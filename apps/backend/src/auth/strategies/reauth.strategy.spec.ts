import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { Role } from '../../generated/prisma';
import type { RequestWithUser } from '../../common/types/request-with-user';
import { ReauthStrategy } from './reauth.strategy';

describe('ReauthStrategy', () => {
  let strategy: ReauthStrategy;

  const usuario: RequestWithUser['user'] = {
    id: 'admin-1',
    email: 'admin@test.com',
    role: Role.ADMIN,
  };

  const req = { user: usuario } as unknown as Request;

  beforeAll(() => {
    process.env.JWT_SECRET ??= 'test-secret';
  });

  beforeEach(() => {
    strategy = new ReauthStrategy();
  });

  it('acepta el token de documentos del mismo usuario', () => {
    expect(
      strategy.validate(req, { sub: usuario.id, scope: 'documentos' }),
    ).toBe(usuario);
  });

  it('rechaza un token con otro alcance', () => {
    expect(() =>
      strategy.validate(req, { sub: usuario.id, scope: 'sesion' }),
    ).toThrow(UnauthorizedException);
  });

  it('rechaza el token de otro usuario', () => {
    expect(() =>
      strategy.validate(req, { sub: 'otro-admin', scope: 'documentos' }),
    ).toThrow(UnauthorizedException);
  });
});
