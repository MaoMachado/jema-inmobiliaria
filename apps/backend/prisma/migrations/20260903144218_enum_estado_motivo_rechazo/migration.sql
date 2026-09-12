-- CreateEnum
CREATE TYPE "EstadoPropiedad" AS ENUM ('PENDIENTE', 'APROBADA', 'RECHAZADA');

-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "estado" "EstadoPropiedad" NOT NULL DEFAULT 'PENDIENTE',
ADD COLUMN     "motivoRechazo" TEXT;