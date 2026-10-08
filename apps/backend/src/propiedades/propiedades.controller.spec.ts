import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropiedadesController } from './propiedades.controller';
import { PropiedadesService } from './propiedades.service';
import {
  CreatePropiedadDto,
  FiltroPropiedadesDto,
  RechazarPropiedadDto,
  SubirDocumentoDto,
  ToggleDestacadaDto,
  UpdatePropiedadDto,
} from './dto/propiedades.dto';
import { VerificarDto } from '../usuarios/dto/verificar.dto';

describe('PropiedadesController', () => {
  let controller: PropiedadesController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findMisPropiedades: jest.Mock;
    findPendientes: jest.Mock;
    findDestacadas: jest.Mock;
    toggleDestacada: jest.Mock;
    findOne: jest.Mock;
    obtenerContacto: jest.Mock;
    aprobar: jest.Mock;
    rechazar: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    subirDocumentos: jest.Mock;
    getDocumentos: jest.Mock;
    eliminarDocumento: jest.Mock;
    verificarDocumentoPropiedad: jest.Mock;
  };

  const mockUserReq = {
    user: { id: 'usr-1', role: 'USER' },
  };

  beforeEach(async () => {
    service = {
      create: jest.fn().mockResolvedValue({ id: 'prop-1' }),
      findAll: jest.fn().mockResolvedValue({ data: [], pagination: {} }),
      findMisPropiedades: jest.fn().mockResolvedValue([]),
      findPendientes: jest.fn().mockResolvedValue([]),
      findDestacadas: jest.fn().mockResolvedValue([]),
      toggleDestacada: jest
        .fn()
        .mockResolvedValue({ id: 'prop-1', destacada: true }),
      findOne: jest.fn().mockResolvedValue({ id: 'prop-1' }),
      obtenerContacto: jest.fn().mockResolvedValue({ email: 'test@mail.com' }),
      aprobar: jest.fn().mockResolvedValue({ message: 'Propiedad aprobada' }),
      rechazar: jest.fn().mockResolvedValue({ message: 'Propiedad rechazada' }),
      update: jest.fn().mockResolvedValue({ id: 'prop-1' }),
      remove: jest.fn().mockResolvedValue({ message: 'Propiedad eliminada' }),
      subirDocumentos: jest.fn().mockResolvedValue([{ id: 'doc-1' }]),
      getDocumentos: jest.fn().mockResolvedValue([]),
      eliminarDocumento: jest
        .fn()
        .mockResolvedValue({ message: 'Documento eliminado' }),
      verificarDocumentoPropiedad: jest
        .fn()
        .mockResolvedValue({ verificado: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropiedadesController],
      providers: [
        {
          provide: PropiedadesService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<PropiedadesController>(PropiedadesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debe llamar a service.create con el DTO, archivos y userId', async () => {
      const dto: CreatePropiedadDto = {
        titulo: 'Casa',
        descripcion: 'Casa hermosa',
        precio: 200000000,
        ciudad: 'Medellin',
        barrio: 'Laureles',
        direccion: 'Circular 1',
        estrato: 4,
        tipo: 'Casa',
        habitaciones: 3,
        banos: 2,
        area: 100,
        antiguedad: 1,
      };
      const mockFiles = [{ originalname: '1.jpg' }] as Express.Multer.File[];

      const result = await controller.create(
        dto,
        mockFiles,
        mockUserReq as any,
      );

      expect(service.create).toHaveBeenCalledWith(dto, mockFiles, 'usr-1');
      expect(result).toEqual({ id: 'prop-1' });
    });
  });

  describe('findAll', () => {
    it('debe listar propiedades con filtros válidos', async () => {
      const query: FiltroPropiedadesDto = {
        ciudad: 'Medellin',
        precioMin: 100,
        precioMax: 500,
      };

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toBeDefined();
    });

    it('debe lanzar BadRequestException si precioMin > precioMax', () => {
      const query: FiltroPropiedadesDto = {
        precioMin: 600,
        precioMax: 200,
      };

      expect(() => controller.findAll(query)).toThrow(BadRequestException);
    });
  });

  describe('findMisPropiedades, findPendientes, findDestacadas', () => {
    it('debe llamar a findMisPropiedades con el id del usuario', async () => {
      await controller.findMisPropiedades(mockUserReq as any);
      expect(service.findMisPropiedades).toHaveBeenCalledWith('usr-1');
    });

    it('debe llamar a findPendientes', async () => {
      await controller.findPendientes();
      expect(service.findPendientes).toHaveBeenCalled();
    });

    it('debe llamar a findDestacadas', async () => {
      await controller.findDestacadas();
      expect(service.findDestacadas).toHaveBeenCalled();
    });
  });

  describe('toggleDestacada, findOne, obtenerContacto', () => {
    it('debe alternar estado destacada', async () => {
      const dto: ToggleDestacadaDto = { destacada: true };
      const result = await controller.toggleDestacada(
        'prop-1',
        dto,
        mockUserReq as any,
      );

      expect(service.toggleDestacada).toHaveBeenCalledWith(
        'prop-1',
        true,
        'usr-1',
      );
      expect(result.destacada).toBe(true);
    });

    it('debe buscar una propiedad por id', async () => {
      const result = await controller.findOne('prop-1');
      expect(service.findOne).toHaveBeenCalledWith('prop-1');
      expect(result.id).toBe('prop-1');
    });

    it('debe obtener contacto del anunciante', async () => {
      const result = await controller.obtenerContacto(
        'prop-1',
        mockUserReq as any,
      );
      expect(service.obtenerContacto).toHaveBeenCalledWith(
        'prop-1',
        mockUserReq.user,
      );
      expect(result.email).toBe('test@mail.com');
    });
  });

  describe('aprobar y rechazar', () => {
    it('debe aprobar una propiedad', async () => {
      const result = await controller.aprobar('prop-1');
      expect(service.aprobar).toHaveBeenCalledWith('prop-1');
      expect(result.message).toBe('Propiedad aprobada');
    });

    it('debe rechazar una propiedad con motivo', async () => {
      const dto: RechazarPropiedadDto = {
        motivoRechazo: 'Documentos ilegibles',
      };
      const result = await controller.rechazar('prop-1', dto);
      expect(service.rechazar).toHaveBeenCalledWith('prop-1', dto);
      expect(result.message).toBe('Propiedad rechazada');
    });
  });

  describe('update y remove', () => {
    it('debe actualizar propiedad', async () => {
      const dto: UpdatePropiedadDto = { precio: 250000000 };
      const result = await controller.update('prop-1', dto, mockUserReq as any);

      expect(service.update).toHaveBeenCalledWith('prop-1', dto, 'usr-1');
      expect(result.id).toBe('prop-1');
    });

    it('debe eliminar propiedad', async () => {
      const result = await controller.remove('prop-1', mockUserReq as any);
      expect(service.remove).toHaveBeenCalledWith('prop-1', 'usr-1');
      expect(result.message).toBe('Propiedad eliminada');
    });
  });

  describe('subirDocumentos, getDocumentos, eliminarDocumento, verificarDocumento', () => {
    it('debe subir documentos si se envían archivos', async () => {
      const mockFiles = [{ originalname: 'doc.pdf' }] as Express.Multer.File[];
      const dto: SubirDocumentoDto = { tipo: 'ESCRITURA' };

      const result = await controller.subirDocumentos(
        'prop-1',
        mockFiles,
        dto,
        mockUserReq as any,
      );

      expect(service.subirDocumentos).toHaveBeenCalledWith(
        'prop-1',
        'usr-1',
        mockFiles,
        'ESCRITURA',
      );
      expect(result).toHaveLength(1);
    });

    it('debe lanzar BadRequestException si no se adjuntan archivos', () => {
      const dto: SubirDocumentoDto = { tipo: 'ESCRITURA' };
      expect(() =>
        controller.subirDocumentos('prop-1', [], dto, mockUserReq as any),
      ).toThrow(BadRequestException);
    });

    it('debe obtener documentos', async () => {
      await controller.getDocumentos('prop-1', mockUserReq as any);
      expect(service.getDocumentos).toHaveBeenCalledWith(
        'prop-1',
        mockUserReq.user,
      );
    });

    it('debe eliminar documento pasando docId correctamente', async () => {
      const result = await controller.eliminarDocumento(
        'doc-100',
        mockUserReq as any,
      );
      expect(service.eliminarDocumento).toHaveBeenCalledWith(
        'doc-100',
        'usr-1',
      );
      expect(result.message).toBe('Documento eliminado');
    });

    it('debe verificar documento de propiedad', async () => {
      const dto: VerificarDto = { verificado: true };
      const result = await controller.verificarDocumento('doc-100', dto);
      expect(service.verificarDocumentoPropiedad).toHaveBeenCalledWith(
        'doc-100',
        true,
      );
      expect(result.verificado).toBe(true);
    });
  });
});
