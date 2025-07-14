/**
 * Controlador de autenticación
 * Maneja registro, login, verificación y recuperación de contraseña
 * para administradores y administradores del sistema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
// const smsService = require('../services/smsService'); // Reemplazado por híbrido
const SMSHybridService = require('../services/smsHybridService');
const smsService = new SMSHybridService(); // Instancia del servicio híbrido
const { generateToken, generateRefreshToken } = require('../middlewares/authMiddleware');
const cacheService = require('../services/cacheService');
require('dotenv').config();

// Número de rondas para hash de contraseñas
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Registra un nuevo administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const registrarAdministrador = async (req, res) => {
  try {
    console.log('📝 Iniciando registro temporal:', req.body);
    const { nombre, email, telefono, password } = req.body;
    
    // Normalizar teléfono primero
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Verificar si ya existe un administrador CONFIRMADO con ese teléfono o email
    const existenteConfirmado = await prisma.administrador.findFirst({
      where: {
        OR: [
          { telefono: telefonoNormalizado },
          { email }
        ]
      }
    });
    
    if (existenteConfirmado) {
      if (existenteConfirmado.telefono === telefonoNormalizado) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe un administrador registrado con este número de teléfono',
          campo: 'telefono'
        });
      }
      if (existenteConfirmado.email === email) {
        return res.status(400).json({
          status: 'error',
          message: 'Ya existe un administrador registrado con este correo electrónico',
          campo: 'email'
        });
      }
    }

    // Verificar si ya existe un registro temporal (y eliminarlo si existe)
    await prisma.registroTemporal.deleteMany({
      where: {
        OR: [
          { telefono: telefonoNormalizado },
          { email }
        ]
      }
    });
    
    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Crear registro TEMPORAL (15 minutos de expiración)
    const expiracion = new Date();
    expiracion.setMinutes(expiracion.getMinutes() + 15);
    
    const registroTemporal = await prisma.registroTemporal.create({
      data: {
        nombre,
        email,
        telefono: telefonoNormalizado,
        password: hashedPassword,
        expiradoEn: expiracion
      }
    });
    
    // Enviar código de verificación por SMS
    const resultadoSMS = await smsService.enviarCodigoVerificacion(
      telefonoNormalizado,
      'REGISTRO',
      registroTemporal.id // Usar ID del registro temporal
    );
    
    if (!resultadoSMS.success) {
      logger.error(`Error al enviar SMS de verificación: ${resultadoSMS.message}`, 'auth', { tempId: registroTemporal.id });
      // Si falla el SMS, eliminar registro temporal
      await prisma.registroTemporal.delete({ where: { id: registroTemporal.id } });
      return res.status(500).json({
        status: 'error',
        message: 'Error al enviar código de verificación. Intente nuevamente.'
      });
    }
    
    // Responder SIN crear el administrador real aún
    res.status(200).json({
      status: 'success', 
      message: 'Se ha enviado un código de verificación al teléfono proporcionado. Verifique para completar el registro.',
      data: {
        tempId: registroTemporal.id,
        telefono: telefonoNormalizado,
        requiresSmsVerification: true
      }
    });
  } catch (error) {
    console.error('❌ Error al registrar administrador:', error.message);
    console.error('Stack:', error.stack);
    logger.error(`Error al registrar administrador: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al registrar administrador',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Verifica un administrador mediante código SMS
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const verificarAdministrador = async (req, res) => {
  try {
    const { telefono, codigo } = req.body;
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar registro temporal
    const registroTemporal = await prisma.registroTemporal.findFirst({
      where: { 
        telefono: telefonoNormalizado,
        expiradoEn: {
          gt: new Date() // No expirado
        }
      }
    });
    
    if (!registroTemporal) {
      return res.status(404).json({
        status: 'error',
        message: 'Registro temporal no encontrado o expirado. Debe registrarse nuevamente.'
      });
    }
    
    // Verificar código
    const verificacion = await smsService.verificarCodigo(
      telefonoNormalizado,
      codigo,
      'REGISTRO'
    );
    
    if (!verificacion.success) {
      return res.status(400).json({
        status: 'error',
        message: verificacion.message
      });
    }
    
    // AHORA SÍ crear el administrador real
    const administrador = await prisma.administrador.create({
      data: {
        nombre: registroTemporal.nombre,
        email: registroTemporal.email,
        telefono: registroTemporal.telefono,
        password: registroTemporal.password,
        verificado: true,
        activo: true,
        fechaRegistro: new Date()
      }
    });
    
    // Eliminar registro temporal
    await prisma.registroTemporal.delete({
      where: { id: registroTemporal.id }
    });
    
    // Generar tokens
    const payload = {
      id: administrador.id,
      role: 'administrador'
    };
    
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    // Guardar refresh token en caché
    await cacheService.set(
      `refresh_token:${administrador.id}`,
      refreshToken,
      60 * 60 * 24 * 7 // 7 días
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Administrador verificado y registrado correctamente',
      data: {
        token,
        refreshToken,
        admin: {
          id: administrador.id,
          nombre: administrador.nombre,
          telefono: administrador.telefono,
          email: administrador.email,
          verificado: administrador.verificado,
          tipo: 'administrador'
        }
      }
    });
  } catch (error) {
    logger.error(`Error al verificar administrador: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar administrador'
    });
  }
};

/**
 * Reenviar código de verificación SMS
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const reenviarCodigo = async (req, res) => {
  try {
    const { telefono } = req.body;
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar registro temporal activo
    const registroTemporal = await prisma.registroTemporal.findFirst({
      where: {
        telefono: telefonoNormalizado,
        expiradoEn: {
          gt: new Date() // No expirado
        }
      }
    });
    
    if (!registroTemporal) {
      return res.status(404).json({
        status: 'error',
        message: 'No hay un registro temporal activo. Debe registrarse nuevamente.'
      });
    }
    
    // Reenviar código
    const resultadoSMS = await smsService.enviarCodigoVerificacion(
      telefonoNormalizado,
      'REGISTRO',
      registroTemporal.id
    );
    
    if (!resultadoSMS.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Error al reenviar código. Intente nuevamente.'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Código de verificación reenviado exitosamente.'
    });
    
  } catch (error) {
    logger.error(`Error al reenviar código: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor'
    });
  }
};

/**
 * Inicia sesión para un administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const loginAdministrador = async (req, res) => {
  try {
    const { telefono, password } = req.body;
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar administrador
    const administrador = await prisma.administrador.findFirst({
      where: { telefono: telefonoNormalizado }
    });
    
    if (!administrador) {
      return res.status(404).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }
    
    // Verificar si está activo
    if (!administrador.activo) {
      return res.status(403).json({
        status: 'error',
        message: 'Cuenta inactiva. Contacte al administrador del sistema.'
      });
    }
    
    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, administrador.password);
    
    if (!passwordValida) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }
    
    // Enviar código SMS para verificación de dos factores
    const resultadoSMS = await smsService.enviarCodigoVerificacion(
      telefonoNormalizado,
      'LOGIN',
      administrador.id
    );
    
    if (!resultadoSMS.success) {
      logger.error(`Error al enviar SMS de login: ${resultadoSMS.message}`, 'auth', { adminId: administrador.id });
      return res.status(500).json({
        status: 'error',
        message: 'Error al enviar código de verificación'
      });
    }
    
    // Guardar en caché que el usuario ha iniciado el proceso de login
    await cacheService.set(
      `login_pending:${administrador.id}`,
      true,
      60 * 10 // 10 minutos
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Se ha enviado un código de verificación al teléfono proporcionado',
      data: {
        id: administrador.id,
        requireVerification: true
      }
    });
  } catch (error) {
    logger.error(`Error en login de administrador: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al iniciar sesión'
    });
  }
};

/**
 * Verifica el código SMS para completar el login
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const verificarLoginAdministrador = async (req, res) => {
  try {
    const { telefono, codigo } = req.body;
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar administrador
    const administrador = await prisma.administrador.findFirst({
      where: { telefono: telefonoNormalizado }
    });
    
    if (!administrador) {
      return res.status(404).json({
        status: 'error',
        message: 'Administrador no encontrado'
      });
    }
    
    // Verificar si está en proceso de login
    const loginPending = await cacheService.get(`login_pending:${administrador.id}`);
    
    if (!loginPending) {
      return res.status(400).json({
        status: 'error',
        message: 'Sesión de verificación expirada o inválida'
      });
    }
    
    // Verificar código
    const verificacion = await smsService.verificarCodigo(
      telefonoNormalizado,
      codigo,
      'LOGIN'
    );
    
    if (!verificacion.success) {
      return res.status(400).json({
        status: 'error',
        message: verificacion.message
      });
    }
    
    // Actualizar último acceso
    await prisma.administrador.update({
      where: { id: administrador.id },
      data: { ultimoAcceso: new Date() }
    });
    
    // Eliminar flag de login pendiente
    await cacheService.del(`login_pending:${administrador.id}`);
    
    // Generar tokens
    const payload = {
      id: administrador.id,
      role: 'administrador'
    };
    
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    // Guardar refresh token en caché
    await cacheService.set(
      `refresh_token:${administrador.id}`,
      refreshToken,
      60 * 60 * 24 * 7 // 7 días
    );
    
    // Obtener copropiedades administradas
    const copropiedades = await prisma.copropiedad.findMany({
      where: {
        administradorId: administrador.id,
        activo: true
      },
      select: {
        id: true,
        nombre: true,
        nit: true
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        id: administrador.id,
        nombre: administrador.nombre,
        telefono: administrador.telefono,
        email: administrador.email,
        copropiedades,
        token,
        refreshToken
      }
    });
  } catch (error) {
    logger.error(`Error en verificación de login: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar código'
    });
  }
};

/**
 * Solicita un código para recuperación de contraseña
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const solicitarRecuperacionPassword = async (req, res) => {
  try {
    const { telefono } = req.body;
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar administrador
    const administrador = await prisma.administrador.findFirst({
      where: { telefono: telefonoNormalizado }
    });
    
    if (!administrador) {
      // Por seguridad, no revelamos que el usuario no existe
      return res.status(200).json({
        status: 'success',
        message: 'Si el teléfono está registrado, recibirá un código de recuperación'
      });
    }
    
    // Enviar código SMS para recuperación
    const resultadoSMS = await smsService.enviarCodigoVerificacion(
      telefonoNormalizado,
      'RECUPERACION',
      administrador.id
    );
    
    if (!resultadoSMS.success) {
      logger.error(`Error al enviar SMS de recuperación: ${resultadoSMS.message}`, 'auth', { adminId: administrador.id });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Si el teléfono está registrado, recibirá un código de recuperación'
    });
  } catch (error) {
    logger.error(`Error en solicitud de recuperación: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud'
    });
  }
};

/**
 * Verifica el código y permite cambiar la contraseña
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const verificarCodigoRecuperacion = async (req, res) => {
  try {
    const { telefono, codigo } = req.body;
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Buscar administrador
    const administrador = await prisma.administrador.findFirst({
      where: { telefono: telefonoNormalizado }
    });
    
    if (!administrador) {
      return res.status(404).json({
        status: 'error',
        message: 'Administrador no encontrado'
      });
    }
    
    // Verificar código
    const verificacion = await smsService.verificarCodigo(
      telefonoNormalizado,
      codigo,
      'RECUPERACION'
    );
    
    if (!verificacion.success) {
      return res.status(400).json({
        status: 'error',
        message: verificacion.message
      });
    }
    
    // Generar token temporal para cambio de contraseña
    const resetToken = generateToken(
      { id: administrador.id, action: 'reset_password' },
      '15m' // 15 minutos
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Código verificado correctamente',
      data: {
        resetToken
      }
    });
  } catch (error) {
    logger.error(`Error en verificación de código de recuperación: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar código'
    });
  }
};

/**
 * Cambia la contraseña usando un token de recuperación
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const cambiarPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    
    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Token inválido o expirado'
      });
    }
    
    // Verificar que el token es para cambio de contraseña
    if (decoded.action !== 'reset_password') {
      return res.status(401).json({
        status: 'error',
        message: 'Token no autorizado para esta acción'
      });
    }
    
    // Buscar administrador
    const administrador = await prisma.administrador.findUnique({
      where: { id: decoded.id }
    });
    
    if (!administrador) {
      return res.status(404).json({
        status: 'error',
        message: 'Administrador no encontrado'
      });
    }
    
    // Validar nueva contraseña
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({
        status: 'error',
        message: 'La nueva contraseña debe tener al menos 8 caracteres'
      });
    }
    
    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Actualizar contraseña
    await prisma.administrador.update({
      where: { id: administrador.id },
      data: {
        password: hashedPassword,
        fechaActualizacionPassword: new Date()
      }
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    logger.error(`Error al cambiar contraseña: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al cambiar contraseña'
    });
  }
};

/**
 * Refresca el token JWT usando un refresh token
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: 'Refresh token no proporcionado'
      });
    }
    
    // Verificar refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token inválido o expirado'
      });
    }
    
    // Verificar que el refresh token está en caché
    const storedToken = await cacheService.get(`refresh_token:${decoded.id}`);
    
    if (!storedToken || storedToken !== refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Refresh token inválido o revocado'
      });
    }
    
    // Generar nuevo token
    const newToken = generateToken({
      id: decoded.id,
      role: decoded.role
    });
    
    res.status(200).json({
      status: 'success',
      message: 'Token actualizado correctamente',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    logger.error(`Error al refrescar token: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al refrescar token'
    });
  }
};

/**
 * Cierra la sesión de un usuario
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 */
const logout = async (req, res) => {
  try {
    // Verificar que existe req.user (debe ejecutarse después de verifyToken)
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'error',
        message: 'No autenticado'
      });
    }
    
    // Eliminar refresh token de caché
    await cacheService.del(`refresh_token:${req.user.id}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    logger.error(`Error en logout: ${error.message}`, 'auth', { error, userId: req.user?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al cerrar sesión'
    });
  }
};

module.exports = {
  registrarAdministrador,
  verificarAdministrador,
  reenviarCodigo,
  loginAdministrador,
  verificarLoginAdministrador,
  solicitarRecuperacionPassword,
  verificarCodigoRecuperacion,
  cambiarPassword,
  refreshToken,
  logout
};
