/**
 * App mínimo para diagnosticar error path-to-regexp
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
require('dotenv').config();

const prisma = new PrismaClient();
const packageJson = require('../package.json');

// Crear la aplicación Express
const app = express();

// Configuración de seguridad con Helmet
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

// Compresión de respuestas
app.use(compression());

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Límite de 1000 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes, por favor intente más tarde'
  }
});
app.use(generalLimiter);

// Logging de solicitudes HTTP
app.use(morgan('combined'));

// Configuración CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiadas solicitudes, por favor intente más tarde'
  }
});

// Rate limiting más estricto para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Límite de 10 solicitudes por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Demasiados intentos de autenticación, por favor intente más tarde'
  }
});

// Middleware para agregar timestamp a las solicitudes
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Ruta de prueba con redis
app.get('/api/v1/health', async (req, res) => {
  try {
    // Test Database connection
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (dbError) {
      // Database error handled
    }
    
    // Test Redis connection
    const redis = require('./services/cacheService').getClient();
    let redisStatus = 'disconnected';
    try {
      await redis.ping();
      redisStatus = 'connected';
    } catch (redisError) {
      // Redis error handled
    }
    
    // Test Circuit Breakers
    const circuitBreakerService = require('./services/circuitBreakerService');
    let circuitBreakers = {};
    try {
      circuitBreakers = Object.keys(circuitBreakerService.getCircuitBreakers()).reduce((acc, key) => {
        const breaker = circuitBreakerService.getCircuitBreakers()[key];
        acc[key] = {
          state: breaker.state,
          stats: breaker.stats
        };
        return acc;
      }, {});
    } catch (cbError) {
      // Circuit breaker error handled
    }
    
    res.json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      redis: redisStatus,
      circuitBreakers: circuitBreakers
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Ruta de información de la API
app.get('/api/info', (req, res) => {
  const apiInfo = {
    name: 'Paz y Salvos PH Colombia API',
    version: process.env.npm_package_version || packageJson.version,
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
// app.all('(.*)', (req, res) => {
//   res.status(404).json({
//     status: 'error',
//     message: `No se encontró la ruta ${req.originalUrl} en este servidor`
//   });
// });

module.exports = app;
