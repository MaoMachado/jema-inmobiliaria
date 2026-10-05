import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let usuariosService: {
    getAll: jest.Mock;
    getUrlDocumentoUsuario: jest.Mock;
    getDocumentosPropiedadUsuario: jest.Mock;
    subirDocumento: jest.Mock;
    verificarDocumento: jest.Mock;
    verificarTelefono: jest.Mock;
    cargarPerfil: jest.Mock;
    actualizarPerfil: jest.Mock;
    subirFoto: jest.Mock;
    cambiarPassword: jest.Mock;
  };

  const mockUserReq = {
    user: { id: 'usr-123', email: 'carlos@test.com', role: 'USER' },
  };

  beforeEach(async () => {
    usuariosService = {
      getAll: jest.fn().mockResolvedValue([]),
      getUrlDocumentoUsuario: jest
        .fn()
        .mockResolvedValue('https://storage/doc.pdf'),
      getDocumentosPropiedadUsuario: jest.fn().mockResolvedValue([]),
      subirDocumento: jest
        .fn()
        .mockResolvedValue({ documentoUrl: 'docs/doc.pdf' }),
      verificarDocumento: jest
        .fn()
        .mockResolvedValue({ documentoVerificado: true }),
      verificarTelefono: jest
        .fn()
        .mockResolvedValue({ celularVerificado: true }),
      cargarPerfil: jest.fn().mockResolvedValue({ id: 'usr-123' }),
      actualizarPerfil: jest.fn().mockResolvedValue({ id: 'usr-123' }),
      subirFoto: jest.fn().mockResolvedValue({ fotoUrl: 'avatars/pic.png' }),
      cambiarPassword: jest
        .fn()
        .mockResolvedValue({ message: 'Contraseña actualizada' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: usuariosService,
        },
      ],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('debe llamar a usuariosService.getAll', async () => {
      await controller.findAll();
      expect(usuariosService.getAll).toHaveBeenCalled();
    });
  });

  describe('getDocumentoUrl', () => {
    it('debe retornar la url del documento del usuario', async () => {
      const result = await controller.getDocumentoUrl('usr-123');
      expect(usuariosService.getUrlDocumentoUsuario).toHaveBeenCalledWith(
        'usr-123',
      );
      expect(result).toEqual({ url: 'https://storage/doc.pdf' });
    });
  });

  describe('getDocumentosPropiedad', () => {
    it('debe llamar a usuariosService.getDocumentosPropiedadUsuario', async () => {
      await controller.getDocumentosPropiedad('usr-123');
      expect(
        usuariosService.getDocumentosPropiedadUsuario,
      ).toHaveBeenCalledWith('usr-123');
    });
  });

  describe('subirDocumento', () => {
    it('debe llamar a usuariosService.subirDocumento si el archivo existe', async () => {
      const mockFile = { originalname: 'doc.pdf' } as Express.Multer.File;
      const result = await controller.subirDocumento(
        mockFile,
        mockUserReq as any,
      );

      expect(usuariosService.subirDocumento).toHaveBeenCalledWith(
        'usr-123',
        mockFile,
      );
      expect(result).toEqual({ documentoUrl: 'docs/doc.pdf' });
    });

    it('debe lanzar BadRequestException si el archivo no existe', () => {
      expect(() =>
        controller.subirDocumento(undefined as any, mockUserReq as any),
      ).toThrow(BadRequestException);
    });
  });

  describe('verificarDocumento', () => {
    it('debe verificar documento', async () => {
      const result = await controller.verificarDocumento('usr-123', {
        verificado: true,
      });
      expect(usuariosService.verificarDocumento).toHaveBeenCalledWith(
        'usr-123',
        true,
      );
      expect(result).toEqual({ documentoVerificado: true });
    });
  });

  describe('verificarTelefono', () => {
    it('debe verificar telefono', async () => {
      const result = await controller.verificarTelefono('usr-123', {
        verificado: true,
      });
      expect(usuariosService.verificarTelefono).toHaveBeenCalledWith(
        'usr-123',
        true,
      );
      expect(result).toEqual({ celularVerificado: true });
    });
  });

  describe('cargarPerfil', () => {
    it('debe retornar perfil del usuario autenticado', async () => {
      const result = await controller.cargarPerfil(mockUserReq as any);
      expect(usuariosService.cargarPerfil).toHaveBeenCalledWith('usr-123');
      expect(result).toEqual({ id: 'usr-123' });
    });
  });

  describe('actualizarPerfil', () => {
    it('debe actualizar perfil con datos del DTO', async () => {
      const dto = { nombres: 'Carlos' };
      await controller.actualizarPerfil(mockUserReq as any, dto);
      expect(usuariosService.actualizarPerfil).toHaveBeenCalledWith(
        'usr-123',
        dto,
      );
    });
  });

  describe('subirFoto', () => {
    it('debe subir foto de perfil', async () => {
      const mockFile = { originalname: 'pic.png' } as Express.Multer.File;
      const result = await controller.subirFoto(mockUserReq as any, mockFile);

      expect(usuariosService.subirFoto).toHaveBeenCalledWith(
        'usr-123',
        mockFile,
      );
      expect(result).toEqual({ fotoUrl: 'avatars/pic.png' });
    });

    it('debe lanzar BadRequestException si falta la foto', async () => {
      await expect(
        controller.subirFoto(mockUserReq as any, undefined as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cambiarPassword', () => {
    it('debe cambiar la contraseña', async () => {
      const dto = { actual: 'passOld123', nueva: 'passNew456' };
      const result = await controller.cambiarPassword(
        mockUserReq as any,
        dto,
      );

      expect(usuariosService.cambiarPassword).toHaveBeenCalledWith(
        'usr-123',
        dto,
      );
      expect(result).toEqual({ message: 'Contraseña actualizada' });
    });
  });
});
