-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "planVence" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "referencia" TEXT;
