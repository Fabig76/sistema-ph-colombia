/**
 * Middleware de validación simplificado - VERSIÓN DE PRUEBA
 */

const Joi = require('joi');
const logger = require('../utils/logger');

// Configuración básica de mensajes de error
const mensajesError = {
  'string.base': 'El campo debe ser de tipo texto',
  'string.empty': 'El campo no puede estar vacío',
  'any.required': 'El campo es obligatorio'
};

/**
 * Middleware genérico para validación de datos
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      messages: mensajesError
    });
    
    if (!error) {
      req[property] = value;
      return next();
    }
    
    return res.status(400).json({
      status: 'error',
      message: 'Datos de entrada inválidos'
    });
  };
};

// Esquemas básicos simplificados
const registroAdministradorSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  telefono: Joi.string().required(),
  password: Joi.string().min(8).max(30).required()
});

const loginAdministradorSchema = Joi.object({
  telefono: Joi.string().required(),
  password: Joi.string().required()
});

// Exportar solo lo esencial
const schemas = {
  registroAdministrador: registroAdministradorSchema,
  loginAdministrador: loginAdministradorSchema
};

module.exports = {
  validate,
  schemas
};
