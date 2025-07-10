/**
 * Script de inicialización de datos para desarrollo
 * Crea usuarios de prueba y datos iniciales
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

async function main() {
  console.log('Iniciando carga de datos de prueba...');

  // Crear administrador del sistema (superadmin)
  const adminSistemaPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  const adminSistema = await prisma.adminSistema.upsert({
    where: { email: 'admin@pazysalvosph.com' },
    update: {},
    create: {
      nombre: 'Administrador Sistema',
      email: 'admin@pazysalvosph.com',
      telefono: '+573001234567',
      password: adminSistemaPassword,
      activo: true
    }
  });
  
  console.log(`Administrador del sistema creado: ${adminSistema.email}`);

  // Crear administrador de prueba
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  const administrador = await prisma.administrador.upsert({
    where: { email: 'administrador@ejemplo.com' },
    update: {},
    create: {
      nombre: 'Juan Pérez',
      email: 'administrador@ejemplo.com',
      telefono: '+573002345678',
      password: adminPassword,
      activo: true
    }
  });
  
  console.log(`Administrador creado: ${administrador.email}`);

  // Crear copropiedad de prueba
  const fechaFinPrueba = new Date();
  fechaFinPrueba.setDate(fechaFinPrueba.getDate() + 60); // 60 días de prueba
  
  const copropiedad = await prisma.copropiedad.upsert({
    where: { nit: '900123456-7' },
    update: {},
    create: {
      nit: '900123456-7',
      nombre: 'Conjunto Residencial Ejemplo',
      administradorId: administrador.id,
      hojaGoogleSheetsId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
      plantillaGoogleDocsId: '1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
      resolucionNumero: '123-2023',
      resolucionFecha: new Date(),
      activo: true,
      periodoGratis: true,
      periodoGratisHasta: fechaFinPrueba
    }
  });
  
  console.log(`Copropiedad creada: ${copropiedad.nombre}`);

  // Crear algunos eventos de ejemplo
  await prisma.evento.createMany({
    data: [
      {
        tipo: 'REGISTRO_ADMIN',
        descripcion: 'Registro de administrador Juan Pérez',
        copropiedadId: null,
        createdAt: new Date(Date.now() - 86400000 * 5) // 5 días atrás
      },
      {
        tipo: 'REGISTRO_COPROPIEDAD',
        descripcion: `Registro de copropiedad ${copropiedad.nombre}`,
        copropiedadId: copropiedad.id,
        createdAt: new Date(Date.now() - 86400000 * 4) // 4 días atrás
      },
      {
        tipo: 'GENERACION_PAZ_Y_SALVO',
        descripcion: 'Generación de paz y salvo para Torre 1 - Apto 101',
        copropiedadId: copropiedad.id,
        createdAt: new Date(Date.now() - 86400000 * 2) // 2 días atrás
      },
      {
        tipo: 'GENERACION_PAZ_Y_SALVO',
        descripcion: 'Generación de paz y salvo para Torre 2 - Apto 202',
        copropiedadId: copropiedad.id,
        createdAt: new Date(Date.now() - 86400000 * 1) // 1 día atrás
      }
    ]
  });
  
  console.log('Eventos de ejemplo creados');

  // Crear algunos logs de ejemplo
  await prisma.log.createMany({
    data: [
      {
        nivel: 'INFO',
        mensaje: 'Servidor iniciado correctamente',
        origen: 'server',
        timestamp: new Date(Date.now() - 86400000 * 3) // 3 días atrás
      },
      {
        nivel: 'WARN',
        mensaje: 'Intento de acceso con credenciales incorrectas',
        origen: 'auth',
        metadatos: { ip: '192.168.1.100', intentos: 2 },
        timestamp: new Date(Date.now() - 86400000 * 2) // 2 días atrás
      },
      {
        nivel: 'ERROR',
        mensaje: 'Error al conectar con Google Sheets API',
        origen: 'google-sheets',
        metadatos: { error: 'Timeout' },
        timestamp: new Date(Date.now() - 86400000 * 1) // 1 día atrás
      }
    ]
  });
  
  console.log('Logs de ejemplo creados');

  console.log('Datos de prueba cargados correctamente');
}

main()
  .catch((e) => {
    console.error('Error al cargar datos de prueba:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
