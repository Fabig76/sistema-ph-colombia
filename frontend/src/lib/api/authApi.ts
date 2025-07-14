/**
 * API para autenticación de usuarios
 */

import { apiUtils } from './apiUtils';

const { api } = apiUtils;

/**
 * Login para administradores de PH
 */
const loginAdminPh = async (telefono: string, password: string) => {
  try {
    const response = await api.post('/auth/login', {
      telefono,
      password
    });
    
    if (response.data.status === 'success') {
      // Verificar si requiere verificación SMS
      if (response.data.data?.requireVerification) {
        return {
          requireVerification: true,
          adminId: response.data.data.id,
          message: response.data.message
        };
      }
      
      // Login directo (sin verificación SMS)
      const { token, admin } = response.data.data;
      
      // Guardar token en localStorage SOLO si los datos son válidos
      if (token && admin && typeof admin === 'object') {
        localStorage.setItem('ph_auth_token', token);
        localStorage.setItem('ph_user_data', JSON.stringify(admin));
      } else {
        console.error('Datos inválidos para localStorage:', { token: !!token, admin });
      }
      
      return {
        token,
        admin
      };
    } else {
      throw new Error(response.data.message || 'Credenciales inválidas');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      throw new Error('Credenciales inválidas');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al iniciar sesión');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  }
};

/**
 * Registro para administradores de PH
 */
const registerAdminPh = async (data: {
  nombre: string;
  telefono: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post('/auth/registro', data);
    
    if (response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message,
        requiresSmsVerification: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Error al registrar administrador');
    }
  } catch (error: any) {
    console.error('🔴 Error en registerAdminPh:', error);
    
    if (error.response) {
      const errorData = error.response.data;
      
      // Error 400: datos inválidos o usuario ya existe
      if (error.response.status === 400) {
        if (errorData.campo === 'telefono') {
          throw new Error('Este número de teléfono ya está registrado');
        } else if (errorData.campo === 'email') {
          throw new Error('Este correo electrónico ya está registrado');
        } else if (errorData.errores) {
          // Errores de validación
          const primerError = errorData.errores[0];
          throw new Error(primerError.mensaje || 'Datos inválidos');
        } else {
          throw new Error(errorData.message || 'Datos inválidos');
        }
      }
      
      // Error 409: conflicto (usuario duplicado)
      else if (error.response.status === 409) {
        throw new Error('El teléfono o email ya están registrados');
      }
      
      // Otros errores del servidor
      else {
        throw new Error(errorData.message || 'Error del servidor');
      }
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    } else {
      throw new Error(error.message || 'Error al registrar administrador');
    }
  }
};

/**
 * Verificación de código SMS para administradores de PH (registro)
 */
const verifySmsCodeAdminPh = async (telefono: string, code: string) => {
  try {
    const response = await api.post('/auth/verificar', {
      telefono,
      codigo: code
    });
    
    if (response.data.status === 'success') {
      // Si la verificación es exitosa, el usuario queda activado
      const responseData = response.data.data;
      
      // Si viene token y admin en la respuesta, guardar automáticamente
      if (responseData?.token && responseData?.admin) {
        localStorage.setItem('ph_auth_token', responseData.token);
        localStorage.setItem('ph_user_data', JSON.stringify(responseData.admin));
        
        console.log('✅ Usuario logueado automáticamente después del registro');
      }
      
      return {
        success: true,
        message: response.data.message,
        data: responseData,
        token: responseData?.token,
        admin: responseData?.admin
      };
    } else {
      throw new Error(response.data.message || 'Código de verificación inválido');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      throw new Error('Código de verificación inválido o expirado');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al verificar código');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al verificar código');
    }
  }
};

/**
 * Verificación de código SMS para login de administradores
 */
const verifyLoginSmsCode = async (telefono: string, code: string) => {
  try {
    const response = await api.post('/auth/verificar-login', {
      telefono,
      codigo: code
    });
    
    if (response.data.status === 'success') {
      const responseData = response.data.data;
      
      // Si viene token en la respuesta, guardar automáticamente
      if (responseData?.token && responseData?.id && responseData?.nombre) {
        localStorage.setItem('ph_auth_token', responseData.token);
        
        // Crear objeto admin del formato original SOLO si hay datos válidos
        const adminData = {
          id: responseData.id,
          nombre: responseData.nombre,
          telefono: responseData.telefono,
          email: responseData.email,
          tipo: 'administrador',
          copropiedades: responseData.copropiedades || []
        };
        
        // Validar que adminData tiene propiedades válidas antes de guardar
        if (adminData.id && adminData.nombre) {
          localStorage.setItem('ph_user_data', JSON.stringify(adminData));
          console.log('✅ Login verificado - Usuario autenticado correctamente');
        } else {
          console.error('Datos de admin incompletos:', adminData);
        }
      } else {
        console.error('Datos de respuesta inválidos:', responseData);
      }
      
      return {
        success: true,
        message: response.data.message,
        data: responseData,
        token: responseData?.token,
        admin: responseData
      };
    } else {
      throw new Error(response.data.message || 'Código de verificación inválido');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      throw new Error('Código de verificación inválido o expirado');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al verificar código');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al verificar código');
    }
  }
};

/**
 * Reenviar código SMS de verificación
 */
const resendSmsCode = async (telefono: string) => {
  try {
    const response = await api.post('/auth/reenviar-codigo', {
      telefono
    });
    
    if (response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Código reenviado exitosamente'
      };
    } else {
      throw new Error(response.data.message || 'Error al reenviar código');
    }
  } catch (error: any) {
    console.error('🔴 Error en resendSmsCode:', error);
    
    if (error.response?.status === 404) {
      throw new Error('No hay un registro activo. Debe registrarse nuevamente.');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al reenviar código');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al reenviar código');
    }
  }
};

// Funciones de propietarios eliminadas - están ahora en propietariosApi.ts
// Los propietarios no se registran, solo se validan temporalmente con SMS

/**
 * Recuperación de contraseña para administradores de PH
 */
const recuperarPasswordAdminPh = async (email: string) => {
  try {
    const response = await api.post('/auth/recuperar', {
      email
    });
    
    if (response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Se ha enviado un correo con instrucciones para recuperar tu contraseña'
      };
    } else {
      throw new Error(response.data.message || 'Error al solicitar recuperación de contraseña');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      throw new Error('No se encontró una cuenta con este correo electrónico');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al solicitar recuperación de contraseña');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al solicitar recuperación de contraseña');
    }
  }
};

export const authApi = {
  loginAdminPh,
  registerAdminPh,
  verifySmsCodeAdminPh,
  verifyLoginSmsCode,
  resendSmsCode,
  recuperarPasswordAdminPh,
};
