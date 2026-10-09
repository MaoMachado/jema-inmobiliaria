import { INestApplication, ValidationPipe } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/** Configuración HTTP compartida por main.ts y los tests e2e. */
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
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const origin = req.headers.origin;
    if (origin && !origenes.includes(origin)) {
      res.status(403).json({ message: 'Origen no permitido' });
      return;
    }

    next();
  });
}
