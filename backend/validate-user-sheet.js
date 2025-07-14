/**
 * Validar hoja del usuario después de compartir
 */
require('dotenv').config();
const googleSheetsService = require('./src/services/googleSheetsService');

const validateUserSheet = async () => {
  try {
    const userUrl = 'https://docs.google.com/spreadsheets/d/18Wjxas8I0oUnHfHS8uYzgrxs0EnmtI7q/edit?usp=drive_link&ouid=108573711468371578391&rtpof=true&sd=true';
    
    console.log('🔍 Validando hoja del usuario (después de compartir)...\n');
    console.log(`📊 URL: ${userUrl}\n`);
    
    // 1. Extraer ID
    const sheetId = googleSheetsService.extractSheetId(userUrl);
    console.log(`🆔 ID extraído: ${sheetId}`);
    
    if (!sheetId) {
      console.log('❌ No se pudo extraer el ID');
      return;
    }
    
    // 2. Validar formato
    console.log('\n📋 Paso 1: Validando formato de headers...');
    const formatResult = await googleSheetsService.validateSheetFormat(sheetId);
    
    if (formatResult.isValid) {
      console.log('✅ Formato correcto');
    } else {
      console.log(`❌ Error de formato: ${formatResult.message}`);
    }
    
    // 3. Intentar leer primera fila de datos para NIT y nombre
    console.log('\n📊 Paso 2: Leyendo datos para validación...');
    
    // Simular validación con datos de ejemplo
    // (deberás proporcionar el NIT y nombre real de tu copropiedad)
    const expectedNit = 'TU_NIT_AQUI';     // Reemplaza con tu NIT
    const expectedNombre = 'TU_NOMBRE_AQUI'; // Reemplaza con tu nombre de copropiedad
    
    console.log(`🎯 Datos esperados:`);
    console.log(`   - NIT esperado: ${expectedNit}`);
    console.log(`   - Nombre esperado: ${expectedNombre}`);
    
    console.log('\n💡 SIGUIENTE PASO:');
    console.log('   1. Comparte la hoja con: sistema-ph-service@sistema-ph-colombia.iam.gserviceaccount.com');
    console.log('   2. Verifica que la primera fila tenga: NIT | NOMBRE_COPROPIEDAD');
    console.log('   3. Ejecuta este script nuevamente');
    
  } catch (error) {
    if (error.message.includes('No se pudo inicializar la autenticación')) {
      console.log('❌ Error de autenticación - credenciales no válidas');
    } else {
      console.log(`❌ Error: ${error.message}`);
    }
  }
};

validateUserSheet();
