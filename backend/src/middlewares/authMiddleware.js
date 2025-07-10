/**
 * Middleware de autenticación
 * Implementa verificación de JWT para proteger rutas
 * y diferenciar entre tipos de usuarios
 */

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
require('dotenv').config();

// Clave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_para_jwt';

/**
 * Middleware para verificar token JWT
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const verifyToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        message: 'No se proporcionó token de autenticación'
      });
    }
    
    // Verificar formato Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        status: 'error',
        message: 'Formato de token inválido'
      });
    }
    
    const token = parts[1];
    
    // Verificar token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.warn('Token JWT inválido', 'auth', { error: err.message });
        return res.status(401).json({
          status: 'error',
          message: 'Token inválido o expirado'
        });
      }
      
      // Guardar datos del usuario en la solicitud
      req.user = decoded;
      next();
    });
  } catch (error) {
    logger.error(`Error en verificación de token: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar autenticación'
    });
  }
};

/**
 * Middleware para verificar que el usuario es un administrador
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const isAdministrador = async (req, res, next) => {
  try {
    // Verificar que existe req.user (debe ejecutarse después de verifyToken)
    if (!req.user || !req.user.id || req.user.role !== 'administrador') {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: se requiere rol de administrador'
      });
    }
    
    // Verificar que el administrador existe en la base de datos y está activo
    const admin = await prisma.administrador.findUnique({
      where: { id: req.user.id }
    });
    
    if (!admin || !admin.activo) {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: cuenta de administrador inactiva o no encontrada'
      });
    }
    
    // Actualizar último acceso
    await prisma.administrador.update({
      where: { id: admin.id },
      data: { ultimoAcceso: new Date() }
    });
    
    // Añadir datos completos del administrador a la solicitud
    req.administrador = admin;
    next();
  } catch (error) {
    logger.error(`Error en verificación de administrador: ${error.message}`, 'auth', { error, userId: req.user?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar permisos de administrador'
    });
  }
};

/**
 * Middleware para verificar que el usuario es un administrador del sistema (superadmin)
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const isAdminSistema = async (req, res, next) => {
  try {
    // Verificar que existe req.user (debe ejecutarse después de verifyToken)
    if (!req.user || !req.user.id || req.user.role !== 'admin_sistema') {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: se requiere rol de administrador del sistema'
      });
    }
    
    // Verificar que el admin sistema existe en la base de datos y está activo
    const adminSistema = await prisma.adminSistema.findUnique({
      where: { id: req.user.id }
    });
    
    if (!adminSistema || !adminSistema.activo) {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: cuenta de administrador del sistema inactiva o no encontrada'
      });
    }
    
    // Actualizar último acceso
    await prisma.adminSistema.update({
      where: { id: adminSistema.id },
      data: { ultimoAcceso: new Date() }
    });
    
    // Añadir datos completos del admin sistema a la solicitud
    req.adminSistema = adminSistema;
    next();
  } catch (error) {
    logger.error(`Error en verificación de admin sistema: ${error.message}`, 'auth', { error, userId: req.user?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar permisos de administrador del sistema'
    });
  }
};

/**
 * Middleware para verificar propiedad de una copropiedad
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const verificarPropiedadCopropiedad = async (req, res, next) => {
  try {
    // Verificar que existe req.user y req.administrador
    if (!req.user || !req.administrador) {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: autenticación incompleta'
      });
    }
    
    // Obtener ID de copropiedad de los parámetros o del cuerpo
    const copropiedadId = req.params.copropiedadId || req.body.copropiedadId;
    
    if (!copropiedadId) {
      return res.status(400).json({
        status: 'error',
        message: 'ID de copropiedad no proporcionado'
      });
    }
    
    // Verificar que la copropiedad pertenece al administrador
    const copropiedad = await prisma.copropiedad.findFirst({
      where: {
        id: copropiedadId,
        administradorId: req.administrador.id
      }
    });
    
    if (!copropiedad) {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: la copropiedad no pertenece a este administrador'
      });
    }
    
    // Añadir datos de la copropiedad a la solicitud
    req.copropiedad = copropiedad;
    next();
  } catch (error) {
    logger.error(`Error en verificación de propiedad de copropiedad: ${error.message}`, 'auth', { error, userId: req.user?.id });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar propiedad de copropiedad'
    });
  }
};

/**
 * Genera un token JWT para un usuario
 * @param {Object} payload - Datos a incluir en el token
 * @param {string} expiresIn - Tiempo de expiración (por defecto 24h)
 * @returns {string} - Token JWT generado
 */
const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Genera un token de actualización (refresh token)
 * @param {Object} payload - Datos a incluir en el token
 * @returns {string} - Refresh token generado
 */
const generateRefreshToken = (payload) => {
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

module.exports = {
  verifyToken,
  isAdministrador,
  isAdminSistema,
  verificarPropiedadCopropiedad,
  generateToken,
  generateRefreshToken
};
