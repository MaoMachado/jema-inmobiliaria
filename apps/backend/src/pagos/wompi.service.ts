import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PagosService } from './pagos.service';
import { EventWompi, TransactionWompi, WompiClient } from './wompi.client';
import { EstadoPago, Plan } from '../generated/prisma';

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pagos: PagosService,
    private readonly wompi: WompiClient,
  ) {}

  async iniciarPagoNequi(plan: Plan, telefono: string, userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { email: true, celular: true },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const pago = await this.pagos.crearPagoPasarela(userId, plan);

    const celular = (telefono || usuario.celular || '')
      .replace(/\D/g, '')
      .slice(-10);

    let transaccion: TransactionWompi;

    try {
      transaccion = await this.wompi.crearTransaccionNequi({
        referencia: pago.id,
        montoCentavos: Math.round(pago.monto * 100),
        email: usuario.email,
        telefono: celular,
      });
    } catch (error) {
      // Si la pasarela falla liberamos el cupo de "pago pendiente".
      await this.pagos.marcarFallida(pago.id);
      throw error;
    }

    await this.pagos.guardarTransaccion(pago.id, transaccion.id);

    return { pagoId: pago.id, estado: pago.estado };
  }

  async procesarEvento(evento: EventWompi): Promise<'aplicado' | 'ignorado'> {
    if (!this.wompi.eventoAutentico(evento)) {
      throw new UnauthorizedException('Evento de Wompi no auténtico');
    }

    if (evento.event !== 'transaction.updated') return 'ignorado';

    const transaccion = await this.wompi.consultarTransaccion(
      evento.data.transaction.id,
    );

    const pago = await this.prisma.pago.findUnique({
      where: { transaccionId: transaccion.id },
    });

    if (!pago) {
      this.logger.warn(
        `Evento para transacción desconocida: ${transaccion.id}`,
      );
      return 'ignorado';
    }

    const montoCoincide =
      transaccion.reference === pago.id &&
      transaccion.amount_in_cents === Math.round(pago.monto * 100);

    if (!montoCoincide) {
      this.logger.error(
        `La transacción ${transaccion.id} no coincide con el pago ${pago.id}`,
      );
      return 'ignorado';
    }

    if (pago.estado !== EstadoPago.PENDIENTE) return 'ignorado';

    if (transaccion.status === 'APPROVED') {
      await this.pagos.cambiarEstado(pago.id, EstadoPago.APROBADO);
      this.logger.log(`Pago ${pago.id} aprobado por Wompi`);
      return 'aplicado';
    }

    const rechazados: TransactionWompi['status'][] = [
      'DECLINED',
      'VOIDED',
      'ERROR',
    ];

    if (rechazados.includes(transaccion.status)) {
      await this.pagos.cambiarEstado(pago.id, EstadoPago.RECHAZADO);
      return 'aplicado';
    }

    return 'ignorado';
  }
}
