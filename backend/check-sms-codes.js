const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCodes() {
  try {
    const codes = await prisma.smsVerification.findMany({
      where: { telefono: '3234535890' },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    console.log(`📱 Códigos SMS para 3234535890 (${codes.length} encontrados):`);
    codes.forEach((code, index) => {
      const isExpired = new Date() > code.expiresAt;
      console.log(`${index + 1}. Código: ${code.codigo} | Usado: ${code.usado} | Expirado: ${isExpired} | Creado: ${code.createdAt.toLocaleString()}`);
    });
    
    // También verificar el usuario admin
    const admin = await prisma.administradorPh.findUnique({
      where: { telefono: '3234535890' }
    });
    
    console.log('\n👤 Admin encontrado:');
    console.log({
      id: admin?.id,
      nombre: admin?.nombre,
      telefono: admin?.telefono,
      verificado: admin?.verificado,
      activo: admin?.activo
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCodes();
