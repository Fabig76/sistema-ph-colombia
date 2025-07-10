/**
 * Servidor principal para Paz y Salvos PH Colombia
 * Inicializa la aplicación Express y maneja eventos del servidor
 */

const app = require('./app');
const logger = require('./utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

// Puerto para el servidor
const PORT = process.env.PORT || 5000;

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error(`EXCEPCIÓN NO CAPTURADA: ${err.message}`, 'server', { error: err.stack });
  console.error('EXCEPCIÓN NO CAPTURADA! 💥 Cerrando servidor...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Iniciar el servidor
const server = app.listen(PORT, () => {
  logger.info(`Servidor iniciado en el puerto ${PORT} en modo ${process.env.NODE_ENV}`, 'server');
  console.log(`Servidor iniciado en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});

// Verificar conexión a la base de datos
const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    logger.info('Conexión a la base de datos establecida correctamente', 'server');
  } catch (error) {
    logger.error(`Error al conectar con la base de datos: ${error.message}`, 'server', { error });
    console.error('Error al conectar con la base de datos. Cerrando servidor...');
    process.exit(1);
  }
};

// Ejecutar verificación de base de datos
testDatabaseConnection();

// Manejo de rechazos de promesas no capturados
process.on('unhandledRejection', (err) => {
  logger.error(`RECHAZO NO MANEJADO: ${err.message}`, 'server', { error: err.stack });
  console.error('RECHAZO NO MANEJADO! 💥 Cerrando servidor...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('Señal SIGTERM recibida. Cerrando servidor correctamente', 'server');
  console.log('Señal SIGTERM recibida. Cerrando servidor correctamente');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Servidor cerrado correctamente', 'server');
    process.exit(0);
  });
});

// Exportar el servidor para pruebas
module.exports = server;
