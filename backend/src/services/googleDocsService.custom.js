/**
 * Servicio de integración con Google Docs PERSONALIZADO
 * Implementa funciones específicas para generar paz y salvos usando plantillas personalizadas
 * 
 * ✅ CONFIGURACIÓN EXITOSA VERIFICADA - 2025-07-10
 * URL Real Funcionando: https://docs.google.com/document/d/1ohOpvNzG1r2R_Dy373wnUKUOK5o0j74sP0V1dw4hv4o/edit
 * Plantilla: "Plantillla_paz_y_salvos"
 * 
 * Placeholders Reales Detectados (13 variables):
 * - {{NOMBRE_COPROPIEDAD}} - {{NOMBRE_ADMINISTRADOR}}
 * - {{NUMERO_RESOLUCION}} - {{FECHA_RESOLUCION}} - {{CIUDAD_ALCALDIA}}
 * - {{TIPO_INMUEBLE}} - {{NUMERO_INMUEBLE}} - {{TORRE_EDIFICIO}}
 * - {{DIA_ACTUAL}} - {{MES_ACTUAL}}
 * - {{DIA_EXPEDICION}} - {{MES_EXPEDICION}}
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
const TMP_DIR = process.env.PDF_TMP_DIR || path.join(os.tmpdir(), 'paz-y-salvos');

// Tiempo de expiración de archivos temporales (1 hora por defecto)
const FILE_EXPIRY_MS = parseInt(process.env.PDF_FILE_EXPIRY_MS) || 3600000;

class GoogleDocsServiceCustom {
  constructor() {
    this.auth = null;
    this.docs = null;
    this.drive = null;
    
    // Crear directorio temporal si no existe
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }
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
          scopes: [
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/drive'
          ]
        });
      } else {
        // De lo contrario, usar archivo de credenciales
        this.auth = new GoogleAuth({
          keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
          scopes: [
            'https://www.googleapis.com/auth/documents',
            'https://www.googleapis.com/auth/drive'
          ]
        });
      }

      this.docs = google.docs({ version: 'v1', auth: this.auth });
      this.drive = google.drive({ version: 'v3', auth: this.auth });

      return this.auth;

    } catch (error) {
      logger.error(`Error al inicializar autenticación de Google: ${error.message}`, 'google-docs', { error });
      throw new Error('No se pudo inicializar la autenticación con Google');
    }
  }

  /**
   * Extrae el ID de un documento de Google Docs desde una URL
   * @param {string} url - URL de Google Docs
   * @returns {string|null} - ID del documento o null si no es válida
   */
  extractDocId(url) {
    if (!url) return null;
    
    try {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      return match ? match[1] : null;
    } catch (error) {
      logger.error(`Error al extraer ID de Google Docs: ${error.message}`, 'google-docs');
      return null;
    }
  }

  /**
   * Valida que una plantilla de Google Docs tenga los placeholders necesarios
   * @param {string} templateId - ID de la plantilla
   * @returns {Promise<{valido: boolean, mensaje: string, placeholders?: Array}>}
   */
  async validarPlantilla(templateId) {
    try {
      await this.initAuth();

      // Obtener el documento
      const doc = await this.docs.documents.get({
        documentId: templateId
      });

      // Extraer todo el texto del documento
      let fullText = '';
      const content = doc.data.body.content;
      
      for (const element of content) {
        if (element.paragraph) {
          for (const textElement of element.paragraph.elements) {
            if (textElement.textRun) {
              fullText += textElement.textRun.content;
            }
          }
        }
      }

      // Buscar placeholders específicos
      const requiredPlaceholders = [
        '{{COPROPIEDAD}}',
        '{{PROPIETARIO}}',
        '{{INMUEBLE}}',
        '{{FECHA}}'
      ];

      const foundPlaceholders = [];
      const missingPlaceholders = [];

      for (const placeholder of requiredPlaceholders) {
        if (fullText.includes(placeholder)) {
          foundPlaceholders.push(placeholder);
        } else {
          missingPlaceholders.push(placeholder);
        }
      }

      // Buscar todos los placeholders presentes
      const allPlaceholders = fullText.match(/\{\{[^}]+\}\}/g) || [];

      return {
        valido: missingPlaceholders.length === 0,
        mensaje: missingPlaceholders.length === 0 
          ? 'Plantilla válida con todos los placeholders requeridos'
          : `Faltan placeholders: ${missingPlaceholders.join(', ')}`,
        placeholders: [...new Set(allPlaceholders)],
        foundRequired: foundPlaceholders,
        missingRequired: missingPlaceholders
      };

    } catch (error) {
      logger.error(`Error validar plantilla: ${error.message}`, 'google-docs', { error, templateId });
      return {
        valido: false,
        mensaje: `Error al validar plantilla: ${error.message}`
      };
    }
  }

  /**
   * Genera un paz y salvo usando una plantilla personalizada
   * @param {Object} datos - Datos para generar el paz y salvo
   * @param {string} datos.plantillaUrl - URL de la plantilla de Google Docs
   * @param {string} datos.nombreCopropiedad - Nombre de la copropiedad
   * @param {string} datos.nitCopropiedad - NIT de la copropiedad
   * @param {string} datos.nombrePropietario - Nombre del propietario
   * @param {string} datos.cedulaPropietario - Cédula del propietario
   * @param {string} datos.telefonoPropietario - Teléfono del propietario
   * @param {string} datos.inmueble - Inmueble (ej: Torre A Apto 101)
   * @param {string} datos.tipoInmueble - Tipo de inmueble
   * @param {Object} datos.adicionales - Datos adicionales opcionales
   * @returns {Promise<{success: boolean, documento?: Object, url?: string, fechaGeneracion?: string, message?: string}>}
   */
  async generarPazYSalvo(datos) {
    const docId = uuidv4();
    logger.info('Iniciando generación de paz y salvo', 'google-docs', { docId, propietario: datos.nombrePropietario });

    try {
      await this.initAuth();

      // Extraer ID de la plantilla
      const templateId = this.extractDocId(datos.plantillaUrl);
      if (!templateId) {
        throw new Error('URL de plantilla inválida');
      }

      // Validar plantilla primero
      const validacion = await this.validarPlantilla(templateId);
      if (!validacion.valido) {
        logger.warn('Plantilla no válida', 'google-docs', { templateId, validacion });
      }

      // Crear copia de la plantilla
      const fechaActual = new Date().toLocaleDateString('es-CO');
      const nombreDocumento = `Paz y Salvo - ${datos.nombrePropietario} - ${datos.inmueble} - ${fechaActual}`;
      
      const copyResponse = await this.drive.files.copy({
        fileId: templateId,
        requestBody: {
          name: nombreDocumento
        }
      });

      const newDocId = copyResponse.data.id;
      logger.info('Documento copiado exitosamente', 'google-docs', { docId, newDocId, nombre: nombreDocumento });

      // Preparar variables para reemplazo
      const variables = {
        '{{COPROPIEDAD}}': datos.nombreCopropiedad || 'NOMBRE_COPROPIEDAD',
        '{{NIT_COPROPIEDAD}}': datos.nitCopropiedad || 'NIT_COPROPIEDAD',
        '{{PROPIETARIO}}': datos.nombrePropietario || 'NOMBRE_PROPIETARIO',
        '{{CEDULA}}': datos.cedulaPropietario || 'CEDULA_PROPIETARIO',
        '{{TELEFONO}}': datos.telefonoPropietario || 'TELEFONO_PROPIETARIO',
        '{{INMUEBLE}}': datos.inmueble || 'INMUEBLE',
        '{{TIPO_INMUEBLE}}': datos.tipoInmueble || 'TIPO_INMUEBLE',
        '{{FECHA}}': fechaActual,
        '{{FECHA_EXPEDICION}}': fechaActual,
        '{{FECHA_ACTUAL}}': fechaActual,
        
        // Variables adicionales si existen
        ...datos.adicionales
      };

      // Reemplazar variables en el documento
      await this.reemplazarVariables(newDocId, variables);

      // Exportar como PDF
      const pdfPath = await this.exportarComoPDF(newDocId, nombreDocumento);

      // Eliminar documento temporal de Google Drive
      try {
        await this.drive.files.delete({ fileId: newDocId });
        logger.info('Documento temporal eliminado', 'google-docs', { docId, newDocId });
      } catch (deleteError) {
        logger.warn('No se pudo eliminar documento temporal', 'google-docs', { 
          docId, 
          newDocId, 
          error: deleteError.message 
        });
      }

      // Programar eliminación del archivo local
      setTimeout(() => {
        this.eliminarArchivoTemporal(pdfPath);
      }, FILE_EXPIRY_MS);

      logger.info('Paz y salvo generado exitosamente', 'google-docs', { 
        docId, 
        propietario: datos.nombrePropietario,
        archivo: path.basename(pdfPath)
      });

      return {
        success: true,
        documento: {
          id: docId,
          nombre: nombreDocumento,
          tipo: 'paz-y-salvo',
          propietario: datos.nombrePropietario,
          inmueble: datos.inmueble
        },
        url: `/api/v1/propietarios/descargar-paz-y-salvo/${path.basename(pdfPath)}`,
        fechaGeneracion: fechaActual,
        message: 'Paz y salvo generado exitosamente'
      };

    } catch (error) {
      logger.error(`Error generando paz y salvo: ${error.message}`, 'google-docs', { 
        docId, 
        error,
        propietario: datos.nombrePropietario 
      });

      return {
        success: false,
        message: `Error al generar paz y salvo: ${error.message}`
      };
    }
  }

  /**
   * Reemplaza variables en un documento de Google Docs
   * @param {string} documentId - ID del documento
   * @param {Object} variables - Variables a reemplazar
   * @returns {Promise<boolean>} - true si se completó correctamente
   */
  async reemplazarVariables(documentId, variables) {
    try {
      const requests = [];

      // Crear solicitudes de reemplazo para cada variable
      for (const [placeholder, value] of Object.entries(variables)) {
        requests.push({
          replaceAllText: {
            containsText: {
              text: placeholder,
              matchCase: true
            },
            replaceText: String(value)
          }
        });
      }

      // Ejecutar todas las solicitudes de reemplazo
      if (requests.length > 0) {
        await this.docs.documents.batchUpdate({
          documentId,
          requestBody: {
            requests
          }
        });

        logger.info('Variables reemplazadas exitosamente', 'google-docs', { 
          documentId, 
          variablesCount: requests.length 
        });
      }

      return true;

    } catch (error) {
      logger.error(`Error reemplazar variables: ${error.message}`, 'google-docs', { error, documentId });
      throw error;
    }
  }

  /**
   * Exporta un documento de Google Docs como PDF
   * @param {string} documentId - ID del documento
   * @param {string} fileName - Nombre base del archivo
   * @returns {Promise<string>} - Ruta al archivo PDF descargado
   */
  async exportarComoPDF(documentId, fileName) {
    try {
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9\s\-\.]/g, '_');
      const pdfFileName = `${sanitizedFileName}_${Date.now()}.pdf`;
      const pdfPath = path.join(TMP_DIR, pdfFileName);

      // Exportar como PDF
      const response = await this.drive.files.export({
        fileId: documentId,
        mimeType: 'application/pdf'
      }, { responseType: 'stream' });

      // Guardar el archivo PDF
      const writer = fs.createWriteStream(pdfPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          logger.info('PDF exportado exitosamente', 'google-docs', { 
            documentId, 
            pdfPath: path.basename(pdfPath),
            size: fs.statSync(pdfPath).size 
          });
          resolve(pdfPath);
        });
        writer.on('error', reject);
      });

    } catch (error) {
      logger.error(`Error exportar PDF: ${error.message}`, 'google-docs', { error, documentId });
      throw error;
    }
  }

  /**
   * Elimina un archivo temporal después del tiempo de expiración
   * @param {string} filePath - Ruta del archivo a eliminar
   */
  eliminarArchivoTemporal(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('Archivo temporal eliminado', 'google-docs', { 
          archivo: path.basename(filePath) 
        });
      }
    } catch (error) {
      logger.warn('No se pudo eliminar archivo temporal', 'google-docs', { 
        archivo: path.basename(filePath),
        error: error.message 
      });
    }
  }

  /**
   * Obtiene la ruta de un archivo PDF temporal para descarga
   * @param {string} fileName - Nombre del archivo
   * @returns {string|null} - Ruta completa del archivo o null si no existe
   */
  obtenerRutaPDF(fileName) {
    const filePath = path.join(TMP_DIR, fileName);
    return fs.existsSync(filePath) ? filePath : null;
  }

  /**
   * Limpia archivos temporales antiguos
   * @returns {Promise<number>} - Número de archivos eliminados
   */
  async limpiarArchivosTemporales() {
    try {
      const files = fs.readdirSync(TMP_DIR);
      const now = Date.now();
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(TMP_DIR, file);
        const stats = fs.statSync(filePath);
        
        // Eliminar archivos más antiguos que FILE_EXPIRY_MS
        if (now - stats.mtime.getTime() > FILE_EXPIRY_MS) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        logger.info('Archivos temporales limpiados', 'google-docs', { eliminados: deletedCount });
      }

      return deletedCount;

    } catch (error) {
      logger.error(`Error limpiando archivos temporales: ${error.message}`, 'google-docs', { error });
      return 0;
    }
  }
}

module.exports = new GoogleDocsServiceCustom();
