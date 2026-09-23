-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "chatFecha" TIMESTAMP(3),
ADD COLUMN     "chatUsados" INTEGER NOT NULL DEFAULT 0;
