/**
 * Script para limpiar completamente la base de datos
 * Elimina todos los registros de administradores y copropiedades
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function limpiarBaseDatos() {
  try {
    console.log('🧹 Iniciando limpieza de DATOS de la base de datos...');
    console.log('🔄 Manteniendo estructura de tablas, eliminando solo registros');

    // Eliminar en orden correcto (respetando foreign keys)
    
    // 1. Eliminar pagos (dependen de copropiedades)
    const pagosEliminados = await prisma.pago.deleteMany({});
    console.log(`🗑️  Pagos eliminados: ${pagosEliminados.count}`);

    // 2. Eliminar eventos (dependen de copropiedades)
    const eventosEliminados = await prisma.evento.deleteMany({});
    console.log(`🗑️  Eventos eliminados: ${eventosEliminados.count}`);

    // 3. Eliminar subscriptions (dependen de administradores)
    const subscriptionsEliminadas = await prisma.subscription.deleteMany({});
    console.log(`🗑️  Subscriptions eliminadas: ${subscriptionsEliminadas.count}`);

    // 4. Eliminar códigos SMS (dependen de administradores)
    const codigosEliminados = await prisma.codigoSMS.deleteMany({});
    console.log(`🗑️  Códigos SMS eliminados: ${codigosEliminados.count}`);

    // 5. Eliminar copropiedades (dependen de administradores)
    const copropiedadesEliminadas = await prisma.copropiedad.deleteMany({});
    console.log(`🗑️  Copropiedades eliminadas: ${copropiedadesEliminadas.count}`);

    // 6. Eliminar administradores
    const administradoresEliminados = await prisma.administrador.deleteMany({});
    console.log(`🗑️  Administradores eliminados: ${administradoresEliminados.count}`);

    // 7. Eliminar admin sistema (independiente)
    const adminSistemaEliminados = await prisma.adminSistema.deleteMany({});
    console.log(`🗑️  Admin Sistema eliminados: ${adminSistemaEliminados.count}`);

    // Verificar conteos finales
    console.log('\n📊 Estado final de registros:');
    const counts = {
      pagos: await prisma.pago.count(),
      eventos: await prisma.evento.count(),
      subscriptions: await prisma.subscription.count(),
      codigosSMS: await prisma.codigoSMS.count(),
      copropiedades: await prisma.copropiedad.count(),
      administradores: await prisma.administrador.count(),
      adminSistema: await prisma.adminSistema.count()
    };

    Object.entries(counts).forEach(([tabla, count]) => {
      console.log(`- ${tabla}: ${count}`);
    });

    const totalRegistros = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    if (totalRegistros === 0) {
      console.log('\n✅ Todos los registros eliminados exitosamente');
      console.log('🎯 Base de datos vacía - Lista para el panel de admin sistema');
      console.log('💾 Estructura de tablas mantenida correctamente');
    } else {
      console.log(`\n⚠️  Advertencia: ${totalRegistros} registros no se eliminaron`);
    }

  } catch (error) {
    console.error('❌ Error al limpiar base de datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar limpieza
limpiarBaseDatos();
