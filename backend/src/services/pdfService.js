/**
 * Servicio de generación de PDFs
 * Implementa funciones para generar paz y salvos en PDF localmente
 * con PDFKit y fallback a Google Docs en caso de error
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const googleDocsService = require('./googleDocsService');
require('dotenv').config();

// Directorio temporal para almacenar PDFs generados
const TMP_DIR = process.env.PDF_TMP_DIR || os.tmpdir();

// Tiempo de expiración de archivos temporales (1 hora por defecto)
const FILE_EXPIRY_MS = parseInt(process.env.PDF_FILE_EXPIRY_MS) || 3600000;

/**
 * Genera un paz y salvo en PDF usando PDFKit
 * @param {Object} datos - Datos para generar el paz y salvo
 * @param {string} datos.nombreCopropiedad - Nombre de la copropiedad
 * @param {string} datos.nit - NIT de la copropiedad
 * @param {string} datos.torre - Torre o bloque
 * @param {string} datos.apto - Apartamento o casa
 * @param {string} datos.nombrePropietario - Nombre del propietario
 * @param {string} datos.identificacion - Identificación del propietario
 * @returns {Promise<{success: boolean, filePath?: string, message?: string}>} - Resultado de la generación
 */
const generarPazYSalvoPDF = async (datos) => {
  try {
    // Crear nombre único para el archivo
    const fileName = `paz_y_salvo_${datos.nit}_${datos.torre}_${datos.apto}_${uuidv4()}.pdf`;
    const filePath = path.join(TMP_DIR, fileName);
    
    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      info: {
        Title: `Paz y Salvo - ${datos.nombreCopropiedad}`,
        Author: 'Sistema Paz y Salvos PH Colombia',
        Subject: 'Certificado de Paz y Salvo',
        Keywords: 'paz y salvo, propiedad horizontal, colombia',
        CreationDate: new Date()
      }
    });
    
    // Stream para escribir a archivo
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    // Agregar contenido al PDF
    
    // Encabezado
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('CERTIFICADO DE PAZ Y SALVO', { align: 'center' })
       .moveDown(0.5);
    
    // Logo o imagen (si existe)
    try {
      const logoPath = path.join(__dirname, '../../assets/logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, {
          fit: [150, 150],
          align: 'center'
        }).moveDown(0.5);
      }
    } catch (error) {
      logger.warn('No se pudo cargar el logo', 'pdf', { error: error.message });
    }
    
    // Datos de la copropiedad
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text(datos.nombreCopropiedad.toUpperCase(), { align: 'center' })
       .fontSize(12)
       .text(`NIT: ${datos.nit}`, { align: 'center' })
       .moveDown(1);
    
    // Contenido principal
    doc.fontSize(12)
       .font('Helvetica')
       .text('CERTIFICA QUE:', { align: 'center' })
       .moveDown(1);
    
    doc.fontSize(12)
       .font('Helvetica')
       .text(`El(la) señor(a) ${datos.nombrePropietario.toUpperCase()}, identificado(a) con número ${datos.identificacion}, propietario(a) del inmueble ubicado en ${datos.torre} - ${datos.apto}, se encuentra a PAZ Y SALVO por concepto de cuotas de administración y demás obligaciones con la copropiedad hasta la fecha de expedición del presente certificado.`, { align: 'justify' })
       .moveDown(2);
    
    // Fecha de expedición
    const fecha = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    doc.text(`Expedido en Bogotá, D.C., a los ${fecha.toLocaleDateString('es-CO', options)}.`, { align: 'left' })
       .moveDown(3);
    
    // Firma
    doc.text('_______________________________', { align: 'center' })
       .fontSize(11)
       .text('Administrador(a)', { align: 'center' })
       .text(datos.nombreCopropiedad, { align: 'center' })
       .moveDown(1);
    
    // Nota de validez
    doc.fontSize(9)
       .font('Helvetica-Oblique')
       .text('Este certificado tiene validez de treinta (30) días calendario a partir de su expedición. Generado automáticamente por el Sistema Paz y Salvos PH Colombia.', { align: 'center' });
    
    // Agregar pie de página con número de página
    const totalPaginas = 1;
    doc.fontSize(8)
       .text(`Página 1 de ${totalPaginas}`, { align: 'right' });
    
    // Finalizar documento
    doc.end();
    
    // Esperar a que se complete la escritura
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        // Programar eliminación del archivo temporal
        setTimeout(() => {
          try {
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              logger.debug(`Archivo temporal eliminado: ${filePath}`, 'pdf');
            }
          } catch (err) {
            logger.warn(`No se pudo eliminar archivo temporal: ${err.message}`, 'pdf');
          }
        }, FILE_EXPIRY_MS);
        
        resolve({
          success: true,
          filePath,
          message: 'PDF generado correctamente'
        });
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
    });
  } catch (error) {
    logger.error(`Error al generar PDF: ${error.message}`, 'pdf', { error });
    
    // Intentar fallback a Google Docs
    logger.info('Intentando fallback a Google Docs', 'pdf');
    try {
      const docsResult = await googleDocsService.generarPazYSalvo(datos);
      if (docsResult.success) {
        return {
          success: true,
          filePath: docsResult.filePath,
          message: 'PDF generado correctamente (fallback a Google Docs)'
        };
      } else {
        return {
          success: false,
          message: 'No se pudo generar el PDF'
        };
      }
    } catch (fallbackError) {
      logger.error(`Error en fallback a Google Docs: ${fallbackError.message}`, 'pdf', { error: fallbackError });
      return {
        success: false,
        message: 'No se pudo generar el PDF'
      };
    }
  }
};

/**
 * Obtiene la ruta de un archivo PDF generado
 * @param {string} fileName - Nombre del archivo
 * @returns {string|null} - Ruta completa o null si no existe
 */
const getFilePath = (fileName) => {
  const filePath = path.join(TMP_DIR, fileName);
  
  if (fs.existsSync(filePath)) {
    return filePath;
  }
  
  return null;
};

/**
 * Limpia archivos temporales antiguos
 * @returns {Promise<number>} - Número de archivos eliminados
 */
const limpiarArchivosTemporales = async () => {
  try {
    const files = fs.readdirSync(TMP_DIR);
    let eliminados = 0;
    
    const ahora = Date.now();
    
    for (const file of files) {
      if (file.startsWith('paz_y_salvo_') && file.endsWith('.pdf')) {
        const filePath = path.join(TMP_DIR, file);
        const stats = fs.statSync(filePath);
        
        // Eliminar si es más antiguo que el tiempo de expiración
        if (ahora - stats.mtimeMs > FILE_EXPIRY_MS) {
          fs.unlinkSync(filePath);
          eliminados++;
        }
      }
    }
    
    logger.info(`Limpieza de archivos temporales: ${eliminados} archivos eliminados`, 'pdf');
    return eliminados;
  } catch (error) {
    logger.error(`Error al limpiar archivos temporales: ${error.message}`, 'pdf', { error });
    return 0;
  }
};

module.exports = {
  generarPazYSalvoPDF,
  getFilePath,
  limpiarArchivosTemporales
};
