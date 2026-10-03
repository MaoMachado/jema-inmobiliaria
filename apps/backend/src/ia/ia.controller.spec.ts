import { Test, TestingModule } from '@nestjs/testing';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';

describe('IaController', () => {
  let controller: IaController;
  let service: any;

  beforeEach(async () => {
    service = {
      chat: jest.fn(),
      estimacionPropiedad: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IaController],
      providers: [
        {
          provide: IaService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<IaController>(IaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('chat', () => {
    it('debe delegar la pregunta al servicio con el userId del token', async () => {
      const dto = { mensaje: '¿Tienen casas en Envigado?' };
      const req = { user: { id: 'user-777' } } as any;

      service.chat.mockResolvedValue('Respuesta del asesor');

      const resultado = await controller.chat(dto, req);

      expect(service.chat).toHaveBeenCalledWith(
        '¿Tienen casas en Envigado?',
        'user-777',
      );
      expect(resultado).toBe('Respuesta del asesor');
    });
  });

  describe('estimacion', () => {
    it('debe solicitar la estimación de una propiedad al servicio', async () => {
      const req = { user: { id: 'user-777' } } as any;
      const mockEstimacion = {
        mensajeIA: 'Buena inversión',
        valores: { probabilidadVenta: 80 },
      };

      service.estimacionPropiedad.mockResolvedValue(mockEstimacion);

      const resultado = await controller.ia('prop-123', req);

      expect(service.estimacionPropiedad).toHaveBeenCalledWith(
        'prop-123',
        'user-777',
      );
      expect(resultado).toEqual(mockEstimacion);
    });
  });
});
