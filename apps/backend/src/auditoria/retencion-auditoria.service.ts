import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

// Ley 1581: a los N meses el rastro de acceso pierde los datos personales
// (IP y user agent) y conserva lo que sirve como evidencia: quién, qué y cuándo.
@Injectable()
export class RetencionAuditoriaService {
  private readonly logger = new Logger(RetencionAuditoriaService.name);
  private readonly meses =
    Number(process.env.RETENCION_MESES_AUDIT ?? 24) || 24;

  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 4 1 * *')
  async anonimizarAccesos(): Promise<void> {
    const corte = new Date();
    corte.setMonth(corte.getMonth() - this.meses);

    const { count } = await this.prisma.accesoDocumento.updateMany({
      where: {
        createAt: { lt: corte },
        OR: [{ ip: { not: null } }, { userAgent: { not: null } }],
      },
      data: { ip: null, userAgent: null },
    });

    if (count > 0) {
      this.logger.log(
        `Anonimizados ${count} accesos anteriores a ${corte.toISOString()}`,
      );
    }
  }
}
