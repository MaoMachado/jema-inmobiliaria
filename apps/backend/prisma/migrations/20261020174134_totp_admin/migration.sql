-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "totpActivado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "totpSecret" TEXT;
