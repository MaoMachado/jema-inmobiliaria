import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { RetencionDocumentosService } from './retencion-documentos.service';

jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => undefined,
}));

describe('RetencionDocumentosService', () => {
  let service: RetencionDocumentosService;
  let prisma: {
    propiedad: { findMany: jest.Mock };
    documentoPropiedad: { deleteMany: jest.Mock };
  };
  let storage: { eliminarDocumentosPropiedad: jest.Mock };

  beforeEach(async () => {
    prisma = {
      propiedad: { findMany: jest.fn().mockResolvedValue([]) },
      documentoPropiedad: { deleteMany: jest.fn() },
    };
    storage = {
      eliminarDocumentosPropiedad: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetencionDocumentosService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<RetencionDocumentosService>(
      RetencionDocumentosService,
    );
  });

  it('purga los documentos de las rechazadas vencidas', async () => {
    prisma.propiedad.findMany.mockResolvedValue([
      { id: 'prop-1', documentos: [{ url: 'docs/a.pdf' }] },
    ]);

    await service.purgarRechazadas();

    expect(storage.eliminarDocumentosPropiedad).toHaveBeenCalledWith([
      'docs/a.pdf',
    ]);
    expect(prisma.documentoPropiedad.deleteMany).toHaveBeenCalledWith({
      where: { propiedadId: 'prop-1' },
    });
  });

  it('solo consulta rechazadas sin reportes abiertos', async () => {
    await service.purgarRechazadas();

    const [llamada] = prisma.propiedad.findMany.mock.calls[0] as [
      { where: Record<string, unknown> },
    ];

    expect(llamada.where).toMatchObject({
      estado: 'RECHAZADA',
      reporteFraudes: { none: { estado: 'ABIERTO' } },
      rechazadoAt: { lt: expect.any(Date) as Date },
    });
  });

  it('si el storage falla no borra las filas', async () => {
    prisma.propiedad.findMany.mockResolvedValue([
      { id: 'prop-1', documentos: [{ url: 'docs/a.pdf' }] },
    ]);
    storage.eliminarDocumentosPropiedad.mockRejectedValueOnce(
      new Error('boom'),
    );

    await service.purgarRechazadas();

    expect(prisma.documentoPropiedad.deleteMany).not.toHaveBeenCalled();
  });
});
