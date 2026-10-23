import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';

describe('OtpService', () => {
  let service: OtpService;
  let prisma: any;
  let enviarSms: jest.SpyInstance;

  beforeEach(async () => {
    process.env.OTP_PEPPER = 'test_pepper';

    prisma = {
      usuario: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      codigoOt: {
        findFirst: jest.fn(),
        deleteMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest
        .fn()
        .mockImplementation((actions) => Promise.all(actions)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<OtpService>(OtpService);

    // La lógica de envío real (twilio / log) se probó aislada: aquí solo
    // verificamos que solicitar le delega el envío.
    enviarSms = jest
      .spyOn(service as any, 'enviarSms')
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('solicitar', () => {
    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.solicitar('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si el celular no está registrado', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        celular: null,
      });

      await expect(service.solicitar('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el celular tiene formato inválido (< 10 dígitos)', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        celular: '12345',
        celularVerificado: false,
      });

      await expect(service.solicitar('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe indicar si el celular ya fue verificado', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        celular: '3001234567',
        celularVerificado: true,
      });

      const res = await service.solicitar('user-1');
      expect(res.message).toBe('Tu celular ya está verificado');
    });

    it('debe respetar el cooldown de 60 segundos', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        celular: '3001234567',
        celularVerificado: false,
      });
      prisma.codigoOt.findFirst.mockResolvedValue({
        createAt: new Date(Date.now() - 30_000), // Hace 30s
      });

      await expect(service.solicitar('user-1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe generar y enviar código con éxito', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        celular: '3001234567',
        celularVerificado: false,
      });
      prisma.codigoOt.findFirst.mockResolvedValue(null);

      const res = await service.solicitar('user-1');
      expect(res.message).toBe('Código enviado a tu celular');
      expect(prisma.codigoOt.create).toHaveBeenCalled();
      expect(enviarSms).toHaveBeenCalledWith(
        '+573001234567',
        expect.any(String),
      );
    });

    it('debe lanzar InternalServerErrorException si OTP_PEPPER no está definido', async () => {
      delete process.env.OTP_PEPPER;

      prisma.usuario.findUnique.mockResolvedValue({
        id: 'user-1',
        celular: '3001234567',
        celularVerificado: false,
      });
      prisma.codigoOt.findFirst.mockResolvedValue(null);

      await expect(service.solicitar('user-1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('verificar', () => {
    it('debe lanzar BadRequestException si no hay código solicitado', async () => {
      prisma.codigoOt.findFirst.mockResolvedValue(null);

      await expect(service.verificar('user-1', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar BadRequestException si el código expiró', async () => {
      prisma.codigoOt.findFirst.mockResolvedValue({
        expiraAt: new Date(Date.now() - 1000), // Expirado
        intentos: 0,
      });

      await expect(service.verificar('user-1', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar excepción si se excedieron los intentos máximos', async () => {
      prisma.codigoOt.findFirst.mockResolvedValue({
        expiraAt: new Date(Date.now() + 60_000),
        intentos: 5,
      });

      await expect(service.verificar('user-1', '123456')).rejects.toThrow(
        HttpException,
      );
    });

    it('debe incrementar intentos y lanzar BadRequestException si el código es incorrecto', async () => {
      const hashCorrecto = createHash('sha256')
        .update('test_pepper:999999')
        .digest('hex');

      prisma.codigoOt.findFirst.mockResolvedValue({
        id: 'otp-1',
        codigo: hashCorrecto,
        expiraAt: new Date(Date.now() + 60_000),
        intentos: 1,
      });

      await expect(service.verificar('user-1', '123456')).rejects.toThrow(
        BadRequestException,
      );
      expect(prisma.codigoOt.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: { intentos: { increment: 1 } },
      });
    });

    it('debe verificar exitosamente si el código coincide', async () => {
      const hashCorrecto = createHash('sha256')
        .update('test_pepper:123456')
        .digest('hex');

      prisma.codigoOt.findFirst.mockResolvedValue({
        id: 'otp-1',
        codigo: hashCorrecto,
        expiraAt: new Date(Date.now() + 60_000),
        intentos: 0,
      });

      const res = await service.verificar('user-1', '123456');
      expect(res.celularVerificado).toBe(true);
      expect(res.message).toBe('Celular verificado exitosamente');
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  describe('enviarSms (selección de proveedor)', () => {
    let loggerSpy: jest.SpyInstance;
    let serviceInternals: {
      logger: Logger;
      enviarSms: (celular: string, codigo: string) => Promise<void>;
    };

    beforeEach(() => {
      enviarSms.mockRestore();
      serviceInternals = service as unknown as {
        logger: Logger;
        enviarSms: (celular: string, codigo: string) => Promise<void>;
      };
      loggerSpy = jest
        .spyOn(serviceInternals.logger, 'log')
        .mockImplementation();
      process.env.TWILIO_SID = 'AC_test';
      process.env.TWILIO_TOKEN = 'token_test';
      process.env.TWILIO_FROM = '+15005550006';
    });

    afterEach(() => {
      delete process.env.TWILIO_SID;
      delete process.env.TWILIO_TOKEN;
      delete process.env.TWILIO_FROM;
      delete process.env.OTP_SMS_PROVIDER;
    });

    it('no debe enviar SMS por Twilio si OTP_SMS_PROVIDER=dev, aunque existan credenciales', async () => {
      process.env.OTP_SMS_PROVIDER = 'dev';

      await serviceInternals.enviarSms('+573001234567', '123456');

      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV] OTP para +573001234567: 123456',
      );
    });

    it('usa modo dev si faltan credenciales incluso con proveedor auto', async () => {
      process.env.OTP_SMS_PROVIDER = 'auto';
      delete process.env.TWILIO_TOKEN;

      await serviceInternals.enviarSms('+573001234567', '123456');

      expect(loggerSpy).toHaveBeenCalledWith(
        '[DEV] OTP para +573001234567: 123456',
      );
    });
  });
});
