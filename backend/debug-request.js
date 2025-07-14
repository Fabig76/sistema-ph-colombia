/**
 * Debug para capturar exactamente qué envía el frontend
 */

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: 'http://localhost:3002',
  credentials: true
}));

app.use(express.json());

// Interceptar la petición del frontend
app.post('/api/v1/administradores/copropiedades', (req, res) => {
  console.log('🔍 INTERCEPTANDO PETICIÓN DEL FRONTEND\n');
  
  console.log('📋 HEADERS:');
  console.log(JSON.stringify(req.headers, null, 2));
  
  console.log('\n📋 BODY:');
  console.log(JSON.stringify(req.body, null, 2));
  
  console.log('\n🔍 ANÁLISIS:');
  const { nit, nombre, hojaGoogleSheetsId } = req.body;
  console.log(`   NIT: "${nit}"`);
  console.log(`   Nombre: "${nombre}"`);
  console.log(`   URL: "${hojaGoogleSheetsId}"`);
  
  // Verificar si la URL es la esperada
  const expectedUrl = 'https://docs.google.com/spreadsheets/d/1tqpr569M1uHRm3WVsNCQlSfJp__-RoyVX8G35KRAVOA/edit?usp=drive_link';
  const urlMatch = hojaGoogleSheetsId === expectedUrl;
  console.log(`   URL Match: ${urlMatch ? '✅ SÍ' : '❌ NO'}`);
  
  if (!urlMatch) {
    console.log(`   Expected: "${expectedUrl}"`);
    console.log(`   Received: "${hojaGoogleSheetsId}"`);
  }
  
  // Simular respuesta exitosa para debug
  res.json({
    status: 'success',
    message: 'Petición interceptada para debug',
    data: req.body
  });
});

const PORT = 4001; // Puerto diferente para no interferir
app.listen(PORT, () => {
  console.log(`🔍 DEBUG SERVER corriendo en puerto ${PORT}`);
  console.log('👉 Cambia temporalmente el frontend para apuntar a puerto 4001');
});

module.exports = app;
