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
    const response = await api.post('/auth/login-admin-ph', {
      telefono,
      password
    });
    
    if (response.data.status === 'success') {
      const { token, admin } = response.data.data;
      
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(admin));
      
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
  nitResolucion: string;
  fechaResolucion: string;
}) => {
  try {
    const response = await api.post('/auth/register-admin-ph', data);
    
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
    if (error.response && error.response.status === 409) {
      throw new Error('El teléfono o email ya están registrados');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al registrar administrador');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al registrar administrador');
    }
  }
};

/**
 * Verificación de código SMS para administradores de PH
 */
const verifySmsCodeAdminPh = async (telefono: string, code: string) => {
  try {
    const response = await api.post('/auth/verify-sms-admin-ph', {
      telefono,
      codigo: code
    });
    
    if (response.data.status === 'success') {
      // Si la verificación es exitosa, el usuario queda activado
      return {
        success: true,
        message: response.data.message,
        token: response.data.data?.token,
        admin: response.data.data?.admin
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

// Funciones de propietarios eliminadas - están ahora en propietariosApi.ts
// Los propietarios no se registran, solo se validan temporalmente con SMS

/**
 * Recuperación de contraseña para administradores de PH
 */
const recuperarPasswordAdminPh = async (email: string) => {
  try {
    const response = await api.post('/auth/forgot-password-admin-ph', {
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
  recuperarPasswordAdminPh,
};
