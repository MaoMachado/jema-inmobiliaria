import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SmsProviderFactory } from './sms-provider';

const COOLDOWN_MS = 60_000;
const EXPIRA_MS = 5 * 60_000;
const MAX_INTENTOS = 5;

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsProviderFactory: SmsProviderFactory,
  ) {}

  private hashCodigo(codigo: string): string {
    const pepper = process.env.OTP_PEPPER;
    if (!pepper) {
      throw new HttpException(
        'Error de configuración',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return createHash('sha256').update(`${pepper}:${codigo}`).digest('hex');
  }

  async solicitar(userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    if (!usuario.celular) {
      throw new HttpException(
        'Registrar tu celular primero',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (usuario.celularVerificado) {
      return { message: 'Tu celular ya está verificado' };
    }

    const celular = '+57' + usuario.celular.replace(/\D/g, '').slice(-10);

    const ultimo = await this.prisma.codigoOt.findFirst({
      where: { usuarioId: userId },
      orderBy: { createAt: 'desc' },
    });

    if (ultimo && Date.now() - ultimo.createAt.getTime() < COOLDOWN_MS) {
      const faltan = Math.ceil(
        (COOLDOWN_MS - (Date.now() - ultimo.createAt.getTime())) / 1000,
      );

      throw new HttpException(
        `Puedes solicitar otro código en ${faltan}s`,
        HttpStatus.BAD_REQUEST,
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

    const sms = this.smsProviderFactory.crear();
    try {
      await sms.enviarCodigo(celular, codigo);
    } catch (error) {
      await this.prisma.codigoOt.deleteMany({ where: { usuarioId: userId } });
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
      throw new HttpException(
        'Solicita un código primero',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (codigoOtp.expiraAt.getTime() < Date.now()) {
      throw new HttpException(
        'El codigo expiró. Solicita uno nuevo',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (codigoOtp.intentos >= MAX_INTENTOS) {
      throw new HttpException(
        'Demasiados intentos fallidos. Solicita otro codigo',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (codigoOtp.codigo !== this.hashCodigo(codigo)) {
      await this.prisma.codigoOt.update({
        where: { id: codigoOtp.id },
        data: { intentos: { increment: 1 } },
      });

      throw new HttpException('Código Incorrecto', HttpStatus.BAD_REQUEST);
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
}
