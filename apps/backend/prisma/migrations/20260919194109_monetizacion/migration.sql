-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('GRATIS', 'BASICO', 'PREMIUM');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN     "destacada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "destacadaHasta" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "chatIaLimite" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'GRATIS',
ADD COLUMN     "propiedadesLimite" INTEGER NOT NULL DEFAULT 5;

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "plan" "Plan" NOT NULL,
    "comprobante" TEXT,
    "estado" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
