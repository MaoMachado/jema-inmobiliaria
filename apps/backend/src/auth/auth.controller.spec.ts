import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../generated/prisma';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
    reautenticar: jest.Mock;
    estadoTotp: jest.Mock;
    iniciarTotp: jest.Mock;
    confirmarTotp: jest.Mock;
    desactivarTotp: jest.Mock;
    regenerarRecuperacion: jest.Mock;
  };

  const mockAuthResponse = {
    accessToken: 'jwt-token-xyz',
    refreshToken: 'refresh-token-xyz',
    user: {
      id: 'usr-1',
      nombres: 'Carlos',
      apellidos: 'Gómez',
      celular: '3001234567',
      email: 'carlos@test.com',
      foto: null,
      role: Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockRes = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockAuthResponse),
      login: jest.fn().mockResolvedValue(mockAuthResponse),
      reautenticar: jest.fn().mockResolvedValue('reauth-token-xyz'),
      estadoTotp: jest.fn().mockResolvedValue({ activado: false }),
      iniciarTotp: jest.fn().mockResolvedValue({ qr: 'data:image/png' }),
      confirmarTotp: jest.fn().mockResolvedValue({ activado: true }),
      desactivarTotp: jest.fn().mockResolvedValue({ activado: false }),
      regenerarRecuperacion: jest
        .fn()
        .mockResolvedValue({ codigosRecuperacion: ['ABCDE-12345'] }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('debe llamar a authService.register con los campos del RegisterDto', async () => {
      const dto: RegisterDto = {
        nombres: 'Carlos',
        apellidos: 'Gómez',
        celular: '3001234567',
        email: 'carlos@test.com',
        password: 'password123',
        foto: 'http://foto.png',
      };

      const result = await controller.register(dto, mockRes as any);

      expect(authService.register).toHaveBeenCalledWith(
        dto.nombres,
        dto.apellidos,
        dto.celular,
        dto.email,
        dto.password,
        dto.foto,
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthResponse.accessToken,
        expect.any(Object),
      );
      expect(result).toEqual({ user: mockAuthResponse.user });
    });
  });

  describe('login', () => {
    it('debe llamar a authService.login con email y password del LoginDto', async () => {
      const dto: LoginDto = {
        email: 'carlos@test.com',
        password: 'password123',
      };

      const result = await controller.login(dto, mockRes as any);

      expect(authService.login).toHaveBeenCalledWith(
        dto.email,
        dto.password,
        undefined,
        undefined,
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token',
        mockAuthResponse.accessToken,
        expect.any(Object),
      );
      expect(result).toEqual({ user: mockAuthResponse.user });
    });
  });

  describe('me', () => {
    it('debe retornar el usuario autenticado del request', () => {
      const mockRequest = {
        user: {
          id: 'usr-1',
          email: 'carlos@test.com',
          role: Role.USER,
        },
      };

      const result = controller.me(mockRequest as any);

      expect(result).toEqual(mockRequest.user);
    });
  });

  describe('reautenticar', () => {
    it('debe emitir la cookie de elevación y la ventana de 5 minutos', async () => {
      const mockRequest = { user: { id: 'admin-1', role: Role.ADMIN } };

      const result = await controller.reautenticar(
        mockRequest as any,
        { password: 'password123' },
        mockRes as any,
      );

      expect(authService.reautenticar).toHaveBeenCalledWith(
        'admin-1',
        'password123',
        undefined,
      );
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'reauth_token',
        'reauth-token-xyz',
        expect.any(Object),
      );
      expect(result).toEqual({ expiraEn: 300 });
    });

    it('debe reenviar el código TOTP al servicio', async () => {
      const mockRequest = { user: { id: 'admin-1', role: Role.ADMIN } };

      await controller.reautenticar(
        mockRequest as any,
        { password: 'password123', codigo: '123456' },
        mockRes as any,
      );

      expect(authService.reautenticar).toHaveBeenCalledWith(
        'admin-1',
        'password123',
        '123456',
      );
    });
  });

  describe('totp', () => {
    const mockRequest = { user: { id: 'admin-1', role: Role.ADMIN } };

    it('debe consultar el estado', async () => {
      const result = await controller.estadoTotp(mockRequest as any);

      expect(authService.estadoTotp).toHaveBeenCalledWith('admin-1');
      expect(result).toEqual({ activado: false });
    });

    it('debe delegar inicio, confirmación y desactivación', async () => {
      await controller.iniciarTotp(mockRequest as any);
      await controller.confirmarTotp(mockRequest as any, { codigo: '123456' });
      await controller.desactivarTotp(mockRequest as any, {
        password: 'password123',
      });
      await controller.regenerarRecuperacion(mockRequest as any, {
        password: 'password123',
        codigo: '123456',
      });

      expect(authService.iniciarTotp).toHaveBeenCalledWith('admin-1');
      expect(authService.confirmarTotp).toHaveBeenCalledWith(
        'admin-1',
        '123456',
      );
      expect(authService.desactivarTotp).toHaveBeenCalledWith(
        'admin-1',
        'password123',
      );
      expect(authService.regenerarRecuperacion).toHaveBeenCalledWith(
        'admin-1',
        'password123',
        '123456',
      );
    });
  });
});
