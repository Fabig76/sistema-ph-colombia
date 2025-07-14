const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function eliminarKOA() {
  try {
    console.log('🗑️ Eliminando copropiedad KOA APARTAMENTOS...');
    
    // Buscar la copropiedad KOA
    const koa = await prisma.copropiedad.findFirst({
      where: {
        OR: [
          { nit: '901692134' },
          { nombre: { contains: 'KOA' } }
        ]
      }
    });
    
    if (!koa) {
      console.log('❌ No se encontró la copropiedad KOA');
      return;
    }
    
    console.log(`📋 Encontrada: ${koa.nombre} (NIT: ${koa.nit})`);
    
    // Eliminar eventos relacionados
    const deletedEventos = await prisma.evento.deleteMany({
      where: { copropiedadId: koa.id }
    });
    console.log(`✅ ${deletedEventos.count} eventos eliminados`);
    
    // Eliminar la copropiedad
    await prisma.copropiedad.delete({
      where: { id: koa.id }
    });
    console.log('✅ Copropiedad KOA eliminada correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

eliminarKOA();
