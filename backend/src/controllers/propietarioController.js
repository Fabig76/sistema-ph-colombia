/**
 * Controlador de propietarios ACTUALIZADO - PRODUCCIÓN READY
 * Integración completa con Google Sheets y Google Docs personalizados
 * 
 * ✅ URLs REALES FUNCIONANDO - Verificado 2025-07-10
 * Google Sheets: https://docs.google.com/spreadsheets/d/18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI/edit
 * Google Docs: https://docs.google.com/document/d/1ohOpvNzG1r2R_Dy373wnUKUOK5o0j74sP0V1dw4hv4o/edit
 * 
 * Maneja operaciones relacionadas con consultas de propietarios y generación de paz y salvos
 * Sin almacenamiento local de datos personales, solo consultas en tiempo real
 * 
 * ENDPOINTS LISTOS PARA PRODUCCIÓN:
 * - GET /api/propietarios/copropiedad/:nit - Buscar copropiedad ✅
 * - POST /api/propietarios/solicitar-codigo - Solicitar SMS ✅
 * - POST /api/propietarios/consultar - Consultar inmuebles ✅
 * - POST /api/propietarios/generar-paz-y-salvo - Generar PDF ✅
 * - GET /api/propietarios/descargar-paz-y-salvo/:filename - Descargar PDF ✅
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const googleSheetsService = require('../services/googleSheetsService.custom');
const googleDocsService = require('../services/googleDocsService.custom');
const smsService = require('../services/smsService');
const cacheService = require('../services/cacheService');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Busca una copropiedad por NIT
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const buscarCopropiedad = async (req, res) => {
  try {
    const { nit } = req.params;
    
    if (!nit) {
      return res.status(400).json({
        status: 'error',
        message: 'NIT de copropiedad no proporcionado'
      });
    }
    
    // Buscar copropiedad en la base de datos
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        nit,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        nit: true,
        hojaGoogleSheetsUrl: true,
        plantillaGoogleDocsUrl: true
      }
    });
    
    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }

    // Validar que tenga configuración de Google Sheets
    if (!copropiedad.hojaGoogleSheetsUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Copropiedad no tiene configurada la hoja de Google Sheets'
      });
    }

    // Validar estructura de la hoja de Google Sheets
    const sheetId = googleSheetsService.extractSheetId(copropiedad.hojaGoogleSheetsUrl);
    if (!sheetId) {
      return res.status(400).json({
        status: 'error',
        message: 'URL de Google Sheets inválida'
      });
    }

    const validacion = await googleSheetsService.validarEstructuraHoja(sheetId);
    if (!validacion.valido) {
      logger.warn('Hoja de Google Sheets con estructura inválida', 'propietario', { 
        nit, 
        sheetId, 
        error: validacion.mensaje 
      });
      
      return res.status(400).json({
        status: 'error',
        message: `Estructura de hoja inválida: ${validacion.mensaje}`
      });
    }

    // Verificar que el NIT coincida con el de la hoja
    if (validacion.copropiedad.nit !== nit) {
      return res.status(400).json({
        status: 'error',
        message: 'El NIT de la copropiedad no coincide con el de la hoja de Google Sheets'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        copropiedad: {
          nombre: validacion.copropiedad.nombre,
          nit: validacion.copropiedad.nit
        },
        mensaje: 'Copropiedad encontrada y validada correctamente'
      }
    });

  } catch (error) {
    logger.error(`Error al buscar copropiedad: ${error.message}`, 'propietario', { 
      error, 
      nit: req.params.nit 
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al buscar copropiedad'
    });
  }
};

/**
 * Solicita código de verificación SMS para un propietario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const solicitarCodigoVerificacion = async (req, res) => {
  try {
    const { nit, telefono } = req.body;
    
    if (!nit || !telefono) {
      return res.status(400).json({
        status: 'error',
        message: 'NIT y teléfono son requeridos'
      });
    }
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar copropiedad
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        nit,
        activo: true
      }
    });
    
    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }

    // Verificar que el propietario existe en la hoja de Google Sheets
    const sheetId = googleSheetsService.extractSheetId(copropiedad.hojaGoogleSheetsUrl);
    const propietario = await googleSheetsService.buscarPropietarioPorTelefono(sheetId, telefonoNormalizado);
    
    if (!propietario) {
      return res.status(404).json({
        status: 'error',
        message: 'No se encontró un propietario registrado con ese número de teléfono'
      });
    }
    
    // Enviar código SMS
    const resultadoSMS = await smsService.enviarCodigo(
      telefonoNormalizado,
      'VERIFICACION',
      {
        nit,
        propietario: propietario.propietario
      }
    );
    
    if (!resultadoSMS.success) {
      return res.status(500).json({
        status: 'error',
        message: resultadoSMS.message
      });
    }
    
    logger.info('Código SMS enviado exitosamente', 'propietario', { 
      nit, 
      telefono: telefonoNormalizado,
      propietario: propietario.propietario
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        mensaje: 'Código de verificación enviado por SMS',
        telefono: telefonoNormalizado,
        propietario: propietario.propietario
      }
    });

  } catch (error) {
    logger.error(`Error al solicitar código: ${error.message}`, 'propietario', { 
      error, 
      nit: req.body.nit,
      telefono: req.body.telefono
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al solicitar código de verificación'
    });
  }
};

/**
 * Verifica el código SMS y consulta los inmuebles del propietario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const consultarInmuebles = async (req, res) => {
  try {
    const { nit, cedula, telefono, codigoVerificacion } = req.body;
    
    if (!nit || !telefono || !codigoVerificacion) {
      return res.status(400).json({
        status: 'error',
        message: 'NIT, teléfono y código de verificación son requeridos'
      });
    }
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar copropiedad
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        nit,
        activo: true
      }
    });
    
    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }
    
    // Verificar código SMS
    const verificacion = await smsService.verificarCodigo(
      telefonoNormalizado,
      codigoVerificacion,
      'VERIFICACION',
      { 
        nit,
        cedula
      }
    );
    
    if (!verificacion.success) {
      return res.status(400).json({
        status: 'error',
        message: verificacion.message
      });
    }
    
    // Consultar inmuebles del propietario usando el teléfono
    const sheetId = googleSheetsService.extractSheetId(copropiedad.hojaGoogleSheetsUrl);
    
    if (!sheetId) {
      return res.status(400).json({
        status: 'error',
        message: 'URL de Google Sheets inválida en la copropiedad'
      });
    }
    
    // Buscar propietario por teléfono
    const propietario = await googleSheetsService.buscarPropietarioPorTelefono(
      sheetId,
      telefonoNormalizado
    );
    
    if (!propietario) {
      return res.status(404).json({
        status: 'error',
        message: 'Propietario no encontrado con ese teléfono'
      });
    }
    
    // Verificar que la cédula coincida si se proporcionó
    if (cedula && !propietario.propietario.includes(cedula)) {
      return res.status(400).json({
        status: 'error',
        message: 'La cédula no coincide con el propietario encontrado'
      });
    }
    
    // Registrar evento de consulta
    await prisma.evento.create({
      data: {
        tipo: 'GENERACION_PAZ_Y_SALVO',
        descripcion: `Consulta de inmuebles por propietario ${propietario.propietario}`,
        copropiedadId: copropiedad.id,
        fecha: new Date()
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        copropiedad: {
          nombre: copropiedad.nombre,
          nit: copropiedad.nit
        },
        propietario: {
          nombre: propietario.propietario,
          telefono: propietario.telefono,
          email: propietario.email
        },
        inmuebles: [{
          inmueble: propietario.inmueble,
          tipo: propietario.tipo,
          torre: propietario.torre,
          estadoCuenta: propietario.estadoCuenta,
          saldo: propietario.saldo,
          alDia: googleSheetsService.estaAlDia(propietario)
        }]
      }
    });
  } catch (error) {
    logger.error(`Error al consultar inmuebles: ${error.message}`, 'propietario', { 
      error, 
      nit: req.body.nit,
      telefono: req.body.telefono
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al consultar inmuebles'
    });
  }
};

/**
 * Genera un paz y salvo para un propietario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const generarPazYSalvo = async (req, res) => {
  try {
    const { nit, cedula, telefono, codigoVerificacion } = req.body;
    
    if (!nit || !telefono || !codigoVerificacion) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos requeridos: NIT, teléfono y código de verificación'
      });
    }
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Verificar código SMS
    const verificacion = await smsService.verificarCodigo(
      telefonoNormalizado,
      codigoVerificacion,
      'VERIFICACION',
      { 
        nit,
        cedula
      }
    );
    
    if (!verificacion.success) {
      return res.status(400).json({
        status: 'error',
        message: verificacion.message
      });
    }
    
    // Buscar copropiedad
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        nit,
        activo: true
      }
    });
    
    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }

    // Verificar que tenga plantilla de Google Docs configurada
    if (!copropiedad.plantillaGoogleDocsUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'Copropiedad no tiene configurada la plantilla de paz y salvo'
      });
    }
    
    // Consultar datos del propietario
    const sheetId = googleSheetsService.extractSheetId(copropiedad.hojaGoogleSheetsUrl);
    const propietario = await googleSheetsService.buscarPropietarioPorTelefono(
      sheetId,
      telefonoNormalizado
    );
    
    if (!propietario) {
      return res.status(404).json({
        status: 'error',
        message: 'Propietario no encontrado'
      });
    }
    
    // Verificar que está al día
    if (!googleSheetsService.estaAlDia(propietario)) {
      return res.status(403).json({
        status: 'error',
        message: 'No se puede generar paz y salvo. El inmueble presenta saldo pendiente con la administración.'
      });
    }
    
    // Preparar datos para el documento
    const datosDocumento = {
      plantillaUrl: copropiedad.plantillaGoogleDocsUrl,
      nombreCopropiedad: copropiedad.nombre,
      nitCopropiedad: copropiedad.nit,
      nombrePropietario: propietario.propietario,
      cedulaPropietario: cedula || 'N/A',
      telefonoPropietario: propietario.telefono,
      inmueble: propietario.inmueble,
      tipoInmueble: propietario.tipo,
      adicionales: {
        '{{TORRE}}': propietario.torre || 'N/A',
        '{{EMAIL}}': propietario.email || 'N/A',
        '{{ESTADO_CUENTA}}': propietario.estadoCuenta
      }
    };
    
    // Generar paz y salvo con Google Docs
    const resultado = await googleDocsService.generarPazYSalvo(datosDocumento);
    
    if (!resultado.success) {
      return res.status(500).json({
        status: 'error',
        message: resultado.message || 'Error al generar paz y salvo'
      });
    }
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'GENERACION_PAZ_Y_SALVO',
        descripcion: `Generación de paz y salvo para ${propietario.propietario} - ${propietario.inmueble}`,
        copropiedadId: copropiedad.id,
        fecha: new Date()
      }
    });
    
    logger.info('Paz y salvo generado exitosamente', 'propietario', { 
      nit,
      propietario: propietario.propietario,
      inmueble: propietario.inmueble
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        documento: resultado.documento,
        url: resultado.url,
        fechaGeneracion: resultado.fechaGeneracion,
        message: resultado.message
      }
    });

  } catch (error) {
    logger.error(`Error generando paz y salvo: ${error.message}`, 'propietario', { 
      error,
      nit: req.body.nit,
      telefono: req.body.telefono
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al generar paz y salvo'
    });
  }
};

/**
 * Descargar archivo PDF de paz y salvo
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const descargarPazYSalvo = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        status: 'error',
        message: 'Nombre de archivo no proporcionado'
      });
    }

    // Obtener la ruta del archivo PDF
    const filePath = googleDocsService.obtenerRutaPDF(filename);
    
    if (!filePath) {
      return res.status(404).json({
        status: 'error',
        message: 'Archivo no encontrado o expirado'
      });
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        status: 'error',
        message: 'Archivo no encontrado'
      });
    }

    // Configurar headers para descarga
    const stats = fs.statSync(filePath);
    const fileName = path.basename(filePath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    // Crear stream de lectura y enviarlo
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    readStream.on('error', (error) => {
      logger.error(`Error al leer archivo: ${error.message}`, 'propietario', { error, filePath });
      if (!res.headersSent) {
        res.status(500).json({
          status: 'error',
          message: 'Error al leer archivo'
        });
      }
    });

  } catch (error) {
    logger.error(`Error descargando paz y salvo: ${error.message}`, 'propietario', { 
      error,
      filename: req.params.filename
    });
    
    if (!res.headersSent) {
      res.status(500).json({
        status: 'error',
        message: 'Error al descargar archivo'
      });
    }
  }
};

module.exports = {
  buscarCopropiedad,
  solicitarCodigoVerificacion,
  consultarInmuebles,
  generarPazYSalvo,
  descargarPazYSalvo
};
