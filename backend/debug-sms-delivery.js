require('dotenv').config();
const LabsMobileService = require('./src/services/labsMobileService');
const axios = require('axios');

async function debugSMSDelivery() {
  console.log('🔍 === DEBUG SMS DELIVERY ===');
  console.log('📱 Investigando por qué no llegó el SMS\n');

  const labsService = new LabsMobileService();
  
  try {
    // 1. Verificar detalles del último envío
    console.log('📋 DETALLES DEL ÚLTIMO ENVÍO:');
    console.log('📞 Número: 3182992889 → +573182992889');
    console.log('🆔 Transaction ID: welcome-1752377698145');
    console.log('📅 Hora envío: 2025-07-12 22:33 COT');
    console.log('⏰ Tiempo transcurrido: ~4 minutos\n');

    // 2. Validar formato del número nuevamente
    console.log('🔢 VALIDACIÓN DEL NÚMERO:');
    const numeroOriginal = '3182992889';
    const numeroFormateado = labsService.formatColombianPhone(numeroOriginal);
    console.log(`📱 Original: ${numeroOriginal}`);
    console.log(`📲 Formateado: ${numeroFormateado}`);
    console.log(`✅ Formato E.164: ${numeroFormateado.startsWith('57') ? 'CORRECTO' : 'INCORRECTO'}\n`);

    // 3. Probar con formato alternativo
    console.log('🧪 PRUEBAS DE FORMATO ALTERNATIVO:');
    const formatosAlternativos = [
      `+57${numeroOriginal}`,
      `57${numeroOriginal}`,
      `+573182992889`,
      `573182992889`
    ];
    
    formatosAlternativos.forEach((formato, index) => {
      console.log(`${index + 1}. ${formato} ${formato === numeroFormateado ? '← USADO' : ''}`);
    });

    // 4. Verificar estado del servicio Labs Mobile
    console.log('\n🌐 VERIFICANDO ESTADO LABS MOBILE:');
    const balance = await labsService.getBalance();
    if (balance.success) {
      console.log(`✅ Servicio Labs Mobile: ACTIVO`);
      console.log(`💰 Créditos: ${balance.credits}`);
    } else {
      console.log(`❌ Problema con Labs Mobile`);
    }

    // 5. Intentar envío de prueba a número diferente para comparar
    console.log('\n🧪 ENVIANDO SMS DE PRUEBA CORTO:');
    
    // Probar con mensaje muy corto y número alternativo
    const mensajePrueba = 'TEST SMS PH';
    console.log(`💬 Mensaje: "${mensajePrueba}"`);
    console.log(`📏 Longitud: ${mensajePrueba.length} caracteres`);
    
    // Activar modo test para no consumir créditos
    labsService.setTestMode(true);
    
    const payloadPrueba = {
      recipient: [{ msisdn: numeroFormateado }],
      message: mensajePrueba,
      tpoa: 'TEST',  // Cambiar sender por si es el problema
      test: 1, // Modo test para no consumir créditos
      subid: `debug-${Date.now()}`
    };
    
    console.log('📋 Enviando con sender "TEST"...');
    
    const response = await axios.post('https://api.labsmobile.com/json/send', payloadPrueba, {
      auth: {
        username: 'customerservice@bytracking.net',
        password: 'u069ErpPxGtpP0YUTMTTyTnnAS1DbVlw'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('📊 Respuesta prueba:', response.data);

    // 6. Revisar problemas comunes
    console.log('\n🚨 POSIBLES CAUSAS DEL PROBLEMA:');
    console.log('1. ⏰ Demora en entrega (puede tomar hasta 30 minutos)');
    console.log('2. 📱 Número fuera de servicio o inactivo');
    console.log('3. 🚫 Operador bloqueando SMS por sender "SistemaPH"');
    console.log('4. 📵 Dispositivo sin señal o apagado');
    console.log('5. 🔒 Filtro anti-spam del operador');
    console.log('6. 📞 Número incorrecto o no pertenece al operador esperado');

    // 7. Sugerencias de solución
    console.log('\n💡 PRÓXIMOS PASOS RECOMENDADOS:');
    console.log('1. ⏳ Esperar 30 minutos más para entrega');
    console.log('2. 🔄 Probar con sender "SMS" o "INFO" en lugar de "SistemaPH"');
    console.log('3. 📱 Validar que el número esté activo llamando');
    console.log('4. 🧪 Probar con otro número de Colombia conocido');
    console.log('5. 📞 Contactar soporte Labs Mobile si persiste');

    // 8. Información de contacto Labs Mobile
    console.log('\n📞 SOPORTE LABS MOBILE:');
    console.log('🌐 Web: https://www.labsmobile.com');
    console.log('📧 Email: support@labsmobile.com');
    console.log('📱 Teléfono: +34 936 808 409');

  } catch (error) {
    console.error('\n💥 ERROR EN DEBUG:', error.message);
    if (error.response?.data) {
      console.error('📊 Detalles:', error.response.data);
    }
  }
  
  console.log('\n🏁 Debug completado');
}

// Ejecutar debug
debugSMSDelivery();
