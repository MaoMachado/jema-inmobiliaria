import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import { SmsProviderFactory } from './sms-provider';

describe('OtpService', () => {
  let service: OtpService;
  let prisma: any;
  let smsFactory: any;
  let mockSmsProvider: any;

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

    mockSmsProvider = {
      enviarCodigo: jest.fn().mockResolvedValue(undefined),
    };

    smsFactory = {
      crear: jest.fn().mockReturnValue(mockSmsProvider),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: PrismaService, useValue: prisma },
        { provide: SmsProviderFactory, useValue: smsFactory },
      ],
    }).compile();

    service = module.get<OtpService>(OtpService);
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
      expect(mockSmsProvider.enviarCodigo).toHaveBeenCalledWith(
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
});
