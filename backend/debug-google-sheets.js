/**
 * Diagnóstico completo de Google Sheets
 */
require('dotenv').config();
const googleSheetsService = require('./src/services/googleSheetsService');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const debugGoogleSheets = async () => {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE GOOGLE SHEETS\n');
  
  try {
    // 1. Verificar variables de entorno
    console.log('1️⃣ VERIFICANDO CREDENCIALES...');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    console.log(`   📧 GOOGLE_CLIENT_EMAIL: ${clientEmail ? '✅ Configurado' : '❌ Faltante'}`);
    console.log(`   🔑 GOOGLE_PRIVATE_KEY: ${privateKey ? '✅ Configurado' : '❌ Faltante'}`);
    console.log(`   📄 GOOGLE_APPLICATION_CREDENTIALS: ${credsPath ? '✅ Configurado' : '❌ Faltante'}`);
    
    if (!clientEmail || !privateKey) {
      console.log('❌ CREDENCIALES INCOMPLETAS - NO SE PUEDE CONTINUAR');
      return;
    }
    
    // 2. Verificar servicio
    console.log('\n2️⃣ VERIFICANDO SERVICIO...');
    console.log(`   📦 Servicio cargado: ${typeof googleSheetsService === 'object' ? '✅' : '❌'}`);
    console.log(`   🔧 validateSheetFormat disponible: ${typeof googleSheetsService.validateSheetFormat === 'function' ? '✅' : '❌'}`);
    console.log(`   🔧 validateCopropiedadData disponible: ${typeof googleSheetsService.validateCopropiedadData === 'function' ? '✅' : '❌'}`);
    console.log(`   🔧 extractSheetId disponible: ${typeof googleSheetsService.extractSheetId === 'function' ? '✅' : '❌'}`);
    
    // 3. Probar conexión básica
    console.log('\n3️⃣ PROBANDO CONEXIÓN BÁSICA A GOOGLE API...');
    
    const auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('   ✅ Cliente de Google Sheets creado');
    
    // 4. Probar con hoja conocida que funciona
    console.log('\n4️⃣ PROBANDO CON HOJA CONOCIDA...');
    const hojaConocida = {
      id: '18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI',
      url: 'https://docs.google.com/spreadsheets/d/18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI/edit',
      nit: '901292707',
      nombre: 'OVIEDO PARQUE RESIDENCIAL'
    };
    
    console.log(`   🆔 ID: ${hojaConocida.id}`);
    console.log(`   🔗 URL: ${hojaConocida.url}`);
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: hojaConocida.id,
        range: 'A1:B2'
      });
      
      if (response.data.values && response.data.values.length > 0) {
        console.log('   ✅ Acceso exitoso a hoja conocida');
        console.log(`   📊 Datos: ${JSON.stringify(response.data.values)}`);
      } else {
        console.log('   ⚠️  Hoja conocida vacía o sin datos');
      }
    } catch (error) {
      console.log(`   ❌ Error accediendo a hoja conocida: ${error.message}`);
      
      if (error.code === 403) {
        console.log('   🔐 PROBLEMA: Hoja no compartida con Service Account');
        console.log(`   📧 Compartir con: ${clientEmail}`);
      }
    }
    
    // 5. Probar funciones del servicio
    console.log('\n5️⃣ PROBANDO FUNCIONES DEL SERVICIO...');
    
    try {
      const formatResult = await googleSheetsService.validateSheetFormat(hojaConocida.id);
      console.log(`   📋 validateSheetFormat: ${formatResult.isValid ? '✅ OK' : '❌ FALLA'}`);
      console.log(`   💬 Mensaje: ${formatResult.message}`);
    } catch (error) {
      console.log(`   ❌ Error en validateSheetFormat: ${error.message}`);
    }
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETO');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Service Account Email para compartir hojas:');
    console.log(`   ${clientEmail}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ ERROR GENERAL:', error.message);
  }
};

debugGoogleSheets();
