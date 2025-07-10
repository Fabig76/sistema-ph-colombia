/**
 * Sistema de logging para Paz y Salvos PH
 * Implementa Winston para logs en consola y archivo
 * Opcionalmente guarda logs en base de datos para consulta desde el panel de admin
 */

const winston = require('winston');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

// Configuración de niveles y colores
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Añadir colores a winston
winston.addColors(colors);

// Formato personalizado para los logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.metadata ? ' ' + JSON.stringify(info.metadata) : ''}`
  )
);

// Transportes para los logs
const transports = [
  // Consola
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      format
    ),
  }),
  // Archivo para todos los logs
  new winston.transports.File({
    filename: 'logs/combined.log',
    format,
  }),
  // Archivo solo para errores
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format,
  }),
];

// Crear el logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

// Función para guardar logs en la base de datos
const saveLogToDb = async (level, message, origin, metadata = {}) => {
  try {
    // Solo guardar en DB si está habilitado en la configuración
    if (process.env.LOG_TO_DB === 'true') {
      // Eliminar información sensible de los metadatos
      const sanitizedMetadata = { ...metadata };
      
      // Lista de campos sensibles a eliminar
      const sensitiveFields = ['password', 'token', 'refreshToken', 'codigo', 'jwt'];
      
      // Función recursiva para limpiar objetos anidados
      const sanitizeObject = (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        
        Object.keys(obj).forEach(key => {
          if (sensitiveFields.includes(key.toLowerCase())) {
            obj[key] = '[REDACTED]';
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          }
        });
        
        return obj;
      };
      
      sanitizeObject(sanitizedMetadata);
      
      // Guardar en la base de datos
      await prisma.log.create({
        data: {
          nivel: level.toUpperCase(),
          mensaje: message,
          origen: origin,
          metadatos: sanitizedMetadata
        }
      });
    }
  } catch (error) {
    // Si falla el guardado en DB, al menos lo registramos en el log de archivo
    console.error('Error al guardar log en base de datos:', error);
  }
};

// Extender el logger con métodos personalizados que también guardan en DB
const customLogger = {
  error: (message, origin = 'system', metadata = {}) => {
    logger.error(message, { metadata });
    saveLogToDb('ERROR', message, origin, metadata);
  },
  warn: (message, origin = 'system', metadata = {}) => {
    logger.warn(message, { metadata });
    saveLogToDb('WARN', message, origin, metadata);
  },
  info: (message, origin = 'system', metadata = {}) => {
    logger.info(message, { metadata });
    saveLogToDb('INFO', message, origin, metadata);
  },
  debug: (message, origin = 'system', metadata = {}) => {
    logger.debug(message, { metadata });
    if (process.env.LOG_LEVEL === 'debug') {
      saveLogToDb('DEBUG', message, origin, metadata);
    }
  },
  // Método para logs de HTTP que no se guardan en DB
  http: (message, metadata = {}) => {
    logger.http(message, { metadata });
  }
};

module.exports = customLogger;
