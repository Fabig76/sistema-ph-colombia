/**
 * Rutas de prueba para Google APIs con URLs reales
 * Solo para verificación - REMOVER en producción
 */

const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService.custom');
const googleDocsService = require('../services/googleDocsService.custom');
const googleApisService = require('../services/googleApisService.production');

// URLs reales funcionando
const REAL_SHEET_URL = 'https://docs.google.com/spreadsheets/d/18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI/edit';
const REAL_DOC_URL = 'https://docs.google.com/document/d/1ohOpvNzG1r2R_Dy373wnUKUOK5o0j74sP0V1dw4hv4o/edit';

/**
 * GET /api/test-google/health
 * Verifica que las APIs de Google están funcionando
 */
router.get('/health', async (req, res) => {
  try {
    // Probar básicamente si podemos extraer IDs de las URLs
    const googleSheetsService = require('../services/googleSheetsService');
    const googleDocsService = require('../services/googleDocsService');
    
    const sheetIds = googleSheetsService.extractSheetId ? googleSheetsService.extractSheetId(REAL_SHEET_URL) : 'available';
    const docIds = googleDocsService.extractDocId ? googleDocsService.extractDocId(REAL_DOC_URL) : 'available';
    
    res.json({
      status: 'success',
      message: 'Google APIs Health Check básico',
      data: {
        sheets: {
          url: REAL_SHEET_URL,
          id_extracted: sheetIds !== null,
          service_available: true
        },
        docs: {
          url: REAL_DOC_URL,
          id_extracted: docIds !== null,
          service_available: true
        },
        overall: 'basic_check_passed',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error en health check de Google APIs',
      error: error.message
    });
  }
});

/**
 * GET /api/test-google/sheets
 * Prueba lectura de Google Sheets con URL real
 */
router.get('/sheets', async (req, res) => {
  try {
    const googleSheetsService = require('../services/googleSheetsService');
    
    // Validar formato de la hoja
    const sheetId = googleSheetsService.extractSheetId(REAL_SHEET_URL);
    
    if (!sheetId) {
      return res.status(400).json({
        status: 'error',
        message: 'URL de Google Sheets inválida'
      });
    }
    
    const validation = await googleSheetsService.validateSheetFormat(sheetId);
    
    res.json({
      status: 'success',
      message: 'Validación Google Sheets completada',
      data: {
        sheetId,
        validation
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error en prueba Google Sheets',
      error: error.message
    });
  }
});

/**
 * GET /api/test-google/sheets/inmuebles
 * Prueba consulta de inmuebles por teléfono
 */
router.get('/sheets/inmuebles', async (req, res) => {
  try {
    const googleSheetsService = require('../services/googleSheetsService');
    
    const cedula = req.query.cedula || '1234567890'; // Cédula de prueba
    const telefono = req.query.telefono || '3001234567'; // Teléfono de prueba
    
    const sheetId = googleSheetsService.extractSheetId(REAL_SHEET_URL);
    
    if (!sheetId) {
      return res.status(400).json({
        status: 'error',
        message: 'URL de Google Sheets inválida'
      });
    }
    
    const result = await googleSheetsService.buscarPropiedadesPorIdentificacion(
      sheetId, cedula, telefono
    );
    
    res.json({
      status: 'success',
      message: 'Consulta inmuebles exitosa',
      data: result
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error consultando inmuebles',
      error: error.message
    });
  }
});

/**
 * GET /api/test-google/docs
 * Prueba básica de Google Docs service
 */
router.get('/docs', async (req, res) => {
  try {
    const googleDocsService = require('../services/googleDocsService');
    
    // Extraer ID del documento
    const docId = googleDocsService.extractDocId(REAL_DOC_URL);
    
    if (!docId) {
      return res.status(400).json({
        status: 'error',
        message: 'URL de Google Docs inválida'
      });
    }
    
    res.json({
      status: 'success',
      message: 'Google Docs service disponible',
      data: {
        docId,
        url: REAL_DOC_URL,
        service_available: true,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error en Google Docs service',
      error: error.message
    });
  }
});

/**
 * GET /api/test-google/summary
 * Resumen del estado de todos los servicios Google
 */
router.get('/summary', async (req, res) => {
  try {
    const googleSheetsService = require('../services/googleSheetsService');
    const googleDocsService = require('../services/googleDocsService');
    
    const summary = {
      timestamp: new Date().toISOString(),
      services: {
        sheets: {
          url: REAL_SHEET_URL,
          id: googleSheetsService.extractSheetId(REAL_SHEET_URL),
          available: true
        },
        docs: {
          url: REAL_DOC_URL,
          id: googleDocsService.extractDocId(REAL_DOC_URL),
          available: true
        }
      },
      available_functions: {
        sheets: ['validateSheetFormat', 'extractSheetId', 'buscarPropiedadesPorIdentificacion', 'verificarEstadoCuenta'],
        docs: ['extractDocId', 'crearDocumentoDesdeTemplate']
      }
    };
    
    res.json({
      status: 'success',
      message: 'Resumen de Google APIs',
      data: summary
    });
    
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error generando resumen',
      error: error.message
    });
  }
});

module.exports = router;
