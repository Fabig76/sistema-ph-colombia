/**
 * Servidor mínimo para diagnosticar error path-to-regexp
 */

const app = require('./app.minimal');
require('dotenv').config();

// Puerto para el servidor
const PORT = process.env.PORT || 5000;

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/v1/health`);
});

// Manejo graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado.');
    process.exit(0);
  });
});

module.exports = server;
