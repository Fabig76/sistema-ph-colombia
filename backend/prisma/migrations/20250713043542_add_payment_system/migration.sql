/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `pagos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transactionId` to the `pagos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoPago" ADD VALUE 'APPROVED';
ALTER TYPE "EstadoPago" ADD VALUE 'DECLINED';
ALTER TYPE "EstadoPago" ADD VALUE 'PROCESSING';

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "administradorId" TEXT,
ADD COLUMN     "datosMock" JSONB,
ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "moneda" TEXT NOT NULL DEFAULT 'COP',
ADD COLUMN     "proveedor" TEXT NOT NULL DEFAULT 'mock',
ADD COLUMN     "transactionId" TEXT NOT NULL,
ALTER COLUMN "referencia" DROP NOT NULL;

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "copropiedadId" TEXT NOT NULL,
    "administradorId" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "activadaEn" TIMESTAMP(3),
    "expiraEn" TIMESTAMP(3),
    "ultimoPago" TIMESTAMP(3),
    "periodoGracia" INTEGER NOT NULL DEFAULT 7,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_copropiedadId_key" ON "subscriptions"("copropiedadId");

-- CreateIndex
CREATE UNIQUE INDEX "pagos_transactionId_key" ON "pagos"("transactionId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_administradorId_fkey" FOREIGN KEY ("administradorId") REFERENCES "administradores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_copropiedadId_fkey" FOREIGN KEY ("copropiedadId") REFERENCES "copropiedades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
