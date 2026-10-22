import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

// Si el dueño no corrigió ni volvió a enviar la propiedad en N días, sus
// documentos no tienen por qué seguir almacenados. La fila de la propiedad se
// conserva como registro del rechazo.
@Injectable()
export class RetencionDocumentosService {
  private readonly logger = new Logger(RetencionDocumentosService.name);
  private readonly dias =
    Number(process.env.RETENCION_DIAS_RECHAZO ?? 90) || 90;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  @Cron('0 3 * * *')
  async purgarRechazadas(): Promise<void> {
    const corte = new Date(Date.now() - this.dias * 24 * 60 * 60 * 1000);

    const propiedades = await this.prisma.propiedad.findMany({
      where: {
        estado: 'RECHAZADA',
        rechazadoAt: { lt: corte },
        // Con un reporte abierto los documentos son evidencia: no se tocan.
        reporteFraudes: { none: { estado: 'ABIERTO' } },
      },
      select: { id: true, documentos: { select: { url: true } } },
    });

    for (const propiedad of propiedades) {
      try {
        await this.storage.eliminarDocumentosPropiedad(
          propiedad.documentos.map((doc) => doc.url),
        );
        await this.prisma.documentoPropiedad.deleteMany({
          where: { propiedadId: propiedad.id },
        });
        this.logger.log(
          `Purgados ${propiedad.documentos.length} documentos de ${propiedad.id}`,
        );
      } catch (error) {
        this.logger.error(
          `No se pudieron purgar los documentos de ${propiedad.id}: ${String(error)}`,
        );
      }
    }
  }
}
