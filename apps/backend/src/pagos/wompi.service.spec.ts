import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { EstadoPago, Plan } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { PagosService } from './pagos.service';
import { EventWompi, WompiClient } from './wompi.client';
import { WompiService } from './wompi.service';

describe('WompiService', () => {
  let service: WompiService;
  let prisma: {
    usuario: { findUnique: jest.Mock };
    pago: { findUnique: jest.Mock };
  };
  let pagos: {
    crearPagoPasarela: jest.Mock;
    guardarTransaccion: jest.Mock;
    marcarFallida: jest.Mock;
    cambiarEstado: jest.Mock;
  };
  let wompi: {
    crearTransaccionNequi: jest.Mock;
    consultarTransaccion: jest.Mock;
    eventoAutentico: jest.Mock;
  };

  const evento = (status: string): EventWompi => ({
    event: 'transaction.updated',
    data: {
      transaction: {
        id: 'wompi-1',
        reference: 'pago-1',
        amount_in_cents: 1500000,
        status: status as EventWompi['data']['transaction']['status'],
      },
    },
    environment: 'test',
    signature: { properties: [], checksum: 'x' },
    timestamp: 1,
  });

  beforeEach(async () => {
    prisma = {
      usuario: { findUnique: jest.fn() },
      pago: { findUnique: jest.fn() },
    };

    pagos = {
      crearPagoPasarela: jest.fn(),
      guardarTransaccion: jest.fn(),
      marcarFallida: jest.fn(),
      cambiarEstado: jest.fn(),
    };

    wompi = {
      crearTransaccionNequi: jest.fn(),
      consultarTransaccion: jest.fn(),
      eventoAutentico: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        WompiService,
        { provide: PrismaService, useValue: prisma },
        { provide: PagosService, useValue: pagos },
        { provide: WompiClient, useValue: wompi },
      ],
    }).compile();

    service = module.get(WompiService);
  });

  describe('iniciarPagoNequi', () => {
    it('crea el pago con el monto del plan y guarda la transacción de Wompi', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        email: 'a@a.com',
        celular: null,
      });
      pagos.crearPagoPasarela.mockResolvedValue({
        id: 'pago-1',
        monto: 15000,
        estado: EstadoPago.PENDIENTE,
      });
      wompi.crearTransaccionNequi.mockResolvedValue({ id: 'wompi-1' });

      const resultado = await service.iniciarPagoNequi(
        Plan.BASICO,
        '3001234567',
        'user-1',
      );

      expect(resultado.pagoId).toBe('pago-1');
      expect(pagos.crearPagoPasarela).toHaveBeenCalledWith(
        'user-1',
        Plan.BASICO,
      );
      expect(wompi.crearTransaccionNequi).toHaveBeenCalledWith({
        referencia: 'pago-1',
        montoCentavos: 1500000,
        email: 'a@a.com',
        telefono: '3001234567',
      });
      expect(pagos.guardarTransaccion).toHaveBeenCalledWith(
        'pago-1',
        'wompi-1',
      );
    });

    it('si la pasarela falla, marca el pago como fallido para no bloquear al usuario', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        email: 'a@a.com',
        celular: null,
      });
      pagos.crearPagoPasarela.mockResolvedValue({
        id: 'pago-1',
        monto: 15000,
        estado: EstadoPago.PENDIENTE,
      });
      wompi.crearTransaccionNequi.mockRejectedValue(new Error('Wompi caído'));

      await expect(
        service.iniciarPagoNequi(Plan.BASICO, '3001234567', 'user-1'),
      ).rejects.toThrow('Wompi caído');
      expect(pagos.marcarFallida).toHaveBeenCalledWith('pago-1');
    });
  });

  describe('procesarEvento', () => {
    beforeEach(() => {
      wompi.eventoAutentico.mockReturnValue(true);
      wompi.consultarTransaccion.mockResolvedValue({
        id: 'wompi-1',
        reference: 'pago-1',
        amount_in_cents: 1500000,
        status: 'APPROVED',
      });
      prisma.pago.findUnique.mockResolvedValue({
        id: 'pago-1',
        usuarioId: 'user-1',
        monto: 15000,
        estado: EstadoPago.PENDIENTE,
      });
    });

    it('aplica el plan cuando Wompi aprueba el pago', async () => {
      await expect(service.procesarEvento(evento('APPROVED'))).resolves.toBe(
        'aplicado',
      );
      expect(pagos.cambiarEstado).toHaveBeenCalledWith(
        'pago-1',
        EstadoPago.APROBADO,
      );
    });

    it('rechaza el pago cuando la transacción es declinada', async () => {
      wompi.consultarTransaccion.mockResolvedValue({
        id: 'wompi-1',
        reference: 'pago-1',
        amount_in_cents: 1500000,
        status: 'DECLINED',
      });

      await service.procesarEvento(evento('DECLINED'));

      expect(pagos.cambiarEstado).toHaveBeenCalledWith(
        'pago-1',
        EstadoPago.RECHAZADO,
      );
    });

    it('ignora eventos con firma inválida', async () => {
      wompi.eventoAutentico.mockReturnValue(false);

      await expect(
        service.procesarEvento(evento('APPROVED')),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(pagos.cambiarEstado).not.toHaveBeenCalled();
    });

    it('ignora transacciones que no son de nuestro sistema', async () => {
      prisma.pago.findUnique.mockResolvedValue(null);

      await expect(service.procesarEvento(evento('APPROVED'))).resolves.toBe(
        'ignorado',
      );
      expect(pagos.cambiarEstado).not.toHaveBeenCalled();
    });

    it('ignora el evento si el monto no coincide con nuestro pago', async () => {
      wompi.consultarTransaccion.mockResolvedValue({
        id: 'wompi-1',
        reference: 'pago-1',
        amount_in_cents: 999999,
        status: 'APPROVED',
      });

      await expect(service.procesarEvento(evento('APPROVED'))).resolves.toBe(
        'ignorado',
      );
      expect(pagos.cambiarEstado).not.toHaveBeenCalled();
    });

    it('es idempotente: un segundo evento del mismo pago no vuelve a aplicar el plan', async () => {
      prisma.pago.findUnique.mockResolvedValue({
        id: 'pago-1',
        usuarioId: 'user-1',
        monto: 15000,
        estado: EstadoPago.APROBADO,
      });

      await expect(service.procesarEvento(evento('APPROVED'))).resolves.toBe(
        'ignorado',
      );
      expect(pagos.cambiarEstado).not.toHaveBeenCalled();
    });
  });
});
