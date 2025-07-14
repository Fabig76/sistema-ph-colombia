const axios = require('axios');

class LabsMobileService {
  constructor() {
    // Credenciales reales de bytracking.net
    this.username = 'customerservice@bytracking.net';
    this.token = 'u069ErpPxGtpP0YUTMTTyTnnAS1DbVlw';
    this.sender = process.env.LABS_MOBILE_SENDER || 'SistemaPH';
    this.baseUrl = 'https://api.labsmobile.com';
    
    // Inicializar en modo test por defecto para seguridad
    this.testMode = true;
    
    // Basic Auth para Labs Mobile
    this.auth = {
      username: this.username,
      password: this.token
    };
  }

  async sendVerificationCode(phoneNumber, code) {
    try {
      console.log(`📱 Enviando SMS a ${phoneNumber} con código: ${code}`);
      
      // Formatear número colombiano
      const formattedPhone = this.formatColombianPhone(phoneNumber);
      console.log(`📞 Número formateado: ${formattedPhone}`);
      
      const payload = {
        recipient: [{ msisdn: formattedPhone }],
        message: `Tu código de verificación es: ${code}. Sistema PH Colombia.`,
        tpoa: this.sender,
        test: this.testMode ? 1 : 0 // Usar configuración de testMode
      };

      console.log('📤 Enviando SMS via API REST...');
      console.log('🔧 Payload:', payload);
      console.log('🔐 Auth:', { username: this.username, password: '***HIDDEN***' });
      
      const response = await axios.post(`${this.baseUrl}/json/send`, payload, {
        auth: this.auth,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('📊 Respuesta Labs Mobile:', response.data);
      
      // Labs Mobile: código 0 = éxito, otros códigos = error
      if (response.data.code && response.data.code !== 0 && response.data.code !== '0') {
        throw new Error(`Error ${response.data.code}: ${response.data.message}`);
      }
      
      return {
        success: true,
        phone: formattedPhone,
        messageId: response.data.subid,
        testMode: this.testMode,
        provider: 'labs-mobile',
        response: response.data
      };

    } catch (error) {
      console.error('❌ Error crítico Labs Mobile:', error.message);
      if (error.response) {
        console.error('📊 Error response:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  formatColombianPhone(phone) {
    console.log(`🔧 Formateando número: ${phone}`);
    
    // Limpiar número
    let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Labs Mobile requiere: 573001234567 (sin +)
    if (cleanPhone.startsWith('+57')) {
      cleanPhone = cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('57') && cleanPhone.length === 12) {
      // Ya está en formato correcto
    } else if (cleanPhone.startsWith('3') && cleanPhone.length === 10) {
      cleanPhone = '57' + cleanPhone;
    }
    
    console.log(`✅ Número final: ${cleanPhone}`);
    return cleanPhone;
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async getBalance() {
    try {
      console.log('💰 Consultando balance...');
      
      const response = await axios.get(`${this.baseUrl}/json/balance`, {
        auth: this.auth,
        timeout: 10000
      });
      
      console.log('📊 Resultado balance:', response.data);
      
      if (response.data.code === 0) {
        return {
          success: true,
          credits: parseFloat(response.data.credits),
          currency: 'EUR'
        };
      } else {
        return {
          success: false,
          error: `Error ${response.data.code}: ${response.data.message}`
        };
      }
    } catch (error) {
      console.error('❌ Error consultando balance:', error.message);
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  async getPricesColombiaSpain() {
    try {
      console.log('💸 Consultando precios CO y ES...');
      
      const response = await axios.get(`${this.baseUrl}/json/prices?country=CO,ES`, {
        auth: this.auth,
        timeout: 10000
      });
      
      console.log('📊 Precios:', response.data);
      return {
        success: true,
        prices: response.data
      };
    } catch (error) {
      console.error('❌ Error consultando precios:', error.message);
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  // Método genérico para enviar cualquier mensaje
  async sendMessage(phoneNumber, message, customSender = null) {
    try {
      console.log(`📱 Enviando mensaje a ${phoneNumber}: ${message}`);
      
      // Formatear número colombiano
      const formattedPhone = this.formatColombianPhone(phoneNumber);
      console.log(`📞 Número formateado: ${formattedPhone}`);
      
      const payload = {
        recipient: [{ msisdn: formattedPhone }],
        message: message,
        tpoa: customSender || this.sender,
        test: this.testMode ? 1 : 0
      };

      console.log('📤 Enviando SMS via API REST...');
      console.log('🔧 Payload:', payload);
      
      const response = await axios.post(`${this.baseUrl}/json/send`, payload, {
        auth: this.auth,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('📊 Respuesta Labs Mobile:', response.data);
      
      // Labs Mobile: código 0 = éxito, otros códigos = error
      if (response.data.code && response.data.code !== 0 && response.data.code !== '0') {
        throw new Error(`Error ${response.data.code}: ${response.data.message}`);
      }
      
      return {
        success: true,
        phone: formattedPhone,
        messageId: response.data.subid,
        testMode: this.testMode,
        provider: 'labs-mobile',
        apiResponse: response.data
      };

    } catch (error) {
      console.error('❌ Error crítico Labs Mobile:', error.message);
      if (error.response) {
        console.error('📊 Error response:', error.response.data);
      }
      return {
        success: false,
        error: error.message,
        details: error.response?.data
      };
    }
  }

  // Cambiar entre modo test y real
  setTestMode(enabled) {
    this.testMode = enabled;
    console.log(`🧪 Modo test: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  }
}

module.exports = LabsMobileService;
