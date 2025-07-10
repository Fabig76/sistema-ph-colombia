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
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Datos simulados de copropiedades
    return [
      {
        id: '1',
        nombre: 'Edificio Los Pinos',
        nit: '900123456-7',
        direccion: 'Calle 123 #45-67, Bogotá',
        totalPropietarios: 45,
        totalInmuebles: 60,
        totalPazYSalvos: 28,
        fechaRegistro: '2023-08-15',
        estado: 'activo',
        googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example1',
        googleDocUrl: 'https://docs.google.com/document/d/example1'
      },
      {
        id: '2',
        nombre: 'Conjunto Residencial El Paraíso',
        nit: '901234567-8',
        direccion: 'Carrera 78 #90-12, Medellín',
        totalPropietarios: 120,
        totalInmuebles: 150,
        totalPazYSalvos: 75,
        fechaRegistro: '2023-09-20',
        estado: 'activo',
        googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example2',
        googleDocUrl: 'https://docs.google.com/document/d/example2'
      }
    ];
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener copropiedades');
  }
};

/**
 * Obtiene los detalles de una copropiedad
 */
const getCopropiedadById = async (id: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Datos simulados de la copropiedad
    if (id === '1') {
      return {
        id: '1',
        nombre: 'Edificio Los Pinos',
        nit: '900123456-7',
        direccion: 'Calle 123 #45-67, Bogotá',
        totalPropietarios: 45,
        totalInmuebles: 60,
        totalPazYSalvos: 28,
        fechaRegistro: '2023-08-15',
        estado: 'activo',
        googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example1',
        googleDocUrl: 'https://docs.google.com/document/d/example1',
        resolucion: {
          numero: '12345',
          fecha: '2023-07-01'
        }
      };
    } else if (id === '2') {
      return {
        id: '2',
        nombre: 'Conjunto Residencial El Paraíso',
        nit: '901234567-8',
        direccion: 'Carrera 78 #90-12, Medellín',
        totalPropietarios: 120,
        totalInmuebles: 150,
        totalPazYSalvos: 75,
        fechaRegistro: '2023-09-20',
        estado: 'activo',
        googleSheetUrl: 'https://docs.google.com/spreadsheets/d/example2',
        googleDocUrl: 'https://docs.google.com/document/d/example2',
        resolucion: {
          numero: '67890',
          fecha: '2023-08-15'
        }
      };
    }
    
    throw new Error('Copropiedad no encontrada');
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener copropiedad');
  }
};

/**
 * Registra una nueva copropiedad
 */
const registrarCopropiedad = async (data: any) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Validamos que el NIT y el nombre estén en las dos primeras columnas de la hoja de Google
    // En un entorno real, esto se haría en el backend
    
    // Simulamos una respuesta exitosa
    return {
      success: true,
      copropiedad: {
        id: `nuevo-${Date.now()}`,
        nombre: data.nombre,
        nit: data.nit,
        direccion: '',
        totalPropietarios: 0,
        totalInmuebles: 0,
        totalPazYSalvos: 0,
        fechaRegistro: new Date().toISOString().split('T')[0],
        estado: 'activo',
        googleSheetUrl: data.googleSheetUrl,
        googleDocUrl: data.googleDocUrl,
        resolucion: {
          numero: data.resolucionNumero,
          fecha: data.resolucionFecha
        }
      }
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al registrar copropiedad');
  }
};

/**
 * Elimina una copropiedad
 */
const eliminarCopropiedad = async (id: string) => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulamos una respuesta exitosa
    return {
      success: true,
      message: 'Copropiedad eliminada correctamente'
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al eliminar copropiedad');
  }
};

/**
 * Obtiene las estadísticas del administrador
 */
const getEstadisticas = async () => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Datos simulados de estadísticas
    return {
      totalCopropiedades: 2,
      totalPropietarios: 165,
      totalPazYSalvos: 103,
      proximosVencimientos: [
        {
          id: '1',
          copropiedad: 'Edificio Los Pinos',
          fecha: '2023-11-15'
        },
        {
          id: '2',
          copropiedad: 'Conjunto Residencial El Paraíso',
          fecha: '2023-11-20'
        }
      ],
      copropiedadesRecientes: [
        {
          id: '2',
          nombre: 'Conjunto Residencial El Paraíso',
          fecha: '2023-09-20'
        },
        {
          id: '1',
          nombre: 'Edificio Los Pinos',
          fecha: '2023-08-15'
        }
      ]
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener estadísticas');
  }
};

/**
 * Actualiza el perfil del administrador
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
      admin: {
        ...data
      }
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al actualizar perfil');
  }
};

/**
 * Obtiene el estado de la suscripción del administrador
 */
const getEstadoSuscripcion = async () => {
  try {
    // En un entorno real, esto se conectaría con el backend
    // Por ahora simulamos una respuesta exitosa
    
    // Simulamos un delay para simular la llamada al backend
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Datos simulados de suscripción
    return {
      estado: 'activo',
      plan: 'Básico',
      fechaInicio: '2023-08-15',
      fechaRenovacion: '2023-11-15',
      precio: 20000,
      copropiedadesIncluidas: 2,
      diasRestantesPrueba: 0,
      historialPagos: [
        {
          id: '1',
          fecha: '2023-10-15',
          monto: 40000,
          estado: 'completado',
          metodo: 'tarjeta'
        },
        {
          id: '2',
          fecha: '2023-09-15',
          monto: 40000,
          estado: 'completado',
          metodo: 'tarjeta'
        }
      ]
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al obtener estado de suscripción');
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
