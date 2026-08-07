import { Test, TestingModule } from '@nestjs/testing';
import { PropiedadesService } from './propiedades.service';

describe('PropiedadesService', () => {
  let service: PropiedadesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropiedadesService],
    }).compile();

    service = module.get<PropiedadesService>(PropiedadesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
