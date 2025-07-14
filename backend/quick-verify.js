/**
 * Verificación rápida con timeout
 */
require('dotenv').config();
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const quickVerify = async () => {
  const timeout = setTimeout(() => {
    console.log('⏰ TIMEOUT - La hoja no responde');
    console.log('\n🔍 POSIBLES PROBLEMAS:');
    console.log('1. La hoja está siendo editada actualmente');
    console.log('2. Hay muchas celdas con fórmulas que se están calculando');
    console.log('3. La hoja necesita ser compartida nuevamente con el Service Account');
    console.log('\n💡 SOLUCIONES:');
    console.log('- Espera unos minutos y vuelve a intentar');
    console.log('- Verifica que la hoja esté compartida con: sistema-ph-service@sistema-ph-colombia.iam.gserviceaccount.com');
    console.log('- Simplifica la estructura eliminando fórmulas complejas');
    process.exit(0);
  }, 10000); // 10 segundos timeout

  try {
    console.log('🔍 Verificación rápida de acceso...\n');
    
    const auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = '1tqpr569M1uHRm3WVsNCQlSfJp__-RoyVX8G35KRAVOA';
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A1:C3'
    });
    
    clearTimeout(timeout);
    
    const values = response.data.values;
    
    if (!values || values.length === 0) {
      console.log('📊 HOJA VACÍA O SIN DATOS');
      return;
    }
    
    console.log('✅ ACCESO EXITOSO');
    console.log(`📊 Datos encontrados (${values.length} filas):\n`);
    
    values.forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, row || ['(vacía)']);
    });
    
    // Análisis rápido
    if (values.length >= 2) {
      const headers = values[0];
      const firstData = values[1];
      
      console.log('\n🔍 ANÁLISIS RÁPIDO:');
      console.log(`Headers encontrados: ${headers ? headers.join(' | ') : 'No hay'})`);
      console.log(`Primera fila de datos: ${firstData ? firstData.join(' | ') : 'No hay'}`);
      
      if (headers && headers[0] === 'NIT' && headers[1] === 'NOMBRE_COPROPIEDAD') {
        console.log('✅ Headers correctos');
        
        if (firstData && firstData[0] === '901692134' && firstData[1] === 'KOA APARTAMENTOS') {
          console.log('✅ Datos correctos - HOJA VÁLIDA 🎉');
        } else {
          console.log('❌ Datos incorrectos en primera fila');
          console.log(`   Esperado: 901692134 | KOA APARTAMENTOS`);
          console.log(`   Encontrado: ${firstData ? firstData[0] : 'N/A'} | ${firstData ? firstData[1] : 'N/A'}`);
        }
      } else {
        console.log('❌ Headers incorrectos');
      }
    }
    
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ ERROR:', error.message);
    
    if (error.code === 403) {
      console.log('\n🔐 PROBLEMA DE PERMISOS');
      console.log('La hoja no está compartida con el Service Account');
      console.log('Compártela con: sistema-ph-service@sistema-ph-colombia.iam.gserviceaccount.com');
    }
  }
};

quickVerify();
