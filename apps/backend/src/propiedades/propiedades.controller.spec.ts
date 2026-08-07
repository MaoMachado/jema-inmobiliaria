import { Test, TestingModule } from '@nestjs/testing';
import { PropiedadesController } from './propiedades.controller';

describe('PropiedadesController', () => {
  let controller: PropiedadesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropiedadesController],
    }).compile();

    controller = module.get<PropiedadesController>(PropiedadesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
