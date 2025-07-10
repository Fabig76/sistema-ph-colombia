/**
 * Rutas de propietarios
 * Maneja endpoints para consulta de inmuebles y generación de paz y salvos
 */

const express = require('express');
const router = express.Router();
const propietarioController = require('../controllers/propietarioController');
const { validate, schemas } = require('../middlewares/validationMiddleware');

// Búsqueda de copropiedad por NIT
router.get('/copropiedades/:nit', propietarioController.buscarCopropiedad);

// Solicitud de código de verificación
router.post('/solicitar-codigo', propietarioController.solicitarCodigoVerificacion);

// Consulta de inmuebles
router.post('/consultar-inmuebles', propietarioController.consultarInmuebles);

// Verificación de estado de cuenta
router.post('/verificar-estado', propietarioController.verificarEstadoCuenta);

// Generación de paz y salvo
router.post('/generar-paz-y-salvo', propietarioController.generarPazYSalvo);

module.exports = router;
