/**
 * Analizar y crear estructura correcta para la hoja de Google Sheets
 */
require('dotenv').config();
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const fixSheetStructure = async () => {
  try {
    console.log('🔧 ANALIZANDO Y CORRIGIENDO ESTRUCTURA DE LA HOJA\n');
    
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1tqpr569M1uHRm3WVsNCQlSfJp__-RoyVX8G35KRAVOA/edit?usp=sharing';
    const sheetId = '1tqpr569M1uHRm3WVsNCQlSfJp__-RoyVX8G35KRAVOA';
    
    // Autenticación
    const auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('📊 Leyendo datos actuales...');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'A:J', // Todas las columnas relevantes
    });
    
    const values = response.data.values;
    
    if (!values || values.length === 0) {
      console.log('❌ La hoja está vacía');
      return;
    }
    
    console.log(`📋 Datos actuales (${values.length} filas):`);
    values.forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, row || ['(vacía)']);
    });
    
    // Datos de la copropiedad (primera fila actual)
    const nitCopropiedad = values[0][0]; // '901692134'
    const nombreCopropiedad = values[0][1]; // 'KOA APARTAMENTOS'
    
    console.log('\n🎯 DATOS DE LA COPROPIEDAD:');
    console.log(`NIT: ${nitCopropiedad}`);
    console.log(`Nombre: ${nombreCopropiedad}`);
    
    // Headers correctos requeridos
    const headersCorrectos = [
      'NIT', 'NOMBRE_COPROPIEDAD', 'TORRE_BLOQUE', 'APTO_CASA', 
      'IDENTIFICACION', 'NOMBRE_PROPIETARIO', 'TELEFONO', 'EMAIL', 
      'ESTADO_CUENTA'
    ];
    
    console.log('\n📋 ESTRUCTURA CORRECTA REQUERIDA:');
    console.log('FILA 1 (HEADERS):');
    console.log(headersCorrectos.join(' | '));
    
    // Convertir datos actuales al formato correcto
    console.log('\n🔄 CONVIRTIENDO DATOS AL FORMATO CORRECTO:');
    
    const datosCorrectos = [];
    
    // Fila 1: Headers
    datosCorrectos.push(headersCorrectos);
    
    // Procesar filas de datos (empezando desde fila 3 que tiene los propietarios)
    for (let i = 2; i < values.length; i++) {
      const row = values[i];
      if (!row || row.length === 0) continue;
      
      const nombrePropietario = row[0] || '';
      const telefono = row[1] || '';
      const inmueble = row[2] || '';
      const tipo = row[3] || '';
      const torre = row[4] || '';
      
      // Generar datos faltantes
      const identificacion = `12345${i.toString().padStart(3, '0')}`; // ID simulado
      const email = nombrePropietario.toLowerCase().replace(/\s+/g, '.').replace(/[áéíóú]/g, match => {
        const map = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u'};
        return map[match] || match;
      }) + '@email.com';
      const estado = 'AL DIA'; // Estado por defecto
      
      const filaCorrecta = [
        nitCopropiedad,           // NIT
        nombreCopropiedad,        // NOMBRE_COPROPIEDAD
        torre || 'Torre A',       // TORRE_BLOQUE
        inmueble,                 // APTO_CASA
        identificacion,           // IDENTIFICACION (generado)
        nombrePropietario,        // NOMBRE_PROPIETARIO
        telefono,                 // TELEFONO
        email,                    // EMAIL (generado)
        estado                    // ESTADO_CUENTA
      ];
      
      datosCorrectos.push(filaCorrecta);
    }
    
    console.log('\n✅ DATOS CONVERTIDOS:');
    datosCorrectos.forEach((row, index) => {
      console.log(`Fila ${index + 1}:`, row.join(' | '));
    });
    
    // Generar texto para copiar y pegar
    console.log('\n📋 FORMATO CSV PARA COPIAR Y PEGAR:');
    console.log('=====================================');
    datosCorrectos.forEach(row => {
      console.log(row.join('\t')); // Separado por tabs para Excel/Sheets
    });
    console.log('=====================================');
    
    console.log('\n💡 INSTRUCCIONES:');
    console.log('1. Copia todo el texto entre las líneas de ===');
    console.log('2. Abre tu hoja de Google Sheets');
    console.log('3. Seleccione la celda A1');
    console.log('4. Pega el contenido (Ctrl+V o Cmd+V)');
    console.log('5. Los datos se organizarán automáticamente en columnas');
    
    console.log('\n🔗 URL de tu hoja:');
    console.log(sheetUrl);
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
};

fixSheetStructure();
