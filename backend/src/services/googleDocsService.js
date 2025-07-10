/**
 * Servicio de integración con Google Docs
 * Implementa funciones para generar paz y salvos usando plantillas de Google Docs
 * y exportarlos como PDF
 */

const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const circuitBreaker = require('./circuitBreakerService');
require('dotenv').config();

// Directorio temporal para almacenar PDFs generados
const TMP_DIR = process.env.PDF_TMP_DIR || os.tmpdir();

// Tiempo de expiración de archivos temporales (1 hora por defecto)
const FILE_EXPIRY_MS = parseInt(process.env.PDF_FILE_EXPIRY_MS) || 3600000;

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
        scopes: [
          'https://www.googleapis.com/auth/documents',
          'https://www.googleapis.com/auth/drive'
        ]
      });
    }
    
    // De lo contrario, usar archivo de credenciales
    return new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive'
      ]
    });
  } catch (error) {
    logger.error(`Error al inicializar autenticación de Google: ${error.message}`, 'google-docs', { error });
    throw new Error('No se pudo inicializar la autenticación con Google');
  }
};

/**
 * Extrae el ID de un documento de Google Docs desde una URL
 * @param {string} url - URL de Google Docs
 * @returns {string|null} - ID del documento o null si no es válida
 */
const extractDocId = (url) => {
  try {
    // Patrones comunes de URLs de Google Docs
    const patterns = [
      /\/document\/d\/([a-zA-Z0-9-_]+)/,
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
    logger.error(`Error al extraer ID de documento: ${error.message}`, 'google-docs', { url, error });
    return null;
  }
};

/**
 * Crea una copia de una plantilla de Google Docs
 * @param {string} templateId - ID de la plantilla
 * @param {string} title - Título para la nueva copia
 * @returns {Promise<string>} - ID del nuevo documento
 */
const copyTemplate = async (templateId, title) => {
  try {
    const fetchCopy = async () => {
      const auth = await getAuthClient();
      const drive = google.drive({ version: 'v3', auth });
      
      const response = await drive.files.copy({
        fileId: templateId,
        requestBody: {
          name: title
        }
      });
      
      return response.data.id;
    };
    
    // Ejecutar a través del circuit breaker
    return await circuitBreaker.execute(
      'google-docs-copy',
      fetchCopy,
      [],
      () => { throw new Error('No se pudo copiar la plantilla de Google Docs'); }
    );
  } catch (error) {
    logger.error(`Error al copiar plantilla: ${error.message}`, 'google-docs', { templateId, error });
    throw error;
  }
};

/**
 * Reemplaza variables en un documento de Google Docs
 * @param {string} documentId - ID del documento
 * @param {Object} variables - Variables a reemplazar
 * @returns {Promise<boolean>} - true si se completó correctamente
 */
const replaceVariables = async (documentId, variables) => {
  try {
    const fetchReplace = async () => {
      const auth = await getAuthClient();
      const docs = google.docs({ version: 'v1', auth });
      
      // Preparar solicitudes de reemplazo
      const requests = [];
      
      for (const [key, value] of Object.entries(variables)) {
        requests.push({
          replaceAllText: {
            containsText: {
              text: `{{${key}}}`,
              matchCase: true
            },
            replaceText: value || ''
          }
        });
      }
      
      // Ejecutar reemplazos
      if (requests.length > 0) {
        await docs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests
          }
        });
      }
      
      return true;
    };
    
    // Ejecutar a través del circuit breaker
    return await circuitBreaker.execute(
      'google-docs-replace',
      fetchReplace,
      [],
      () => { throw new Error('No se pudieron reemplazar las variables en el documento'); }
    );
  } catch (error) {
    logger.error(`Error al reemplazar variables: ${error.message}`, 'google-docs', { documentId, error });
    throw error;
  }
};

/**
 * Exporta un documento de Google Docs como PDF
 * @param {string} documentId - ID del documento
 * @returns {Promise<string>} - Ruta al archivo PDF descargado
 */
const exportAsPDF = async (documentId) => {
  try {
    const fetchExport = async () => {
      const auth = await getAuthClient();
      const drive = google.drive({ version: 'v3', auth });
      
      // Exportar como PDF
      const response = await drive.files.export({
        fileId: documentId,
        mimeType: 'application/pdf'
      }, {
        responseType: 'arraybuffer'
      });
      
      // Guardar en archivo temporal
      const fileName = `paz_y_salvo_docs_${uuidv4()}.pdf`;
      const filePath = path.join(TMP_DIR, fileName);
      
      fs.writeFileSync(filePath, Buffer.from(response.data));
      
      // Programar eliminación del archivo temporal
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.debug(`Archivo temporal eliminado: ${filePath}`, 'google-docs');
          }
        } catch (err) {
          logger.warn(`No se pudo eliminar archivo temporal: ${err.message}`, 'google-docs');
        }
      }, FILE_EXPIRY_MS);
      
      return filePath;
    };
    
    // Ejecutar a través del circuit breaker
    return await circuitBreaker.execute(
      'google-docs-export',
      fetchExport,
      [],
      () => { throw new Error('No se pudo exportar el documento como PDF'); }
    );
  } catch (error) {
    logger.error(`Error al exportar como PDF: ${error.message}`, 'google-docs', { documentId, error });
    throw error;
  }
};

/**
 * Elimina un documento de Google Docs
 * @param {string} documentId - ID del documento
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const deleteDocument = async (documentId) => {
  try {
    const fetchDelete = async () => {
      const auth = await getAuthClient();
      const drive = google.drive({ version: 'v3', auth });
      
      await drive.files.delete({
        fileId: documentId
      });
      
      return true;
    };
    
    // Ejecutar a través del circuit breaker
    return await circuitBreaker.execute(
      'google-docs-delete',
      fetchDelete,
      [],
      () => false // Fallback: ignorar errores al eliminar
    );
  } catch (error) {
    logger.warn(`Error al eliminar documento: ${error.message}`, 'google-docs', { documentId, error });
    return false;
  }
};

/**
 * Genera un paz y salvo usando una plantilla de Google Docs
 * @param {Object} datos - Datos para generar el paz y salvo
 * @param {string} datos.nombreCopropiedad - Nombre de la copropiedad
 * @param {string} datos.nit - NIT de la copropiedad
 * @param {string} datos.torre - Torre o bloque
 * @param {string} datos.apto - Apartamento o casa
 * @param {string} datos.nombrePropietario - Nombre del propietario
 * @param {string} datos.identificacion - Identificación del propietario
 * @param {string} datos.plantillaId - ID de la plantilla de Google Docs
 * @returns {Promise<{success: boolean, filePath?: string, message?: string}>} - Resultado de la generación
 */
const generarPazYSalvo = async (datos) => {
  let documentId = null;
  
  try {
    // Validar que tengamos un ID de plantilla
    if (!datos.plantillaId) {
      throw new Error('No se proporcionó ID de plantilla');
    }
    
    // Extraer ID de la plantilla si es una URL
    const templateId = extractDocId(datos.plantillaId) || datos.plantillaId;
    
    // Crear título para la copia
    const title = `Paz y Salvo - ${datos.nombreCopropiedad} - ${datos.torre} ${datos.apto} - ${new Date().toISOString()}`;
    
    // Copiar plantilla
    logger.debug('Copiando plantilla de Google Docs', 'google-docs');
    documentId = await copyTemplate(templateId, title);
    
    // Preparar variables para reemplazar
    const fecha = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    
    const variables = {
      NOMBRE_COPROPIEDAD: datos.nombreCopropiedad,
      NIT: datos.nit,
      TORRE_BLOQUE: datos.torre,
      APTO_CASA: datos.apto,
      NOMBRE_PROPIETARIO: datos.nombrePropietario,
      IDENTIFICACION: datos.identificacion,
      FECHA_EXPEDICION: fecha.toLocaleDateString('es-CO', options),
      FECHA_VENCIMIENTO: new Date(fecha.setDate(fecha.getDate() + 30)).toLocaleDateString('es-CO', options)
    };
    
    // Reemplazar variables en el documento
    logger.debug('Reemplazando variables en el documento', 'google-docs');
    await replaceVariables(documentId, variables);
    
    // Exportar como PDF
    logger.debug('Exportando documento como PDF', 'google-docs');
    const filePath = await exportAsPDF(documentId);
    
    // Eliminar documento temporal
    deleteDocument(documentId).catch(() => {});
    
    return {
      success: true,
      filePath,
      message: 'Paz y salvo generado correctamente con Google Docs'
    };
  } catch (error) {
    logger.error(`Error al generar paz y salvo con Google Docs: ${error.message}`, 'google-docs', { error });
    
    // Intentar eliminar el documento si se creó
    if (documentId) {
      deleteDocument(documentId).catch(() => {});
    }
    
    return {
      success: false,
      message: `Error al generar paz y salvo: ${error.message}`
    };
  }
};

module.exports = {
  generarPazYSalvo,
  extractDocId
};
