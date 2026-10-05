import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let prisma: {
    usuario: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    propiedad: {
      findMany: jest.Mock;
    };
  };
  let storage: {
    getUrlDocumentoPropiedad: jest.Mock;
    getUrlDocumentoUsuario: jest.Mock;
    subirDocumento: jest.Mock;
    subirFotoPerfil: jest.Mock;
  };

  const mockUser = {
    id: 'usr-1',
    nombres: 'Carlos',
    apellidos: 'Gómez',
    celular: '3001234567',
    celularVerificado: true,
    email: 'carlos@test.com',
    password: 'hashed-password-old',
    foto: 'https://storage/foto.png',
    documentoUrl: 'docs/doc-1.pdf',
    documentoVerificado: true,
    role: 'USER',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      usuario: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      propiedad: {
        findMany: jest.fn(),
      },
    };

    storage = {
      getUrlDocumentoPropiedad: jest
        .fn()
        .mockImplementation(async (url: string) => `https://signed/${url}`),
      getUrlDocumentoUsuario: jest
        .fn()
        .mockImplementation(async (url: string) => `https://signed/${url}`),
      subirDocumento: jest.fn().mockResolvedValue('docs/new-doc.pdf'),
      subirFotoPerfil: jest.fn().mockResolvedValue('avatars/new-photo.png'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAll', () => {
    it('debe retornar lista de usuarios con urls de documentos de propiedades procesadas', async () => {
      const mockUsuarios = [
        {
          ...mockUser,
          propiedades: [
            {
              id: 'prop-1',
              titulo: 'Casa Campestre',
              documentos: [
                {
                  id: 'doc-1',
                  tipo: 'ESCRITURA',
                  verificado: true,
                  url: 'escritura.pdf',
                },
              ],
            },
          ],
        },
      ];
      prisma.usuario.findMany.mockResolvedValue(mockUsuarios);

      const result = await service.getAll();

      expect(prisma.usuario.findMany).toHaveBeenCalled();
      expect(storage.getUrlDocumentoPropiedad).toHaveBeenCalledWith(
        'escritura.pdf',
      );
      expect(result[0].propiedades[0].documentos[0].url).toBe(
        'https://signed/escritura.pdf',
      );
    });
  });

  describe('subirDocumento', () => {
    const mockFile = {
      originalname: 'cedula.pdf',
      buffer: Buffer.from('test'),
    } as Express.Multer.File;

    it('debe subir documento y actualizar documentoVerificado a false', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.usuario.update.mockResolvedValue({
        ...mockUser,
        documentoUrl: 'docs/new-doc.pdf',
        documentoVerificado: false,
      });

      const result = await service.subirDocumento('usr-1', mockFile);

      expect(storage.subirDocumento).toHaveBeenCalledWith(mockFile);
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: {
          documentoUrl: 'docs/new-doc.pdf',
          documentoVerificado: false,
        },
      });
      expect(result).toEqual({ documentoUrl: 'docs/new-doc.pdf' });
    });

    it('debe lanzar BadRequestException si el archivo es undefined', async () => {
      await expect(
        service.subirDocumento('usr-1', undefined as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(
        service.subirDocumento('usr-inexistente', mockFile),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verificarDocumento', () => {
    it('debe actualizar el estado de verificación del documento', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.usuario.update.mockResolvedValue({
        ...mockUser,
        documentoVerificado: true,
      });

      const result = await service.verificarDocumento('usr-1', true);

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { documentoVerificado: true },
      });
      expect(result).toEqual({ documentoVerificado: true });
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);
      await expect(
        service.verificarDocumento('usr-inexistente', true),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getDocumentosPropiedadUsuario', () => {
    it('debe retornar documentos de propiedades con urls firmadas', async () => {
      prisma.propiedad.findMany.mockResolvedValue([
        {
          id: 'prop-1',
          titulo: 'Apartamento Centro',
          documentos: [
            { id: 'doc-1', tipo: 'TRADICION', url: 'doc-tradicion.pdf' },
          ],
        },
      ]);

      const result = await service.getDocumentosPropiedadUsuario('usr-1');

      expect(prisma.propiedad.findMany).toHaveBeenCalledWith({
        where: { publicadoPorId: 'usr-1' },
        include: { documentos: true },
      });
      expect(result[0].propiedadTitulo).toBe('Apartamento Centro');
      expect(result[0].url).toBe('https://signed/doc-tradicion.pdf');
    });
  });

  describe('verificarTelefono', () => {
    it('debe actualizar celularVerificado', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.usuario.update.mockResolvedValue({
        ...mockUser,
        celularVerificado: true,
      });

      const result = await service.verificarTelefono('usr-1', true);

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { celularVerificado: true },
      });
      expect(result).toEqual({ celularVerificado: true });
    });
  });

  describe('cargarPerfil', () => {
    it('debe retornar datos del perfil del usuario', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      const result = await service.cargarPerfil('usr-1');

      expect(result.id).toBe('usr-1');
      expect(result.email).toBe('carlos@test.com');
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(service.cargarPerfil('usr-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('actualizarPerfil', () => {
    it('debe actualizar datos y resetear celularVerificado si el celular cambió', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.usuario.update.mockResolvedValue({
        ...mockUser,
        celular: '3109876543',
        celularVerificado: false,
      });

      const result = await service.actualizarPerfil('usr-1', {
        nombres: ' Carlos Alberto ',
        celular: ' 3109876543 ',
      });

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: {
          nombres: 'Carlos Alberto',
          celular: '3109876543',
          celularVerificado: false,
        },
        select: expect.any(Object),
      });
      expect(result.celular).toBe('3109876543');
    });

    it('debe mantener celularVerificado si el número es el mismo', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.usuario.update.mockResolvedValue(mockUser);

      await service.actualizarPerfil('usr-1', {
        celular: '3001234567',
      });

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: {
          celular: '3001234567',
          celularVerificado: undefined,
        },
        select: expect.any(Object),
      });
    });
  });

  describe('subirFoto', () => {
    const mockFile = {
      originalname: 'perfil.png',
      buffer: Buffer.from('img'),
    } as Express.Multer.File;

    it('debe subir foto y actualizar campo foto del usuario', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      prisma.usuario.update.mockResolvedValue({
        ...mockUser,
        foto: 'avatars/new-photo.png',
      });

      const result = await service.subirFoto('usr-1', mockFile);

      expect(storage.subirFotoPerfil).toHaveBeenCalledWith(mockFile);
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { foto: 'avatars/new-photo.png' },
      });
      expect(result).toEqual({ fotoUrl: 'avatars/new-photo.png' });
    });

    it('debe lanzar BadRequestException si falta el archivo', async () => {
      await expect(service.subirFoto('usr-1', undefined as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cambiarPassword', () => {
    it('debe cambiar contraseña cuando la actual es válida y la nueva cumple condiciones', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed-new-password');
      prisma.usuario.update.mockResolvedValue(mockUser);

      const result = await service.cambiarPassword('usr-1', {
        actual: 'oldPassword123',
        nueva: 'newPassword456',
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'oldPassword123',
        mockUser.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword456', 10);
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: 'usr-1' },
        data: { password: 'hashed-new-password' },
      });
      expect(result).toEqual({ message: 'Contraseña actualizada' });
    });

    it('debe lanzar BadRequestException si faltan datos o la contraseña es menor a 6 caracteres', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.cambiarPassword('usr-1', { actual: '', nueva: '123456' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.cambiarPassword('usr-1', {
          actual: 'oldPass',
          nueva: '123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la nueva contraseña es igual a la actual', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.cambiarPassword('usr-1', {
          actual: 'samePassword123',
          nueva: 'samePassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si la contraseña actual no coincide', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        service.cambiarPassword('usr-1', {
          actual: 'wrongPassword',
          nueva: 'newPassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
