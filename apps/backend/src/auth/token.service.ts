import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const DIAS_REFRESH = 30;

@Injectable()
export class TokenService {
  constructor(private readonly prisma: PrismaService) {}

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async emitir(usuarioId: string): Promise<string> {
    const token = randomBytes(32).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        usuarioId,
        tokenHash: this.hash(token),
        expiraAt: new Date(Date.now() + DIAS_REFRESH * 86_400_000),
      },
    });

    return token;
  }

  async rotar(refreshToken: string) {
    const registro = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hash(refreshToken) },
    });

    if (!registro || registro.revocado || registro.expiraAt < new Date()) {
      if (registro?.usuarioId) await this.revocarTodas(registro.usuarioId);
      throw new UnauthorizedException('Sesión Expirada');
    }

    await this.prisma.refreshToken.update({
      where: { id: registro.id },
      data: { revocado: true },
    });

    return {
      usuarioId: registro.usuarioId,
      refreshToken: await this.emitir(registro.usuarioId),
    };
  }

  async revocar(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(refreshToken), revocado: false },
      data: { revocado: true },
    });
  }

  async revocarTodas(usuarioId: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.refreshToken.updateMany({
        where: { usuarioId, revocado: false },
        data: { revocado: true },
      }),

      this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { tokenVersion: { increment: 1 } },
      }),
    ]);
  }
}
