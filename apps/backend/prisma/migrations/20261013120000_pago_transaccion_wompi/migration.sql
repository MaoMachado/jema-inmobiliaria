-- AlterTable
ALTER TABLE "Pago" ADD COLUMN     "transaccionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Pago_transaccionId_key" ON "Pago"("transaccionId");
