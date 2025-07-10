/**
 * API para módulo de Administrador del Sistema
 */

import { apiUtils } from './apiUtils';

const { api } = apiUtils;

/**
 * Login para super administrador
 */
const loginSuperAdmin = async (username: string, password: string) => {
  try {
    const response = await api.post('/auth/login-super-admin', {
      username,
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
 * Obtiene estadísticas del sistema
 */
const getEstadisticasSistema = async () => {
  try {
    const response = await api.get('/admin-sistema/estadisticas');
    
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
 * Obtiene lista de administradores PH
 */
const getAdministradoresPH = async (filtros?: {
  activo?: boolean;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filtros?.activo !== undefined) params.append('activo', filtros.activo.toString());
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());
    if (filtros?.search) params.append('search', filtros.search);

    const response = await api.get(`/admin-sistema/administradores-ph?${params.toString()}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener administradores');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener administradores');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al obtener administradores');
    }
  }
};

/**
 * Bloquea/desbloquea un administrador PH
 */
const toggleBloqueAdmin = async (adminId: string, bloqueado: boolean) => {
  try {
    const response = await api.patch(`/admin-sistema/administradores-ph/${adminId}/bloqueo`, {
      bloqueado
    });
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al actualizar estado del administrador');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar estado del administrador');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al actualizar estado del administrador');
    }
  }
};

/**
 * Obtiene logs del sistema
 */
const getLogs = async (filtros?: {
  nivel?: string;
  fechaInicio?: string;
  fechaFin?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filtros?.nivel) params.append('nivel', filtros.nivel);
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros?.page) params.append('page', filtros.page.toString());
    if (filtros?.limit) params.append('limit', filtros.limit.toString());

    const response = await api.get(`/admin-sistema/logs?${params.toString()}`);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener logs');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener logs');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al obtener logs');
    }
  }
};

/**
 * Obtiene configuración del sistema
 */
const getConfiguracion = async () => {
  try {
    const response = await api.get('/admin-sistema/configuracion');
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al obtener configuración');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al obtener configuración');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al obtener configuración');
    }
  }
};

/**
 * Actualiza configuración del sistema
 */
const updateConfiguracion = async (configuracion: any) => {
  try {
    const response = await api.put('/admin-sistema/configuracion', configuracion);
    
    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Error al actualizar configuración');
    }
  } catch (error: any) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error al actualizar configuración');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error(error.message || 'Error al actualizar configuración');
    }
  }
};

export const adminSistemaApi = {
  loginSuperAdmin,
  getEstadisticasSistema,
  getAdministradoresPH,
  toggleBloqueAdmin,
  getLogs,
  getConfiguracion,
  updateConfiguracion,
};
