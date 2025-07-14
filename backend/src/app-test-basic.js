/**
 * Servidor BÁSICO SIN RUTAS para confirmar origen del error path-to-regexp
 * CERO importación de archivos de rutas
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

console.log('🚀 Servidor BÁSICO sin rutas importadas');

// Health check simple
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Servidor básico funcionando SIN rutas importadas',
    timestamp: new Date().toISOString()
  });
});

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Paz y Salvos PH Colombia API (BASIC TEST)',
    version: '1.0.0',
    status: 'Servidor básico para testing - SIN RUTAS'
  });
});

// 404 handler - SIN app.all('*')
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
