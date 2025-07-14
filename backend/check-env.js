require('dotenv').config()

console.log('🔍 VERIFICANDO VARIABLES DE ENTORNO GOOGLE API')
console.log('===========================================')
console.log(`GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS || 'NO CONFIGURADO'}`)
console.log(`GOOGLE_CLIENT_EMAIL: ${process.env.GOOGLE_CLIENT_EMAIL ? 'CONFIGURADO' : 'NO CONFIGURADO'}`)
console.log(`GOOGLE_PRIVATE_KEY: ${process.env.GOOGLE_PRIVATE_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO'}`)

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const fs = require('fs')
  const path = require('path')
  const fullPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  console.log(`\n📁 Verificando archivo de credenciales:`)
  console.log(`Ruta completa: ${fullPath}`)
  console.log(`Archivo existe: ${fs.existsSync(fullPath) ? '✅ SÍ' : '❌ NO'}`)
}
