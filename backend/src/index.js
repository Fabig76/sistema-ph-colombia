/**
 * Servidor principal para el sistema Paz y Salvos PH Colombia
 * Este archivo configura y arranca el servidor Express con todas las configuraciones
 * necesarias para el funcionamiento del sistema.
 */

// Importaciones de dependencias
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Importaciones de archivos locales
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const propietarioRoutes = require('./routes/propietarioRoutes');
const adminSistemaRoutes = require('./routes/adminSistemaRoutes');

// Inicialización de la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de middlewares globales
app.use(helmet()); // Seguridad HTTP
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parseo de JSON
app.use(express.urlencoded({ extended: true })); // Parseo de formularios

// Configuración de rate limiting global
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos por defecto
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // 100 solicitudes por ventana por defecto
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Demasiadas solicitudes, por favor intente más tarde'
  }
});

// Aplicar rate limiting a todas las rutas
app.use(limiter);

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/propietarios', propietarioRoutes);
app.use('/api/admin-sistema', adminSistemaRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    status: 404,
    message: 'Recurso no encontrado'
  });
});

// Middleware para manejo de errores
app.use(errorHandler);

// Iniciar el servidor
app.listen(PORT, () => {
  logger.info(`Servidor iniciado en el puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;
