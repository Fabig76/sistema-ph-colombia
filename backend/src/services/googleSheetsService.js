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
 * Extraer ID de Google Docs desde URL
 */
const extractDocId = (url) => {
  try {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  } catch (error) {
    logger.error('Error extrayendo ID de Google Docs:', error);
    return null;
  }
};

/**
 * Valida datos específicos de una copropiedad en Google Sheets
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @param {string} expectedNit - NIT esperado de la copropiedad
 * @param {string} expectedNombre - Nombre esperado de la copropiedad
 * @returns {Promise<{isValid: boolean, message: string, data?: Object}>} - Resultado de validación
 */
const validateCopropiedadData = async (sheetId, expectedNit, expectedNombre) => {
  const cacheKey = `sheet:validate-data:${sheetId}:${expectedNit}`;
  
  return await cacheService.getOrSet(cacheKey, async () => {
    try {
      // Función para llamar a la API de Google Sheets
      const fetchSheetData = async () => {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Obtener las primeras dos filas (headers + primera fila de datos)
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A1:B2' // Columnas A y B, filas 1 y 2
        });
        
        return response.data;
      };
      
      // TEMPORAL: Ejecutar directamente sin circuit breaker para debug
      const data = await fetchSheetData();
      
      // const data = await circuitBreaker.execute(
      //   'google-sheets-validate-data',
      //   fetchSheetData,
      //   [],
      //   () => ({ values: [] }) // Fallback en caso de error
      // );
      
      // Verificar si hay datos suficientes
      if (!data.values || data.values.length < 2) {
        return {
          isValid: false,
          message: 'La hoja debe tener al menos una fila de datos además de los encabezados'
        };
      }
      
      // Obtener los datos de la primera fila (índice 1)
      const dataRow = data.values[1];
      
      if (!dataRow || dataRow.length < 2) {
        return {
          isValid: false,
          message: 'La primera fila de datos debe tener al menos NIT y nombre de la copropiedad'
        };
      }
      
      const nitEnHoja = String(dataRow[0]).trim();
      const nombreEnHoja = String(dataRow[1]).trim();
      
      // Comparar datos
      if (nitEnHoja !== expectedNit) {
        return {
          isValid: false,
          message: `El NIT en la hoja (${nitEnHoja}) no coincide con el NIT registrado (${expectedNit})`
        };
      }
      
      if (nombreEnHoja.toUpperCase() !== expectedNombre.toUpperCase()) {
        return {
          isValid: false,
          message: `El nombre en la hoja (${nombreEnHoja}) no coincide con el nombre registrado (${expectedNombre})`
        };
      }
      
      return {
        isValid: true,
        message: 'Los datos de la copropiedad coinciden correctamente',
        data: {
          nitEnHoja,
          nombreEnHoja
        }
      };
    } catch (error) {
      logger.error(`Error al validar datos de copropiedad: ${error.message}`, 'google-sheets', { sheetId, expectedNit, expectedNombre, error });
      return {
        isValid: false,
        message: 'Error al validar los datos en la hoja de Google Sheets'
      };
    }
  }, CACHE_TTL);
};

/**
 * Valida que la hoja de Google Sheets sea accesible
 * Solo verifica que se pueda leer la hoja, sin validar estructura específica
 * @param {string} sheetId - ID de la hoja de Google Sheets
 * @returns {Promise<Object>} - Resultado de la validación
 */
const validateSheetFormat = async (sheetId) => {
  const cacheKey = `sheet:validate-format:${sheetId}`;
  
  return await cacheService.getOrSet(cacheKey, async () => {
    try {
      // Función para llamar a la API de Google Sheets
      const fetchSheetData = async () => {
        const auth = await getAuthClient();
        const sheets = google.sheets({ version: 'v4', auth });
        
        // Solo verificar que la hoja sea accesible leyendo la primera fila
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range: 'A1:B1' // Solo columnas A y B para validación básica
        });
        
        return response.data;
      };
      
      // TEMPORAL: Ejecutar directamente sin circuit breaker para debug
      const data = await fetchSheetData();
      
      // Verificar si hay datos
      if (!data.values || data.values.length === 0) {
        return {
          isValid: false,
          message: 'No se pudo acceder a la hoja o está vacía'
        };
      }
      
      return {
        isValid: true,
        message: 'Hoja accesible correctamente'
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
          range: 'A:K' // Todas las columnas A-K según estructura real
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
      
      // Estructura esperada según especificaciones del proyecto:
      // A: NIT | B: COPROPIEDAD | C: TELEFONO | D: PROPIETARIO | E: NUMERO | F: TIPO | G: TORRE | H: ESTADO_CUENTA | I: SALDO | J: EMAIL | K: OBSERVACIONES
      const expectedStructure = [
        'NIT',           // A
        'COPROPIEDAD',   // B  
        'TELEFONO',      // C
        'PROPIETARIO',   // D
        'NUMERO',        // E
        'TIPO',          // F
        'TORRE',         // G
        'ESTADO_CUENTA', // H
        'SALDO',         // I
        'EMAIL',         // J
        'OBSERVACIONES'  // K
      ];
      
      // Índices fijos según la estructura
      const nitIndex = 0;           // Columna A
      const copropiedadIndex = 1;   // Columna B
      const telefonoIndex = 2;      // Columna C
      const propietarioIndex = 3;   // Columna D
      const numeroIndex = 4;        // Columna E
      const tipoIndex = 5;          // Columna F
      const torreIndex = 6;         // Columna G
      const estadoIndex = 7;        // Columna H
      const saldoIndex = 8;         // Columna I
      const emailIndex = 9;         // Columna J
      const observacionesIndex = 10; // Columna K
      
      // Verificar si hay datos
      if (!data.values || data.values.length <= 1) {
        return [];
      }
      
      // Obtener encabezados
      const headers = data.values[0].map(h => h.toUpperCase().trim());
      
      // Verificar estructura
      if (!headers.every((h, i) => h === expectedStructure[i])) {
        logger.error(`Estructura de la hoja no coincide con la esperada: ${headers.join(', ')}`, 'google-sheets', { sheetId });
        return [];
      }
      
      // Filtrar filas que coincidan con el NIT y la identificación
      const propiedades = data.values.slice(1) // Saltar encabezados
        .filter(row => {
          // Verificar que la fila tenga suficientes columnas
          if (row.length <= Math.max(nitIndex, propietarioIndex)) return false;
          
          // Normalizar valores para comparación
          const rowNit = (row[nitIndex] || '').toString().trim();
          const rowPropietario = (row[propietarioIndex] || '').toString().trim();
          
          return rowNit === nit && rowPropietario === identificacion;
        })
        .map(row => ({
          nit: row[nitIndex] || '',
          copropiedad: row[copropiedadIndex] || '',
          telefono: row[telefonoIndex] || '',
          propietario: row[propietarioIndex] || '',
          numero: row[numeroIndex] || '',
          tipo: row[tipoIndex] || '',
          torre: row[torreIndex] || '',
          estadoCuenta: (row[estadoIndex] || '').toUpperCase().trim(),
          saldo: row[saldoIndex] || '',
          email: row[emailIndex] || '',
          observaciones: row[observacionesIndex] || ''
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
          range: 'A:K' // Todas las columnas A-K según estructura real
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
      
      const datos = data.values || [];
      if (datos.length <= 1) {
        return { alDia: false, mensaje: 'No hay datos en la hoja' };
      }
      
      // Índices fijos según la estructura definida
      const nitIndex = 0;           // Columna A
      const numeroIndex = 4;        // Columna E  
      const torreIndex = 6;         // Columna G
      const estadoIndex = 7;        // Columna H
      
      // Buscar la fila específica
      const fila = datos.slice(1).find(row => {
        const filaNit = (row[nitIndex] || '').toString().trim();
        const filaTorre = (row[torreIndex] || '').toString().trim();
        const filaNumero = (row[numeroIndex] || '').toString().trim();
        
        return filaNit === nit && filaTorre === torre && filaNumero === apto;
      });
      
      if (!fila) {
        return { alDia: false, mensaje: 'No se encontró el inmueble especificado' };
      }
      
      // Verificar estado de cuenta
      const estado = (fila[estadoIndex] || '').toUpperCase().trim();
      const alDia = estado === 'AL DIA' || estado === 'AL_DIA' || estado === 'PAGADO' || estado === 'AL_DIA';
      
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
  validateCopropiedadData,
  extractSheetId,
  extractDocId,
  buscarPropiedadesPorIdentificacion,
  verificarEstadoCuenta,
  invalidarCache
};
