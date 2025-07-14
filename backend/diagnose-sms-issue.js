require('dotenv').config();
const axios = require('axios');

async function diagnosticarProblemasSMS() {
  console.log('🔍 === DIAGNÓSTICO PROBLEMAS SMS ===\n');

  // 1. Análisis del número
  console.log('📱 ANÁLISIS DEL NÚMERO:');
  const numeroOriginal = '3182992889';
  const prefijo = numeroOriginal.substring(0, 3);
  
  console.log(`📞 Número: ${numeroOriginal}`);
  console.log(`🔢 Prefijo: ${prefijo}`);
  
  // Identificar operador por prefijo
  const operadores = {
    '300': 'Tigo',
    '301': 'Tigo', 
    '302': 'Tigo',
    '303': 'Tigo',
    '304': 'Tigo',
    '305': 'Tigo',
    '310': 'Movistar',
    '311': 'Movistar',
    '312': 'Movistar', 
    '313': 'Movistar',
    '314': 'Movistar',
    '315': 'Movistar',
    '316': 'Movistar',
    '317': 'Movistar',
    '318': 'Movistar',
    '319': 'Movistar',
    '320': 'Claro',
    '321': 'Claro',
    '322': 'Claro',
    '323': 'Claro',
    '324': 'Claro',
    '325': 'Claro'
  };

  const operador = operadores[prefijo] || 'DESCONOCIDO';
  console.log(`📶 Operador probable: ${operador}`);
  
  if (operador === 'DESCONOCIDO') {
    console.log('⚠️  PROBLEMA: Prefijo no reconocido como operador colombiano válido');
  }

  // 2. Verificar si el problema es el sender
  console.log('\n🏷️  ANÁLISIS DEL SENDER:');
  console.log('📤 Sender usado: "SistemaPH"');
  console.log('⚠️  Posibles problemas con senders largos o con caracteres especiales');
  
  // 3. Hacer una prueba controlada
  console.log('\n🧪 PRUEBA CONTROLADA:');
  console.log('📋 Enviando SMS simple con sender básico...');
  
  try {
    const payload = {
      recipient: [{ msisdn: `57${numeroOriginal}` }],
      message: 'TEST',
      tpoa: 'SMS',  // Sender simple
      test: 1,      // Modo test primero
      subid: `diag-${Date.now()}`
    };

    const response = await axios.post('https://api.labsmobile.com/json/send', payload, {
      auth: {
        username: 'customerservice@bytracking.net',
        password: 'u069ErpPxGtpP0YUTMTTyTnnAS1DbVlw'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('📊 Respuesta modo test:', response.data);

    if (response.data.code === '0') {
      console.log('✅ API funciona - El problema NO es técnico');
      
      // Si test funciona, hacer envío real simple
      console.log('\n🚀 ENVIANDO REAL CON CONFIGURACIÓN SIMPLE:');
      
      const payloadReal = {
        ...payload,
        test: 0,  // Cambiar a real
        message: 'Hola desde PH Colombia',
        subid: `real-simple-${Date.now()}`
      };

      const responseReal = await axios.post('https://api.labsmobile.com/json/send', payloadReal, {
        auth: {
          username: 'customerservice@bytracking.net',
          password: 'u069ErpPxGtpP0YUTMTTyTnnAS1DbVlw'
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('📊 Respuesta envío real simple:', responseReal.data);
      
      if (responseReal.data.code === '0') {
        console.log('✅ Enviado con configuración simple');
        console.log('⏰ Espera 5-10 minutos para ver si llega');
        console.log('🆔 ID:', responseReal.data.subid);
      }

    } else {
      console.log('❌ Problema con la API');
    }

  } catch (error) {
    console.error('💥 Error en prueba:', error.message);
  }

  // 4. Recomendaciones específicas
  console.log('\n💡 RECOMENDACIONES ESPECÍFICAS:');
  
  if (operador === 'Movistar') {
    console.log('📶 Movistar Colombia:');
    console.log('   - A veces bloquea SMS de remitentes no registrados');
    console.log('   - Puede requerir sender numérico (ej: 12345)');
    console.log('   - Filtros anti-spam más estrictos');
  }
  
  console.log('\n🔧 PASOS A SEGUIR:');
  console.log('1. ✅ Confirmar si llegó el SMS simple recién enviado');
  console.log('2. 🔄 Si no llega, probar con sender numérico');
  console.log('3. 📱 Verificar que el número esté activo');
  console.log('4. 🧪 Probar con otro número de Colombia');
  console.log('5. 💬 Contactar Labs Mobile para verificar entrega');

  console.log('\n📞 INFO ADICIONAL:');
  console.log('🕐 Hora actual:', new Date().toLocaleString('es-CO', {timeZone: 'America/Bogota'}));
  console.log('⏰ SMS enviado hace:', '~8 minutos');
  console.log('🔔 Tiempo máximo espera:', '30 minutos');
}

// Ejecutar diagnóstico
diagnosticarProblemasSMS();
