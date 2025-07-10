/**
 * Controlador de Propietarios - Versión de Prueba Minimalista
 */

const logger = require('../utils/logger');

/**
 * Función de prueba básica
 */
const testBasico = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'success',
      message: 'Test básico funcionando'
    });
  } catch (error) {
    logger.error(`Error en test básico: ${error.message}`, 'propietario', { error });
    return res.status(500).json({
      status: 'error',
      message: 'Error en test básico'
    });
  }
};

module.exports = {
  testBasico
};
