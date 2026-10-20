import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from '../../common/types/request-with-user';

@Injectable()
export class ReauthGuard extends AuthGuard('reauth') {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    // El dueño consulta sus propios documentos: no necesita doble control.
    if (req.user?.role !== 'ADMIN') return true;

    return super.canActivate(context);
  }

  handleRequest<TUser>(err: unknown, user: TUser | false): TUser {
    if (err || !user) {
      // Este prefijo es el que el frontend usa para abrir el modal.
      throw new ForbiddenException(
        'REAUTH_REQUIRED: confirma tu contraseña para ver documentos',
      );
    }

    return user;
  }
}
