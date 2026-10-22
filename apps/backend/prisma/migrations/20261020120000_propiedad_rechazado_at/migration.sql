-- AlterTable
ALTER TABLE "Propiedad" ADD COLUMN "rechazadoAt" TIMESTAMP(3);

-- Backfill: las propiedades rechazadas antes de esta columna no tienen fecha
-- exacta del rechazo; se usa su última actualización.
UPDATE "Propiedad" SET "rechazadoAt" = "updatedAt" WHERE "estado" = 'RECHAZADA';
