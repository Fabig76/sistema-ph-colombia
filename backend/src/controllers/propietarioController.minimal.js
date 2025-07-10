/**
 * Controlador minimal sin dependencias externas para diagnosticar error path-to-regexp
 */

// Funciones básicas de test
const buscarCopropiedad = async (req, res) => {
  res.json({ message: 'Búsqueda de copropiedad - TEST' });
};

const buscarPropietario = async (req, res) => {
  res.json({ message: 'Búsqueda de propietario - TEST' });
};

const generarPazYSalvo = async (req, res) => {
  res.json({ message: 'Generación de paz y salvo - TEST' });
};

module.exports = {
  buscarCopropiedad,
  buscarPropietario,
  generarPazYSalvo
};
