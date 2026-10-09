import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  let prisma: {
    refreshToken: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    usuario: { update: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      usuario: { update: jest.fn() },
      $transaction: jest.fn().mockResolvedValue([]),
    };

    const module = await Test.createTestingModule({
      providers: [TokenService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(TokenService);
  });

  it('emite un refresh y guarda solo su hash', async () => {
    prisma.refreshToken.create.mockResolvedValue({});
    const token = await service.emitir('user-1');

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    const data = prisma.refreshToken.create.mock.calls[0][0].data;
    expect(data.tokenHash).not.toBe(token);
    expect(data.usuarioId).toBe('user-1');
  });

  it('rechaza y revoca la familia si el refresh ya fue usado', async () => {
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: 'r1',
      usuarioId: 'user-1',
      revocado: true,
      expiraAt: new Date(Date.now() + 1000),
    });

    await expect(service.rotar('token-usado')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
