/**
 * Rutas de administradores
 * Maneja endpoints para gestión de copropiedades y perfil de administrador
 */

const express = require('express');
const router = express.Router();
const administradorController = require('../controllers/administradorController');
const { validate, schemas } = require('../middlewares/validationMiddleware');
const { verifyToken, isAdministrador, verificarPropiedadCopropiedad } = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);
router.use(isAdministrador);

// Rutas de perfil
router.get('/perfil', administradorController.getPerfil);
router.put('/perfil', administradorController.actualizarPerfil);

// Rutas de copropiedades
router.post('/copropiedades', validate(schemas.registroCopropiedad), administradorController.registrarCopropiedad);
router.get('/copropiedades', administradorController.getCopropiedades);

// Rutas para una copropiedad específica
router.get('/copropiedades/:copropiedadId', verificarPropiedadCopropiedad, administradorController.getCopropiedad);
router.put('/copropiedades/:copropiedadId', verificarPropiedadCopropiedad, validate(schemas.actualizacionCopropiedad), administradorController.actualizarCopropiedad);
router.delete('/copropiedades/:copropiedadId', verificarPropiedadCopropiedad, administradorController.eliminarCopropiedad);

// Eventos de una copropiedad
router.get('/copropiedades/:copropiedadId/eventos', verificarPropiedadCopropiedad, administradorController.getEventosCopropiedad);

// Estadísticas
router.get('/estadisticas', administradorController.getEstadisticas);

module.exports = router;
