import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { leerCookie } from '../cookies';
import type { RequestWithUser } from '../../common/types/request-with-user';

interface ReauthPayload {
  sub: string;
  scope: string;
}

@Injectable()
export class ReauthStrategy extends PassportStrategy(Strategy, 'reauth') {
  constructor() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET no esta definido');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => leerCookie(req, 'reauth_token') ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: ReauthPayload) {
    if (payload.scope !== 'documentos') {
      throw new UnauthorizedException('Reautenticación inválida');
    }

    const usuario = (req as RequestWithUser).user;

    // El token de elevación solo sirve para la sesión que lo pidió.
    if (!usuario || usuario.id !== payload.sub) {
      throw new UnauthorizedException('Reautenticación inválida');
    }

    return usuario;
  }
}
