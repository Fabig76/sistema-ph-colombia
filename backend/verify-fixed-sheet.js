/**
 * Verificar hoja después de corrección
 */
require('dotenv').config();
const googleSheetsService = require('./src/services/googleSheetsService');

const verifyFixedSheet = async () => {
  try {
    console.log('🧪 VERIFICANDO HOJA CORREGIDA\n');
    
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/1tqpr569M1uHRm3WVsNCQlSfJp__-RoyVX8G35KRAVOA/edit?usp=sharing';
    const expectedNit = '901692134';
    const expectedNombre = 'KOA APARTAMENTOS';
    
    console.log(`📊 URL: ${sheetUrl}`);
    console.log(`🎯 NIT esperado: ${expectedNit}`);
    console.log(`🎯 Nombre esperado: ${expectedNombre}\n`);
    
    // 1. Extraer ID
    const sheetId = googleSheetsService.extractSheetId(sheetUrl);
    console.log(`🆔 ID extraído: ${sheetId}\n`);
    
    // 2. Validar formato
    console.log('1️⃣ Validando formato de headers...');
    const formatResult = await googleSheetsService.validateSheetFormat(sheetId);
    
    if (formatResult.isValid) {
      console.log('   ✅ Formato correcto');
      console.log(`   📋 Headers: ${formatResult.data?.headers ? formatResult.data.headers.join(', ') : 'N/A'}`);
    } else {
      console.log(`   ❌ Error de formato: ${formatResult.message}`);
    }
    
    // 3. Validar datos específicos
    console.log('\n2️⃣ Validando datos de copropiedad...');
    const dataResult = await googleSheetsService.validateCopropiedadData(sheetId, expectedNit, expectedNombre);
    
    if (dataResult.isValid) {
      console.log('   ✅ Datos válidos');
      console.log(`   🎯 NIT en hoja: ${dataResult.data?.nitEnHoja}`);
      console.log(`   🎯 Nombre en hoja: ${dataResult.data?.nombreEnHoja}`);
    } else {
      console.log(`   ❌ Error en datos: ${dataResult.message}`);
    }
    
    // 4. Probar búsqueda de propietario
    console.log('\n3️⃣ Probando búsqueda de propietario...');
    const testIdentificacion = '12345678'; // Juan Pérez García
    const propiedades = await googleSheetsService.buscarPropiedadesPorIdentificacion(
      sheetId, expectedNit, testIdentificacion
    );
    
    if (propiedades.length > 0) {
      console.log(`   ✅ Encontrado ${propiedades.length} propiedad(es) para ID: ${testIdentificacion}`);
      propiedades.forEach((prop, index) => {
        console.log(`   📊 Propiedad ${index + 1}:`);
        console.log(`      - Nombre: ${prop.nombrePropietario}`);
        console.log(`      - Inmueble: ${prop.apto} - ${prop.torre}`);
        console.log(`      - Teléfono: ${prop.telefono}`);
        console.log(`      - Estado: ${prop.estadoCuenta}`);
      });
    } else {
      console.log(`   ⚠️  No se encontraron propiedades para ID: ${testIdentificacion}`);
    }
    
    // 5. Resultado final
    const isFullyValid = formatResult.isValid && dataResult.isValid;
    
    console.log('\n🎯 RESULTADO FINAL:');
    if (isFullyValid) {
      console.log('✅ HOJA COMPLETAMENTE VÁLIDA');
      console.log('🚀 Lista para registrar copropiedad en el sistema');
      console.log('🔐 Propietarios podrán hacer login exitosamente');
    } else {
      console.log('❌ HOJA AÚN TIENE ERRORES');
      console.log('🔧 Revisar y corregir estructura');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
};

// Ejecutar después de 5 segundos para dar tiempo a corregir
console.log('⏳ Esperando 5 segundos para que corrijas la hoja...');
setTimeout(verifyFixedSheet, 5000);
