/*
  Warnings:

  - Added the required column `antiguedad` to the `Propiedad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `direccion` to the `Propiedad` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estrato` to the `Propiedad` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "antiguedad" INTEGER NOT NULL,
ADD COLUMN     "direccion" TEXT NOT NULL,
ADD COLUMN     "estrato" INTEGER NOT NULL,
ADD COLUMN     "fotografias" TEXT[],
ADD COLUMN     "parqueaderos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "puntaje" INTEGER,
ADD COLUMN     "ubicacionLat" DOUBLE PRECISION,
ADD COLUMN     "ubicacionLong" DOUBLE PRECISION,
ADD COLUMN     "video" TEXT;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "celularVerificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "documentoUrl" TEXT,
ADD COLUMN     "documentoVerificado" BOOLEAN NOT NULL DEFAULT false;
