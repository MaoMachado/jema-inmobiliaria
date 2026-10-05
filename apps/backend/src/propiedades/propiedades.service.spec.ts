import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PropiedadesService } from './propiedades.service';
import { CreatePropiedadDto } from './dto/propiedades.dto';

describe('PropiedadesService', () => {
  let service: PropiedadesService;
  let prisma: {
    usuario: {
      findUnique: jest.Mock;
    };
    propiedad: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
      count: jest.Mock;
    };
    documentoPropiedad: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let storage: {
    subirFotos: jest.Mock;
    subirPropiedadDocumento: jest.Mock;
    getUrlDocumentoPropiedad: jest.Mock;
  };

  const mockUser = {
    id: 'usr-1',
    plan: 'PREMIUM',
    propiedadesLimite: 10,
  };

  const mockPropiedad = {
    id: 'prop-1',
    titulo: 'Casa en Poblado',
    descripcion: 'Hermosa casa con vista',
    precio: 500000000,
    ciudad: 'Medellin',
    barrio: 'El Poblado',
    direccion: 'Calle 10 # 20',
    estrato: 5,
    tipo: 'Casa',
    habitaciones: 3,
    banos: 2,
    parqueaderos: 1,
    area: 120,
    antiguedad: 2,
    fotografias: ['https://storage/foto1.jpg'],
    video: null,
    ubicacionLat: 6.2088,
    ubicacionLong: -75.5678,
    puntaje: 90,
    publicadoPorId: 'usr-1',
    estado: 'APROBADA',
    destacada: false,
    destacadaHasta: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    publicadoPor: {
      nombres: 'Carlos',
      apellidos: 'Gómez',
      celularVerificado: true,
      documentoVerificado: true,
      email: 'carlos@test.com',
      celular: '3001234567',
    },
    documentos: [],
  };

  const mockCreateDto: CreatePropiedadDto = {
    titulo: 'Casa en Poblado',
    descripcion: 'Hermosa casa con vista',
    precio: 500000000,
    ciudad: 'Medellin',
    barrio: 'El Poblado',
    direccion: 'Calle 10 # 20',
    estrato: 5,
    tipo: 'Casa',
    habitaciones: 3,
    banos: 2,
    parqueaderos: 1,
    area: 120,
    antiguedad: 2,
    ubicacionLat: 6.2088,
    ubicacionLong: -75.5678,
  };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findUnique: jest.fn(),
      },
      propiedad: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      documentoPropiedad: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (cb) => cb(prisma)),
    };

    storage = {
      subirFotos: jest.fn().mockResolvedValue(['https://storage/foto1.jpg']),
      subirPropiedadDocumento: jest
        .fn()
        .mockResolvedValue('docs/escritura.pdf'),
      getUrlDocumentoPropiedad: jest
        .fn()
        .mockImplementation(async (url: string) => `https://signed/${url}`),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropiedadesService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<PropiedadesService>(PropiedadesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear una propiedad exitosamente', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.propiedad.count.mockResolvedValue(2);
      prisma.propiedad.create.mockResolvedValue(mockPropiedad);

      const result = await service.create(
        mockCreateDto,
        [{ originalname: 'foto.jpg' } as Express.Multer.File],
        'usr-1',
      );

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        select: { plan: true, propiedadesLimite: true },
      });
      expect(storage.subirFotos).toHaveBeenCalled();
      expect(prisma.propiedad.create).toHaveBeenCalled();
      expect(result.id).toBe('prop-1');
      expect(result.titulo).toBe(mockCreateDto.titulo);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.create(mockCreateDto, [], 'usr-inexistente'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ForbiddenException si alcanzó el límite de propiedades de su plan', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'usr-1',
        plan: 'GRATIS',
        propiedadesLimite: 2,
      });
      prisma.propiedad.count.mockResolvedValue(2);

      await expect(service.create(mockCreateDto, [], 'usr-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('debe lanzar ForbiddenException si excede el límite de fotos de su plan', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        id: 'usr-1',
        plan: 'GRATIS', // max 5 fotos
        propiedadesLimite: 5,
      });
      prisma.propiedad.count.mockResolvedValue(0);

      const seisFotos = new Array(6).fill({
        originalname: 'foto.jpg',
      }) as Express.Multer.File[];

      await expect(
        service.create(mockCreateDto, seisFotos, 'usr-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('debe retornar lista de propiedades paginada con filtros', async () => {
      prisma.propiedad.count.mockResolvedValue(1);
      prisma.propiedad.findMany.mockResolvedValue([mockPropiedad]);

      const result = await service.findAll({
        ciudad: 'Medellin',
        tipo: 'Casa',
        page: 1,
        limit: 10,
        orderBy: 'precio',
        order: 'asc',
      });

      expect(prisma.propiedad.count).toHaveBeenCalled();
      expect(prisma.propiedad.findMany).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('findOne', () => {
    it('debe retornar propiedad aprobada para cualquier usuario', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);

      const result = await service.findOne('prop-1');
      expect(result.id).toBe('prop-1');
    });

    it('debe permitir ver propiedad pendiente o rechazada a su dueño', async () => {
      const pendiente = {
        ...mockPropiedad,
        estado: 'PENDIENTE',
        publicadoPorId: 'usr-1',
      };
      prisma.propiedad.findUnique.mockResolvedValue(pendiente);

      const result = await service.findOne('prop-1', {
        id: 'usr-1',
        role: 'USER',
      });
      expect(result.estado).toBe('PENDIENTE');
    });

    it('debe permitir ver propiedad pendiente a un admin', async () => {
      const pendiente = {
        ...mockPropiedad,
        estado: 'PENDIENTE',
        publicadoPorId: 'usr-otro',
      };
      prisma.propiedad.findUnique.mockResolvedValue(pendiente);

      const result = await service.findOne('prop-1', {
        id: 'usr-admin',
        role: 'ADMIN',
      });
      expect(result.id).toBe('prop-1');
    });

    it('debe lanzar NotFoundException si no está aprobada y no es dueño ni admin', async () => {
      const pendiente = {
        ...mockPropiedad,
        estado: 'PENDIENTE',
        publicadoPorId: 'usr-1',
      };
      prisma.propiedad.findUnique.mockResolvedValue(pendiente);

      await expect(
        service.findOne('prop-1', { id: 'usr-desconocido', role: 'USER' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('obtenerContacto', () => {
    it('debe retornar el email y celular del anunciante', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);

      const result = await service.obtenerContacto('prop-1', {
        id: 'usr-2',
        role: 'USER',
      });

      expect(result).toEqual({
        email: 'carlos@test.com',
        celular: '3001234567',
      });
    });
  });

  describe('update', () => {
    it('debe actualizar la propiedad y recalcular puntaje', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.propiedad.update.mockResolvedValue({
        ...mockPropiedad,
        precio: 550000000,
      });

      const result = await service.update(
        'prop-1',
        { precio: 550000000 },
        'usr-1',
      );

      expect(prisma.propiedad.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prop-1' },
          data: expect.objectContaining({
            precio: 550000000,
            estado: 'PENDIENTE',
          }),
        }),
      );
      expect(result.precio).toBe(550000000);
    });

    it('debe lanzar ForbiddenException si quien intenta editar no es el dueño', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);

      await expect(
        service.update('prop-1', { precio: 550000000 }, 'usr-ajeno'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('debe eliminar la propiedad si es el dueño', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);
      prisma.propiedad.delete.mockResolvedValue(mockPropiedad);

      const result = await service.remove('prop-1', 'usr-1');

      expect(prisma.propiedad.delete).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
      });
      expect(result).toEqual({ message: 'Propiedad eliminada' });
    });

    it('debe lanzar ForbiddenException si no es el dueño', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);

      await expect(service.remove('prop-1', 'usr-ajeno')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('Documentos de la propiedad', () => {
    it('debe subir documentos a la propiedad', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);
      prisma.documentoPropiedad.create.mockResolvedValue({
        id: 'doc-1',
        tipo: 'ESCRITURA',
        url: 'docs/escritura.pdf',
      });

      const mockFiles = [
        { originalname: 'escritura.pdf' },
      ] as Express.Multer.File[];
      const result = await service.subirDocumentos(
        'prop-1',
        'usr-1',
        mockFiles,
        'ESCRITURA',
      );

      expect(storage.subirPropiedadDocumento).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('debe obtener documentos con URLs firmadas para el dueño o admin', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);
      prisma.documentoPropiedad.findMany.mockResolvedValue([
        { id: 'doc-1', tipo: 'ESCRITURA', url: 'escritura.pdf' },
      ]);

      const result = await service.getDocumentos('prop-1', {
        id: 'usr-1',
        role: 'USER',
      });

      expect(storage.getUrlDocumentoPropiedad).toHaveBeenCalledWith(
        'escritura.pdf',
      );
      expect(result[0].url).toBe('https://signed/escritura.pdf');
    });

    it('debe eliminar un documento de propiedad', async () => {
      prisma.documentoPropiedad.findUnique.mockResolvedValue({
        id: 'doc-1',
        propiedad: { publicadoPorId: 'usr-1' },
      });
      prisma.documentoPropiedad.delete.mockResolvedValue({ id: 'doc-1' });

      const result = await service.eliminarDocumento('doc-1', 'usr-1');
      expect(result).toEqual({ message: 'Documento eliminado' });
    });

    it('debe verificar documento de propiedad por parte del admin', async () => {
      prisma.documentoPropiedad.findUnique.mockResolvedValue({ id: 'doc-1' });
      prisma.documentoPropiedad.update.mockResolvedValue({
        id: 'doc-1',
        verificado: true,
      });

      const result = await service.verificarDocumentoPropiedad('doc-1', true);
      expect(result).toEqual({ verificado: true });
    });
  });

  describe('Estados y Destacadas', () => {
    it('aprobar: debe cambiar estado a APROBADA', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);
      prisma.propiedad.update.mockResolvedValue({
        ...mockPropiedad,
        estado: 'APROBADA',
      });

      const result = await service.aprobar('prop-1');
      expect(prisma.propiedad.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { estado: 'APROBADA' },
      });
      expect(result).toEqual({ message: 'Propiedad aprobada' });
    });

    it('rechazar: debe cambiar estado a RECHAZADA con motivo', async () => {
      prisma.propiedad.findUnique.mockResolvedValue(mockPropiedad);
      prisma.propiedad.update.mockResolvedValue({
        ...mockPropiedad,
        estado: 'RECHAZADA',
        motivoRechazo: 'Fotos borrosas',
      });

      const result = await service.rechazar('prop-1', {
        motivoRechazo: 'Fotos borrosas',
      });
      expect(prisma.propiedad.update).toHaveBeenCalledWith({
        where: { id: 'prop-1' },
        data: { estado: 'RECHAZADA', motivoRechazo: 'Fotos borrosas' },
      });
      expect(result).toEqual({ message: 'Propiedad rechazada' });
    });

    it('findDestacadas: debe retornar destacadas y rellenar con fallback si son menores al límite', async () => {
      prisma.propiedad.findMany
        .mockResolvedValueOnce([mockPropiedad]) // 1 destacada
        .mockResolvedValueOnce([
          { ...mockPropiedad, id: 'prop-2', destacada: false },
        ]); // fallback

      const result = await service.findDestacadas(2);
      expect(result).toHaveLength(2);
    });

    it('toggleDestacada: debe permitir destacar si tiene plan PREMIUM y no supera 3 destacadas', async () => {
      prisma.propiedad.findUnique.mockResolvedValue({
        ...mockPropiedad,
        publicadoPor: { plan: 'PREMIUM' },
        estado: 'APROBADA',
        destacada: false,
      });
      prisma.propiedad.count.mockResolvedValue(1);
      prisma.propiedad.update.mockResolvedValue({
        ...mockPropiedad,
        destacada: true,
      });

      const result = await service.toggleDestacada('prop-1', true, 'usr-1');
      expect(result.destacada).toBe(true);
    });

    it('toggleDestacada: debe lanzar ForbiddenException si el usuario no tiene plan PREMIUM', async () => {
      prisma.propiedad.findUnique.mockResolvedValue({
        ...mockPropiedad,
        publicadoPor: { plan: 'GRATIS' },
        estado: 'APROBADA',
        destacada: false,
      });

      await expect(
        service.toggleDestacada('prop-1', true, 'usr-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('toggleDestacada: debe lanzar BadRequestException si ya tiene 3 destacadas', async () => {
      prisma.propiedad.findUnique.mockResolvedValue({
        ...mockPropiedad,
        publicadoPor: { plan: 'PREMIUM' },
        estado: 'APROBADA',
        destacada: false,
      });
      prisma.propiedad.count.mockResolvedValue(3);

      await expect(
        service.toggleDestacada('prop-1', true, 'usr-1'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
