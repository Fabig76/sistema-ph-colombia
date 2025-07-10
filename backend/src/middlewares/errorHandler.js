/**
 * Middleware para manejo centralizado de errores
 * Captura todos los errores lanzados en la aplicación y los formatea
 * para enviar una respuesta consistente al cliente
 */

const logger = require('../utils/logger');

/**
 * Middleware de manejo de errores
 * @param {Error} err - Error capturado
 * @param {Request} req - Objeto de solicitud Express
 * @param {Response} res - Objeto de respuesta Express
 * @param {Function} next - Función next de Express
 */
const errorHandler = (err, req, res, next) => {
  // Extraer información de la solicitud para el log
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || 'unknown';
  
  // Determinar el código de estado HTTP
  // Por defecto 500, pero podemos tener errores personalizados con su propio código
  const statusCode = err.statusCode || 500;
  
  // Determinar si incluimos el stack trace (solo en desarrollo)
  const isDev = process.env.NODE_ENV === 'development';
  
  // Crear objeto de error para la respuesta
  const errorResponse = {
    status: 'error',
    message: statusCode === 500 ? 'Error interno del servidor' : err.message,
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  };
  
  // Solo incluir detalles técnicos en desarrollo
  if (isDev) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details || null;
  }
  
  // Registrar el error en los logs
  logger.error(`${method} ${originalUrl} - ${statusCode} - ${err.message}`, 'http', {
    ip,
    userAgent,
    method,
    path: originalUrl,
    statusCode,
    errorCode: err.code || 'INTERNAL_ERROR',
    stack: isDev ? err.stack : undefined,
    details: err.details || null
  });
  
  // Enviar respuesta al cliente
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
