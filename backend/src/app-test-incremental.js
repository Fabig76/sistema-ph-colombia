/**
 * Servidor INCREMENTAL para identificar middleware problemático path-to-regexp
 * Agregamos middleware UNO POR UNO hasta reproducir el error
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Crear aplicación
const app = express();

console.log('🔍 AGREGANDO MIDDLEWARE INCREMENTAL...');

// PASO 1: CORS (ya probado que funciona)
console.log('🧪 PASO 1: Agregando CORS...');
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

// PASO 2: JSON parsing (ya probado que funciona)
console.log('🧪 PASO 2: Agregando JSON parsing...');
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// PASO 3: HELMET (SOSPECHOSO)
console.log('🧪 PASO 3: Agregando HELMET...');
try {
  app.use(helmet());
  console.log('✅ HELMET: Agregado exitosamente');
} catch (error) {
  console.error('❌ ERROR EN HELMET:', error.message);
  process.exit(1);
}

// PASO 4: COMPRESSION (SOSPECHOSO)
console.log('🧪 PASO 4: Agregando COMPRESSION...');
try {
  app.use(compression());
  console.log('✅ COMPRESSION: Agregado exitosamente');
} catch (error) {
  console.error('❌ ERROR EN COMPRESSION:', error.message);
  process.exit(1);
}

// PASO 5: STATIC FILES (SOSPECHOSO)
console.log('🧪 PASO 5: Agregando STATIC FILES...');
try {
  app.use('/static', express.static(path.join(__dirname, '../public')));
  
  // Directorio temporal para PDFs
  const tmpDir = process.env.PDF_TMP_DIR || path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }
  app.use('/tmp', express.static(tmpDir));
  console.log('✅ STATIC FILES: Agregados exitosamente');
} catch (error) {
  console.error('❌ ERROR EN STATIC FILES:', error.message);
  process.exit(1);
}

// PASO 6: RATE LIMITING (MUY SOSPECHOSO)
console.log('🧪 PASO 6: Agregando RATE LIMITING...');
try {
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
  
  console.log('✅ RATE LIMITING: Configurado exitosamente');
} catch (error) {
  console.error('❌ ERROR EN RATE LIMITING:', error.message);
  process.exit(1);
}

// PASO 7: DEBUGGING MIDDLEWARE
console.log('🧪 PASO 7: Agregando debugging middleware...');
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use((req, res, next) => {
  console.log(`🚨 ${req.method} ${req.path}`);
  next();
});

// PASO 8: IMPORTAR RUTAS (ya probado que funciona)
console.log('🧪 PASO 8: Importando rutas...');
try {
  const authRoutes = require('./routes/authRoutes');
  const administradorRoutes = require('./routes/administradorRoutes');
  const propietarioRoutes = require('./routes/propietarioRoutes');
  const adminSistemaRoutes = require('./routes/adminSistemaRoutes');
  const copropiedadRoutes = require('./routes/copropiedadRoutes');
  
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/administradores', administradorRoutes);
  app.use('/api/v1/propietarios', propietarioRoutes);
  app.use('/api/v1/admin-sistema', adminSistemaRoutes);
  app.use('/api/v1/copropiedades', copropiedadRoutes);
  
  console.log('✅ RUTAS: Todas importadas exitosamente');
  
  // PASO 9: AGREGAR TEST GOOGLE APIS (SOSPECHOSO DE CAUSAR PATH-TO-REGEXP)
  console.log('🧪 PASO 9: Agregando TEST GOOGLE APIS...');
  const testGoogleApisRoutes = require('./routes/testGoogleApis');
  app.use('/api/test-google', testGoogleApisRoutes);
  console.log('✅ TEST GOOGLE APIS: Agregado exitosamente');
  
} catch (error) {
  console.error('❌ ERROR EN RUTAS:', error.message);
  process.exit(1);
}

console.log('✅ TODOS LOS MIDDLEWARE AGREGADOS EXITOSAMENTE');

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Servidor incremental funcionando con TODOS los middleware',
    timestamp: new Date().toISOString()
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Paz y Salvos PH Colombia API (INCREMENTAL TEST)',
    version: '1.0.0',
    status: 'Servidor para identificar middleware problemático'
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
