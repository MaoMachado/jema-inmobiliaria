import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';
import { PropiedadesService } from './propiedades.service';

describe('PropiedadesService', () => {
  let service: PropiedadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropiedadesService,
        { provide: StorageService, useValue: { subirFotos: jest.fn() } },
        { provide: PrismaService, useValue: { propiedad: {} } },
      ],
    }).compile();

    service = module.get<PropiedadesService>(PropiedadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
