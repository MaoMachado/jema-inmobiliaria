import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import 'dotenv/config';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureApp } from './../src/configure-app';
import { PrismaService } from './../src/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const email = `e2e-${Date.now()}@test.com`;
  const password = 'password123';

  const cookiesDe = (res: { headers: Record<string, unknown> }): string[] =>
    (res.headers['set-cookie'] as string[] | undefined) ?? [];

  const refreshDe = (res: { headers: Record<string, unknown> }): string =>
    cookiesDe(res)
      .find((c) => c.startsWith('refresh_token='))!
      .split(';')[0];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.usuario.deleteMany({ where: { email } });
    await app.close();
  });

  it('registra, deja cookies httpOnly y autoriza /auth/me', async () => {
    const registro = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombres: 'E2E',
        apellidos: 'Test',
        celular: '3000000000',
        email,
        password,
      })
      .expect(201);

    expect(registro.body.user.password).toBeUndefined();

    const cookies = cookiesDe(registro);
    expect(cookies.some((c) => c.startsWith('access_token='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refresh_token='))).toBe(true);
    expect(cookies.every((c) => c.toLowerCase().includes('httponly'))).toBe(
      true,
    );

    const cookieHeader = cookies.map((c) => c.split(';')[0]).join('; ');

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookieHeader)
      .expect(200)
      .expect((res) => expect(res.body.email).toBe(email));

    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('rota el refresh y detecta el reuso revocando la familia', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const refreshViejo = refreshDe(login);

    const refresco = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshViejo)
      .expect(201);
    const refreshNuevo = refreshDe(refresco);
    expect(refreshNuevo).not.toBe(refreshViejo);

    // Reuso del token ya rotado.
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshViejo)
      .expect(401);

    // La familia quedó revocada: el token nuevo tampoco sirve.
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refreshNuevo)
      .expect(401);
  });

  it('logout revoca el refresh (ya no se puede renovar)', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);
    const refresh = refreshDe(login);

    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', refresh)
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', refresh)
      .expect(401);
  });

  it('rechaza mutaciones desde un Origin ajeno (CSRF)', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .set('Origin', 'http://evil.test')
      .send({ email, password })
      .expect(403);
  });
});
