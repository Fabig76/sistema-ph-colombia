-- AlterTable
ALTER TABLE "administradores" ADD COLUMN     "fechaRegistro" TIMESTAMP(3),
ADD COLUMN     "verificado" BOOLEAN NOT NULL DEFAULT false;
