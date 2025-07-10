/**
 * Controlador de propietarios
 * Maneja operaciones relacionadas con consultas de propietarios y generación de paz y salvos
 * Sin almacenamiento local de datos personales, solo consultas en tiempo real
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const googleSheetsService = require('../services/googleSheetsService');
const smsService = require('../services/smsService');
const pdfService = require('../services/pdfService');
const cacheService = require('../services/cacheService');
const fs = require('fs');
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
    
    // Buscar copropiedad
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        nit,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        nit: true
      }
    });
    
    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: copropiedad
    });
  } catch (error) {
    logger.error(`Error al buscar copropiedad: ${error.message}`, 'propietario', { error, nit: req.params.nit });
    res.status(500).json({
      status: 'error',
      message: 'Error al buscar copropiedad'
    });
  }
};

/**
 * Solicita código de verificación para un propietario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const solicitarCodigoVerificacion = async (req, res) => {
  try {
    const { nit, identificacion, telefono } = req.body;
    
    if (!nit || !identificacion || !telefono) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos requeridos'
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
    const propietario = await googleSheetsService.buscarPropiedadesPorIdentificacion(
      copropiedad.hojaGoogleSheetsId,
      nit,
      identificacion
    );
    
    if (!propietario.success) {
      return res.status(404).json({
        status: 'error',
        message: 'Propietario no encontrado en esta copropiedad'
      });
    }
    
    // Enviar código SMS
    const resultadoSMS = await smsService.enviarCodigoVerificacion(
      telefonoNormalizado,
      'VERIFICACION',
      null, // No hay ID de usuario para propietarios
      { 
        nit,
        identificacion
      }
    );
    
    if (!resultadoSMS.success) {
      return res.status(500).json({
        status: 'error',
        message: `Error al enviar código SMS: ${resultadoSMS.message}`
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Código de verificación enviado correctamente'
    });
  } catch (error) {
    logger.error(`Error al solicitar código de verificación: ${error.message}`, 'propietario', { 
      error, 
      nit: req.body.nit,
      identificacion: req.body.identificacion
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
    const { nit, identificacion, telefono, codigo } = req.body;
    
    if (!nit || !identificacion || !telefono || !codigo) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos requeridos'
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
      codigo,
      'VERIFICACION',
      { 
        nit,
        identificacion
      }
    );
    
    if (!verificacion.success) {
      return res.status(400).json({
        status: 'error',
        message: verificacion.message
      });
    }
    
    // Consultar inmuebles del propietario
    const resultado = await googleSheetsService.buscarPropiedadesPorIdentificacion(
      copropiedad.hojaGoogleSheetsId,
      nit,
      identificacion
    );
    
    if (!resultado.success) {
      return res.status(404).json({
        status: 'error',
        message: resultado.message
      });
    }
    
    // Registrar evento de consulta
    await prisma.evento.create({
      data: {
        tipo: 'CONSULTA_PROPIETARIO',
        descripcion: `Consulta de inmuebles por propietario con identificación ${identificacion}`,
        copropiedadId: copropiedad.id,
        fecha: new Date()
      }
    });
    
    // Generar token temporal para operaciones adicionales
    const jwt = require('jsonwebtoken');
    const tokenPropietario = jwt.sign(
      { 
        nit,
        identificacion,
        telefono: telefonoNormalizado
      },
      process.env.JWT_SECRET,
      { expiresIn: '30m' } // 30 minutos
    );
    
    // Guardar token en caché para validación posterior
    await cacheService.set(
      `propietario_token:${nit}:${identificacion}`,
      tokenPropietario,
      60 * 30 // 30 minutos
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        copropiedad: {
          nombre: copropiedad.nombre,
          nit: copropiedad.nit
        },
        propietario: {
          nombre: resultado.propietario.nombre,
          identificacion: resultado.propietario.identificacion
        },
        inmuebles: resultado.inmuebles,
        token: tokenPropietario
      }
    });
  } catch (error) {
    logger.error(`Error al consultar inmuebles: ${error.message}`, 'propietario', { 
      error, 
      nit: req.body.nit,
      identificacion: req.body.identificacion
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al consultar inmuebles'
    });
  }
};

/**
 * Verifica si un inmueble está al día y puede generar paz y salvo
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const verificarEstadoCuenta = async (req, res) => {
  try {
    const { nit, torre, apto, token } = req.body;
    
    if (!nit || !torre || !apto || !token) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos requeridos'
      });
    }
    
    // Verificar token
    let decoded;
    try {
      const jwt = require('jsonwebtoken');
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido o expirado'
      });
    }
    
    // Verificar que el token corresponde a la copropiedad
    if (decoded.nit !== nit) {
      return res.status(403).json({
        status: 'error',
        message: 'Token no válido para esta copropiedad'
      });
    }
    
    // Verificar que el token está en caché
    const tokenCached = await cacheService.get(`propietario_token:${nit}:${decoded.identificacion}`);
    if (!tokenCached || tokenCached !== token) {
      return res.status(401).json({
        status: 'error',
        message: 'Sesión expirada o inválida'
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
    
    // Verificar estado de cuenta
    const resultado = await googleSheetsService.verificarEstadoCuenta(
      copropiedad.hojaGoogleSheetsId,
      decoded.identificacion,
      torre,
      apto
    );
    
    if (!resultado.success) {
      return res.status(400).json({
        status: 'error',
        message: resultado.message
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        alDia: resultado.alDia,
        mensaje: resultado.alDia 
          ? 'El inmueble se encuentra al día con la administración'
          : 'El inmueble presenta saldo pendiente con la administración'
      }
    });
  } catch (error) {
    logger.error(`Error al verificar estado de cuenta: ${error.message}`, 'propietario', { 
      error, 
      nit: req.body.nit,
      torre: req.body.torre,
      apto: req.body.apto
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar estado de cuenta'
    });
  }
};

/**
 * Genera un paz y salvo para un inmueble
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const generarPazYSalvo = async (req, res) => {
  try {
    const { nit, torre, apto, token } = req.body;
    
    if (!nit || !torre || !apto || !token) {
      return res.status(400).json({
        status: 'error',
        message: 'Faltan datos requeridos'
      });
    }
    
    // Verificar token
    let decoded;
    try {
      const jwt = require('jsonwebtoken');
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido o expirado'
      });
    }
    
    // Verificar que el token corresponde a la copropiedad
    if (decoded.nit !== nit) {
      return res.status(403).json({
        status: 'error',
        message: 'Token no válido para esta copropiedad'
      });
    }
    
    // Verificar que el token está en caché
    const tokenCached = await cacheService.get(`propietario_token:${nit}:${decoded.identificacion}`);
    if (!tokenCached || tokenCached !== token) {
      return res.status(401).json({
        status: 'error',
        message: 'Sesión expirada o inválida'
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
    
    // Verificar estado de cuenta
    const estadoCuenta = await googleSheetsService.verificarEstadoCuenta(
      copropiedad.hojaGoogleSheetsId,
      decoded.identificacion,
      torre,
      apto
    );
    
    if (!estadoCuenta.success) {
      return res.status(400).json({
        status: 'error',
        message: estadoCuenta.message
      });
    }
    
    // Verificar que está al día
    if (!estadoCuenta.alDia) {
      return res.status(403).json({
        status: 'error',
        message: 'No se puede generar paz y salvo. El inmueble presenta saldo pendiente con la administración.'
      });
    }
    
    // Obtener datos del propietario
    const propietario = await googleSheetsService.buscarPropiedadesPorIdentificacion(
      copropiedad.hojaGoogleSheetsId,
      nit,
      decoded.identificacion
    );
    
    if (!propietario.success) {
      return res.status(404).json({
        status: 'error',
        message: 'Propietario no encontrado'
      });
    }
    
    // Generar PDF
    const datos = {
      nombreCopropiedad: copropiedad.nombre,
      nit: copropiedad.nit,
      torre,
      apto,
      nombrePropietario: propietario.propietario.nombre,
      identificacion: decoded.identificacion,
      plantillaId: copropiedad.plantillaGoogleDocsId
    };
    
    const resultadoPDF = await pdfService.generarPazYSalvoPDF(datos);
    
    if (!resultadoPDF.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Error al generar paz y salvo'
      });
    }
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'GENERACION_PAZ_Y_SALVO',
        descripcion: `Generación de paz y salvo para ${torre} - ${apto} por propietario con identificación ${decoded.identificacion}`,
        copropiedadId: copropiedad.id,
        fecha: new Date()
      }
    });
    
    // Enviar archivo
    const filePath = resultadoPDF.filePath;
    
    if (!fs.existsSync(filePath)) {
      return res.status(500).json({
        status: 'error',
        message: 'Error al acceder al archivo generado'
      });
    }
    
    const fileName = `Paz_y_Salvo_${copropiedad.nombre}_${torre}_${apto}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Stream del archivo al cliente
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    // Manejar errores de stream
    fileStream.on('error', (error) => {
      logger.error(`Error al enviar archivo PDF: ${error.message}`, 'propietario', { error });
      res.status(500).end();
    });
  } catch (error) {
    logger.error(`Error al generar paz y salvo: ${error.message}`, 'propietario', { 
      error, 
      nit: req.body.nit,
      torre: req.body.torre,
      apto: req.body.apto
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al generar paz y salvo'
    });
  }
};

module.exports = {
  buscarCopropiedad,
  solicitarCodigoVerificacion,
  consultarInmuebles,
  verificarEstadoCuenta,
  generarPazYSalvo
};
