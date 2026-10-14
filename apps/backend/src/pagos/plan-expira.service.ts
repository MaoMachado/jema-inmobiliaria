import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Plan } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { PLANES } from './planes';

const INTERVALO_MS = 60 * 60 * 1000;

@Injectable()
export class PlanExpiraService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlanExpiraService.name);
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    void this.bajarPlanesVencidos();
    this.timer = setInterval(
      () => void this.bajarPlanesVencidos(),
      INTERVALO_MS,
    );
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async bajarPlanesVencidos(ahora = new Date()): Promise<number> {
    const { count } = await this.prisma.usuario.updateMany({
      where: {
        plan: { not: Plan.GRATIS },
        planVence: { lt: ahora },
      },
      data: {
        plan: Plan.GRATIS,
        propiedadesLimite: PLANES.GRATIS.propiedades,
        chatIaLimite: PLANES.GRATIS.chatDiario,
        planVence: null,
      },
    });

    if (count > 0) {
      this.logger.log(`${count} plan(es) vencido(s) devueltos a GRATIS`);
    }

    return count;
  }
}
