import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';

export function configureApp(app: NestExpressApplication): void {
  // Con proxy delante, sin esto el audit guarda la IP del proxy.
  // Sin proxy, confiar en X-Forwarded-For permite falsear la IP: por eso va por env.
  if (process.env.TRUST_PROXY === '1') {
    app.set('trust proxy', 1);
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const origenes = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origen) => origen.trim())
    .filter(Boolean);

  app.enableCors({ origin: origenes, credentials: true });

  // CSRF: las cookies van con SameSite=Lax; rechazamos mutaciones desde un Origin ajeno.
  // El webhook de Wompi es server-to-server y no lleva Origin: se excluye explícitamente.
  const RUTAS_PUBLICAS = ['/pagos/wompi/evento'];

  // CSRF
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
    if (RUTAS_PUBLICAS.includes(req.path)) return next();

    const origin = req.headers.origin;
    if (origin && !origenes.includes(origin)) {
      res.status(403).json({ message: 'Origen no permitido' });
      return;
    }

    next();
  });
}
