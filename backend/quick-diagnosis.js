/**
 * Diagnóstico rápido y directo
 */
require('dotenv').config();

const quickDiagnosis = () => {
  console.log('🔍 DIAGNÓSTICO RÁPIDO DE GOOGLE SHEETS\n');
  
  // 1. Variables de entorno
  console.log('1️⃣ CREDENCIALES:');
  console.log(`   📧 GOOGLE_CLIENT_EMAIL: ${process.env.GOOGLE_CLIENT_EMAIL ? '✅ OK' : '❌ FALTANTE'}`);
  console.log(`   🔑 GOOGLE_PRIVATE_KEY: ${process.env.GOOGLE_PRIVATE_KEY ? '✅ OK' : '❌ FALTANTE'}`);
  console.log(`   📄 GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅ OK' : '❌ FALTANTE'}`);
  
  if (process.env.GOOGLE_CLIENT_EMAIL) {
    console.log(`   📧 Service Account: ${process.env.GOOGLE_CLIENT_EMAIL}`);
  }
  
  // 2. Cargar servicio
  console.log('\n2️⃣ SERVICIO:');
  try {
    const googleSheetsService = require('./src/services/googleSheetsService');
    console.log('   📦 Servicio cargado: ✅ OK');
    console.log(`   🔧 validateSheetFormat: ${typeof googleSheetsService.validateSheetFormat === 'function' ? '✅ OK' : '❌ FALTANTE'}`);
    console.log(`   🔧 validateCopropiedadData: ${typeof googleSheetsService.validateCopropiedadData === 'function' ? '✅ OK' : '❌ FALTANTE'}`);
  } catch (error) {
    console.log(`   ❌ Error cargando servicio: ${error.message}`);
  }
  
  // 3. Configuración
  console.log('\n3️⃣ CONFIGURACIÓN:');
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.log('   ❌ CREDENCIALES INCOMPLETAS');
    console.log('\n🔧 SOLUCIÓN:');
    console.log('   1. Verificar archivo .env');
    console.log('   2. Configurar GOOGLE_CLIENT_EMAIL');
    console.log('   3. Configurar GOOGLE_PRIVATE_KEY');
    console.log('   4. Configurar GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    console.log('   ✅ Credenciales configuradas');
  }
  
  console.log('\n🎯 PRÓXIMO PASO:');
  if (!process.env.GOOGLE_CLIENT_EMAIL) {
    console.log('   🔧 Configurar credenciales de Google Service Account');
  } else {
    console.log('   🔧 Compartir hoja de Google Sheets con Service Account');
    console.log(`   📧 Email para compartir: ${process.env.GOOGLE_CLIENT_EMAIL}`);
  }
};

quickDiagnosis();
