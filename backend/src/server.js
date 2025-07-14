/**
 * Servidor principal ESTABLE para Paz y Salvos PH Colombia
 * Inicializa la aplicación Express y maneja eventos del servidor
 */

const app = require('./app');
const logger = require('./utils/logger');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
require('dotenv').config();

// Puerto para el servidor
const PORT = process.env.PORT || 4000;

console.log('🚀 Iniciando Paz y Salvos PH Backend...');

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error(`EXCEPCIÓN NO CAPTURADA: ${err.message}`, 'server', { error: err.stack });
  console.error('EXCEPCIÓN NO CAPTURADA! 💥 Cerrando servidor...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Iniciar el servidor PRIMERO
const server = app.listen(PORT, () => {
  logger.info(`Servidor iniciado en el puerto ${PORT} en modo ${process.env.NODE_ENV}`, 'server');
  console.log(`✅ Servidor iniciado en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
  
  // DESPUÉS verificar la base de datos (no bloquear inicio)
  testDatabaseConnection();
});

// Verificar conexión a la base de datos (ASYNC - NO BLOQUEA)
const testDatabaseConnection = async () => {
  try {
    console.log('📡 Verificando conexión a base de datos...');
    await prisma.$connect();
    logger.info('Conexión a la base de datos establecida correctamente', 'server');
    console.log('✅ Base de datos conectada');
  } catch (error) {
    logger.error(`Error al conectar con la base de datos: ${error.message}`, 'server', { error });
    console.error('⚠️  Error al conectar con la base de datos, pero servidor sigue activo');
    console.error('Error:', error.message);
    // NO cerrar el servidor, solo logear el error
  }
};

// Manejo de rechazos de promesas no capturados - MODIFICADO PARA NO CERRAR SERVIDOR
process.on('unhandledRejection', (err) => {
  logger.error(`RECHAZO NO MANEJADO: ${err.message}`, 'server', { error: err.stack });
  console.error('🚨 RECHAZO NO MANEJADO - ERROR DETECTADO:');
  console.error('Error Name:', err.name);
  console.error('Error Message:', err.message);
  console.error('Error Stack:', err.stack);
  console.error('🚀 Servidor continuando...');
  // NO cerrar el servidor, solo logear el error
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

process.on('SIGINT', () => {
  logger.info('Señal SIGINT recibida. Cerrando servidor correctamente', 'server');
  console.log('Señal SIGINT recibida. Cerrando servidor correctamente');
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Servidor cerrado correctamente', 'server');
    process.exit(0);
  });
});

// Mantener el proceso activo
setInterval(() => {
  console.log(`🔄 Backend activo - ${new Date().toISOString()}`);
}, 30000);

// Exportar el servidor para pruebas
module.exports = server;
