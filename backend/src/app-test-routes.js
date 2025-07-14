/**
 * Servidor para IDENTIFICAR qué archivo de rutas causa el error path-to-regexp
 * Importaremos rutas UNA POR UNA para aislar el problema
 */

const express = require('express');
const cors = require('cors');

// Crear aplicación
const app = express();

// CORS básico
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000', 'http://localhost:3003'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// JSON parsing
app.use(express.json({ limit: '1mb' }));

// Middleware de debugging
app.use((req, res, next) => {
  console.log(`🚨 ${req.method} ${req.path}`);
  next();
});

console.log('🔍 IDENTIFICANDO ARCHIVO DE RUTA PROBLEMÁTICO...');

// PASO 1: Probar solo authRoutes
console.log('🧪 TEST 1: Importando authRoutes...');
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/v1/auth', authRoutes);
  console.log('✅ authRoutes: EXITOSO');
} catch (error) {
  console.error('❌ ERROR EN authRoutes:', error.message);
  process.exit(1);
}

console.log('🧪 TEST 2: Importando copropiedadRoutes...');
try {
  const copropiedadRoutes = require('./routes/copropiedadRoutes');
  app.use('/api/v1/copropiedades', copropiedadRoutes);
  console.log('✅ copropiedadRoutes: EXITOSO');
} catch (error) {
  console.error('❌ ERROR EN copropiedadRoutes:', error.message);
  process.exit(1);
}

console.log('🧪 TEST 3: Importando administradorRoutes...');
try {
  const administradorRoutes = require('./routes/administradorRoutes');
  app.use('/api/v1/administradores', administradorRoutes);
  console.log('✅ administradorRoutes: EXITOSO');
} catch (error) {
  console.error('❌ ERROR EN administradorRoutes:', error.message);
  process.exit(1);
}

console.log('🧪 TEST 4: Importando propietarioRoutes...');
try {
  const propietarioRoutes = require('./routes/propietarioRoutes');
  app.use('/api/v1/propietarios', propietarioRoutes);
  console.log('✅ propietarioRoutes: EXITOSO');
} catch (error) {
  console.error('❌ ERROR EN propietarioRoutes:', error.message);
  process.exit(1);
}

console.log('🧪 TEST 5: Importando adminSistemaRoutes...');
try {
  const adminSistemaRoutes = require('./routes/adminSistemaRoutes');
  app.use('/api/v1/admin-sistema', adminSistemaRoutes);
  console.log('✅ adminSistemaRoutes: EXITOSO');
} catch (error) {
  console.error('❌ ERROR EN adminSistemaRoutes:', error.message);
  process.exit(1);
}

console.log('🧪 TEST 6: Importando testGoogleApis...');
try {
  const testGoogleApis = require('./routes/testGoogleApis');
  app.use('/api/test-google', testGoogleApis);
  console.log('✅ testGoogleApis: EXITOSO');
} catch (error) {
  console.error('❌ ERROR EN testGoogleApis:', error.message);
  console.error('🎯 ARCHIVO PROBLEMÁTICO IDENTIFICADO: testGoogleApis.js');
  process.exit(1);
}

console.log('✅ TODAS LAS RUTAS IMPORTADAS EXITOSAMENTE');

// Health check simple
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Servidor con TODAS las rutas funcionando',
    timestamp: new Date().toISOString()
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Paz y Salvos PH Colombia API (ROUTE TEST)',
    version: '1.0.0',
    status: 'Servidor para identificar rutas problemáticas'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta ${req.originalUrl} no encontrada`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
});

module.exports = app;
