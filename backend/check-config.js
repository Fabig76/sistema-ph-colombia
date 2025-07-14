require('dotenv').config();

console.log('=== VERIFICACIÓN DE CONFIGURACIÓN ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('REDIS_URL exists:', !!process.env.REDIS_URL);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

console.log('\n=== CONFIGURACIÓN DOCKER ===');
console.log('PostgreSQL debe estar en: localhost:5433');
console.log('Redis debe estar en: localhost:6379');

console.log('\n=== ESTADO DE VARIABLES ===');
console.log('Total variables cargadas desde .env:', Object.keys(process.env).filter(key => 
  process.env[key] && !process.env[key].includes('PATH') && !process.env[key].includes('/usr')
).length);
