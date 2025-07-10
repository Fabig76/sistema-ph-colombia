/**
 * Controlador de autenticación
 * Maneja registro, login, verificación y recuperación de contraseña
 * para administradores y administradores del sistema
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');
const smsService = require('../services/smsService');
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
    const { nombre, email, telefono, password } = req.body;
    
    // Verificar si ya existe un administrador con ese teléfono o email
    const existente = await prisma.administrador.findFirst({
      where: {
        OR: [
          { telefono },
          { email }
        ]
      }
    });
    
    if (existente) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe un administrador con ese teléfono o email'
      });
    }
    
    // Normalizar teléfono
    const telefonoNormalizado = smsService.normalizarTelefono(telefono);
    
    // Hash de contraseña
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Crear administrador (inicialmente inactivo hasta verificación)
    const administrador = await prisma.administrador.create({
      data: {
        nombre,
        email,
        telefono: telefonoNormalizado,
        password: hashedPassword,
        activo: false,
        verificado: false,
        fechaRegistro: new Date()
      }
    });
    
    // Enviar código de verificación por SMS
    const resultadoSMS = await smsService.enviarCodigoVerificacion(
      telefonoNormalizado,
      'REGISTRO',
      administrador.id
    );
    
    if (!resultadoSMS.success) {
      logger.error(`Error al enviar SMS de verificación: ${resultadoSMS.message}`, 'auth', { adminId: administrador.id });
    }
    
    // Responder sin datos sensibles
    res.status(201).json({
      status: 'success',
      message: 'Administrador registrado. Se ha enviado un código de verificación al teléfono proporcionado.',
      data: {
        id: administrador.id,
        nombre: administrador.nombre,
        telefono: administrador.telefono,
        email: administrador.email,
        verificado: administrador.verificado
      }
    });
  } catch (error) {
    logger.error(`Error al registrar administrador: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al registrar administrador'
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
      'REGISTRO'
    );
    
    if (!verificacion.success) {
      return res.status(400).json({
        status: 'error',
        message: verificacion.message
      });
    }
    
    // Actualizar administrador a verificado y activo
    const administradorActualizado = await prisma.administrador.update({
      where: { id: administrador.id },
      data: {
        verificado: true,
        activo: true,
        fechaVerificacion: new Date()
      }
    });
    
    // Generar tokens
    const payload = {
      id: administradorActualizado.id,
      role: 'administrador'
    };
    
    const token = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);
    
    // Guardar refresh token en caché
    await cacheService.set(
      `refresh_token:${administradorActualizado.id}`,
      refreshToken,
      60 * 60 * 24 * 7 // 7 días
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Administrador verificado correctamente',
      data: {
        id: administradorActualizado.id,
        nombre: administradorActualizado.nombre,
        telefono: administradorActualizado.telefono,
        email: administradorActualizado.email,
        verificado: administradorActualizado.verificado,
        token,
        refreshToken
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
  loginAdministrador,
  verificarLoginAdministrador,
  solicitarRecuperacionPassword,
  verificarCodigoRecuperacion,
  cambiarPassword,
  refreshToken,
  logout
};
