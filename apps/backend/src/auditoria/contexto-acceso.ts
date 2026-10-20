import { RequestWithUser } from '../common/types/request-with-user';

export interface ContextoAcceso {
  ip?: string;
  userAgent?: string;
}

export const contextoDe = (req: RequestWithUser): ContextoAcceso => ({
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});
