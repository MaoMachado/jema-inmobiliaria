import { Test } from '@nestjs/testing';
import { Plan } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { PlanExpiraService } from './plan-expira.service';

describe('PlanExpiraService', () => {
  let service: PlanExpiraService;
  let prisma: { usuario: { updateMany: jest.Mock } };

  beforeEach(async () => {
    prisma = { usuario: { updateMany: jest.fn() } };

    const module = await Test.createTestingModule({
      providers: [
        PlanExpiraService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(PlanExpiraService);
  });

  it('devuelve a GRATIS solo a los usuarios con el plan vencido', async () => {
    prisma.usuario.updateMany.mockResolvedValue({ count: 2 });

    const ahora = new Date('2026-11-10T00:00:00.000Z');
    await expect(service.bajarPlanesVencidos(ahora)).resolves.toBe(2);

    expect(prisma.usuario.updateMany).toHaveBeenCalledWith({
      where: { plan: { not: Plan.GRATIS }, planVence: { lt: ahora } },
      data: {
        plan: Plan.GRATIS,
        propiedadesLimite: 5,
        chatIaLimite: 10,
        planVence: null,
      },
    });
  });
});
