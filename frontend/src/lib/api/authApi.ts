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
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una respuesta exitosa
    if (telefono === '3001234567' && password === 'password123') {
      return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-admin-ph',
        admin: {
          id: '1',
          nombre: 'Juan Pérez',
          telefono: '3001234567',
          email: 'juan@example.com',
          role: 'admin_ph'
        }
      };
    }
    
    // Simulamos un error de credenciales inválidas
    throw new Error('Credenciales inválidas');
  } catch (error: any) {
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

/**
 * Registro para administradores de PH
 */
const registerAdminPh = async (data: any) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una respuesta exitosa
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-admin-ph-new',
      admin: {
        id: '2',
        nombre: data.nombre,
        telefono: data.telefono,
        email: data.email,
        role: 'admin_ph'
      }
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al registrar usuario');
  }
};

/**
 * Verificación de código SMS para administradores de PH
 */
const verifySmsCodeAdminPh = async (telefono: string, code: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una verificación exitosa
    if (code === '123456') {
      return { success: true };
    }
    
    // Simulamos un error de código inválido
    throw new Error('Código de verificación inválido');
  } catch (error: any) {
    throw new Error(error.message || 'Error al verificar código');
  }
};

/**
 * Login para propietarios
 */
const loginPropietario = async (telefono: string, nit: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una respuesta exitosa
    if (telefono === '3001234567' && (nit === '900123456-7' || nit === '900123456')) {
      return {
        success: true,
        inmuebles: [
          {
            id: '1',
            tipo: 'Apartamento',
            numero: '301',
            torre: 'A',
            estado: 'al_dia'
          },
          {
            id: '2',
            tipo: 'Parqueadero',
            numero: 'P12',
            torre: '',
            estado: 'al_dia'
          }
        ]
      };
    }
    
    // Simulamos un error de propietario no encontrado
    throw new Error('No se encontraron inmuebles asociados a este número de teléfono en la copropiedad indicada');
  } catch (error: any) {
    throw new Error(error.message || 'Error al iniciar sesión');
  }
};

/**
 * Verificación de código SMS para propietarios
 */
const verifySmsCodePropietario = async (telefono: string, code: string, nit: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una verificación exitosa
    if (code === '123456') {
      return {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token-propietario',
        propietario: {
          id: '1',
          nombre: 'Carlos Rodríguez',
          telefono: telefono,
          role: 'propietario',
          inmuebles: [
            {
              id: '1',
              tipo: 'Apartamento',
              numero: '301',
              torre: 'A',
              estado: 'al_dia'
            },
            {
              id: '2',
              tipo: 'Parqueadero',
              numero: 'P12',
              torre: '',
              estado: 'al_dia'
            }
          ],
          copropiedad: {
            id: '1',
            nombre: 'Edificio Los Pinos',
            nit: nit
          }
        }
      };
    }
    
    // Simulamos un error de código inválido
    throw new Error('Código de verificación inválido');
  } catch (error: any) {
    throw new Error(error.message || 'Error al verificar código');
  }
};

/**
 * Búsqueda de copropiedad por NIT
 */
const buscarCopropiedadPorNit = async (nit: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Formato del NIT para búsqueda
    const nitFormatted = nit.includes('-') ? nit : `${nit.slice(0, -1)}-${nit.slice(-1)}`;
    
    // Simulamos resultados de búsqueda
    if (nitFormatted === '900123456-7') {
      return {
        id: '1',
        nombre: 'Edificio Los Pinos',
        nit: '900123456-7',
        direccion: 'Calle 123 #45-67, Bogotá',
        administrador: 'Juan Pérez'
      };
    } else if (nitFormatted === '901234567-8') {
      return {
        id: '2',
        nombre: 'Conjunto Residencial El Paraíso',
        nit: '901234567-8',
        direccion: 'Carrera 78 #90-12, Medellín',
        administrador: 'María López'
      };
    }
    
    // Simulamos un error de copropiedad no encontrada
    throw new Error('No se encontró ninguna copropiedad con el NIT proporcionado');
  } catch (error: any) {
    throw new Error(error.message || 'Error al buscar copropiedad');
  }
};

/**
 * Recuperación de contraseña para administradores de PH
 */
const recuperarPasswordAdminPh = async (email: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una respuesta exitosa
    return { success: true, message: 'Se ha enviado un correo con instrucciones para recuperar tu contraseña' };
  } catch (error: any) {
    throw new Error(error.message || 'Error al solicitar recuperación de contraseña');
  }
};

export const authApi = {
  loginAdminPh,
  registerAdminPh,
  verifySmsCodeAdminPh,
  loginPropietario,
  verifySmsCodePropietario,
  buscarCopropiedadPorNit,
  recuperarPasswordAdminPh,
};
