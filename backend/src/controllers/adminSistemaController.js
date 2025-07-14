/**
 * Controlador de Administrador del Sistema
 * Maneja operaciones relacionadas con la administración global del sistema
 * Incluye gestión de usuarios, configuraciones, y monitoreo
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const cacheService = require('../services/cacheService');
const circuitBreaker = require('../services/circuitBreakerService');
const { generateToken } = require('../middlewares/authMiddleware');
require('dotenv').config();

// Número de rondas para hash de contraseñas
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Obtiene estadísticas generales del sistema
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getEstadisticasSistema = async (req, res) => {
  try {
    // Contar administradores activos
    const totalAdministradores = await prisma.administrador.count({
      where: { activo: true }
    });
    
    // Contar copropiedades activas
    const totalCopropiedades = await prisma.copropiedad.count({
      where: { activo: true }
    });
    
    // Contar eventos por tipo en los últimos 30 días
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);
    
    const eventosRecientes = await prisma.evento.groupBy({
      by: ['tipo'],
      where: {
        fecha: { gte: fechaInicio }
      },
      _count: {
        id: true
      }
    });
    
    // Formatear eventos
    const eventos = {};
    eventosRecientes.forEach(evento => {
      eventos[evento.tipo] = evento._count.id;
    });
    
    // Contar códigos SMS enviados en los últimos 30 días
    const totalSMS = await prisma.codigoSMS.count({
      where: {
        fechaCreacion: { gte: fechaInicio }
      }
    });
    
    // Obtener estado de circuit breakers
    const estadoCircuitBreakers = circuitBreaker.getStats();
    
    // Obtener información de Redis
    let estadoRedis = { connected: false };
    try {
      const redisClient = cacheService.getClient();
      const redisInfo = await redisClient.info();
      estadoRedis = {
        connected: true,
        info: redisInfo
      };
    } catch (error) {
      logger.error(`Error al obtener información de Redis: ${error.message}`, 'admin-sistema', { error });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        usuarios: {
          administradores: totalAdministradores
        },
        copropiedades: totalCopropiedades,
        eventos: {
          total: Object.values(eventos).reduce((a, b) => a + b, 0),
          desglose: eventos
        },
        sms: {
          total: totalSMS
        },
        sistema: {
          circuitBreakers: estadoCircuitBreakers,
          redis: estadoRedis
        }
      }
    });
  } catch (error) {
    logger.error(`Error al obtener estadísticas del sistema: ${error.message}`, 'admin-sistema', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas del sistema'
    });
  }
};

/**
 * Obtiene la lista de administradores
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getAdministradores = async (req, res) => {
  try {
    const { page = 1, limit = 20, activo } = req.query;
    
    // Convertir a números
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Preparar filtros
    const where = {};
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }
    
    // Obtener administradores
    const administradores = await prisma.administrador.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        activo: true,
        verificado: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        _count: {
          select: {
            copropiedades: true
          }
        }
      },
      orderBy: { fechaRegistro: 'desc' },
      take: limitNum,
      skip
    });
    
    // Formatear respuesta
    const administradoresFormateados = administradores.map(admin => ({
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      telefono: admin.telefono,
      activo: admin.activo,
      verificado: admin.verificado,
      fechaRegistro: admin.fechaRegistro,
      ultimoAcceso: admin.ultimoAcceso,
      totalCopropiedades: admin._count.copropiedades
    }));
    
    // Obtener total de administradores
    const totalAdministradores = await prisma.administrador.count({ where });
    
    res.status(200).json({
      status: 'success',
      data: {
        administradores: administradoresFormateados,
        pagination: {
          total: totalAdministradores,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalAdministradores / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error(`Error al obtener administradores: ${error.message}`, 'admin-sistema', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener administradores'
    });
  }
};

/**
 * Obtiene detalles de un administrador específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getAdministrador = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar administrador
    const administrador = await prisma.administrador.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        email: true,
        telefono: true,
        activo: true,
        verificado: true,
        fechaRegistro: true,
        ultimoAcceso: true,
        fechaVerificacion: true,
        fechaActualizacionPassword: true,
        copropiedades: {
          select: {
            id: true,
            nombre: true,
            nit: true,
            activo: true,
            fechaRegistro: true,
            fechaFinPrueba: true,
            estadoPago: true
          }
        }
      }
    });
    
    if (!administrador) {
      return res.status(404).json({
        status: 'error',
        message: 'Administrador no encontrado'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: administrador
    });
  } catch (error) {
    logger.error(`Error al obtener administrador: ${error.message}`, 'admin-sistema', { error, adminId: req.params.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener administrador'
    });
  }
};

/**
 * Actualiza el estado de un administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const actualizarEstadoAdministrador = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    
    if (activo === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Se debe proporcionar el estado (activo)'
      });
    }
    
    // Buscar administrador
    const administrador = await prisma.administrador.findUnique({
      where: { id }
    });
    
    if (!administrador) {
      return res.status(404).json({
        status: 'error',
        message: 'Administrador no encontrado'
      });
    }
    
    // Actualizar estado
    const administradorActualizado = await prisma.administrador.update({
      where: { id },
      data: { activo: Boolean(activo) }
    });
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: activo ? 'ACTIVACION_ADMINISTRADOR' : 'DESACTIVACION_ADMINISTRADOR',
        descripcion: `${activo ? 'Activación' : 'Desactivación'} de administrador ${administrador.nombre}`,
        adminSistemaId: req.adminSistema.id,
        fecha: new Date()
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: `Administrador ${activo ? 'activado' : 'desactivado'} correctamente`,
      data: {
        id: administradorActualizado.id,
        nombre: administradorActualizado.nombre,
        activo: administradorActualizado.activo
      }
    });
  } catch (error) {
    logger.error(`Error al actualizar estado de administrador: ${error.message}`, 'admin-sistema', { 
      error, 
      adminId: req.params.id,
      adminSistemaId: req.adminSistema?.id
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar estado de administrador'
    });
  }
};

/**
 * Obtiene la lista de copropiedades
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getCopropiedades = async (req, res) => {
  try {
    const { page = 1, limit = 20, activo, estadoPago } = req.query;
    
    // Convertir a números
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Preparar filtros
    const where = {};
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }
    if (estadoPago) {
      where.estadoPago = estadoPago;
    }
    
    // Obtener copropiedades
    const copropiedades = await prisma.copropiedad.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        nit: true,
        activo: true,
        fechaRegistro: true,
        fechaFinPrueba: true,
        estadoPago: true,
        administrador: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true
          }
        }
      },
      orderBy: { fechaRegistro: 'desc' },
      take: limitNum,
      skip
    });
    
    // Obtener total de copropiedades
    const totalCopropiedades = await prisma.copropiedad.count({ where });
    
    res.status(200).json({
      status: 'success',
      data: {
        copropiedades,
        pagination: {
          total: totalCopropiedades,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCopropiedades / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error(`Error al obtener copropiedades: ${error.message}`, 'admin-sistema', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener copropiedades'
    });
  }
};

/**
 * Obtiene detalles de una copropiedad específica
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getCopropiedad = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar copropiedad
    const copropiedad = await prisma.copropiedad.findUnique({
      where: { id },
      include: {
        administrador: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            activo: true
          }
        }
      }
    });
    
    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }
    
    // Obtener estadísticas de uso
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);
    
    const eventosRecientes = await prisma.evento.groupBy({
      by: ['tipo'],
      where: {
        copropiedadId: id,
        fecha: { gte: fechaInicio }
      },
      _count: {
        id: true
      }
    });
    
    // Formatear eventos
    const eventos = {};
    eventosRecientes.forEach(evento => {
      eventos[evento.tipo] = evento._count.id;
    });
    
    // Obtener pagos
    const pagos = await prisma.pago.findMany({
      where: { copropiedadId: id },
      orderBy: { fecha: 'desc' },
      take: 5
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        ...copropiedad,
        estadisticas: {
          eventos,
          consultasPropietarios: eventos['GENERACION_PAZ_Y_SALVO'] || 0,
          pazYSalvosGenerados: eventos['GENERACION_PAZ_Y_SALVO'] || 0
        },
        pagosRecientes: pagos
      }
    });
  } catch (error) {
    logger.error(`Error al obtener copropiedad: ${error.message}`, 'admin-sistema', { error, copropiedadId: req.params.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener copropiedad'
    });
  }
};

/**
 * Actualiza el estado de una copropiedad
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const actualizarEstadoCopropiedad = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo, estadoPago, fechaFinPrueba } = req.body;
    
    if (activo === undefined && estadoPago === undefined && fechaFinPrueba === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'Se debe proporcionar al menos un campo para actualizar'
      });
    }
    
    // Buscar copropiedad
    const copropiedad = await prisma.copropiedad.findUnique({
      where: { id }
    });
    
    if (!copropiedad) {
      return res.status(404).json({
        status: 'error',
        message: 'Copropiedad no encontrada'
      });
    }
    
    // Preparar datos para actualizar
    const datosActualizacion = {};
    
    if (activo !== undefined) datosActualizacion.activo = Boolean(activo);
    if (estadoPago !== undefined) datosActualizacion.estadoPago = estadoPago;
    if (fechaFinPrueba !== undefined) datosActualizacion.fechaFinPrueba = new Date(fechaFinPrueba);
    
    // Actualizar copropiedad
    const copropiedadActualizada = await prisma.copropiedad.update({
      where: { id },
      data: datosActualizacion
    });
    
    // Registrar evento
    let tipoEvento = 'ACTUALIZACION_COPROPIEDAD';
    let descripcion = `Actualización de copropiedad ${copropiedad.nombre}`;
    
    if (activo !== undefined) {
      tipoEvento = activo ? 'ACTIVACION_COPROPIEDAD' : 'DESACTIVACION_COPROPIEDAD';
      descripcion = `${activo ? 'Activación' : 'Desactivación'} de copropiedad ${copropiedad.nombre}`;
    } else if (estadoPago !== undefined) {
      tipoEvento = 'CAMBIO_ESTADO_PAGO_COPROPIEDAD';
      descripcion = `Cambio de estado de pago de copropiedad ${copropiedad.nombre} a ${estadoPago}`;
    }
    
    await prisma.evento.create({
      data: {
        tipo: tipoEvento,
        descripcion,
        adminSistemaId: req.adminSistema.id,
        copropiedadId: id,
        fecha: new Date()
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Copropiedad actualizada correctamente',
      data: {
        id: copropiedadActualizada.id,
        nombre: copropiedadActualizada.nombre,
        activo: copropiedadActualizada.activo,
        estadoPago: copropiedadActualizada.estadoPago,
        fechaFinPrueba: copropiedadActualizada.fechaFinPrueba
      }
    });
  } catch (error) {
    logger.error(`Error al actualizar estado de copropiedad: ${error.message}`, 'admin-sistema', { 
      error, 
      copropiedadId: req.params.id,
      adminSistemaId: req.adminSistema?.id
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al actualizar estado de copropiedad'
    });
  }
};

/**
 * Registra un nuevo administrador del sistema
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const registrarAdminSistema = async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body;
    
    // Verificar si ya existe un admin sistema con ese email
    const existente = await prisma.adminSistema.findFirst({
      where: {
        OR: [
          { email },
          { telefono }
        ]
      }
    });
    
    if (existente) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe un administrador del sistema con ese email o teléfono'
      });
    }
    
    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Crear admin sistema
    const adminSistema = await prisma.adminSistema.create({
      data: {
        nombre,
        email,
        telefono,
        password: hashedPassword,
        activo: true,
        fechaRegistro: new Date()
      }
    });
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'REGISTRO_ADMIN_SISTEMA',
        descripcion: `Registro de administrador del sistema ${nombre}`,
        adminSistemaId: req.adminSistema.id,
        fecha: new Date()
      }
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Administrador del sistema registrado correctamente',
      data: {
        id: adminSistema.id,
        nombre: adminSistema.nombre,
        email: adminSistema.email,
        telefono: adminSistema.telefono
      }
    });
  } catch (error) {
    logger.error(`Error al registrar administrador del sistema: ${error.message}`, 'admin-sistema', { 
      error,
      adminSistemaId: req.adminSistema?.id
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al registrar administrador del sistema'
    });
  }
};

/**
 * Obtiene los logs del sistema
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, nivel, desde, hasta } = req.query;
    
    // Convertir a números
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Preparar filtros
    const where = {};
    
    if (nivel) {
      where.nivel = nivel;
    }
    
    if (desde || hasta) {
      where.timestamp = {};
      
      if (desde) {
        where.timestamp.gte = new Date(desde);
      }
      
      if (hasta) {
        where.timestamp.lte = new Date(hasta);
      }
    }
    
    // Obtener logs
    const logs = await prisma.log.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limitNum,
      skip
    });
    
    // Obtener total de logs
    const totalLogs = await prisma.log.count({ where });
    
    res.status(200).json({
      status: 'success',
      data: {
        logs,
        pagination: {
          total: totalLogs,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalLogs / limitNum)
        }
      }
    });
  } catch (error) {
    logger.error(`Error al obtener logs: ${error.message}`, 'admin-sistema', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener logs'
    });
  }
};

/**
 * Obtiene el estado de los circuit breakers
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getCircuitBreakers = async (req, res) => {
  try {
    const stats = circuitBreaker.getStats();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error(`Error al obtener estado de circuit breakers: ${error.message}`, 'admin-sistema', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estado de circuit breakers'
    });
  }
};

/**
 * Resetea un circuit breaker específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const resetCircuitBreaker = async (req, res) => {
  try {
    const { nombre } = req.params;
    
    const resultado = circuitBreaker.reset(nombre);
    
    if (!resultado) {
      return res.status(404).json({
        status: 'error',
        message: 'Circuit breaker no encontrado'
      });
    }
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'RESET_CIRCUIT_BREAKER',
        descripcion: `Reset de circuit breaker ${nombre}`,
        adminSistemaId: req.adminSistema.id,
        fecha: new Date()
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: `Circuit breaker ${nombre} reseteado correctamente`,
      data: circuitBreaker.getStats()
    });
  } catch (error) {
    logger.error(`Error al resetear circuit breaker: ${error.message}`, 'admin-sistema', { 
      error,
      nombre: req.params.nombre,
      adminSistemaId: req.adminSistema?.id
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al resetear circuit breaker'
    });
  }
};

/**
 * Obtiene el estado de la caché Redis
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const getEstadoCache = async (req, res) => {
  try {
    const redisClient = cacheService.getClient();
    
    // Obtener información de Redis
    const info = await redisClient.info();
    
    // Obtener estadísticas de uso de memoria
    const memory = await redisClient.info('memory');
    
    // Obtener estadísticas de clientes
    const clients = await redisClient.info('clients');
    
    // Obtener estadísticas de persistencia
    const persistence = await redisClient.info('persistence');
    
    // Obtener estadísticas de stats
    const stats = await redisClient.info('stats');
    
    res.status(200).json({
      status: 'success',
      data: {
        connected: true,
        info,
        memory,
        clients,
        persistence,
        stats
      }
    });
  } catch (error) {
    logger.error(`Error al obtener estado de caché: ${error.message}`, 'admin-sistema', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener estado de caché',
      data: {
        connected: false,
        error: error.message
      }
    });
  }
};

/**
 * Limpia un patrón de caché específico
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const limpiarCache = async (req, res) => {
  try {
    const { patron } = req.body;
    
    if (!patron) {
      return res.status(400).json({
        status: 'error',
        message: 'Se debe proporcionar un patrón de caché'
      });
    }
    
    const eliminados = await cacheService.delByPattern(patron);
    
    // Registrar evento
    await prisma.evento.create({
      data: {
        tipo: 'LIMPIEZA_CACHE',
        descripcion: `Limpieza de caché con patrón ${patron}. ${eliminados} claves eliminadas.`,
        adminSistemaId: req.adminSistema.id,
        fecha: new Date()
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: `Caché limpiada correctamente. ${eliminados} claves eliminadas.`,
      data: {
        patron,
        eliminados
      }
    });
  } catch (error) {
    logger.error(`Error al limpiar caché: ${error.message}`, 'admin-sistema', { 
      error,
      patron: req.body.patron,
      adminSistemaId: req.adminSistema?.id
    });
    res.status(500).json({
      status: 'error',
      message: 'Error al limpiar caché'
    });
  }
};

module.exports = {
  getEstadisticasSistema,
  getAdministradores,
  getAdministrador,
  actualizarEstadoAdministrador,
  getCopropiedades,
  getCopropiedad,
  actualizarEstadoCopropiedad,
  registrarAdminSistema,
  getLogs,
  getCircuitBreakers,
  resetCircuitBreaker,
  getEstadoCache,
  limpiarCache
};
