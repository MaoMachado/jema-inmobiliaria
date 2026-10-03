import {
  BadGatewayException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { IaService } from './ia.service';

describe('IaService', () => {
  let service: IaService;
  let prisma: any;
  let mockGenAI: any;

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.APP_TIMEZONE = 'America/Bogota';

    prisma = {
      usuario: {
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      propiedad: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IaService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<IaService>(IaService);

    mockGenAI = {
      models: {
        generateContent: jest.fn(),
      },
    };
    (service as any).genAI = mockGenAI;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    const userId = 'user-123';
    const mensaje = 'Busco apartamento en Medellín';

    it('debe lanzar ForbiddenException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.chat(mensaje, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debe resetear contador a 1 si es un nuevo día', async () => {
      const ayer = new Date('2026-09-01T00:00:00.000Z');
      prisma.usuario.findUnique.mockResolvedValue({
        id: userId,
        chatIaLimite: 10,
        chatUsados: 5,
        chatFecha: ayer,
      });
      prisma.usuario.update.mockResolvedValue({});
      prisma.propiedad.findMany.mockResolvedValue([]);
      mockGenAI.models.generateContent.mockResolvedValue({
        text: 'Respuesta de asesor JEMA',
      });

      const res = await service.chat(mensaje, userId);

      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: expect.objectContaining({ chatUsados: 1 }),
        }),
      );
      expect(res).toBe('Respuesta de asesor JEMA');
    });

    it('debe lanzar ForbiddenException si supera el límite de consultas', async () => {
      const hoy = new Date();
      prisma.usuario.findUnique.mockResolvedValue({
        id: userId,
        chatIaLimite: 10,
        chatUsados: 10,
        chatFecha: hoy,
      });
      prisma.usuario.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.chat(mensaje, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debe incrementar chatUsados e invocar a Gemini exitosamente', async () => {
      const hoy = new Date();
      prisma.usuario.findUnique.mockResolvedValue({
        id: userId,
        chatIaLimite: 10,
        chatUsados: 2,
        chatFecha: hoy,
      });
      prisma.usuario.updateMany.mockResolvedValue({ count: 1 });
      prisma.propiedad.findMany.mockResolvedValue([
        {
          id: 'prop-1',
          titulo: 'Apto Poblado',
          precio: 450000000,
          ciudad: 'Medellin',
          barrio: 'El Poblado',
          tipo: 'APARTAMENTO',
          habitaciones: 3,
          area: 90,
          puntaje: 95,
        },
      ]);
      mockGenAI.models.generateContent.mockResolvedValue({
        text: 'Tenemos un apartamento en El Poblado por 450 millones.',
      });

      const res = await service.chat(mensaje, userId);

      expect(prisma.usuario.updateMany).toHaveBeenCalledWith({
        where: { id: userId, chatUsados: { lt: 10 } },
        data: { chatUsados: { increment: 1 } },
      });
      expect(mockGenAI.models.generateContent).toHaveBeenCalled();
      expect(res).toContain('apartamento en El Poblado');
    });

    it('debe revertir chatUsados y lanzar BadGatewayException si Gemini falla', async () => {
      const hoy = new Date();
      prisma.usuario.findUnique.mockResolvedValue({
        id: userId,
        chatIaLimite: 10,
        chatUsados: 2,
        chatFecha: hoy,
      });
      prisma.usuario.updateMany.mockResolvedValue({ count: 1 });
      prisma.propiedad.findMany.mockResolvedValue([]);
      prisma.usuario.update.mockResolvedValue({});
      mockGenAI.models.generateContent.mockRejectedValue(
        new Error('Gemini API Error'),
      );

      await expect(service.chat(mensaje, userId)).rejects.toThrow(
        BadGatewayException,
      );

      expect(prisma.usuario.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: userId },
          data: { chatUsados: { decrement: 1 } },
        }),
      );
    });
  });

  describe('estimacionPropiedad', () => {
    const propiedadId = 'prop-100';
    const userId = 'user-owner';

    it('debe lanzar NotFoundException si la propiedad no existe o es de otro usuario', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(null);

      await expect(
        service.estimacionPropiedad(propiedadId, userId),
      ).rejects.toThrow(NotFoundException);

      prisma.propiedad.findUnique.mockResolvedValue({
        id: propiedadId,
        publicadoPorId: 'otro-user',
      });

      await expect(
        service.estimacionPropiedad(propiedadId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe calcular métricas y retornar mensaje IA si todo es correcto', async () => {
      prisma.propiedad.findUnique.mockResolvedValue({
        id: propiedadId,
        publicadoPorId: userId,
        tipo: 'APARTAMENTO',
        ciudad: 'Bogota',
        precio: 350000000,
        area: 75,
        habitaciones: 2,
        puntaje: 80,
      });
      prisma.propiedad.findMany.mockResolvedValue([
        {
          id: 'prop-2',
          precio: 340000000,
          area: 70,
          habitaciones: 2,
          puntaje: 85,
        },
      ]);
      mockGenAI.models.generateContent.mockResolvedValue({
        text: 'La propiedad tiene un precio competitivo y alta probabilidad de venta.',
      });

      const resultado = await service.estimacionPropiedad(
        propiedadId,
        userId,
      );

      expect(resultado).toHaveProperty('valores');
      expect(resultado.valores).toHaveProperty('probabilidadVenta');
      expect(resultado.valores).toHaveProperty('canonEsperado');
      expect(resultado.mensajeIA).toBe(
        'La propiedad tiene un precio competitivo y alta probabilidad de venta.',
      );
    });

    it('debe retornar las métricas numéricas incluso si Gemini falla', async () => {
      prisma.propiedad.findUnique.mockResolvedValue({
        id: propiedadId,
        publicadoPorId: userId,
        tipo: 'APARTAMENTO',
        ciudad: 'Bogota',
        precio: 350000000,
        area: 75,
        habitaciones: 2,
        puntaje: 80,
      });
      prisma.propiedad.findMany.mockResolvedValue([]);
      mockGenAI.models.generateContent.mockRejectedValue(
        new Error('Gemini Down'),
      );

      const resultado = await service.estimacionPropiedad(
        propiedadId,
        userId,
      );

      expect(resultado.valores).toBeDefined();
      expect(resultado.mensajeIA).toBeNull();
    });
  });
});
