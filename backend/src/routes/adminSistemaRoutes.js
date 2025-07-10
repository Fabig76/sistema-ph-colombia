/**
 * Rutas de Administrador del Sistema
 * Maneja endpoints para la administración global del sistema
 */

const express = require('express');
const router = express.Router();
const adminSistemaController = require('../controllers/adminSistemaController');
const { validate, schemas } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdminSistema } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);
router.use(isAdminSistema);

// Estadísticas del sistema
router.get('/estadisticas', adminSistemaController.getEstadisticasSistema);

// Gestión de administradores
router.get('/administradores', adminSistemaController.getAdministradores);
router.get('/administradores/:id', adminSistemaController.getAdministrador);
router.patch('/administradores/:id/estado', adminSistemaController.actualizarEstadoAdministrador);

// Gestión de copropiedades
router.get('/copropiedades', adminSistemaController.getCopropiedades);
router.get('/copropiedades/:id', adminSistemaController.getCopropiedad);
router.patch('/copropiedades/:id/estado', adminSistemaController.actualizarEstadoCopropiedad);

// Registro de nuevos administradores del sistema
router.post('/registrar', validate(schemas.registroAdminSistema), adminSistemaController.registrarAdminSistema);

// Logs del sistema
router.get('/logs', adminSistemaController.getLogs);

// Circuit breakers
router.get('/circuit-breakers', adminSistemaController.getCircuitBreakers);
router.post('/circuit-breakers/:nombre/reset', adminSistemaController.resetCircuitBreaker);

// Caché
router.get('/cache', adminSistemaController.getEstadoCache);
router.post('/cache/limpiar', adminSistemaController.limpiarCache);

module.exports = router;
