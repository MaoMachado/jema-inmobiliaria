import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '../../generated/prisma';
import { PrismaService } from '../../prisma/prisma.service';
import { leerCookie } from '../cookies';

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
  tokenVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET no esta definido');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => leerCookie(req, 'access_token') ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),

      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.id || !payload.email || !payload.role) {
      throw new UnauthorizedException('Invalid Payload');
    }

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { tokenVersion: true },
    });

    if (!usuario || usuario.tokenVersion !== (payload.tokenVersion ?? 0)) {
      throw new UnauthorizedException('Sesión Revocada');
    }

    return { id: payload.id, email: payload.email, role: payload.role };
  }
}
