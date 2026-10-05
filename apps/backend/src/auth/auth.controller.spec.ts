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
  };

  const mockAuthResponse = {
    token: 'jwt-token-xyz',
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

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockAuthResponse),
      login: jest.fn().mockResolvedValue(mockAuthResponse),
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

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(
        dto.nombres,
        dto.apellidos,
        dto.celular,
        dto.email,
        dto.password,
        dto.foto,
      );
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('debe llamar a authService.login con email y password del LoginDto', async () => {
      const dto: LoginDto = {
        email: 'carlos@test.com',
        password: 'password123',
      };

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto.email, dto.password);
      expect(result).toEqual(mockAuthResponse);
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
});
