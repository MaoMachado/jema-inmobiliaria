import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RetencionAuditoriaService } from './retencion-auditoria.service';

jest.mock('@nestjs/schedule', () => ({
  Cron: () => () => undefined,
}));

describe('RetencionAuditoriaService', () => {
  let service: RetencionAuditoriaService;
  let prisma: { accesoDocumento: { updateMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { accesoDocumento: { updateMany: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RetencionAuditoriaService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<RetencionAuditoriaService>(RetencionAuditoriaService);
  });

  it('anonimiza ip y userAgent de los accesos viejos', async () => {
    prisma.accesoDocumento.updateMany.mockResolvedValue({ count: 3 });

    await service.anonimizarAccesos();

    expect(prisma.accesoDocumento.updateMany).toHaveBeenCalledWith({
      where: {
        createAt: { lt: expect.any(Date) as Date },
        OR: [{ ip: { not: null } }, { userAgent: { not: null } }],
      },
      data: { ip: null, userAgent: null },
    });
  });
});
