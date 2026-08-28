-- CreateTable
CREATE TABLE "DocumentoPropiedad" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "propiedadId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoPropiedad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentoPropiedad" ADD CONSTRAINT "DocumentoPropiedad_propiedadId_fkey" FOREIGN KEY ("propiedadId") REFERENCES "Propiedad"("id") ON DELETE CASCADE ON UPDATE CASCADE;
