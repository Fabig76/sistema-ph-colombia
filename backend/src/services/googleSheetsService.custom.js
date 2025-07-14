/**
 * Servicio de integración con Google Sheets PERSONALIZADO
 * Implementa funciones específicas para el formato de hojas del usuario
 * 
 * ✅ CONFIGURACIÓN EXITOSA VERIFICADA - 2025-07-10
 * URL Real Funcionando: https://docs.google.com/spreadsheets/d/18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI/edit
 * 
 * Estructura: 
 * - Fila 1: A1 (NIT), B1 (NOMBRE_COPROPIEDAD)
 * - Fila 2: Headers (PROPIETARIO, TELEFONO, INMUEBLE, TIPO, TORRE, ESTADO_CUENTA, SALDO, EMAIL)
 * - Fila 3+: Datos de propietarios
 * 
 * Ejemplo Real Validado:
 * - A1: "901292707" | B1: "OVIEDO PARQUE RESIDENCIAL"
 * - A2: "PROPIETARIO" | B2: "TELEFONO" | C2: "INMUEBLE"
 * - A3: "Juan Pérez García" | B3: "3001234567" | C3: "101"
 */

const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const logger = require('../utils/logger');
const cacheService = require('./cacheService');
const circuitBreaker = require('./circuitBreakerService');
require('dotenv').config();

// Tiempo de caché para datos de Google Sheets (5 minutos por defecto)
const CACHE_TTL = parseInt(process.env.GOOGLE_SHEETS_CACHE_TTL) || 300;

class GoogleSheetsServiceCustom {
  constructor() {
    this.auth = null;
    this.sheets = null;
  }

  /**
   * Inicializa la autenticación con Google
   */
  async initAuth() {
    try {
      if (this.auth) return this.auth;

      // Usar credenciales de variables de entorno si están disponibles
      if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
        this.auth = new GoogleAuth({
          credentials: {
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      } else {
        // De lo contrario, usar archivo de credenciales
        this.auth = new GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
        });
      }

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      return this.auth;

    } catch (error) {
      logger.error(`Error al inicializar autenticación de Google: ${error.message}`, 'google-sheets', { error });
      throw new Error('No se pudo inicializar la autenticación con Google');
    }
  }

  /**
   * Extrae el ID de una hoja de Google Sheets desde una URL
   * @param {string} url - URL de Google Sheets
   * @returns {string|null} - ID de la hoja o null si no es válida
   */
  extractSheetId(url) {
    if (!url) return null;
    
    try {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    } catch (error) {
      logger.error(`Error al extraer ID de Google Sheets: ${error.message}`, 'google-sheets');
      return null;
    }
  }

  /**
   * Valida la estructura de la hoja según el formato específico del usuario
   * @param {string} spreadsheetId - ID de la hoja de Google Sheets
   * @returns {Promise<{valido: boolean, mensaje: string, copropiedad?: Object, headers?: Array}>}
   */
  async validarEstructuraHoja(spreadsheetId) {
    try {
      await this.initAuth();

      // Leer información de la copropiedad (A1:B1)
      const infoResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1:B1'
      });

      const infoData = infoResponse.data.values;
      if (!infoData || infoData.length === 0 || !infoData[0][0] || !infoData[0][1]) {
        return {
          valido: false,
          mensaje: 'Falta información de copropiedad en A1 (NIT) y B1 (Nombre)'
        };
      }

      // Leer headers (A2:H2)
      const headersResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A2:H2'
      });

      const headers = headersResponse.data.values;
      if (!headers || headers.length === 0) {
        return {
          valido: false,
          mensaje: 'Faltan headers en la fila 2'
        };
      }

      // Verificar headers requeridos
      const requiredHeaders = ['PROPIETARIO', 'TELEFONO', 'INMUEBLE', 'TIPO', 'ESTADO_CUENTA'];
      const headerRow = headers[0];
      
      for (const required of requiredHeaders) {
        if (!headerRow.some(h => h && h.toUpperCase().includes(required))) {
          return {
            valido: false,
            mensaje: `Falta header requerido: ${required}`
          };
        }
      }

      return {
        valido: true,
        mensaje: 'Estructura válida',
        copropiedad: {
          nit: infoData[0][0],
          nombre: infoData[0][1]
        },
        headers: headerRow
      };

    } catch (error) {
      logger.error(`Error al validar estructura de hoja: ${error.message}`, 'google-sheets', { error });
      return {
        valido: false,
        mensaje: `Error al validar: ${error.message}`
      };
    }
  }

  /**
   * Buscar propietario por teléfono específico para la estructura del usuario
   * @param {string} spreadsheetId - ID de la hoja de Google Sheets
   * @param {string} telefono - Número de teléfono del propietario
   * @returns {Promise<Object|null>} - Datos del propietario o null si no se encuentra
   */
  async buscarPropietarioPorTelefono(spreadsheetId, telefono) {
    try {
      await this.initAuth();

      // Clave de caché
      const cacheKey = `sheet_search_${spreadsheetId}_${telefono}`;
      
      // Intentar obtener de caché primero
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        logger.info('Datos obtenidos de caché', 'google-sheets', { spreadsheetId, telefono });
        return JSON.parse(cached);
      }

      // Leer todos los datos desde fila 3
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A3:H1000' // Leer hasta fila 1000
      });

      const data = response.data.values || [];
      
      // Buscar fila que coincida con el teléfono (columna B)
      const propietarioRow = data.find(row => {
        const telefonoEnHoja = row[1]; // Columna B (índice 1)
        return telefonoEnHoja && this.normalizarTelefono(telefonoEnHoja) === this.normalizarTelefono(telefono);
      });

      if (!propietarioRow) {
        // Guardar resultado negativo en caché por menor tiempo
        await cacheService.set(cacheKey, JSON.stringify(null), 60); // 1 minuto
        return null;
      }

      // Mapear datos según la estructura del usuario
      const propietario = {
        propietario: propietarioRow[0] || '', // Columna A
        telefono: propietarioRow[1] || '',    // Columna B
        inmueble: propietarioRow[2] || '',    // Columna C
        tipo: propietarioRow[3] || '',        // Columna D
        torre: propietarioRow[4] || '',       // Columna E
        estadoCuenta: propietarioRow[5] || '', // Columna F
        saldo: propietarioRow[6] || '',       // Columna G
        email: propietarioRow[7] || ''        // Columna H
      };

      // Guardar en caché
      await cacheService.set(cacheKey, JSON.stringify(propietario), CACHE_TTL);

      logger.info('Propietario encontrado', 'google-sheets', { 
        spreadsheetId, 
        telefono, 
        propietario: propietario.propietario 
      });

      return propietario;

    } catch (error) {
      logger.error(`Error buscar propietario: ${error.message}`, 'google-sheets', { error, spreadsheetId, telefono });
      return null;
    }
  }

  /**
   * Buscar propietario por cédula (alternativo)
   * @param {string} spreadsheetId - ID de la hoja de Google Sheets  
   * @param {string} cedula - Número de cédula del propietario
   * @returns {Promise<Object|null>} - Datos del propietario o null si no se encuentra
   */
  async buscarPropietarioPorCedula(spreadsheetId, cedula) {
    try {
      await this.initAuth();

      // Leer todos los datos desde fila 3
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A3:H1000'
      });

      const data = response.data.values || [];
      
      // Buscar por nombre del propietario que contenga la cédula
      // O agregar columna específica para cédula si es necesario
      const propietarioRow = data.find(row => {
        const nombrePropietario = row[0] || ''; // Columna A
        return nombrePropietario.includes(cedula);
      });

      if (!propietarioRow) {
        return null;
      }

      return {
        propietario: propietarioRow[0] || '',
        telefono: propietarioRow[1] || '',
        inmueble: propietarioRow[2] || '',
        tipo: propietarioRow[3] || '',
        torre: propietarioRow[4] || '',
        estadoCuenta: propietarioRow[5] || '',
        saldo: propietarioRow[6] || '',
        email: propietarioRow[7] || ''
      };

    } catch (error) {
      logger.error(`Error buscar propietario por cédula: ${error.message}`, 'google-sheets', { error });
      return null;
    }
  }

  /**
   * Normalizar teléfono para comparación
   * @param {string} telefono - Número de teléfono
   * @returns {string} - Teléfono normalizado
   */
  normalizarTelefono(telefono) {
    return telefono.toString().replace(/\D/g, '').slice(-10); // Últimos 10 dígitos
  }

  /**
   * Verificar si está al día según la estructura del usuario
   * @param {Object} propietario - Datos del propietario
   * @returns {boolean} - true si está al día
   */
  estaAlDia(propietario) {
    const estado = propietario.estadoCuenta.toLowerCase();
    const saldo = parseFloat(propietario.saldo) || 0;
    
    return estado.includes('al día') || 
           estado.includes('al dia') ||
           estado.includes('paz y salvo') || 
           estado.includes('paz y salvos') ||
           saldo === 0;
  }

  /**
   * Obtener información de la copropiedad desde la hoja
   * @param {string} spreadsheetId - ID de la hoja de Google Sheets
   * @returns {Promise<Object|null>} - Información de la copropiedad
   */
  async obtenerInfoCopropiedad(spreadsheetId) {
    try {
      await this.initAuth();

      const cacheKey = `copropiedad_info_${spreadsheetId}`;
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Leer información de la copropiedad (A1:B1)
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A1:B1'
      });

      const data = response.data.values;
      if (!data || data.length === 0) {
        return null;
      }

      const info = {
        nit: data[0][0] || '',
        nombre: data[0][1] || ''
      };

      // Guardar en caché por más tiempo
      await cacheService.set(cacheKey, JSON.stringify(info), CACHE_TTL * 2);

      return info;

    } catch (error) {
      logger.error(`Error obtener info copropiedad: ${error.message}`, 'google-sheets', { error });
      return null;
    }
  }

  /**
   * Invalidar caché para una hoja específica
   * @param {string} spreadsheetId - ID de la hoja de Google Sheets
   * @returns {Promise<boolean>} - true si se invalidó correctamente
   */
  async invalidarCache(spreadsheetId) {
    try {
      const patterns = [
        `sheet_search_${spreadsheetId}_*`,
        `copropiedad_info_${spreadsheetId}`
      ];

      for (const pattern of patterns) {
        await cacheService.invalidateByPattern(pattern);
      }

      logger.info('Caché invalidada para hoja', 'google-sheets', { spreadsheetId });
      return true;

    } catch (error) {
      logger.error(`Error invalidar caché: ${error.message}`, 'google-sheets', { error });
      return false;
    }
  }
}

module.exports = new GoogleSheetsServiceCustom();
