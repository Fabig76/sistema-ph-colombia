/**
 * API para administradores de propiedad horizontal
 */

import { apiUtils } from './apiUtils';

const { api } = apiUtils;

/**
 * Obtiene las copropiedades de un administrador
 */
const getCopropiedades = async () => {
  try {
    const response = await api.get('/admin-ph/copropiedades');
    
    if (response.data.status === 'success') {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || 'Error al obtener copropiedades');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener copropiedades');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al obtener copropiedades');
    }
  }
};

/**
 * Obtiene los detalles de una copropiedad
 */
const getCopropiedadById = async (id: string) => {
  try {
    const response = await api.get(`/admin-ph/copropiedades/${id}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener detalles de copropiedad');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      throw new Error('Copropiedad no encontrada');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener detalles de copropiedad');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al obtener detalles de copropiedad');
    }
  }
};

/**
 * Registra una nueva copropiedad
 */
const registrarCopropiedad = async (data: {
  nombre: string;
  nit: string;
  resolucionNumero: string;
  resolucionFecha: string;
  googleSheetUrl: string;
  googleDocUrl: string;
}) => {
  try {
    const response = await api.post('/admin-ph/copropiedades', data);
    
    if (response.data.status === 'success') {
      return {
        success: true,
        copropiedad: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data.message || 'Error al registrar copropiedad');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      throw new Error(error.response.data.message || 'Datos de copropiedad inválidos');
    } else if (error.response && error.response.status === 409) {
      throw new Error('El NIT de copropiedad ya está registrado');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al registrar copropiedad');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al registrar copropiedad');
    }
  }
};

/**
 * Elimina una copropiedad
 */
const eliminarCopropiedad = async (id: string) => {
  try {
    const response = await api.delete(`/admin-ph/copropiedades/${id}`);
    
    if (response.data.status === 'success') {
      return {
        success: true,
        message: response.data.message || 'Copropiedad eliminada correctamente'
      };
    } else {
      throw new Error(response.data.message || 'Error al eliminar copropiedad');
    }
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      throw new Error('Copropiedad no encontrada');
    } else if (error.response) {
      throw new Error(error.response.data.message || 'Error al eliminar copropiedad');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al eliminar copropiedad');
    }
  }
};

/**
 * Obtiene las estadísticas del administrador
 */
const getEstadisticas = async () => {
  try {
    const response = await api.get('/admin-ph/estadisticas');
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener estadísticas');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener estadísticas');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  }
};

/**
 * Actualiza el perfil del administrador
 */
const updatePerfil = async (data: {
  nombre?: string;
  email?: string;
  celular?: string;
}) => {
  try {
    const response = await api.put('/admin-ph/perfil', data);
    
    if (response.data.status === 'success') {
      return {
        success: true,
        admin: response.data.data
      };
    } else {
      throw new Error(response.data.message || 'Error al actualizar perfil');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar perfil');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al actualizar perfil');
    }
  }
};

/**
 * Obtiene el estado de la suscripción del administrador
 */
const getEstadoSuscripcion = async () => {
  try {
    const response = await api.get('/admin-ph/suscripcion');
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener estado de suscripción');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener estado de suscripción');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al obtener estado de suscripción');
    }
  }
};

export const adminPhApi = {
  getCopropiedades,
  getCopropiedadById,
  registrarCopropiedad,
  eliminarCopropiedad,
  getEstadisticas,
  updatePerfil,
  getEstadoSuscripcion,
};
