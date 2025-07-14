/**
 * Servidor ULTRA-SIMPLIFICADO para resolver problema path-to-regexp
 * Solo lo esencial para que funcione
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

console.log('🔗 Importando rutas básicas...');

// Importar solo las rutas esenciales una por una con try-catch
try {
  const authRoutes = require('./routes/authRoutes');
  app.use('/api/v1/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Error loading auth routes:', error.message);
}

try {
  const copropiedadRoutes = require('./routes/copropiedadRoutes');
  app.use('/api/v1/copropiedades', copropiedadRoutes);
  console.log('✅ Copropiedad routes loaded');
} catch (error) {
  console.error('❌ Error loading copropiedad routes:', error.message);
}

try {
  const administradorRoutes = require('./routes/administradorRoutes');
  app.use('/api/v1/administradores', administradorRoutes);
  console.log('✅ Administrador routes loaded');
} catch (error) {
  console.error('❌ Error loading administrador routes:', error.message);
}

try {
  const propietarioRoutes = require('./routes/propietarioRoutes');
  app.use('/api/v1/propietarios', propietarioRoutes);
  console.log('✅ Propietario routes loaded');
} catch (error) {
  console.error('❌ Error loading propietario routes:', error.message);
}

try {
  const adminSistemaRoutes = require('./routes/adminSistemaRoutes');
  app.use('/api/v1/admin-sistema', adminSistemaRoutes);
  console.log('✅ Admin sistema routes loaded');
} catch (error) {
  console.error('❌ Error loading admin sistema routes:', error.message);
}

console.log('✅ Carga de rutas completada');

// Health check simple
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Servidor minimal funcionando',
    timestamp: new Date().toISOString()
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Paz y Salvos PH Colombia API (MINIMAL)',
    version: '1.0.0',
    status: 'Servidor ultra-simplificado'
  });
});

// 404 handler
app.use('*', (req, res) => {
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
