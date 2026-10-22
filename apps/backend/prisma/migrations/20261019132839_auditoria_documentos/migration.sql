-- CreateEnum
CREATE TYPE "AccionDocumento" AS ENUM ('VER', 'VERIFICAR');

-- CreateEnum
CREATE TYPE "RecursoDocumento" AS ENUM ('PROPIEDAD_DOC', 'USUARIO_DOC');

-- AlterTable
ALTER TABLE "DocumentoPropiedad" ADD COLUMN     "verificadoAt" TIMESTAMP(3),
ADD COLUMN     "verificadoPorId" TEXT;

-- CreateTable
CREATE TABLE "AccesoDocumento" (
    "id" TEXT NOT NULL,
    "accion" "AccionDocumento" NOT NULL,
    "recursoTipo" "RecursoDocumento" NOT NULL,
    "recursoId" TEXT NOT NULL,
    "documento" TEXT,
    "usuarioId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccesoDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccesoDocumento_recursoTipo_recursoId_idx" ON "AccesoDocumento"("recursoTipo", "recursoId");

-- CreateIndex
CREATE INDEX "AccesoDocumento_usuarioId_createAt_idx" ON "AccesoDocumento"("usuarioId", "createAt");
