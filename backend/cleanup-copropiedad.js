const { PrismaClient } = require('@prisma/client');
const Redis = require('redis');

const prisma = new PrismaClient();

async function limpiarCopropiedades() {
  try {
    console.log('🧹 Iniciando limpieza de copropiedades...');
    
    // Listar copropiedades existentes
    const copropiedades = await prisma.copropiedad.findMany({
      select: {
        id: true,
        nit: true,
        nombre: true,
        createdAt: true
      }
    });
    
    console.log('\n📋 Copropiedades encontradas:');
    copropiedades.forEach((c, index) => {
      console.log(`${index + 1}. NIT: ${c.nit} | Nombre: ${c.nombre} | Fecha: ${c.createdAt}`);
    });
    
    if (copropiedades.length === 0) {
      console.log('✅ No hay copropiedades para eliminar');
      return;
    }
    
    // Eliminar eventos relacionados
    console.log('\n🗑️ Eliminando eventos relacionados...');
    const deletedEventos = await prisma.evento.deleteMany({
      where: {
        copropiedadId: {
          in: copropiedades.map(c => c.id)
        }
      }
    });
    console.log(`✅ ${deletedEventos.count} eventos eliminados`);
    
    // Eliminar copropiedades
    console.log('\n🗑️ Eliminando copropiedades...');
    const deletedCopropiedades = await prisma.copropiedad.deleteMany({});
    console.log(`✅ ${deletedCopropiedades.count} copropiedades eliminadas`);
    
    // Limpiar cache Redis
    console.log('\n🧽 Limpiando cache Redis...');
    try {
      const redis = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      
      await redis.connect();
      await redis.flushDb();
      console.log('✅ Cache Redis limpiado');
      await redis.disconnect();
    } catch (redisError) {
      console.log('⚠️ No se pudo limpiar Redis:', redisError.message);
    }
    
    console.log('\n🎉 ¡Limpieza completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarCopropiedades();
