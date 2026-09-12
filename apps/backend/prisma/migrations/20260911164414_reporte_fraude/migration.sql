-- CreateEnum
CREATE TYPE "EstadoReporte" AS ENUM ('ABIERTO', 'RESUELTO', 'IGNORADO');

-- CreateTable
CREATE TABLE "ReporteFraude" (
    "id" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "descripcion" TEXT,
    "estado" "EstadoReporte" NOT NULL DEFAULT 'ABIERTO',
    "usuarioId" TEXT NOT NULL,
    "propiedadId" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReporteFraude_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ReporteFraude" ADD CONSTRAINT "ReporteFraude_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReporteFraude" ADD CONSTRAINT "ReporteFraude_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
