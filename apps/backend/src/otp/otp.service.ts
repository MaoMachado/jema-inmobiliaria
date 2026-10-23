import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import twilio from 'twilio';
import { PrismaService } from '../prisma/prisma.service';

const COOLDOWN_MS = 60_000;
const EXPIRA_MS = 5 * 60_000;
const MAX_INTENTOS = 5;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private readonly prisma: PrismaService) {}

  private hashCodigo(codigo: string): string {
    const pepper = process.env.OTP_PEPPER;
    if (!pepper) {
      this.logger.error('Variable OTP_PEPPER no esta configurada');
      throw new InternalServerErrorException(
        'Error de configuración del servidor',
      );
    }

    return createHash('sha256').update(`${pepper}:${codigo}`).digest('hex');
  }

  private compararHash(hashGuardado: string, hashEntrante: string): boolean {
    try {
      const bufferGuardado = Buffer.from(hashGuardado, 'hex');
      const bufferEntrante = Buffer.from(hashEntrante, 'hex');

      if (bufferGuardado.length !== bufferEntrante.length) return false;

      return timingSafeEqual(bufferGuardado, bufferEntrante);
    } catch {
      return false;
    }
  }

  async solicitar(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (!usuario.celular) {
      throw new BadRequestException(
        'Debes registrar tu número celular primero',
      );
    }

    if (usuario.celularVerificado) {
      return { message: 'Tu celular ya está verificado' };
    }

    const digitos = usuario.celular.replace(/\D/g, '');
    if (digitos.length < 10) {
      throw new BadRequestException('Debes registrar un número celular válido');
    }

    const celular = '+57' + digitos.slice(-10);

    const ultimo = await this.prisma.codigoOt.findFirst({
      where: { usuarioId: userId },
      orderBy: { createAt: 'desc' },
    });

    if (ultimo && Date.now() - ultimo.createAt.getTime() < COOLDOWN_MS) {
      const faltan = Math.ceil(
        (COOLDOWN_MS - (Date.now() - ultimo.createAt.getTime())) / 1000,
      );

      throw new BadRequestException(
        `Puedes solicitar otro código en ${faltan}s`,
      );
    }

    const codigo = randomInt(0, 1_000_000).toString().padStart(6, '0');

    await this.prisma.codigoOt.deleteMany({ where: { usuarioId: userId } });
    await this.prisma.codigoOt.create({
      data: {
        usuarioId: userId,
        codigo: this.hashCodigo(codigo),
        expiraAt: new Date(Date.now() + EXPIRA_MS),
      },
    });

    try {
      await this.enviarSms(celular, codigo);
    } catch (error) {
      this.logger.error(
        `Error al enviar SMS para el usuario ${userId}:`,
        error,
      );
      throw error;
    }

    return { message: 'Código enviado a tu celular' };
  }

  async verificar(userId: string, codigo: string) {
    const codigoOtp = await this.prisma.codigoOt.findFirst({
      where: { usuarioId: userId, usado: false },
      orderBy: { createAt: 'desc' },
    });

    if (!codigoOtp) {
      throw new BadRequestException('Solicita un código primero');
    }

    if (codigoOtp.expiraAt.getTime() < Date.now()) {
      throw new BadRequestException('El codigo expiró. Solicita uno nuevo');
    }

    if (codigoOtp.intentos >= MAX_INTENTOS) {
      throw new HttpException(
        'Demasiados intentos fallidos. Solicita otro codigo',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hashEntrante = this.hashCodigo(codigo);
    if (!this.compararHash(codigoOtp.codigo, hashEntrante)) {
      await this.prisma.codigoOt.update({
        where: { id: codigoOtp.id },
        data: { intentos: { increment: 1 } },
      });

      throw new BadRequestException('Codigo Incorrecto');
    }

    await this.prisma.$transaction([
      this.prisma.codigoOt.update({
        where: { id: codigoOtp.id },
        data: { usado: true },
      }),

      this.prisma.codigoOt.deleteMany({
        where: { usuarioId: userId, id: { not: codigoOtp.id } },
      }),

      this.prisma.usuario.update({
        where: { id: userId },
        data: { celularVerificado: true },
      }),
    ]);

    return {
      message: 'Celular verificado exitosamente',
      celularVerificado: true,
    };
  }

  // Un solo proveedor real: Twilio si hay credenciales, si no solo log local.
  private async enviarSms(celular: string, codigo: string): Promise<void> {
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_TOKEN;
    const from = process.env.TWILIO_FROM;

    if (!sid || !token || !from) {
      this.logger.log(`[DEV] OTP para ${celular}: ${codigo}`);
      return;
    }

    try {
      await twilio(sid, token).messages.create({
        body: `Tu código OTP es: ${codigo}`,
        from,
        to: celular,
      });
    } catch (error) {
      this.logger.error('Error al enviar SMS con Twilio:', error);
      throw new Error('No se pudo enviar el SMS. Inténtalo de nuevo.');
    }
  }
}
