/**
 * Controlador de administradores
 * Maneja operaciones relacionadas con administradores y sus copropiedades
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const googleSheetsService = require('../services/googleSheetsService');
const cacheService = require('../services/cacheService');
require('dotenv').config();

/**
 * Obtiene el perfil del administrador autenticado
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getPerfil = async (req, res) => {
  try {
    // req.administrador ya está disponible desde el middleware isAdministrador
    const { id, nombre, email, telefono, fechaRegistro, ultimoAcceso } = req.administrador;
    
    // Obtener copropiedades administradas
    const copropiedades = await prisma.copropiedad.findMany({
      where: {
        administradorId: id,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        nit: true,
        fechaRegistro: true,
        fechaFinPrueba: true,
        estadoPago: true
      }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        id,
        nombre,
        email,
        telefono,
        fechaRegistro,
        ultimoAcceso,
        copropiedades
      }
    });
  } catch (error) {
    logger.error(`Error al obtener perfil: ${error.message}`, 'administrador', { error, adminId: req.administrador?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener información del perfil'
    });
  }
};

/**
 * Actualiza el perfil del administrador autenticado
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const adminId = req.administrador.id;
    
    // Validar datos
    if (!nombre && !email) {
      return res.status(400).json({
        status: 'error',
        message: 'No se proporcionaron datos para actualizar'
      });
    }
    
    // Preparar datos para actualizar
    const datosActualizacion = {};
    if (nombre) datosActualizacion.nombre = nombre;
    if (email) datosActualizacion.email = email;
    
    // Actualizar administrador
    const administradorActualizado = await prisma.administrador.update({
      where: { id: adminId },
      data: datosActualizacion
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado correctamente',
      data: {
        id: administradorActualizado.id,
        nombre: administradorActualizado.nombre,
        email: administradorActualizado.email,
        telefono: administradorActualizado.telefono
      }
    });
  } catch (error) {
    logger.error(`Error al actualizar perfil: ${error.message}`, 'administrador', { error, adminId: req.administrador?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar perfil'
    });
  }
};

/**
 * Registra una nueva copropiedad
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const registrarCopropiedad = async (req, res) => {
  try {
    const { nit, nombre, hojaGoogleSheetsId, plantillaGoogleDocsId, resolucionNumero, resolucionFecha } = req.body;
    const adminId = req.administrador.id;
    
    // Verificar si ya existe una copropiedad con ese NIT
    const existente = await prisma.copropiedad.findFirst({
      where: { nit }
    });
    
    if (existente) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe una copropiedad registrada con ese NIT'
      });
    }
    
    // Validar hoja de Google Sheets
    try {
      // Extraer ID de la hoja si es una URL
      const sheetId = googleSheetsService.extractSheetId(hojaGoogleSheetsId);
      
      // 1. Validar estructura/formato de la hoja
      const validacionFormato = await googleSheetsService.validateSheetFormat(sheetId);
      
      if (!validacionFormato.isValid) {
        return res.status(400).json({
          status: 'error',
          message: `Error en formato de la hoja: ${validacionFormato.message}`
        });
      }
      
      // 2. Validar que los datos de NIT y nombre coincidan
      const validacionDatos = await googleSheetsService.validateCopropiedadData(sheetId, nit, nombre);
      
      if (!validacionDatos.isValid) {
        return res.status(400).json({
          status: 'error',
          message: validacionDatos.message
        });
      }
      
      logger.info('Hoja de Google Sheets validada exitosamente (formato y datos)', 'administrador', { 
        sheetId, 
        adminId, 
        nit, 
        nombre,
        datosValidados: validacionDatos.data
      });
    } catch (error) {
      logger.error(`Error al validar hoja de Google Sheets: ${error.message}`, 'administrador', { error, adminId });
      return res.status(400).json({
        status: 'error',
        message: `Error al validar hoja de Google Sheets: ${error.message}`
      });
    }
    
    // Calcular fecha de fin de prueba (60 días desde hoy)
    const fechaFinPrueba = new Date();
    fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 60);
    
    // Crear copropiedad
    const copropiedad = await prisma.copropiedad.create({
      data: {
        nit,
        nombre,
        hojaGoogleSheetsId: googleSheetsService.extractSheetId(hojaGoogleSheetsId),
        plantillaGoogleDocsId: googleSheetsService.extractDocId(plantillaGoogleDocsId),
        resolucionNumero,
        resolucionFecha: resolucionFecha ? new Date(resolucionFecha) : null,
        administradorId: adminId,
        fechaRegistro: new Date(),
        fechaFinPrueba,
        estadoPago: 'PRUEBA',
        activo: true
      }
    });
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'REGISTRO_COPROPIEDAD',
        descripcion: `Registro de copropiedad ${nombre} (${nit})`,
        copropiedadId: copropiedad.id
      }
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Copropiedad registrada correctamente',
      data: {
        id: copropiedad.id,
        nit: copropiedad.nit,
        nombre: copropiedad.nombre,
        fechaRegistro: copropiedad.fechaRegistro,
        fechaFinPrueba: copropiedad.fechaFinPrueba,
        estadoPago: copropiedad.estadoPago
      }
    });
  } catch (error) {
    console.log('🚨 ERROR COMPLETO:', error);
    console.log('🚨 ERROR STACK:', error.stack);
    logger.error(`Error al registrar copropiedad: ${error.message}`, 'administrador', { error: error.stack, adminId: req.administrador?.id });
    res.status(500).json({
      status: 'error',
      message: `Error al registrar copropiedad: ${error.message}`
    });
  }
};

/**
 * Obtiene las copropiedades del administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getCopropiedades = async (req, res) => {
  try {
    const adminId = req.administrador.id;
    const { includeInactive } = req.query;
    
    // Filtrar por activo si no se solicita incluir inactivas
    const where = { administradorId: adminId };
    if (!includeInactive || includeInactive !== 'true') {
      where.activo = true;
    }
    
    // Obtener copropiedades
    const copropiedades = await prisma.copropiedad.findMany({
      where,
      select: {
        id: true,
        nit: true,
        nombre: true,
        hojaGoogleSheetsId: true,
        plantillaGoogleDocsId: true,
        resolucionNumero: true,
        resolucionFecha: true,
        fechaRegistro: true,
        fechaFinPrueba: true,
        estadoPago: true,
        activo: true
      },
      orderBy: { fechaRegistro: 'desc' }
    });
    
    res.status(200).json({
      status: 'success',
      data: copropiedades
    });
  } catch (error) {
    logger.error(`Error al obtener copropiedades: ${error.message}`, 'administrador', { error, adminId: req.administrador?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener copropiedades'
    });
  }
};

/**
 * Obtiene una copropiedad específica
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getCopropiedad = async (req, res) => {
  try {
    // req.copropiedad ya está disponible desde el middleware verificarPropiedadCopropiedad
    const copropiedad = req.copropiedad;
    
    // Obtener estadísticas de uso
    const estadisticas = await prisma.evento.groupBy({
      by: ['tipo'],
      where: {
        copropiedadId: copropiedad.id,
        tipo: {
          in: ['GENERACION_PAZ_Y_SALVO']
        },
        fecha: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)) // Últimos 30 días
        }
      },
      _count: {
        id: true
      }
    });
    
    // Formatear estadísticas
    const consultasPropietarios = estadisticas.find(e => e.tipo === 'GENERACION_PAZ_Y_SALVO')?._count?.id || 0;
    const pazYSalvosGenerados = estadisticas.find(e => e.tipo === 'GENERACION_PAZ_Y_SALVO')?._count?.id || 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        id: copropiedad.id,
        nit: copropiedad.nit,
        nombre: copropiedad.nombre,
        hojaGoogleSheetsId: copropiedad.hojaGoogleSheetsId,
        plantillaGoogleDocsId: copropiedad.plantillaGoogleDocsId,
        resolucionNumero: copropiedad.resolucionNumero,
        resolucionFecha: copropiedad.resolucionFecha,
        fechaRegistro: copropiedad.fechaRegistro,
        fechaFinPrueba: copropiedad.fechaFinPrueba,
        estadoPago: copropiedad.estadoPago,
        activo: copropiedad.activo,
        estadisticas: {
          consultasPropietarios,
          pazYSalvosGenerados
        }
      }
    });
  } catch (error) {
    logger.error(`Error al obtener copropiedad: ${error.message}`, 'administrador', { 
      error, 
      adminId: req.administrador?.id,
      copropiedadId: req.copropiedad?.id 
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener información de la copropiedad'
    });
  }
};

/**
 * Actualiza una copropiedad
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const actualizarCopropiedad = async (req, res) => {
  try {
    const copropiedadId = req.copropiedad.id;
    const { nombre, hojaGoogleSheetsId, plantillaGoogleDocsId, resolucionNumero, resolucionFecha, activo } = req.body;
    
    // Preparar datos para actualizar
    const datosActualizacion = {};
    
    if (nombre !== undefined) datosActualizacion.nombre = nombre;
    
    if (hojaGoogleSheetsId !== undefined) {
      try {
        // Extraer ID de la hoja si es una URL
        const sheetId = googleSheetsService.extractSheetId(hojaGoogleSheetsId);
        
        // Validar estructura de la hoja
        const validacionFormato = await googleSheetsService.validateSheetFormat(sheetId);
        
        if (!validacionFormato.isValid) {
          return res.status(400).json({
            status: 'error',
            message: `Error en formato de la hoja: ${validacionFormato.message}`
          });
        }
        
        datosActualizacion.hojaGoogleSheetsId = sheetId;
        
        // Invalidar caché relacionada con esta hoja
        await googleSheetsService.invalidarCache(sheetId);
      } catch (error) {
        logger.error(`Error al validar hoja de Google Sheets: ${error.message}`, 'administrador', { 
          error, 
          adminId: req.administrador?.id,
          copropiedadId
        });
        return res.status(400).json({
          status: 'error',
          message: `Error al validar hoja de Google Sheets: ${error.message}`
        });
      }
    }
    
    if (plantillaGoogleDocsId !== undefined) {
      datosActualizacion.plantillaGoogleDocsId = googleSheetsService.extractDocId(plantillaGoogleDocsId);
    }
    
    if (resolucionNumero !== undefined) datosActualizacion.resolucionNumero = resolucionNumero;
    if (resolucionFecha !== undefined) datosActualizacion.resolucionFecha = resolucionFecha ? new Date(resolucionFecha) : null;
    if (activo !== undefined) datosActualizacion.activo = activo;
    
    // Actualizar copropiedad
    const copropiedadActualizada = await prisma.copropiedad.update({
      where: { id: copropiedadId },
      data: datosActualizacion
    });
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'ACTUALIZACION_COPROPIEDAD',
        descripcion: `Actualización de copropiedad ${copropiedadActualizada.nombre} (${copropiedadActualizada.nit})`,
        administradorId: req.administrador.id,
        copropiedadId: copropiedadActualizada.id,
        fecha: new Date()
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Copropiedad actualizada correctamente',
      data: {
        id: copropiedadActualizada.id,
        nit: copropiedadActualizada.nit,
        nombre: copropiedadActualizada.nombre,
        hojaGoogleSheetsId: copropiedadActualizada.hojaGoogleSheetsId,
        plantillaGoogleDocsId: copropiedadActualizada.plantillaGoogleDocsId,
        resolucionNumero: copropiedadActualizada.resolucionNumero,
        resolucionFecha: copropiedadActualizada.resolucionFecha,
        activo: copropiedadActualizada.activo
      }
    });
  } catch (error) {
    logger.error(`Error al actualizar copropiedad: ${error.message}`, 'administrador', { 
      error, 
      adminId: req.administrador?.id,
      copropiedadId: req.copropiedad?.id 
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar copropiedad'
    });
  }
};

/**
 * Elimina una copropiedad
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const eliminarCopropiedad = async (req, res) => {
  try {
    const copropiedadId = req.copropiedad.id;
    const adminId = req.administrador.id;
    
    // Guardar información para el evento antes de eliminar
    const { nombre, nit } = req.copropiedad;
    
    // Desactivar copropiedad (no eliminar físicamente)
    await prisma.copropiedad.update({
      where: { id: copropiedadId },
      data: { activo: false }
    });
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'ELIMINACION_COPROPIEDAD',
        descripcion: `Eliminación de copropiedad ${nombre} (${nit})`,
        administradorId: adminId,
        fecha: new Date()
      }
    });
    
    // Invalidar caché relacionada con esta copropiedad
    await googleSheetsService.invalidarCache(req.copropiedad.hojaGoogleSheetsId);
    
    res.status(200).json({
      status: 'success',
      message: 'Copropiedad eliminada correctamente'
    });
  } catch (error) {
    logger.error(`Error al eliminar copropiedad: ${error.message}`, 'administrador', { 
      error, 
      adminId: req.administrador?.id,
      copropiedadId: req.copropiedad?.id 
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al eliminar copropiedad'
    });
  }
};

/**
 * Obtiene los eventos de una copropiedad
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getEventosCopropiedad = async (req, res) => {
  try {
    const copropiedadId = req.copropiedad.id;
    const { limit = 50, page = 1 } = req.query;
    
    // Convertir a números
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;
    
    // Obtener eventos
    const eventos = await prisma.evento.findMany({
      where: { copropiedadId },
      select: {
        id: true,
        tipo: true,
        descripcion: true,
        fecha: true
      },
      orderBy: { fecha: 'desc' },
      take: limitNum,
      skip
    });
    
    // Obtener total de eventos
    const totalEventos = await prisma.evento.count({
      where: { copropiedadId }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        eventos,
        pagination: {
          total: totalEventos,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalEventos / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error(`Error al obtener eventos: ${error.message}`, 'administrador', { 
      error, 
      adminId: req.administrador?.id,
      copropiedadId: req.copropiedad?.id 
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener eventos de la copropiedad'
    });
  }
};

/**
 * Obtiene estadísticas de uso de todas las copropiedades del administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getEstadisticas = async (req, res) => {
  try {
    const adminId = req.administrador.id;
    const { dias = 30 } = req.query;
    
    // Convertir a número
    const diasNum = parseInt(dias);
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - diasNum);
    
    // Obtener copropiedades activas
    const copropiedades = await prisma.copropiedad.findMany({
      where: {
        administradorId: adminId,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        nit: true
      }
    });
    
    // Obtener estadísticas por copropiedad
    const estadisticasPorCopropiedad = [];
    
    for (const copropiedad of copropiedades) {
      // Consultas de propietarios (usando GENERACION_PAZ_Y_SALVO como proxy)
      const consultasPropietarios = await prisma.evento.count({
        where: {
          copropiedadId: copropiedad.id,
          tipo: 'GENERACION_PAZ_Y_SALVO',
          fecha: { gte: fechaInicio }
        }
      });
      
      // Paz y salvos generados
      const pazYSalvosGenerados = await prisma.evento.count({
        where: {
          copropiedadId: copropiedad.id,
          tipo: 'GENERACION_PAZ_Y_SALVO',
          fecha: { gte: fechaInicio }
        }
      });
      
      estadisticasPorCopropiedad.push({
        id: copropiedad.id,
        nombre: copropiedad.nombre,
        nit: copropiedad.nit,
        consultasPropietarios,
        pazYSalvosGenerados
      });
    }
    
    // Estadísticas totales
    const totalCopropiedades = copropiedades.length;
    const totalConsultas = estadisticasPorCopropiedad.reduce((sum, item) => sum + item.consultasPropietarios, 0);
    const totalPazYSalvos = estadisticasPorCopropiedad.reduce((sum, item) => sum + item.pazYSalvosGenerados, 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        resumen: {
          totalCopropiedades,
          totalConsultas,
          totalPazYSalvos,
          periodo: `Últimos ${diasNum} días`
        },
        copropiedades: estadisticasPorCopropiedad
      }
    });
  } catch (error) {
    logger.error(`Error al obtener estadísticas: ${error.message}`, 'administrador', { error, adminId: req.administrador?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas'
    });
  }
};

module.exports = {
  getPerfil,
  actualizarPerfil,
  registrarCopropiedad,
  getCopropiedades,
  getCopropiedad,
  actualizarCopropiedad,
  eliminarCopropiedad,
  getEventosCopropiedad,
  getEstadisticas
};
