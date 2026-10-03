import { Test, TestingModule } from '@nestjs/testing';
import { PropiedadesController } from './propiedades.controller';
import { PropiedadesService } from './propiedades.service';

describe('PropiedadesController', () => {
  let controller: PropiedadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropiedadesController],
      providers: [
        {
          provide: PropiedadesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<PropiedadesController>(PropiedadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
