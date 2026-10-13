import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EstadoPago, Plan } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PagosService } from './pagos.service';

describe('PagosService', () => {
  let service: PagosService;
  let prisma: {
    usuario: { findUnique: jest.Mock; update: jest.Mock };
    pago: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      usuario: { findUnique: jest.fn(), update: jest.fn() },
      pago: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        PagosService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: {} },
      ],
    }).compile();

    service = module.get(PagosService);
  });

  describe('solicitarPago', () => {
    beforeEach(() => {
      prisma.usuario.findUnique.mockResolvedValue({ id: 'user-1' });
      prisma.pago.findFirst.mockResolvedValue(null);
    });

    it('acepta la referencia de Nequi sin comprobante', async () => {
      await service.solicitarPago(
        { monto: 15000, plan: Plan.BASICO, referencia: ' 482913 ' },
        'user-1',
      );

      expect(prisma.pago.create).toHaveBeenCalledWith({
        data: {
          usuarioId: 'user-1',
          monto: 15000,
          plan: Plan.BASICO,
          comprobante: null,
          referencia: '482913',
          estado: EstadoPago.PENDIENTE,
        },
      });
    });

    it('rechaza la solicitud sin referencia y sin comprobante', async () => {
      await expect(
        service.solicitarPago({ monto: 15000, plan: Plan.BASICO }, 'user-1'),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rechaza un monto que no coincide con el plan', async () => {
      await expect(
        service.solicitarPago(
          { monto: 1000, plan: Plan.BASICO, referencia: '482913' },
          'user-1',
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('cambiarEstado', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2026-10-10T12:00:00.000Z'));

      prisma.pago.findUnique.mockResolvedValue({
        id: 'pago-1',
        usuarioId: 'user-1',
        plan: Plan.BASICO,
        estado: EstadoPago.PENDIENTE,
      });
      prisma.usuario.update.mockResolvedValue({});
      prisma.pago.update.mockResolvedValue({});
      prisma.$transaction.mockResolvedValue([
        {},
        { id: 'pago-1', estado: EstadoPago.APROBADO },
      ]);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('al aprobar fija el vencimiento a 30 días y confirma plan y pago juntos', async () => {
      const pago = await service.cambiarEstado('pago-1', EstadoPago.APROBADO);
      expect(pago.estado).toBe(EstadoPago.APROBADO);

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          plan: Plan.BASICO,
          propiedadesLimite: 15,
          chatIaLimite: 20,
          chatUsados: 0,
          chatFecha: new Date('2026-10-10T12:00:00.000Z'),
          planVence: new Date('2026-11-09T12:00:00.000Z'),
        },
      });

      expect(prisma.pago.update).toHaveBeenCalledWith({
        where: { id: 'pago-1' },
        data: { estado: EstadoPago.APROBADO },
      });

      // Ambas escrituras van dentro de la misma transacción.
      expect(prisma.$transaction).toHaveBeenCalledWith([
        expect.anything(),
        expect.anything(),
      ]);
    });

    it('no reprocesa un pago ya resuelto', async () => {
      prisma.pago.findUnique.mockResolvedValue({
        id: 'pago-1',
        usuarioId: 'user-1',
        plan: Plan.BASICO,
        estado: EstadoPago.APROBADO,
      });

      await expect(
        service.cambiarEstado('pago-1', EstadoPago.APROBADO),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('al rechazar solo cambia el estado del pago', async () => {
      await service.cambiarEstado('pago-1', EstadoPago.RECHAZADO);

      expect(prisma.usuario.update).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
      expect(prisma.pago.update).toHaveBeenCalledWith({
        where: { id: 'pago-1' },
        data: { estado: EstadoPago.RECHAZADO },
      });
    });
  });

  describe('planActualUsuario', () => {
    it('devuelve la fecha de vencimiento del plan', async () => {
      const vence = new Date('2026-11-10T00:00:00.000Z');
      prisma.usuario.findUnique.mockResolvedValue({
        plan: Plan.BASICO,
        propiedadesLimite: 15,
        chatIaLimite: 20,
        planVence: vence,
      });

      const plan = await service.planActualUsuario('user-1');
      expect(plan.planVence).toBe(vence);
    });
  });
});
