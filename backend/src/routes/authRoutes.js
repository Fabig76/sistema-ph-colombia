/**
 * Rutas de autenticación
 * Maneja endpoints para registro, login, verificación y recuperación de contraseña
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate, schemas } = require('../middlewares/validationMiddleware');
const { verifyToken } = require('../middlewares/authMiddleware');

// Registro y verificación de administradores
router.post('/registro', validate(schemas.registroAdministrador), authController.registrarAdministrador);
router.post('/verificar', validate(schemas.verificacionSms), authController.verificarAdministrador);
router.post('/reenviar-codigo', validate(schemas.solicitudSms), authController.reenviarCodigo);

// Login y verificación de dos factores
router.post('/login', validate(schemas.loginAdministrador), authController.loginAdministrador);
router.post('/verificar-login', validate(schemas.verificacionSms), authController.verificarLoginAdministrador);

// Recuperación de contraseña
router.post('/recuperar', validate(schemas.solicitudSms), authController.solicitarRecuperacionPassword);
router.post('/verificar-recuperacion', validate(schemas.verificacionSms), authController.verificarCodigoRecuperacion);
router.post('/cambiar-password', authController.cambiarPassword);

// Refresh token y logout
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', verifyToken, authController.logout);

// Solicitud de código SMS (para cualquier propósito)
router.post('/solicitar-codigo', validate(schemas.solicitudSms), async (req, res) => {
  try {
    const { telefono, tipo } = req.body;
    
    // Normalizar teléfono
    const telefonoNormalizado = require('../services/smsService').normalizarTelefono(telefono);
    
    // Enviar código SMS
    const resultado = await require('../services/smsService').enviarCodigoVerificacion(
      telefonoNormalizado,
      tipo
    );
    
    if (!resultado.success) {
      return res.status(400).json({
        status: 'error',
        message: resultado.message
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Código enviado correctamente'
    });
  } catch (error) {
    require('../utils/logger').error(`Error al solicitar código SMS: ${error.message}`, 'auth', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error al enviar código SMS'
    });
  }
});

module.exports = router;
