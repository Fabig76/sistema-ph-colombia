/**
 * Servidor de prueba ultra simple
 */
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware básico
app.use(express.json());

// Ruta básica de salud
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Información básica
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Paz y Salvos PH Colombia API',
    version: '1.0.0',
    status: 'running'
  });
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  console.log(`✅ Servidor de prueba iniciado en el puerto ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🔥 Health check: http://localhost:${PORT}/api/v1/health`);
});

// Manejo de errores
process.on('uncaughtException', (err) => {
  console.error('❌ EXCEPCIÓN NO CAPTURADA:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ PROMESA NO MANEJADA:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
