const fs = require('fs')
const path = require('path')

console.log('🔧 CORRIGIENDO RUTA GOOGLE_APPLICATION_CREDENTIALS EN .env')
console.log('=====================================================')

const envPath = '.env'
const correctPath = '/Users/imac/Paz y salvos ph/sistema-ph-colombia/backend/google-credentials.json'

try {
  // Leer archivo .env
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  // Mostrar línea actual
  const lines = envContent.split('\n')
  const googleCredLine = lines.find(line => line.includes('GOOGLE_APPLICATION_CREDENTIALS'))
  console.log('📋 Línea actual:')
  console.log(`   ${googleCredLine}`)
  
  // Reemplazar la línea incorrecta
  const newContent = envContent.replace(
    /GOOGLE_APPLICATION_CREDENTIALS=.*$/m,
    `GOOGLE_APPLICATION_CREDENTIALS=${correctPath}`
  )
  
  // Escribir el archivo corregido
  fs.writeFileSync(envPath, newContent)
  
  console.log('\n✅ Archivo .env actualizado exitosamente')
  console.log('📋 Nueva línea:')
  console.log(`   GOOGLE_APPLICATION_CREDENTIALS=${correctPath}`)
  
  console.log('\n🧪 Ejecutando test para verificar...')
  
} catch (error) {
  console.error('❌ Error:', error.message)
}
