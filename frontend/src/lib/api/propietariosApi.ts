/**
 * API para propietarios
 */

import { apiUtils } from './apiUtils';

const { api } = apiUtils;

/**
 * Obtiene los inmuebles de un propietario
 */
const getInmuebles = async () => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Datos simulados de inmuebles
    return [
      {
        id: '1',
        tipo: 'Apartamento',
        numero: '301',
        torre: 'A',
        estado: 'al_dia',
        ultimoPago: '2023-10-15',
        proximoPago: '2023-11-15'
      },
      {
        id: '2',
        tipo: 'Parqueadero',
        numero: 'P12',
        torre: '',
        estado: 'al_dia',
        ultimoPago: '2023-10-15',
        proximoPago: '2023-11-15'
      }
    ];
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener inmuebles');
  }
};

/**
 * Obtiene los paz y salvos de un propietario
 */
const getPazYSalvos = async () => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Datos simulados de paz y salvos
    return [
      {
        id: '1',
        inmuebleId: '1',
        inmuebleInfo: 'Apartamento Torre A - 301',
        fechaGeneracion: '2023-10-15',
        fechaVencimiento: '2023-11-14',
        estado: 'vigente',
        url: '#'
      },
      {
        id: '2',
        inmuebleId: '1',
        inmuebleInfo: 'Apartamento Torre A - 301',
        fechaGeneracion: '2023-09-15',
        fechaVencimiento: '2023-10-14',
        estado: 'vencido',
        url: '#'
      },
      {
        id: '3',
        inmuebleId: '2',
        inmuebleInfo: 'Parqueadero P12',
        fechaGeneracion: '2023-10-15',
        fechaVencimiento: '2023-11-14',
        estado: 'vigente',
        url: '#'
      }
    ];
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener paz y salvos');
  }
};

/**
 * Genera un nuevo paz y salvo para un inmueble
 */
const generarPazYSalvo = async (inmuebleId: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulamos que se ha generado correctamente
    const hoy = new Date();
    const vencimiento = new Date();
    vencimiento.setDate(hoy.getDate() + 30); // Vence en 30 días
    
    return {
      id: `nuevo-${Date.now()}`,
      inmuebleId,
      inmuebleInfo: inmuebleId === '1' ? 'Apartamento Torre A - 301' : 'Parqueadero P12',
      fechaGeneracion: hoy.toISOString().split('T')[0],
      fechaVencimiento: vencimiento.toISOString().split('T')[0],
      estado: 'vigente',
      url: '#'
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al generar paz y salvo');
  }
};

/**
 * Actualiza el perfil de un propietario
 */
const updatePerfil = async (data: any) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una respuesta exitosa
    return {
      success: true,
      propietario: {
        ...data
      }
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al actualizar perfil');
  }
};

export const propietariosApi = {
  getInmuebles,
  getPazYSalvos,
  generarPazYSalvo,
  updatePerfil,
};
