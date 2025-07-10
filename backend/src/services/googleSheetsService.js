/**
 * Servicio de integración con Google Sheets
 * Implementa funciones para conectar, validar y consultar datos en hojas de Google
 * Utiliza caché intensivo y circuit breakers para optimizar rendimiento
 */

const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const logger = require('../utils/logger');
const cacheService = require('./cacheService');
const circuitBreaker = require('./circuitBreakerService');
require('dotenv').config();

// Tiempo de caché para datos de Google Sheets (5 minutos por defecto)
const CACHE_TTL = parseInt(process.env.GOOGLE_SHEETS_CACHE_TTL) || 300;

/**
 * Inicializa la autenticación con Google
 * @returns {Promise<google.auth.GoogleAuth>} - Cliente autenticado
 */
const getAuthClient = async () => {
  try {
    // Usar credenciales de variables de entorno si están disponibles
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      return new GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
    }
    
    // De lo contrario, usar archivo de credenciales
    return new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
  } catch (error) {
    logger.error(`Error al inicializar autenticación de Google: ${error.message}`, 'google-sheets', { error });
    throw new Error('No se pudo inicializar la autenticación con Google');
  }
};

/**
 * Extrae el ID de una hoja de Google Sheets desde una URL
 * @param {string} url - URL de Google Sheets
 * @returns {string|null} - ID de la hoja o null si no es válida
 */
const extractSheetId = (url) => {
  try {
    // Patrones comunes de URLs de Google Sheets
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
      /^([a-zA-Z0-9-_]+)$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    logger.error(`Error al extraer ID de hoja: ${error.message}`, 'google-sheets', { url, error });
    return null;
  }
};

/**
 * Valida el formato de una hoja de Google Sheets para uso en el sistema
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @returns {Promise<{isValid: boolean, message: string, data?: Object}>} - Resultado de validación
 */
const validateSheetFormat = async (sheetId) => {
  const cacheKey = `sheet:validate:${sheetId}`;
  
  return await cacheService.getOrSet(cacheKey, async () => {
    try {
      // Función para llamar a la API de Google Sheets
      const fetchSheetData = async () => {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Obtener solo los encabezados (primera fila)
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A1:J1' // Primeras 10 columnas de la primera fila
        });
        
        return response.data;
      };
      
      // Ejecutar a través del circuit breaker
      const data = await circuitBreaker.execute(
        'google-sheets-validate',
        fetchSheetData,
        [],
        () => ({ values: [] }) // Fallback en caso de error
      );
      
      // Verificar si hay datos
      if (!data.values || data.values.length === 0) {
        return {
          isValid: false,
          message: 'No se pudo acceder a la hoja o está vacía'
        };
      }
      
      // Encabezados requeridos (las primeras columnas deben ser estas, en este orden)
      const requiredHeaders = [
        'NIT', 'NOMBRE_COPROPIEDAD', 'TORRE_BLOQUE', 'APTO_CASA', 
        'IDENTIFICACION', 'NOMBRE_PROPIETARIO', 'TELEFONO', 'EMAIL', 
        'ESTADO_CUENTA'
      ];
      
      // Verificar encabezados
      const headers = data.values[0].map(h => h.toUpperCase().trim());
      
      // Verificar que todos los encabezados requeridos estén presentes y en orden
      for (let i = 0; i < requiredHeaders.length; i++) {
        if (i >= headers.length || headers[i] !== requiredHeaders[i]) {
          return {
            isValid: false,
            message: `La columna ${i + 1} debe ser "${requiredHeaders[i]}", encontrado: "${headers[i] || 'No existe'}"`,
            data: { headers, requiredHeaders }
          };
        }
      }
      
      return {
        isValid: true,
        message: 'Formato de hoja válido',
        data: { headers }
      };
    } catch (error) {
      logger.error(`Error al validar formato de hoja: ${error.message}`, 'google-sheets', { sheetId, error });
      return {
        isValid: false,
        message: 'Error al validar la hoja de Google Sheets'
      };
    }
  }, CACHE_TTL);
};

/**
 * Busca propiedades de un propietario por su número de identificación
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @param {string} nit - NIT de la copropiedad
 * @param {string} identificacion - Número de identificación del propietario
 * @returns {Promise<Array<Object>>} - Lista de propiedades encontradas
 */
const buscarPropiedadesPorIdentificacion = async (sheetId, nit, identificacion) => {
  const cacheKey = `sheet:propiedades:${sheetId}:${nit}:${identificacion}`;
  
  return await cacheService.getOrSet(cacheKey, async () => {
    try {
      // Función para llamar a la API de Google Sheets
      const fetchPropiedades = async () => {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Obtener todos los datos
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A:I' // Todas las columnas relevantes
        });
        
        return response.data;
      };
      
      // Ejecutar a través del circuit breaker
      const data = await circuitBreaker.execute(
        'google-sheets-buscar',
        fetchPropiedades,
        [],
        () => ({ values: [] }) // Fallback en caso de error
      );
      
      // Verificar si hay datos
      if (!data.values || data.values.length <= 1) {
        return [];
      }
      
      // Obtener encabezados
      const headers = data.values[0].map(h => h.toUpperCase().trim());
      
      // Índices de las columnas relevantes
      const nitIndex = headers.indexOf('NIT');
      const nombreCopropiedadIndex = headers.indexOf('NOMBRE_COPROPIEDAD');
      const torreIndex = headers.indexOf('TORRE_BLOQUE');
      const aptoIndex = headers.indexOf('APTO_CASA');
      const idIndex = headers.indexOf('IDENTIFICACION');
      const nombreIndex = headers.indexOf('NOMBRE_PROPIETARIO');
      const telefonoIndex = headers.indexOf('TELEFONO');
      const emailIndex = headers.indexOf('EMAIL');
      const estadoIndex = headers.indexOf('ESTADO_CUENTA');
      
      // Filtrar filas que coincidan con el NIT y la identificación
      const propiedades = data.values.slice(1) // Saltar encabezados
        .filter(row => {
          // Verificar que la fila tenga suficientes columnas
          if (row.length <= Math.max(nitIndex, idIndex)) return false;
          
          // Normalizar valores para comparación
          const rowNit = (row[nitIndex] || '').toString().trim();
          const rowId = (row[idIndex] || '').toString().trim();
          
          return rowNit === nit && rowId === identificacion;
        })
        .map(row => ({
          nit: row[nitIndex] || '',
          nombreCopropiedad: row[nombreCopropiedadIndex] || '',
          torre: row[torreIndex] || '',
          apto: row[aptoIndex] || '',
          identificacion: row[idIndex] || '',
          nombrePropietario: row[nombreIndex] || '',
          telefono: row[telefonoIndex] || '',
          email: row[emailIndex] || '',
          estadoCuenta: (row[estadoIndex] || '').toUpperCase().trim()
        }));
      
      return propiedades;
    } catch (error) {
      logger.error(`Error al buscar propiedades: ${error.message}`, 'google-sheets', { sheetId, nit, identificacion, error });
      return [];
    }
  }, CACHE_TTL);
};

/**
 * Verifica si un propietario está al día con sus pagos
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @param {string} nit - NIT de la copropiedad
 * @param {string} torre - Torre o bloque
 * @param {string} apto - Apartamento o casa
 * @returns {Promise<{alDia: boolean, mensaje: string}>} - Estado de cuenta
 */
const verificarEstadoCuenta = async (sheetId, nit, torre, apto) => {
  const cacheKey = `sheet:estado:${sheetId}:${nit}:${torre}:${apto}`;
  
  return await cacheService.getOrSet(cacheKey, async () => {
    try {
      // Función para llamar a la API de Google Sheets
      const fetchEstado = async () => {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Obtener todos los datos
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A:I' // Todas las columnas relevantes
        });
        
        return response.data;
      };
      
      // Ejecutar a través del circuit breaker
      const data = await circuitBreaker.execute(
        'google-sheets-estado',
        fetchEstado,
        [],
        () => ({ values: [] }) // Fallback en caso de error
      );
      
      // Verificar si hay datos
      if (!data.values || data.values.length <= 1) {
        return { alDia: false, mensaje: 'No se encontraron datos' };
      }
      
      // Obtener encabezados
      const headers = data.values[0].map(h => h.toUpperCase().trim());
      
      // Índices de las columnas relevantes
      const nitIndex = headers.indexOf('NIT');
      const torreIndex = headers.indexOf('TORRE_BLOQUE');
      const aptoIndex = headers.indexOf('APTO_CASA');
      const estadoIndex = headers.indexOf('ESTADO_CUENTA');
      
      // Buscar la fila que coincida con los criterios
      const fila = data.values.slice(1) // Saltar encabezados
        .find(row => {
          // Verificar que la fila tenga suficientes columnas
          if (row.length <= Math.max(nitIndex, torreIndex, aptoIndex)) return false;
          
          // Normalizar valores para comparación
          const rowNit = (row[nitIndex] || '').toString().trim();
          const rowTorre = (row[torreIndex] || '').toString().trim();
          const rowApto = (row[aptoIndex] || '').toString().trim();
          
          return rowNit === nit && rowTorre === torre && rowApto === apto;
        });
      
      if (!fila) {
        return { alDia: false, mensaje: 'Inmueble no encontrado' };
      }
      
      // Verificar estado de cuenta
      const estado = (fila[estadoIndex] || '').toUpperCase().trim();
      const alDia = estado === 'AL DIA' || estado === 'AL DÍA' || estado === 'PAGADO';
      
      return {
        alDia,
        mensaje: alDia ? 'El inmueble se encuentra al día con los pagos' : 'El inmueble presenta pagos pendientes'
      };
    } catch (error) {
      logger.error(`Error al verificar estado de cuenta: ${error.message}`, 'google-sheets', { sheetId, nit, torre, apto, error });
      return { alDia: false, mensaje: 'Error al verificar estado de cuenta' };
    }
  }, CACHE_TTL);
};

/**
 * Invalida la caché para una hoja específica
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @returns {Promise<boolean>} - true si se invalidó correctamente
 */
const invalidarCache = async (sheetId) => {
  try {
    // Eliminar todas las entradas de caché relacionadas con esta hoja
    const pattern = `sheet:*:${sheetId}*`;
    const keysRemoved = await cacheService.delByPattern(pattern);
    
    logger.info(`Caché invalidada para hoja ${sheetId}: ${keysRemoved} entradas eliminadas`, 'google-sheets');
    return true;
  } catch (error) {
    logger.error(`Error al invalidar caché: ${error.message}`, 'google-sheets', { sheetId, error });
    return false;
  }
};

module.exports = {
  validateSheetFormat,
  extractSheetId,
  buscarPropiedadesPorIdentificacion,
  verificarEstadoCuenta,
  invalidarCache
};
