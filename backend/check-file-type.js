/**
 * Verificar tipo de archivo en Google Drive
 */
require('dotenv').config();
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const checkFileType = async () => {
  try {
    console.log('🔍 Verificando tipo de archivo...\n');
    
    const fileId = '18Wjxas8I0oUnHfHS8uYzgrxs0EnmtI7q';
    
    const auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets.readonly'
      ]
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    console.log('📊 Obteniendo información del archivo...');
    
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id,name,mimeType,parents,webViewLink,size,createdTime,modifiedTime'
    });
    
    const file = response.data;
    
    console.log('✅ INFORMACIÓN DEL ARCHIVO:');
    console.log(`📄 Nombre: ${file.name}`);
    console.log(`🎯 Tipo MIME: ${file.mimeType}`);
    console.log(`🆔 ID: ${file.id}`);
    console.log(`🔗 URL: ${file.webViewLink}`);
    console.log(`📏 Tamaño: ${file.size ? `${Math.round(file.size / 1024)} KB` : 'N/A'}`);
    console.log(`📅 Creado: ${file.createdTime}`);
    console.log(`✏️  Modificado: ${file.modifiedTime}`);
    
    console.log('\n🎯 DIAGNÓSTICO:');
    
    if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
      console.log('✅ Es una hoja de cálculo nativa de Google Sheets');
      console.log('   ➤ Debería funcionar con la API de Sheets');
      
    } else if (file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      console.log('⚠️  Es un archivo Excel (.xlsx) subido a Google Drive');
      console.log('   ➤ NO es compatible con Google Sheets API');
      console.log('   ➤ SOLUCIÓN: Convertir a Google Sheets nativo');
      
    } else if (file.mimeType === 'application/vnd.ms-excel') {
      console.log('⚠️  Es un archivo Excel antiguo (.xls) subido a Google Drive');
      console.log('   ➤ NO es compatible con Google Sheets API');
      console.log('   ➤ SOLUCIÓN: Convertir a Google Sheets nativo');
      
    } else {
      console.log(`❓ Tipo desconocido: ${file.mimeType}`);
    }
    
    console.log('\n💡 CÓMO CONVERTIR A GOOGLE SHEETS:');
    console.log('1. Abrir el archivo en Google Drive');
    console.log('2. Hacer clic en "Abrir con Google Sheets"');
    console.log('3. En Google Sheets: Archivo → Guardar como Google Sheets');
    console.log('4. Usar la nueva URL generada');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    
    if (error.code === 403) {
      console.log('\n🔐 Error 403: El archivo no está compartido');
      console.log('   ➤ Compartir con: sistema-ph-service@sistema-ph-colombia.iam.gserviceaccount.com');
    } else if (error.code === 404) {
      console.log('\n🔍 Error 404: Archivo no encontrado');
      console.log('   ➤ Verificar que el ID sea correcto');
      console.log('   ➤ Verificar que el archivo exista');
    }
  }
};

checkFileType();
