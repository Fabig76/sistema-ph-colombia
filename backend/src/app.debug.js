/**
 * Aplicación principal de Paz y Salvos PH
 * Configura Express, middleware, rutas y manejo de errores
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
// const logger = require('./utils/logger');
require('dotenv').config();

const prisma = new PrismaClient();

// Importar rutas
// const authRoutes = require('./routes/authRoutes');
// const administradorRoutes = require('./routes/administradorRoutes');
// const propietarioRoutes = require('./routes/propietarioRoutes');
// const adminSistemaRoutes = require('./routes/adminSistemaRoutes');

// Crear la aplicación Express
const app = express();

// Configuración de seguridad básica
app.use(helmet());

// Configuración de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compresión de respuestas
app.use(compression());

// Parseo de JSON y URL-encoded
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Directorio para archivos estáticos
app.use('/static', express.static(path.join(__dirname, '../public')));

// Directorio temporal para PDFs (crear si no existe)
const tmpDir = process.env.PDF_TMP_DIR || path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}
app.use('/tmp', express.static(tmpDir));

// Configuración de rate limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 100, // Límite de 100 solicitudes por ventana
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     status: 'error',
//     message: 'Demasiadas solicitudes, por favor intente más tarde'
//   }
// });

// Rate limiting más estricto para rutas de autenticación
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutos
//   max: 10, // Límite de 10 solicitudes por ventana
//   standardHeaders: true,
//   legacyHeaders: false,
//   message: {
//     status: 'error',
//     message: 'Demasiados intentos de autenticación, por favor intente más tarde'
//   }
// });

// Logging de solicitudes HTTP
// app.use(morgan('combined', {
//   stream: {
//     write: (message) => logger.http(message.trim())
//   }
// }));

// Middleware para agregar timestamp a las solicitudes
// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString();
//   next();
// });

// Rutas principales
// app.use('/api/v1/auth', authLimiter, authRoutes);
// app.use('/api/v1/administradores', apiLimiter, administradorRoutes);
// app.use('/api/v1/propietarios', apiLimiter, propietarioRoutes);
// app.use('/api/v1/admin-sistema', apiLimiter, adminSistemaRoutes);

// Ruta de estado del servidor (Health Check)
app.get('/api/v1/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (dbError) {
      // logger.error(`Error en health check - Base de datos: ${dbError.message}`, 'health', { error: dbError });
    }
    
    // Verificar conexión a Redis
    let redisStatus = 'disconnected';
    try {
      const redis = require('./services/cacheService').getClient();
      if (redis && redis.status === 'ready') {
        redisStatus = 'connected';
      }
    } catch (redisError) {
      // logger.error(`Error en health check - Redis: ${redisError.message}`, 'health', { error: redisError });
    }
    
    // Verificar circuit breakers
    let circuitBreakersStatus = {};
    try {
      const circuitBreakerService = require('./services/circuitBreakerService');
      const stats = circuitBreakerService.getStats();
      circuitBreakersStatus = stats.reduce((acc, breaker) => {
        acc[breaker.name] = breaker.state;
        return acc;
      }, {});
    } catch (cbError) {
      // logger.error(`Error en health check - Circuit Breakers: ${cbError.message}`, 'health', { error: cbError });
    }
    
    // Información del sistema
    const os = require('os');
    const systemInfo = {
      uptime: Math.floor(process.uptime()),
      memory: {
        free: os.freemem(),
        total: os.totalmem(),
        usage: process.memoryUsage()
      },
      cpu: os.cpus().length
    };
    
    res.status(200).json({
      status: 'success',
      message: 'Servidor funcionando correctamente',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || require('../package.json').version,
      services: {
        database: dbStatus,
        redis: redisStatus,
        circuitBreakers: circuitBreakersStatus
      },
      system: systemInfo
    });
  } catch (error) {
    // logger.error(`Error en health check: ${error.message}`, 'health', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al verificar estado del servidor',
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta de información de la API
app.get('/api/info', (req, res) => {
  const apiInfo = {
    name: 'Paz y Salvos PH Colombia API',
    version: process.env.npm_package_version || require('../package.json').version,
    description: 'API para el sistema de gestión de paz y salvos para propiedad horizontal en Colombia',
    endpoints: {
      auth: '/api/v1/auth',
      administradores: '/api/v1/administradores',
      propietarios: '/api/v1/propietarios',
      adminSistema: '/api/v1/admin-sistema',
      health: '/api/v1/health',
      info: '/api/info'
    },
    documentation: '/api/docs',
    contact: {
      developer: 'Equipo de Desarrollo Paz y Salvos PH',
      email: 'soporte@pazysalvosph.com'
    },
    features: [
      'Integración con Google Sheets para datos de propietarios',
      'Verificación por SMS para autenticación segura',
      'Generación de paz y salvos en PDF',
      'Caché intensivo para optimizar rendimiento',
      'Circuit breakers para protección contra fallos'
    ],
    timestamp: new Date().toISOString()
  };

  res.status(200).json(apiInfo);
});

// Ruta para documentación API (si existe)
if (fs.existsSync(path.join(__dirname, '../public/docs'))) {
  app.use('/api/docs', express.static(path.join(__dirname, '../public/docs')));
}

// Manejo de rutas no encontradas
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `No se encontró la ruta ${req.originalUrl} en este servidor`
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  
  // Loggear el error
  // logger.error(`${req.method} ${req.path} - ${err.message}`, 'express', {
  //   error: err,
  //   body: req.body,
  //   params: req.params,
  //   query: req.query,
  //   user: req.user ? { id: req.user.id } : null
  // });
  
  // Responder al cliente
  res.status(statusCode).json({
    status,
    message: process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Algo salió mal'
      : err.message
  });
});

module.exports = app;
