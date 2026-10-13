import { CookieOptions, Request, Response } from 'express';

const ES_PROD = process.env.NODE_ENV === 'production';
const QUINCE_MIN = 15 * 60 * 1000;
const TREINTA_DIAS = 30 * 24 * 60 * 60 * 1000;

const base: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: ES_PROD,
};

export function setSession(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie('access_token', accessToken, {
    ...base,
    path: '/',
    maxAge: QUINCE_MIN,
  });

  res.cookie('refresh_token', refreshToken, {
    ...base,
    path: '/auth',
    maxAge: TREINTA_DIAS,
  });
}

export function clearSession(res: Response): void {
  res.clearCookie('access_token', {
    ...base,
    path: '/',
  });
  res.clearCookie('refresh_token', {
    ...base,
    path: '/auth',
  });
}

export function leerCookie(req: Request, nombre: string): string | undefined {
  const header = req.headers?.cookie;

  if (!header) return undefined;

  for (const parte of header.split(';')) {
    const [clave, ...valor] = parte.trim().split('=');
    if (clave === nombre) return decodeURIComponent(valor.join('='));
  }

  return undefined;
}
