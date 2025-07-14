const fs = require('fs')
const path = require('path')

console.log('🔧 CORRIGIENDO RUTA DE GOOGLE CREDENTIALS')
console.log('========================================')

// Ruta actual donde está el archivo
const currentPath = path.resolve('./google-credentials.json')
console.log(`Archivo actual: ${currentPath}`)
console.log(`Existe: ${fs.existsSync(currentPath) ? '✅' : '❌'}`)

// Crear directorio /app/ si no existe  
const appDir = '/app'
if (!fs.existsSync(appDir)) {
  try {
    console.log(`Creando directorio ${appDir}...`)
    fs.mkdirSync(appDir, { recursive: true })
    console.log('✅ Directorio creado')
  } catch (error) {
    console.log(`❌ No se puede crear ${appDir}:`, error.message)
    console.log('📋 Solución alternativa: Actualizar .env con ruta correcta')
    console.log(`GOOGLE_APPLICATION_CREDENTIALS=${currentPath}`)
    process.exit(1)
  }
}

// Copiar archivo a /app/
const targetPath = '/app/google-credentials.json'
try {
  fs.copyFileSync(currentPath, targetPath)
  console.log(`✅ Archivo copiado a ${targetPath}`)
} catch (error) {
  console.log(`❌ Error copiando archivo:`, error.message)
  console.log('📋 Solución alternativa: Actualizar .env con ruta correcta')
  console.log(`GOOGLE_APPLICATION_CREDENTIALS=${currentPath}`)
}
