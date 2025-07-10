/**
 * Middleware de validación con Joi
 * Implementa validaciones para los diferentes endpoints de la API
 * con mensajes de error personalizados en español
 */

const Joi = require('joi');
const logger = require('../utils/logger');
const { isValidColombianPhone } = require('../services/smsService');

// Configuración de mensajes de error en español
const mensajesError = {
  'string.base': 'El campo {{#label}} debe ser de tipo texto',
  'string.empty': 'El campo {{#label}} no puede estar vacío',
  'string.min': 'El campo {{#label}} debe tener al menos {{#limit}} caracteres',
  'string.max': 'El campo {{#label}} debe tener como máximo {{#limit}} caracteres',
  'string.email': 'El campo {{#label}} debe ser un correo electrónico válido',
  'string.pattern.base': 'El campo {{#label}} tiene un formato inválido',
  'number.base': 'El campo {{#label}} debe ser un número',
  'number.min': 'El campo {{#label}} debe ser mayor o igual a {{#limit}}',
  'number.max': 'El campo {{#label}} debe ser menor o igual a {{#limit}}',
  'number.integer': 'El campo {{#label}} debe ser un número entero',
  'boolean.base': 'El campo {{#label}} debe ser un valor booleano',
  'date.base': 'El campo {{#label}} debe ser una fecha válida',
  'object.base': 'El campo {{#label}} debe ser un objeto',
  'object.unknown': 'El campo {{#label}} no está permitido',
  'array.base': 'El campo {{#label}} debe ser un array',
  'array.min': 'El campo {{#label}} debe tener al menos {{#limit}} elementos',
  'array.max': 'El campo {{#label}} debe tener como máximo {{#limit}} elementos',
  'any.required': 'El campo {{#label}} es obligatorio',
  'any.only': 'El campo {{#label}} debe ser uno de los valores permitidos',
  'any.invalid': 'El campo {{#label}} contiene un valor no permitido'
};

// Extensión personalizada para validar teléfonos colombianos
const joiTelefonoColombia = Joi.extend((joi) => {
  return {
    type: 'telefonoColombia',
    base: joi.string(),
    messages: {
      'telefonoColombia.invalid': 'El número de teléfono debe tener formato colombiano válido'
    },
    validate(value, helpers) {
      if (!isValidColombianPhone(value)) {
        return { value, errors: helpers.error('telefonoColombia.invalid') };
      }
    }
  };
});

/**
 * Middleware genérico para validación de datos
 * @param {Object} schema - Esquema Joi para validar
 * @param {string} property - Propiedad de la solicitud a validar (body, query, params)
 * @returns {Function} - Middleware de Express
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
    
    // Formatear errores
    const errores = error.details.map(detail => ({
      campo: detail.context.key,
      mensaje: detail.message
    }));
    
    logger.warn('Validación fallida en solicitud', 'validacion', {
      path: req.path,
      method: req.method,
      errores
    });
    
    return res.status(400).json({
      status: 'error',
      message: 'Datos de entrada inválidos',
      errores
    });
  };
};

// Esquemas de validación para diferentes endpoints

// Validación para registro de administrador
const registroAdministradorSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  telefono: joiTelefonoColombia.telefonoColombia().required(),
  password: Joi.string().min(8).max(30).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.max': 'La contraseña debe tener como máximo 30 caracteres'
  })
});

// Validación para login de administrador
const loginAdministradorSchema = Joi.object({
  telefono: joiTelefonoColombia.telefonoColombia().required(),
  password: Joi.string().required()
});

// Validación para verificación de código SMS
const verificacionSmsSchema = Joi.object({
  telefono: joiTelefonoColombia.telefonoColombia().required(),
  codigo: Joi.string().length(6).pattern(/^\d+$/).required()
});

// Validación para solicitud de código SMS
const solicitudSmsSchema = Joi.object({
  telefono: joiTelefonoColombia.telefonoColombia().required(),
  tipo: Joi.string().valid('REGISTRO', 'LOGIN', 'RECUPERACION', 'VERIFICACION').required()
});

// Validación para registro de copropiedad
const registroCopropiedadSchema = Joi.object({
  nit: Joi.string().min(9).max(20).required(),
  nombre: Joi.string().min(3).max(100).required(),
  hojaGoogleSheetsId: Joi.string().required(),
  plantillaGoogleDocsId: Joi.string().required(),
  resolucionNumero: Joi.string().allow('', null),
  resolucionFecha: Joi.date().iso().allow('', null)
});

// Validación para consulta de propietario
const consultaPropietarioSchema = Joi.object({
  nit: Joi.string().min(9).max(20).required(),
  identificacion: Joi.string().min(5).max(20).required()
});

// Validación para generación de paz y salvo
const generacionPazYSalvoSchema = Joi.object({
  nit: Joi.string().min(9).max(20).required(),
  torre: Joi.string().required(),
  apto: Joi.string().required()
});

// Validación para actualización de copropiedad
const actualizacionCopropiedadSchema = Joi.object({
  nombre: Joi.string().min(3).max(100),
  hojaGoogleSheetsId: Joi.string(),
  plantillaGoogleDocsId: Joi.string(),
  resolucionNumero: Joi.string().allow('', null),
  resolucionFecha: Joi.date().iso().allow('', null),
  activo: Joi.boolean()
}).min(1);

// Exportar middleware y esquemas
module.exports = {
  validate,
  schemas: {
    registroAdministrador: registroAdministradorSchema,
    loginAdministrador: loginAdministradorSchema,
    verificacionSms: verificacionSmsSchema,
    solicitudSms: solicitudSmsSchema,
    registroCopropiedad: registroCopropiedadSchema,
    consultaPropietario: consultaPropietarioSchema,
    generacionPazYSalvo: generacionPazYSalvoSchema,
    actualizacionCopropiedad: actualizacionCopropiedadSchema
  }
};
