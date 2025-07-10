/**
 * Servicio de validación SMS
 * Implementa funciones para enviar y verificar códigos SMS
 * con protección contra abusos y validación de números colombianos
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('../utils/logger');
const circuitBreaker = require('./circuitBreakerService');
const { RateLimiterRedis } = require('rate-limiter-flexible');
const Redis = require('ioredis');
require('dotenv').config();

// Cliente Redis para rate limiting
const redisClient = new Redis(process.env.REDIS_URL || {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || ''
});

// Configuración del rate limiter para SMS
const smsRateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit:sms:',
  points: parseInt(process.env.SMS_RATE_LIMIT_MAX) || 5, // 5 SMS por ventana por defecto
  duration: parseInt(process.env.SMS_RATE_LIMIT_WINDOW_MS) / 1000 || 3600, // 1 hora por defecto
});

// Configuración para el servicio de SMS
const SMS_CONFIG = {
  apiKey: process.env.SMS_API_KEY,
  apiUrl: process.env.SMS_API_URL,
  sender: process.env.SMS_SENDER || 'PazySalvos',
  expirySeconds: parseInt(process.env.SMS_EXPIRY_SECONDS) || 300, // 5 minutos por defecto
  maxAttempts: parseInt(process.env.SMS_MAX_ATTEMPTS) || 3 // 3 intentos por defecto
};

/**
 * Valida si un número de teléfono tiene formato colombiano válido
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} - true si es válido
 */
const isValidColombianPhone = (phone) => {
  // Eliminar espacios y caracteres especiales
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  // Validar formato colombiano: +57 seguido de 10 dígitos o 10 dígitos directamente
  // También acepta formato con 57 al inicio sin el +
  const colombianRegex = /^(\+?57)?3\d{9}$/;
  
  return colombianRegex.test(cleanPhone);
};

/**
 * Normaliza un número de teléfono al formato estándar +573XXXXXXXXX
 * @param {string} phone - Número de teléfono a normalizar
 * @returns {string} - Número normalizado
 */
const normalizePhone = (phone) => {
  // Eliminar espacios y caracteres especiales
  let cleanPhone = phone.replace(/\s+/g, '').replace(/[()-]/g, '');
  
  // Si no empieza con +57, agregarlo
  if (!cleanPhone.startsWith('+57') && !cleanPhone.startsWith('57')) {
    cleanPhone = '+57' + cleanPhone;
  } else if (cleanPhone.startsWith('57') && !cleanPhone.startsWith('+57')) {
    cleanPhone = '+' + cleanPhone;
  }
  
  return cleanPhone;
};

/**
 * Genera un código aleatorio de 6 dígitos
 * @returns {string} - Código generado
 */
const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Envía un código SMS a un número de teléfono
 * @param {string} phone - Número de teléfono
 * @param {string} tipo - Tipo de código (REGISTRO, LOGIN, RECUPERACION, VERIFICACION)
 * @param {string} adminId - ID del administrador (opcional)
 * @returns {Promise<{success: boolean, message: string, code?: string}>} - Resultado del envío
 */
const sendVerificationCode = async (phone, tipo, adminId = null) => {
  try {
    // Validar formato de teléfono colombiano
    if (!isValidColombianPhone(phone)) {
      return {
        success: false,
        message: 'El número de teléfono no tiene un formato colombiano válido'
      };
    }
    
    // Normalizar teléfono
    const normalizedPhone = normalizePhone(phone);
    
    // Verificar rate limit
    try {
      await smsRateLimiter.consume(normalizedPhone);
    } catch (error) {
      logger.warn(`Rate limit excedido para SMS: ${normalizedPhone}`, 'sms', { phone: normalizedPhone });
      return {
        success: false,
        message: 'Has excedido el límite de códigos SMS. Por favor, intenta más tarde.'
      };
    }
    
    // Generar código
    const code = generateCode();
    
    // Calcular expiración
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + SMS_CONFIG.expirySeconds);
    
    // Guardar código en la base de datos
    await prisma.codigoSMS.create({
      data: {
        telefono: normalizedPhone,
        codigo: code,
        tipo,
        administradorId: adminId,
        expiradoEn: expiresAt,
        usado: false,
        intentos: 0
      }
    });
    
    // Mensaje a enviar
    const message = `Tu código de verificación para Paz y Salvos PH es: ${code}. Válido por ${SMS_CONFIG.expirySeconds / 60} minutos.`;
    
    // Configuración para llamada a la API de SMS
    const smsApiCall = async () => {
      // Aquí iría la implementación real con el proveedor de SMS
      // Por ejemplo, para Hablame.co:
      /*
      const response = await axios.post(SMS_CONFIG.apiUrl, {
        apiKey: SMS_CONFIG.apiKey,
        toNumber: normalizedPhone,
        sms: message,
        flash: 0,
        senderId: SMS_CONFIG.sender
      });
      
      return response.data;
      */
      
      // Por ahora, simulamos una respuesta exitosa
      logger.info(`[SIMULACIÓN] SMS enviado a ${normalizedPhone}: ${message}`, 'sms');
      return { success: true };
    };
    
    // Ejecutar llamada a través del circuit breaker
    const result = await circuitBreaker.execute(
      'sms-api',
      smsApiCall,
      [],
      () => ({ success: false, message: 'Servicio SMS temporalmente no disponible' })
    );
    
    if (!result.success) {
      logger.error('Error al enviar SMS', 'sms', { phone: normalizedPhone, error: result.message });
      return {
        success: false,
        message: 'No se pudo enviar el código SMS. Por favor, intenta más tarde.'
      };
    }
    
    // En desarrollo, devolvemos el código para facilitar pruebas
    const isDev = process.env.NODE_ENV === 'development';
    
    return {
      success: true,
      message: 'Código SMS enviado correctamente',
      ...(isDev && { code }) // Solo incluir el código en desarrollo
    };
  } catch (error) {
    logger.error(`Error en servicio SMS: ${error.message}`, 'sms', { phone, error });
    return {
      success: false,
      message: 'Error interno al procesar la solicitud SMS'
    };
  }
};

/**
 * Verifica un código SMS
 * @param {string} phone - Número de teléfono
 * @param {string} code - Código a verificar
 * @returns {Promise<{success: boolean, message: string}>} - Resultado de la verificación
 */
const verifyCode = async (phone, code) => {
  try {
    // Normalizar teléfono
    const normalizedPhone = normalizePhone(phone);
    
    // Buscar el código más reciente no usado para este teléfono
    const smsCode = await prisma.codigoSMS.findFirst({
      where: {
        telefono: normalizedPhone,
        usado: false,
        expiradoEn: {
          gt: new Date() // No expirado
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Si no hay código válido
    if (!smsCode) {
      return {
        success: false,
        message: 'No hay un código válido para este número o ha expirado'
      };
    }
    
    // Verificar si se excedió el número de intentos
    if (smsCode.intentos >= SMS_CONFIG.maxAttempts) {
      // Marcar como usado para invalidarlo
      await prisma.codigoSMS.update({
        where: { id: smsCode.id },
        data: { usado: true }
      });
      
      return {
        success: false,
        message: 'Has excedido el número máximo de intentos. Solicita un nuevo código.'
      };
    }
    
    // Incrementar contador de intentos
    await prisma.codigoSMS.update({
      where: { id: smsCode.id },
      data: { intentos: { increment: 1 } }
    });
    
    // Verificar si el código coincide
    if (smsCode.codigo !== code) {
      return {
        success: false,
        message: 'Código incorrecto'
      };
    }
    
    // Marcar código como usado
    await prisma.codigoSMS.update({
      where: { id: smsCode.id },
      data: { usado: true }
    });
    
    return {
      success: true,
      message: 'Código verificado correctamente'
    };
  } catch (error) {
    logger.error(`Error al verificar código SMS: ${error.message}`, 'sms', { phone, error });
    return {
      success: false,
      message: 'Error interno al verificar el código'
    };
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode,
  isValidColombianPhone,
  normalizePhone
};
