/*
  Warnings:

  - Added the required column `apellidos` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "apellidos" TEXT NOT NULL,
ADD COLUMN     "celular" TEXT,
ADD COLUMN     "foto" TEXT,
ADD COLUMN     "nombres" TEXT NOT NULL,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
