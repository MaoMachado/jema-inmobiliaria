import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { NextFunction, Request, Response } from 'express';

const ORIGENES = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ORIGENES,
    credentials: true,
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

    const origin = req.headers.origin;
    if (origin && !ORIGENES.includes(origin)) {
      res.status(403).json({ message: 'Origen no permitido' });
      return;
    }

    next();
  });

  await app.listen(process.env.PORT ?? 3001);
}

void bootstrap();
