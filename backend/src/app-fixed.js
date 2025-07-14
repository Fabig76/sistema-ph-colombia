/**
 * Aplicación principal CORREGIDA de Paz y Salvos PH
 * Configuración simplificada basada en el servidor temporal que funciona
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Instancia de Prisma
const prisma = new PrismaClient();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const administradorRoutes = require('./routes/administradorRoutes');
const propietarioRoutes = require('./routes/propietarioRoutes');
const adminSistemaRoutes = require('./routes/adminSistemaRoutes');
const copropiedadRoutes = require('./routes/copropiedadRoutes');

// Crear la aplicación Express
const app = express();

// 1. MIDDLEWARE DE SEGURIDAD
app.use(helmet());

// 2. CORS CONFIGURATION
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:3003'
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 3. COMPRESIÓN
app.use(compression());

// 4. PARSEO DE JSON
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 5. ARCHIVOS ESTÁTICOS (básico)
app.use('/static', express.static(path.join(__dirname, '../public')));

// Directorio temporal para PDFs
const tmpDir = process.env.PDF_TMP_DIR || path.join(__dirname, '../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}
app.use('/tmp', express.static(tmpDir));

// 6. MIDDLEWARE DE DEBUGGING (IGUAL AL SERVIDOR TEMPORAL)
console.log('🔴 REGISTRANDO MIDDLEWARE DE DEBUGGING...');
app.use((req, res, next) => {
  try {
    console.log(`🚨 ${req.method} ${req.path}`);
    next();
  } catch (error) {
    console.error('Error en middleware debug:', error);
    next();
  }
});
console.log('✅ MIDDLEWARE DE DEBUGGING REGISTRADO');

// 7. REGISTRO DE RUTAS (IGUAL AL SERVIDOR TEMPORAL)
console.log('🔗 Importando y registrando rutas...');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/administradores', administradorRoutes);
app.use('/api/v1/propietarios', propietarioRoutes);  
app.use('/api/v1/admin-sistema', adminSistemaRoutes);
app.use('/api/v1/copropiedades', copropiedadRoutes);
console.log('✅ Todas las rutas registradas');

// 8. RUTAS DE PRUEBA (TEMPORALMENTE DESHABILITADAS - PROBLEMA PATH-TO-REGEXP)
// if (process.env.NODE_ENV !== 'production') {
//   try {
//     const testGoogleApisRoutes = require('./routes/testGoogleApis');
//     app.use('/api/test-google', testGoogleApisRoutes);
//     console.log('✅ Rutas de prueba Google APIs registradas');
//   } catch (error) {
//     console.log('⚠️ No se pudieron cargar las rutas de prueba Google APIs');
//   }
// }
console.log('⚠️ Rutas Google APIs temporalmente deshabilitadas (problema path-to-regexp)');

// 9. HEALTH CHECK SIMPLIFICADO
app.get('/api/v1/health', async (req, res) => {
  try {
    // Verificar base de datos de forma simple
    let dbStatus = 'disconnected';
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      dbStatus = 'connected';
    } catch (dbError) {
      console.log('Database health check error:', dbError.message);
    }
    
    // Verificar Redis de forma simple
    let redisStatus = 'disconnected';
    try {
      const redis = require('./services/cacheService').getClient();
      if (redis && redis.status === 'ready') {
        redisStatus = 'connected';
      }
    } catch (redisError) {
      console.log('Redis health check error:', redisError.message);
    }
    
    res.json({ 
      status: 'success', 
      message: 'Servidor funcionando correctamente',
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Error en health check',
      error: error.message
    });
  }
});

// 10. RUTA DE INFORMACIÓN
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Paz y Salvos PH Colombia API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    status: 'Servidor principal corregido'
  });
});

// 11. MANEJO DE ERRORES 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta ${req.originalUrl} no encontrada`,
    timestamp: new Date().toISOString()
  });
});

// 12. MANEJO DE ERRORES GENERALES
app.use((error, req, res, next) => {
  console.error('Error general:', error);
  
  // Error de validación de Prisma
  if (error.code && error.code.startsWith('P')) {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación en base de datos',
      timestamp: new Date().toISOString()
    });
  }
  
  // Error general
  res.status(error.status || 500).json({
    status: 'error',
    message: error.message || 'Error interno del servidor',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
