/**
 * Script de inicialización de datos de autenticación para pruebas
 * Crea usuarios de prueba para cada rol del sistema
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('🔐 Iniciando carga de datos de autenticación para pruebas...');

  try {
    // Crear administrador del sistema (superadmin)
    const superadminPassword = await bcrypt.hash('superadmin123', SALT_ROUNDS);
    const superadmin = await prisma.adminSistema.upsert({
      where: { email: 'superadmin@pazysalvosph.com' },
      update: {},
      create: {
        nombre: 'Super Administrador',
        email: 'superadmin@pazysalvosph.com',
        telefono: '+573001111111',
        password: superadminPassword,
        activo: true
      }
    });
    
    console.log(`✅ Superadmin creado: ${superadmin.email}`);

    // Crear administradores de prueba
    const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
    
    const admin1 = await prisma.administrador.upsert({
      where: { email: 'admin1@ejemplo.com' },
      update: {},
      create: {
        nombre: 'Administrador Uno',
        email: 'admin1@ejemplo.com',
        telefono: '+573002222222',
        password: adminPassword,
        activo: true
      }
    });
    
    const admin2 = await prisma.administrador.upsert({
      where: { email: 'admin2@ejemplo.com' },
      update: {},
      create: {
        nombre: 'Administrador Dos',
        email: 'admin2@ejemplo.com',
        telefono: '+573003333333',
        password: adminPassword,
        activo: true
      }
    });
    
    console.log(`✅ Administradores creados: ${admin1.email}, ${admin2.email}`);

    // Crear copropiedades de prueba
    const fechaFinPrueba = new Date();
    fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 60); // 60 días de prueba
    
    const copropiedad1 = await prisma.copropiedad.upsert({
      where: { nit: '900111222-3' },
      update: {},
      create: {
        nit: '900111222-3',
        nombre: 'Conjunto Residencial Los Pinos',
        administradorId: admin1.id,
        hojaGoogleSheetsId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ1',
        plantillaGoogleDocsId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ1',
        resolucionNumero: '123-2023',
        resolucionFecha: new Date(),
        activo: true,
        periodoGratis: true,
        periodoGratisHasta: fechaFinPrueba
      }
    });
    
    const copropiedad2 = await prisma.copropiedad.upsert({
      where: { nit: '900444555-6' },
      update: {},
      create: {
        nit: '900444555-6',
        nombre: 'Edificio El Mirador',
        administradorId: admin2.id,
        hojaGoogleSheetsId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ2',
        plantillaGoogleDocsId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ2',
        resolucionNumero: '456-2023',
        resolucionFecha: new Date(),
        activo: true,
        periodoGratis: false,
        periodoGratisHasta: null
      }
    });
    
    console.log(`✅ Copropiedades creadas: ${copropiedad1.nombre}, ${copropiedad2.nombre}`);

    // Crear códigos SMS de prueba
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 5); // 5 minutos
    
    await prisma.codigoSMS.createMany({
      data: [
        {
          telefono: '+573002222222',
          codigo: '123456',
          tipo: 'VERIFICACION',
          administradorId: admin1.id,
          usado: false,
          expiradoEn: fechaExpiracion,
          intentos: 0
        },
        {
          telefono: '+573003333333',
          codigo: '654321',
          tipo: 'VERIFICACION',
          administradorId: admin2.id,
          usado: false,
          expiradoEn: fechaExpiracion,
          intentos: 0
        }
      ]
    });
    
    console.log('✅ Códigos SMS de prueba creados');

    console.log('🎉 Datos de autenticación cargados correctamente');
    console.log('\n📝 Credenciales para pruebas:');
    console.log('--------------------------------');
    console.log('Superadmin:');
    console.log('  Email: superadmin@pazysalvosph.com');
    console.log('  Contraseña: superadmin123');
    console.log('  Teléfono: +573001111111');
    console.log('\nAdministrador 1:');
    console.log('  Email: admin1@ejemplo.com');
    console.log('  Contraseña: admin123');
    console.log('  Teléfono: +573002222222');
    console.log('  Código SMS: 123456');
    console.log('\nAdministrador 2:');
    console.log('  Email: admin2@ejemplo.com');
    console.log('  Contraseña: admin123');
    console.log('  Teléfono: +573003333333');
    console.log('  Código SMS: 654321');
    console.log('--------------------------------');
  } catch (error) {
    console.error('❌ Error al cargar datos de autenticación:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
