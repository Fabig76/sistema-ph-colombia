/**
 * Inspeccionar datos reales de la hoja de Google Sheets
 */
require('dotenv').config();

const googleSheetsService = require('./src/services/googleSheetsService');

const inspectSheetData = async () => {
  console.log('🔍 INSPECCIONANDO DATOS REALES DE LA HOJA\n');
  
  const urlReal = 'https://docs.google.com/spreadsheets/d/1tqpr569M1uHRm3WVsNCQlSfJp__-RoyVX8G35KRAVOA/edit?usp=drive_link';
  const sheetId = googleSheetsService.extractSheetId(urlReal);
  
  console.log(`📄 Sheet ID: ${sheetId}\n`);
  
  try {
    // Leer las primeras 3 filas para ver la estructura
    const { google } = require('googleapis');
    const { GoogleAuth } = require('google-auth-library');
    
    const auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS || './google-credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:Z3', // Primeras 3 filas, todas las columnas
    });
    
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log('❌ La hoja está vacía');
      return;
    }
    
    console.log('📋 DATOS ENCONTRADOS:');
    console.log('-------------------');
    
    rows.forEach((row, index) => {
      console.log(`🔢 Fila ${index + 1}:`);
      row.forEach((cell, cellIndex) => {
        const columnLetter = String.fromCharCode(65 + cellIndex); // A, B, C, etc.
        console.log(`   ${columnLetter}: "${cell}"`);
      });
      console.log('');
    });
    
    // Análisis específico
    if (rows.length >= 1) {
      console.log('🎯 ANÁLISIS:');
      console.log(`   📧 NIT en hoja (A1): "${rows[0][0]}"`);
      if (rows[0][1]) {
        console.log(`   🏢 Nombre en hoja (B1): "${rows[0][1]}"`);
      }
      
      console.log('\n💡 PARA REGISTRAR ESTA COPROPIEDAD DEBES USAR:');
      console.log(`   🔢 NIT: ${rows[0][0]}`);
      console.log(`   📝 Nombre: ${rows[0][1] || 'No especificado'}`);
    }
    
  } catch (error) {
    console.error('❌ Error al inspeccionar hoja:', error.message);
  }
};

inspectSheetData();
