/**
 * Servicio de caché intensivo con Redis
 * Implementa funciones para almacenar y recuperar datos en caché
 * con TTL configurable y manejo de reconexiones
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');
require('dotenv').config();

// Configuración de Redis
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || '',
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
};

// Crear cliente Redis
const redisClient = new Redis(process.env.REDIS_URL || redisConfig);

// Tiempo de vida por defecto para las claves (5 minutos)
const DEFAULT_TTL = parseInt(process.env.CACHE_TTL) || 300;

// Manejar eventos de conexión
redisClient.on('connect', () => {
  logger.info('Conectado a Redis', 'cache');
});

redisClient.on('error', (err) => {
  logger.error(`Error de conexión a Redis: ${err.message}`, 'cache', { error: err });
});

redisClient.on('reconnecting', () => {
  logger.warn('Intentando reconectar a Redis', 'cache');
});

/**
 * Obtener un valor de la caché
 * @param {string} key - Clave para buscar en caché
 * @returns {Promise<any>} - Valor almacenado o null si no existe
 */
const get = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    
    logger.debug(`Cache HIT: ${key}`, 'cache');
    return JSON.parse(value);
  } catch (error) {
    logger.error(`Error al obtener de caché: ${error.message}`, 'cache', { key, error });
    return null;
  }
};

/**
 * Almacenar un valor en la caché
 * @param {string} key - Clave para almacenar
 * @param {any} value - Valor a almacenar (se convertirá a JSON)
 * @param {number} ttl - Tiempo de vida en segundos (opcional)
 * @returns {Promise<boolean>} - true si se almacenó correctamente
 */
const set = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    await redisClient.set(
      key,
      JSON.stringify(value),
      'EX',
      ttl
    );
    logger.debug(`Cache SET: ${key} (TTL: ${ttl}s)`, 'cache');
    return true;
  } catch (error) {
    logger.error(`Error al almacenar en caché: ${error.message}`, 'cache', { key, error });
    return false;
  }
};

/**
 * Eliminar una clave de la caché
 * @param {string} key - Clave a eliminar
 * @returns {Promise<boolean>} - true si se eliminó correctamente
 */
const del = async (key) => {
  try {
    await redisClient.del(key);
    logger.debug(`Cache DEL: ${key}`, 'cache');
    return true;
  } catch (error) {
    logger.error(`Error al eliminar de caché: ${error.message}`, 'cache', { key, error });
    return false;
  }
};

/**
 * Obtener un valor de la caché o ejecutar una función para obtenerlo y almacenarlo
 * @param {string} key - Clave para buscar/almacenar
 * @param {Function} fetchFn - Función asíncrona que devuelve el valor si no está en caché
 * @param {number} ttl - Tiempo de vida en segundos (opcional)
 * @returns {Promise<any>} - Valor de la caché o resultado de la función
 */
const getOrSet = async (key, fetchFn, ttl = DEFAULT_TTL) => {
  try {
    // Intentar obtener de la caché
    const cachedValue = await get(key);
    if (cachedValue !== null) {
      return cachedValue;
    }
    
    // Si no está en caché, ejecutar la función
    logger.debug(`Cache MISS: ${key}, ejecutando función de obtención`, 'cache');
    const fetchedValue = await fetchFn();
    
    // Almacenar el resultado en caché si no es null o undefined
    if (fetchedValue !== null && fetchedValue !== undefined) {
      await set(key, fetchedValue, ttl);
    }
    
    return fetchedValue;
  } catch (error) {
    logger.error(`Error en getOrSet: ${error.message}`, 'cache', { key, error });
    // Si falla la caché, ejecutamos la función directamente
    return await fetchFn();
  }
};

/**
 * Eliminar todas las claves que coincidan con un patrón
 * @param {string} pattern - Patrón para buscar claves (ej: "user:*")
 * @returns {Promise<number>} - Número de claves eliminadas
 */
const delByPattern = async (pattern) => {
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length === 0) return 0;
    
    const pipeline = redisClient.pipeline();
    keys.forEach(key => pipeline.del(key));
    
    const results = await pipeline.exec();
    logger.debug(`Cache DEL_PATTERN: ${pattern} (${keys.length} claves)`, 'cache');
    
    return keys.length;
  } catch (error) {
    logger.error(`Error al eliminar claves por patrón: ${error.message}`, 'cache', { pattern, error });
    return 0;
  }
};

/**
 * Obtener el cliente Redis directamente para operaciones avanzadas
 * @returns {Redis} - Cliente Redis
 */
const getClient = () => redisClient;

module.exports = {
  get,
  set,
  del,
  getOrSet,
  delByPattern,
  getClient,
  DEFAULT_TTL
};
