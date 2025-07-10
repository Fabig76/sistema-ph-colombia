/**
 * API para propietarios
 */

import { apiUtils } from './apiUtils';

const { api } = apiUtils;

/**
 * Obtiene los inmuebles de un propietario
 */
const getInmuebles = async (consultaData: {
  cedula: string;
  telefono: string;
  codigoVerificacion: string;
  nitCopropiedad: string;
}) => {
  try {
    const response = await api.post('/propietarios/consultar', consultaData);
    
    if (response.data.status === 'success') {
      return response.data.data.inmuebles || [];
    } else {
      throw new Error(response.data.message || 'Error al obtener inmuebles');
    }
  } catch (error: any) {
    if (error.response) {
      // Error del servidor
      throw new Error(error.response.data.message || 'Error al obtener inmuebles');
    } else if (error.request) {
      // Error de conexión
      throw new Error('No se pudo conectar con el servidor');
    } else {
      // Otro tipo de error
      throw new Error(error.message || 'Error al obtener inmuebles');
    }
  }
};

/**
 * Obtiene los paz y salvos generados de un propietario
 * En el modelo actual, no se almacenan los paz y salvos previamente generados,
 * pero esta función quedaría preparada para cuando se implemente el historial
 */
const getPazYSalvos = async (propietarioId?: string) => {
  try {
    const response = await api.get(`/propietarios/${propietarioId}/paz-y-salvos`);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error al obtener paz y salvos:', error);
    throw new Error('Error al obtener el historial de paz y salvos');
  }
};

/**
 * Genera un nuevo paz y salvo para un inmueble
 */
const generarPazYSalvo = async (datosGeneracion: {
  cedula: string;
  telefono: string;
  codigoVerificacion: string;
  nitCopropiedad: string;
  inmuebleId: string;
}) => {
  try {
    const response = await api.post('/propietarios/generar-paz-y-salvo', datosGeneracion);
    
    if (response.data.status === 'success') {
      // El backend retorna el documento generado o la URL para descargarlo
      return {
        success: true,
        documento: response.data.data.documento,
        url: response.data.data.url,
        fechaGeneracion: response.data.data.fechaGeneracion,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Error al generar paz y salvo');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al generar paz y salvo');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al generar paz y salvo');
    }
  }
};

/**
 * Busca una copropiedad por NIT
 */
const buscarCopropiedad = async (nit: string) => {
  try {
    const response = await api.get(`/propietarios/copropiedad/${nit}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Copropiedad no encontrada');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      throw new Error('Copropiedad no encontrada o inactiva');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al buscar copropiedad');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al buscar copropiedad');
    }
  }
};

/**
 * Solicita código de verificación SMS
 */
const solicitarCodigoSMS = async (telefono: string) => {
  try {
    const response = await api.post('/propietarios/solicitar-codigo', {
      telefono,
      tipo: 'verificacion'
    });
    
    if (response.data.status === 'success') {
      return { success: true, message: response.data.message };
    } else {
      throw new Error(response.data.message || 'Error al enviar código SMS');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al enviar código SMS');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al enviar código SMS');
    }
  }
};

/**
 * Verifica el estado de cuenta de un propietario
 */
const verificarEstadoCuenta = async (datosVerificacion: {
  cedula: string;
  telefono: string;
  codigoVerificacion: string;
  nitCopropiedad: string;
}) => {
  try {
    const response = await api.post('/propietarios/verificar-estado', datosVerificacion);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al verificar estado de cuenta');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al verificar estado de cuenta');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al verificar estado de cuenta');
    }
  }
};

export const propietariosApi = {
  getInmuebles,
  getPazYSalvos,
  generarPazYSalvo,
  buscarCopropiedad,
  solicitarCodigoSMS,
  verificarEstadoCuenta,
};
