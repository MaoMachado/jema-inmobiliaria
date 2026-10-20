import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '../../generated/prisma';
import type { RequestWithUser } from '../../common/types/request-with-user';
import { ReauthGuard } from './reauth.guard';

describe('ReauthGuard', () => {
  let guard: ReauthGuard;

  const contexto = (user: RequestWithUser['user']): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as unknown as ExecutionContext;

  const usuario = (role: Role): RequestWithUser['user'] => ({
    id: 'usr-1',
    email: 'usr@test.com',
    role,
  });

  beforeEach(() => {
    guard = new ReauthGuard();
  });

  it('deja pasar al dueño sin elevar la sesión', () => {
    expect(guard.canActivate(contexto(usuario(Role.USER)))).toBe(true);
  });

  it('exige elevación al admin', () => {
    const delegado = jest
      .spyOn(Object.getPrototypeOf(ReauthGuard.prototype), 'canActivate')
      .mockReturnValue(true);

    expect(guard.canActivate(contexto(usuario(Role.ADMIN)))).toBe(true);

    delegado.mockRestore();
  });

  it('responde 403 con el prefijo que abre el modal', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(ForbiddenException);
    expect(() => guard.handleRequest(null, false)).toThrow(/REAUTH_REQUIRED/);
  });
});
