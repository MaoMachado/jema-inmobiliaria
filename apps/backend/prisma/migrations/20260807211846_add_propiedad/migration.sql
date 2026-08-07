/*
  Warnings:

  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Propiedad" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "ciudad" TEXT NOT NULL,
    "barrio" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "habitaciones" INTEGER NOT NULL,
    "banos" INTEGER NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "publicadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propiedad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Propiedad" ADD CONSTRAINT "Propiedad_publicadoPorId_fkey" FOREIGN KEY ("publicadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
