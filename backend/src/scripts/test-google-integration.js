/**
 * Script de prueba para validar la integración de Google APIs
 * Este script prueba las funcionalidades de Google Sheets y Google Docs
 */

require('dotenv').config();
const googleSheetsService = require('../services/googleSheetsService.custom');
const googleDocsService = require('../services/googleDocsService.custom');
const logger = require('../utils/logger');

// URLs de prueba (URLs REALES proporcionadas)
const TEST_SHEET_URL = 'https://docs.google.com/spreadsheets/d/18v2nv4vROwn7z-JTI2ix__W6No6ZJuGOI3ooOCxn9xI/edit';
const TEST_DOC_URL = 'https://docs.google.com/document/d/1cGoJ-0eS_trFkOEpMRjkmF61Y5GrPKJW/edit';

async function testGoogleSheetsIntegration() {
  console.log('\n🔍 PRUEBA 1: Integración Google Sheets');
  console.log('=====================================');
  
  try {
    // Extraer ID de la hoja
    const sheetId = googleSheetsService.extractSheetId(TEST_SHEET_URL);
    console.log(`✅ Sheet ID extraído: ${sheetId}`);
    
    if (!sheetId) {
      console.log('❌ ERROR: No se pudo extraer el ID de la hoja');
      return false;
    }
    
    // Validar estructura de la hoja
    console.log('\n📋 Validando estructura de la hoja...');
    const validacion = await googleSheetsService.validarEstructuraHoja(sheetId);
    
    if (validacion.valido) {
      console.log('✅ Estructura de hoja válida');
      console.log(`   - NIT Copropiedad: ${validacion.copropiedad.nit}`);
      console.log(`   - Nombre Copropiedad: ${validacion.copropiedad.nombre}`);
      console.log(`   - Headers encontrados: ${validacion.headers.join(', ')}`);
    } else {
      console.log('❌ ERROR en estructura de hoja:', validacion.mensaje);
      return false;
    }
    
    // Buscar propietario por teléfono (ejemplo)
    console.log('\n🔍 Probando búsqueda por teléfono...');
    const telefonoPrueba = '3001234567'; // Cambiar por un teléfono real de la hoja
    const propietario = await googleSheetsService.buscarPropietarioPorTelefono(sheetId, telefonoPrueba);
    
    if (propietario) {
      console.log('✅ Propietario encontrado:');
      console.log(`   - Nombre: ${propietario.propietario}`);
      console.log(`   - Teléfono: ${propietario.telefono}`);
      console.log(`   - Inmueble: ${propietario.inmueble}`);
      console.log(`   - Estado: ${propietario.estadoCuenta}`);
      console.log(`   - Al día: ${googleSheetsService.estaAlDia(propietario) ? 'SÍ' : 'NO'}`);
    } else {
      console.log(`⚠️  No se encontró propietario con teléfono ${telefonoPrueba}`);
      console.log('   (Esto es normal si el teléfono no existe en la hoja)');
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ ERROR en integración Google Sheets:', error.message);
    return false;
  }
}

async function testGoogleDocsIntegration() {
  console.log('\n📄 PRUEBA 2: Integración Google Docs');
  console.log('====================================');
  
  try {
    // Extraer ID del documento
    const docId = googleDocsService.extractDocId(TEST_DOC_URL);
    console.log(`✅ Doc ID extraído: ${docId}`);
    
    if (!docId) {
      console.log('❌ ERROR: No se pudo extraer el ID del documento');
      return false;
    }
    
    // Validar plantilla
    console.log('\n📝 Validando plantilla...');
    const validacion = await googleDocsService.validarPlantilla(docId);
    
    if (validacion.valido) {
      console.log('✅ Plantilla válida');
      console.log(`   - Placeholders encontrados: ${validacion.placeholders.join(', ')}`);
    } else {
      console.log('⚠️  Plantilla con advertencias:', validacion.mensaje);
      console.log(`   - Placeholders encontrados: ${validacion.foundRequired.join(', ')}`);
      console.log(`   - Placeholders faltantes: ${validacion.missingRequired.join(', ')}`);
    }
    
    // Generar paz y salvo de prueba
    console.log('\n🔄 Generando paz y salvo de prueba...');
    const datosPrueba = {
      plantillaUrl: GOOGLE_DOCS_URL_PRUEBA,
      nombreCopropiedad: 'COPROPIEDAD DE PRUEBA',
      nitCopropiedad: '900123456-7',
      nombrePropietario: 'JUAN PÉREZ LÓPEZ',
      cedulaPropietario: '12345678',
      telefonoPropietario: '3001234567',
      inmueble: 'Torre A Apto 101',
      tipoInmueble: 'Apartamento',
      adicionales: {
        '{{TORRE}}': 'Torre A',
        '{{EMAIL}}': 'juan.perez@email.com'
      }
    };
    
    const resultado = await googleDocsService.generarPazYSalvo(datosPrueba);
    
    if (resultado.success) {
      console.log('✅ Paz y salvo generado exitosamente');
      console.log(`   - Documento: ${resultado.documento.nombre}`);
      console.log(`   - URL descarga: ${resultado.url}`);
      console.log(`   - Fecha: ${resultado.fechaGeneracion}`);
    } else {
      console.log('❌ ERROR generando paz y salvo:', resultado.message);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log('❌ ERROR en integración Google Docs:', error.message);
    return false;
  }
}

async function testCompleteIntegration() {
  console.log('🚀 INICIANDO PRUEBAS DE INTEGRACIÓN GOOGLE APIS');
  console.log('===============================================');
  
  // Verificar variables de entorno
  console.log('\n🔧 Verificando configuración...');
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && 
      (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY)) {
    console.log('❌ ERROR: Faltan credenciales de Google');
    console.log('   Configura GOOGLE_APPLICATION_CREDENTIALS o GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY');
    return;
  }
  console.log('✅ Credenciales de Google configuradas');
  
  // Ejecutar pruebas
  const sheetsOk = await testGoogleSheetsIntegration();
  const docsOk = await testGoogleDocsIntegration();
  
  // Resumen
  console.log('\n📊 RESUMEN DE PRUEBAS');
  console.log('=====================');
  console.log(`Google Sheets: ${sheetsOk ? '✅ OK' : '❌ ERROR'}`);
  console.log(`Google Docs: ${docsOk ? '✅ OK' : '❌ ERROR'}`);
  
  if (sheetsOk && docsOk) {
    console.log('\n🎉 ¡INTEGRACIÓN COMPLETA EXITOSA!');
    console.log('El sistema está listo para usar con Google APIs reales');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron');
    console.log('Revisa la configuración y las URLs de prueba');
  }
  
  // Limpiar archivos temporales
  console.log('\n🧹 Limpiando archivos temporales...');
  const cleaned = await googleDocsService.limpiarArchivosTemporales();
  console.log(`✅ ${cleaned} archivos temporales eliminados`);
}

// Ejecutar pruebas si se llama directamente
if (require.main === module) {
  testCompleteIntegration()
    .then(() => {
      console.log('\n✅ Pruebas completadas');
      process.exit(0);
    })
    .catch((error) => {
      console.log('\n❌ Error en pruebas:', error.message);
      process.exit(1);
    });
}

module.exports = {
  testGoogleSheetsIntegration,
  testGoogleDocsIntegration,
  testCompleteIntegration
};
