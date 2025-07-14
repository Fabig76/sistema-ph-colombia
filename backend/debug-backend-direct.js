/**
 * Debug directo de la función exacta que usa el backend
 */
require('dotenv').config();
const googleSheetsService = require('./src/services/googleSheetsService');

const debugBackendDirect = async () => {
  try {
    console.log('🐛 DEBUG DIRECTO - FUNCIÓN EXACTA DEL BACKEND\n');
    
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1tqpr569M1uHRm3WVsNCQlSfJp__-RoyVX8G35KRAVOA/edit?usp=sharing';
    const nit = '901692134';
    const nombre = 'KOA APARTAMENTOS';
    
    console.log('📊 Datos de prueba:');
    console.log(`   URL: ${sheetUrl}`);
    console.log(`   NIT: ${nit}`);
    console.log(`   Nombre: ${nombre}\n`);
    
    // 1. Extraer ID
    console.log('1️⃣ Extrayendo ID...');
    const sheetId = googleSheetsService.extractSheetId(sheetUrl);
    console.log(`   ✅ ID: ${sheetId}\n`);
    
    // 2. Probar validateSheetFormat (la que está fallando)
    console.log('2️⃣ Ejecutando validateSheetFormat (la función que falla)...');
    console.log('   ⏳ Esperando respuesta...');
    
    const startTime = Date.now();
    const formatResult = await googleSheetsService.validateSheetFormat(sheetId);
    const endTime = Date.now();
    
    console.log(`   ⏱️  Tiempo de respuesta: ${endTime - startTime}ms`);
    console.log(`   📋 Resultado: ${formatResult.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
    console.log(`   💬 Mensaje: ${formatResult.message}`);
    
    if (formatResult.data) {
      console.log('   📊 Datos adicionales:');
      console.log(`     - Headers encontrados: ${formatResult.data.headers ? formatResult.data.headers.join(', ') : 'No hay'}`);
      console.log(`     - Headers requeridos: ${formatResult.data.requiredHeaders ? formatResult.data.requiredHeaders.join(', ') : 'No hay'}`);
    }
    
    // 3. Si formato es válido, probar validación de datos
    if (formatResult.isValid) {
      console.log('\n3️⃣ Formato válido, probando validateCopropiedadData...');
      
      const dataResult = await googleSheetsService.validateCopropiedadData(sheetId, nit, nombre);
      console.log(`   📋 Resultado: ${dataResult.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
      console.log(`   💬 Mensaje: ${dataResult.message}`);
      
      if (dataResult.data) {
        console.log('   📊 Datos encontrados:');
        console.log(`     - NIT en hoja: ${dataResult.data.nitEnHoja}`);
        console.log(`     - Nombre en hoja: ${dataResult.data.nombreEnHoja}`);
      }
    }
    
    // 4. Diagnóstico final
    console.log('\n🎯 DIAGNÓSTICO:');
    if (formatResult.isValid) {
      console.log('✅ validateSheetFormat: OK');
      console.log('🚀 El problema NO está en la función');
      console.log('🔍 Posible causa: Circuit Breaker timeout en el servidor');
    } else {
      console.log('❌ validateSheetFormat: FALLA');
      console.log('🔍 Esta es la función que está causando el error');
      
      if (formatResult.message.includes('No se pudo acceder')) {
        console.log('💡 Causa probable: Circuit Breaker timeout');
        console.log('🔧 Solución: Aumentar timeout o deshabilitar circuit breaker temporalmente');
      }
    }
    
  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
    console.log('🔍 Esto indica un problema más profundo en el sistema');
  }
};

debugBackendDirect();
