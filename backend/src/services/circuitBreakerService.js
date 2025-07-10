/**
 * Servicio de Circuit Breaker
 * Implementa el patrón Circuit Breaker para proteger llamadas a APIs externas
 * y evitar fallos en cascada cuando un servicio externo está fallando
 */

const CircuitBreaker = require('opossum');
const logger = require('../utils/logger');
require('dotenv').config();

// Configuración por defecto para los circuit breakers
const DEFAULT_OPTIONS = {
  timeout: parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 10000, // 10 segundos
  errorThresholdPercentage: parseInt(process.env.CIRCUIT_BREAKER_ERROR_THRESHOLD) || 50, // 50% de errores
  resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 30000, // 30 segundos
  rollingCountTimeout: 60000, // Ventana de 60 segundos para estadísticas
  rollingCountBuckets: 10, // 10 buckets de 6 segundos cada uno
  name: 'default-circuit' // Nombre por defecto
};

// Almacén de circuit breakers creados
const breakers = new Map();

/**
 * Crea un nuevo circuit breaker para una función asíncrona
 * @param {Function} asyncFunction - Función asíncrona a proteger
 * @param {string} name - Nombre único para identificar este circuit breaker
 * @param {Object} options - Opciones personalizadas para este circuit breaker
 * @returns {CircuitBreaker} - Instancia del circuit breaker
 */
const createBreaker = (asyncFunction, name, options = {}) => {
  // Combinar opciones por defecto con las personalizadas
  const breakerOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    name: name || DEFAULT_OPTIONS.name
  };
  
  // Crear el circuit breaker
  const breaker = new CircuitBreaker(asyncFunction, breakerOptions);
  
  // Registrar eventos
  breaker.on('open', () => {
    logger.warn(`Circuit Breaker '${breaker.name}' ABIERTO - El servicio está fallando`, 'circuit', {
      name: breaker.name,
      state: 'open',
      stats: {
        failures: breaker.stats.failures,
        fallbacks: breaker.stats.fallbacks,
        successes: breaker.stats.successes,
        rejects: breaker.stats.rejects
      }
    });
  });
  
  breaker.on('close', () => {
    logger.info(`Circuit Breaker '${breaker.name}' CERRADO - El servicio se ha recuperado`, 'circuit', {
      name: breaker.name,
      state: 'closed'
    });
  });
  
  breaker.on('halfOpen', () => {
    logger.info(`Circuit Breaker '${breaker.name}' SEMI-ABIERTO - Probando si el servicio se ha recuperado`, 'circuit', {
      name: breaker.name,
      state: 'halfOpen'
    });
  });
  
  breaker.on('fallback', (result) => {
    logger.debug(`Circuit Breaker '${breaker.name}' ejecutando fallback`, 'circuit', {
      name: breaker.name,
      result
    });
  });
  
  // Guardar el breaker en el mapa
  breakers.set(name, breaker);
  
  return breaker;
};

/**
 * Obtiene un circuit breaker existente por su nombre
 * @param {string} name - Nombre del circuit breaker
 * @returns {CircuitBreaker|null} - Circuit breaker o null si no existe
 */
const getBreaker = (name) => {
  return breakers.get(name) || null;
};

/**
 * Obtiene o crea un circuit breaker
 * @param {string} name - Nombre del circuit breaker
 * @param {Function} asyncFunction - Función asíncrona a proteger (solo necesaria si se crea nuevo)
 * @param {Object} options - Opciones personalizadas (solo necesarias si se crea nuevo)
 * @returns {CircuitBreaker} - Circuit breaker existente o nuevo
 */
const getOrCreateBreaker = (name, asyncFunction, options = {}) => {
  const existingBreaker = getBreaker(name);
  if (existingBreaker) {
    return existingBreaker;
  }
  
  if (!asyncFunction) {
    throw new Error(`No existe un circuit breaker con nombre '${name}' y no se proporcionó una función para crearlo`);
  }
  
  return createBreaker(asyncFunction, name, options);
};

/**
 * Ejecuta una función a través de un circuit breaker
 * @param {string} name - Nombre del circuit breaker
 * @param {Function} asyncFunction - Función asíncrona a proteger
 * @param {Array} args - Argumentos para la función
 * @param {Function} fallbackFn - Función de fallback opcional
 * @param {Object} options - Opciones personalizadas para el circuit breaker
 * @returns {Promise<any>} - Resultado de la función o del fallback
 */
const execute = async (name, asyncFunction, args = [], fallbackFn = null, options = {}) => {
  // Obtener o crear el circuit breaker
  const breaker = getOrCreateBreaker(name, asyncFunction, options);
  
  // Configurar fallback si se proporcionó
  if (fallbackFn) {
    breaker.fallback(fallbackFn);
  }
  
  try {
    // Ejecutar la función a través del circuit breaker
    return await breaker.fire(...args);
  } catch (error) {
    logger.error(`Error en circuit breaker '${name}': ${error.message}`, 'circuit', {
      name,
      error,
      state: breaker.status.state
    });
    throw error;
  }
};

/**
 * Obtiene estadísticas de todos los circuit breakers
 * @returns {Array<Object>} - Estadísticas de todos los circuit breakers
 */
const getStats = () => {
  const stats = [];
  
  breakers.forEach((breaker, name) => {
    stats.push({
      name,
      state: breaker.status.state,
      stats: {
        failures: breaker.stats.failures,
        fallbacks: breaker.stats.fallbacks,
        successes: breaker.stats.successes,
        rejects: breaker.stats.rejects,
        fires: breaker.stats.fires
      },
      options: {
        timeout: breaker.options.timeout,
        errorThresholdPercentage: breaker.options.errorThresholdPercentage,
        resetTimeout: breaker.options.resetTimeout
      }
    });
  });
  
  return stats;
};

module.exports = {
  createBreaker,
  getBreaker,
  getOrCreateBreaker,
  execute,
  getStats
};
