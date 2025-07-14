/**
 * Rutas de propietarios
 * Maneja endpoints para consulta de inmuebles y generación de paz y salvos
 */

const express = require('express');
const router = express.Router();
const propietarioController = require('../controllers/propietarioController');
// const propietarioController = require('../controllers/propietarioController.minimal');
// const { validate, schemas } = require('../middlewares/validationMiddleware');
const emptyMiddleware = require('../middlewares/validationMiddleware.empty');

// Solo ruta de prueba
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

router.get('/copropiedad/:nit', propietarioController.buscarCopropiedad);

router.post('/solicitar-codigo', propietarioController.solicitarCodigoVerificacion);

router.post('/consultar', propietarioController.consultarInmuebles);

// router.post('/verificar-estado', propietarioController.verificarEstadoCuenta); // TODO: Implementar

router.post('/generar-paz-y-salvo', propietarioController.generarPazYSalvo);

// Nueva ruta para descargar PDFs generados
router.get('/descargar-paz-y-salvo/:filename', propietarioController.descargarPazYSalvo);

module.exports = router;
