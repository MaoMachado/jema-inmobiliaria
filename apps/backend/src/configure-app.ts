import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export function configureApp(app: INestApplication): void {
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
