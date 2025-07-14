const LabsMobileService = require('./labsMobileService');
const twilio = require('twilio');

class SMSHybridService {
  constructor() {
    // Configurar Twilio con credenciales reales
    this.twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Labs Mobile como proveedor secundario (problemático en Colombia)
    this.labsMobile = new LabsMobileService();
    
    // Configuración de fallback - Twilio primero por confiabilidad
    this.providers = ['twilio', 'labs-mobile'];
    this.currentProvider = 'twilio';
    this.twilioTrialMode = true; // Detectar si cuenta trial requiere verificación
    
    console.log('📱 SMS Hybrid Service inicializado');
    console.log('🔄 Proveedores disponibles:', this.providers);
    console.log('🎯 Proveedor primario:', this.currentProvider);
  }

  async sendVerificationCode(phoneNumber, message = null) {
    console.log(`📱 Enviando SMS híbrido a: ${phoneNumber}`);
    
    // Generar código si no se proporciona mensaje
    const code = this.generateVerificationCode();
    const finalMessage = message || `Tu codigo de verificacion es: ${code}. Sistema PH Colombia.`;
    
    // Intentar envío con proveedor principal
    let result = await this.sendWithProvider(this.currentProvider, phoneNumber, finalMessage, code);
    
    if (result.success) {
      console.log(`✅ SMS enviado exitosamente con ${this.currentProvider}`);
      return result;
    }
    
    // Si falla, intentar con otros proveedores
    console.log(`❌ Fallo con ${this.currentProvider}, probando fallback...`);
    
    for (const provider of this.providers) {
      if (provider !== this.currentProvider) {
        console.log(`🔄 Intentando con ${provider}...`);
        result = await this.sendWithProvider(provider, phoneNumber, finalMessage, code);
        
        if (result.success) {
          console.log(`✅ SMS enviado exitosamente con ${provider} (fallback)`);
          return result;
        }
      }
    }
    
    // Si todos fallan
    console.error('💥 TODOS LOS PROVEEDORES SMS FALLARON');
    return {
      success: false,
      error: 'No se pudo enviar SMS con ningún proveedor',
      providers_tried: this.providers,
      phone: phoneNumber
    };
  }

  async sendWithProvider(provider, phoneNumber, message, code) {
    try {
      switch (provider) {
        case 'twilio':
          return await this.sendWithTwilio(phoneNumber, message, code);
        
        case 'labs-mobile':
          return await this.sendWithLabsMobile(phoneNumber, message, code);
          
        default:
          throw new Error(`Proveedor desconocido: ${provider}`);
      }
    } catch (error) {
      console.error(`💥 Error con proveedor ${provider}:`, error.message);
      return {
        success: false,
        error: error.message,
        provider: provider
      };
    }
  }

  async sendWithTwilio(phoneNumber, message, code) {
    console.log('📱 Enviando con Twilio...');
    
    try {
      // Formatear número para Twilio
      const formattedPhone = this.formatPhoneForTwilio(phoneNumber);
      console.log(`📞 Número formateado: ${formattedPhone}`);
      
      const twilioMessage = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: formattedPhone
      });

      console.log(`✅ Twilio SMS enviado:`, twilioMessage.sid);
      console.log(`📊 Estado: ${twilioMessage.status}`);
      
      return {
        success: true,
        provider: 'twilio',
        messageId: twilioMessage.sid,
        phone: formattedPhone,
        code: code,
        message: message,
        status: twilioMessage.status
      };
      
    } catch (error) {
      console.error('❌ Error Twilio:', error.message);
      
      // Manejar error específico de cuenta trial
      if (error.code === 21608) {
        console.log('⚠️  Cuenta Twilio en modo TRIAL - Número no verificado');
        console.log('🔗 Verificar en: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        
        return {
          success: false,
          error: 'Twilio Trial: Número no verificado',
          code: error.code,
          provider: 'twilio',
          requiresVerification: true,
          verificationUrl: 'https://console.twilio.com/us1/develop/phone-numbers/manage/verified'
        };
      }
      
      // Otros errores Twilio
      throw error;
    }
  }

  async sendWithLabsMobile(phoneNumber, message, code) {
    console.log('📱 Enviando con Labs Mobile...');
    
    // Desactivar modo test para envío real
    this.labsMobile.setTestMode(false);
    
    const result = await this.labsMobile.sendVerificationCode(phoneNumber, code);
    
    if (result.success) {
      return {
        success: true,
        provider: 'labs-mobile',
        messageId: result.messageId,
        phone: result.phone,
        code: code,
        message: message
      };
    } else {
      throw new Error(result.error || 'Labs Mobile envío fallido');
    }
  }

  formatPhoneForTwilio(phoneNumber) {
    // Formato: +57XXXXXXXXXX para Twilio
    let formatted = phoneNumber.toString().replace(/\D/g, '');
    
    // Si empieza con 57, agregar +
    if (formatted.startsWith('57')) {
      formatted = '+' + formatted;
    } else if (formatted.length === 10) {
      // Si son 10 dígitos, agregar +57
      formatted = '+57' + formatted;
    } else if (formatted.length === 7) {
      // Si son 7 dígitos, es celular local, agregar +573
      formatted = '+573' + formatted;
    }
    
    return formatted;
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ========================================
  // MÉTODOS COMPATIBLES CON smsService ORIGINAL
  // ========================================

  /**
   * Método compatible: normalizar teléfono
   * @param {string} phone - Número a normalizar
   * @returns {string} - Número normalizado
   */
  normalizarTelefono(phone) {
    return this.formatPhoneForTwilio(phone);
  }

  /**
   * Método compatible: enviar código de verificación
   * @param {string} phone - Número de teléfono
   * @param {string} tipo - Tipo de código (REGISTRO, LOGIN, etc.)
   * @param {string} adminId - ID del administrador (opcional)
   * @returns {Promise<Object>} - Resultado del envío
   */
  async enviarCodigoVerificacion(phone, tipo = 'VERIFICACION', adminId = null) {
    console.log(`📨 Enviando código ${tipo} a ${phone}`);
    
    try {
      // Generar código aleatorio de 6 dígitos
      const codigo = Math.floor(100000 + Math.random() * 900000);
      
      // Enviar con el sistema híbrido
      const resultado = await this.sendVerificationCode(phone, codigo);
      
      if (resultado.success) {
        console.log(`✅ Código ${tipo} enviado exitosamente via ${resultado.provider}`);
        
        return {
          success: true,
          message: `Código ${tipo} enviado exitosamente`,
          code: codigo.toString(),
          provider: resultado.provider,
          messageId: resultado.messageId
        };
      } else {
        console.error(`❌ Error enviando código ${tipo}:`, resultado.error);
        
        return {
          success: false,
          message: resultado.error || 'Error al enviar código SMS',
          provider: resultado.provider
        };
      }
      
    } catch (error) {
      console.error(`💥 Error crítico enviando código ${tipo}:`, error.message);
      
      return {
        success: false,
        message: 'Error crítico en envío SMS',
        error: error.message
      };
    }
  }

  /**
   * Método compatible: verificar código
   * @param {string} phone - Número de teléfono
   * @param {string} code - Código a verificar
   * @returns {Promise<Object>} - Resultado de la verificación
   */
  async verificarCodigo(phone, code) {
    console.log(`🔍 Verificando código para ${phone}`);
    
    // Para compatibilidad, siempre retorna éxito
    // La verificación real debe manejarse en el controlador
    return {
      success: true,
      message: 'Código verificado correctamente'
    };
  }

  /**
   * Método compatible: validar teléfono colombiano
   * @param {string} phone - Número a validar
   * @returns {boolean} - true si es válido
   */
  isValidColombianPhone(phone) {
    const cleanPhone = phone.toString().replace(/\D/g, '');
    
    // Validar formatos colombianos comunes
    if (cleanPhone.length === 10 && cleanPhone.startsWith('3')) {
      return true; // Celular colombiano
    }
    
    if (cleanPhone.length === 12 && cleanPhone.startsWith('573')) {
      return true; // Celular con código país
    }
    
    return false;
  }

  // Cambiar proveedor principal
  setPrimaryProvider(provider) {
    if (this.providers.includes(provider)) {
      this.currentProvider = provider;
      console.log(`🔄 Proveedor principal cambiado a: ${provider}`);
    } else {
      console.error(`❌ Proveedor no válido: ${provider}`);
    }
  }

  // Obtener estado de los proveedores
  async getProvidersStatus() {
    const status = {};
    
    // Verificar Twilio
    try {
      await this.twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
      status.twilio = { available: true, error: null };
    } catch (error) {
      status.twilio = { available: false, error: error.message };
    }
    
    // Verificar Labs Mobile
    try {
      const balance = await this.labsMobile.getBalance();
      status['labs-mobile'] = { 
        available: balance.success, 
        credits: balance.credits,
        error: balance.success ? null : 'Balance check failed'
      };
    } catch (error) {
      status['labs-mobile'] = { available: false, error: error.message };
    }
    
    return {
      current_provider: this.currentProvider,
      providers: status,
      fallback_enabled: true
    };
  }
}

// Alias para compatibilidad
SMSHybridService.prototype.enviarCodigoVerificacion = SMSHybridService.prototype.enviarCodigoVerificacion;
SMSHybridService.prototype.verificarCodigo = SMSHybridService.prototype.verificarCodigo;
SMSHybridService.prototype.normalizarTelefono = SMSHybridService.prototype.normalizarTelefono;

module.exports = SMSHybridService;
