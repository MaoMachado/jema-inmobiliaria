import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SolicitudPagoDto } from './dto/pagos.dto';
import { EstadoPago } from '../generated/prisma';
import { StorageService } from '../storage/storage.service';
import { PlanActual, PLANES, DIAS_PLAN } from './planes';

@Injectable()
export class PagosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async planActualUsuario(userId: string): Promise<PlanActual> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        propiedadesLimite: true,
        chatIaLimite: true,
        planVence: true,
      },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      plan: usuario.plan,
      propiedadesLimite: usuario.propiedadesLimite,
      chatIaLimite: usuario.chatIaLimite,
      beneficios: PLANES[usuario.plan],
      planVence: usuario.planVence,
    };
  }

  async subirComprobante(userId: string, file: Express.Multer.File) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const path = await this.storage.subirComprobantePago(file);

    return { path };
  }

  async solicitarPago(dto: SolicitudPagoDto, userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const precioEsperado = PLANES[dto.plan]?.precio;
    if (precioEsperado === undefined || dto.monto !== precioEsperado) {
      throw new BadRequestException('Monto inválido para el plan solicitado');
    }

    const pendiente = await this.prisma.pago.findFirst({
      where: { usuarioId: userId, estado: EstadoPago.PENDIENTE },
    });

    if (pendiente) {
      throw new BadRequestException('Ya tienes un pago pendiente de verificar');
    }

    const referencia = dto.referencia?.trim() || null;
    const comprobante = dto.comprobante?.trim() || null;

    if (!referencia && !comprobante) {
      throw new BadRequestException(
        'Ingresa la referencia del pago o adjunta el comprobante',
      );
    }

    return this.prisma.pago.create({
      data: {
        usuarioId: userId,
        monto: dto.monto,
        plan: dto.plan,
        comprobante,
        referencia,
        estado: EstadoPago.PENDIENTE,
      },
    });
  }

  async pagosUsuario(userId: string) {
    return this.prisma.pago.findMany({
      where: { usuarioId: userId },
      orderBy: { createAt: 'desc' },
    });
  }

  async listarPagos() {
    return this.prisma.pago.findMany({
      include: { usuario: { select: { email: true, nombres: true } } },
      orderBy: { createAt: 'desc' },
    });
  }

  async comprobanteUrl(pagoId: string) {
    const pago = await this.prisma.pago.findUnique({
      where: { id: pagoId },
    });

    if (!pago || !pago.comprobante) {
      throw new NotFoundException('Comprobante no encontrado');
    }

    return { url: await this.storage.getUrlComprobantePago(pago.comprobante) };
  }

  async cambiarEstado(id: string, estado: EstadoPago) {
    const pago = await this.prisma.pago.findUnique({ where: { id } });
    if (!pago) {
      throw new BadRequestException('Pago no encontrado');
    }

    if (pago.estado !== EstadoPago.PENDIENTE) {
      throw new BadRequestException(
        `Este pago ya fue ${pago.estado.toLowerCase()}`,
      );
    }

    if (estado === EstadoPago.RECHAZADO) {
      return this.prisma.pago.update({
        where: { id },
        data: { estado },
      });
    }

    const beneficios = PLANES[pago.plan];
    const planVence = new Date(Date.now() + DIAS_PLAN * 86_400_000);

    // El plan y el pago se confirman juntos: si algo falla, la suscripción
    // del usuario queda exactamente donde estaba.
    const [, pagoActualizado] = await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: pago.usuarioId },
        data: {
          plan: pago.plan,
          propiedadesLimite: beneficios.propiedades,
          chatIaLimite: beneficios.chatDiario,
          chatUsados: 0,
          chatFecha: new Date(),
          planVence,
        },
      }),

      this.prisma.pago.update({
        where: { id },
        data: { estado },
      }),
    ]);

    return pagoActualizado;
  }
}
