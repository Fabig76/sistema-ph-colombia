const express = require('express');
const { 
  crearCopropiedad, 
  obtenerCopropiedades, 
  obtenerEstadisticas,
  eliminarCopropiedad 
} = require('../controllers/copropiedadController');
const { isAdministrador } = require('../middlewares/authMiddleware');

const router = express.Router();

// Endpoint de prueba SIN autenticación
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Rutas de copropiedades funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Todas las demás rutas requieren autenticación de administrador
router.use(isAdministrador);

// POST /api/v1/copropiedades - Crear nueva copropiedad
router.post('/', crearCopropiedad);

// GET /api/v1/copropiedades - Obtener copropiedades del administrador
router.get('/', obtenerCopropiedades);

// GET /api/v1/copropiedades/estadisticas - Obtener estadísticas
router.get('/estadisticas', obtenerEstadisticas);

// DELETE /api/v1/copropiedades/:id - Eliminar (desactivar) copropiedad
router.delete('/:id', eliminarCopropiedad);

module.exports = router;
