-- CreateEnum
CREATE TYPE "TipoCodigoSMS" AS ENUM ('REGISTRO', 'LOGIN', 'RECUPERACION', 'VERIFICACION');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('REGISTRO_ADMIN', 'LOGIN_ADMIN', 'REGISTRO_COPROPIEDAD', 'GENERACION_PAZ_Y_SALVO', 'PAGO', 'ERROR_SISTEMA', 'CAMBIO_CONFIGURACION');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'COMPLETADO', 'FALLIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "NivelLog" AS ENUM ('INFO', 'WARN', 'ERROR', 'DEBUG');

-- CreateTable
CREATE TABLE "admin_sistema" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "intentosFallidos" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoHasta" TIMESTAMP(3),

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "copropiedades" (
    "id" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "administradorId" TEXT NOT NULL,
    "hojaGoogleSheetsId" TEXT NOT NULL,
    "plantillaGoogleDocsId" TEXT NOT NULL,
    "resolucionNumero" TEXT,
    "resolucionFecha" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "periodoGratis" BOOLEAN NOT NULL DEFAULT true,
    "periodoGratisHasta" TIMESTAMP(3),

    CONSTRAINT "copropiedades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "codigos_sms" (
    "id" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoCodigoSMS" NOT NULL,
    "administradorId" TEXT,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "expiradoEn" TIMESTAMP(3) NOT NULL,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "codigos_sms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "copropiedadId" TEXT,
    "metadatos" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "copropiedadId" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "referencia" TEXT NOT NULL,
    "estado" "EstadoPago" NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "metodoPago" TEXT,
    "comprobante" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" TEXT NOT NULL,
    "nivel" "NivelLog" NOT NULL,
    "mensaje" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "metadatos" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_sistema_email_key" ON "admin_sistema"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_sistema_telefono_key" ON "admin_sistema"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_email_key" ON "administradores"("email");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_telefono_key" ON "administradores"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "copropiedades_nit_key" ON "copropiedades"("nit");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_referencia_key" ON "pagos"("referencia");

-- AddForeignKey
ALTER TABLE "copropiedades" ADD CONSTRAINT "copropiedades_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "codigos_sms" ADD CONSTRAINT "codigos_sms_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_copropiedadId_fkey" FOREIGN KEY ("copropiedadId") REFERENCES "copropiedades"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_copropiedadId_fkey" FOREIGN KEY ("copropiedadId") REFERENCES "copropiedades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
