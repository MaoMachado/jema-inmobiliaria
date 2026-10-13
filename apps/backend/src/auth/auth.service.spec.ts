import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock };
  let tokens: { emitir: jest.Mock; rotar: jest.Mock; revocar: jest.Mock };
  let prisma: {
    usuario: {
      create: jest.Mock;
      findUnique: jest.Mock;
    };
  };

  const mockUser = {
    id: 'user-uuid-123',
    nombres: 'Juan',
    apellidos: 'Pérez',
    celular: '3001234567',
    email: 'juan@test.com',
    password: 'hashed-password-123',
    foto: null,
    role: Role.USER,
    tokenVersion: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    tokens = {
      emitir: jest.fn().mockResolvedValue('refresh-token-xyz'),
      rotar: jest.fn(),
      revocar: jest.fn(),
    };

    prisma = {
      usuario: {
        create: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: tokens },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('debe registrar un usuario exitosamente, hashear contraseña y generar JWT', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashed-password-123');
      prisma.usuario.create.mockResolvedValue(mockUser);

      const result = await service.register(
        ' Juan ',
        ' Pérez ',
        ' 3001234567 ',
        ' Juan@Test.COM ',
        'password123',
        'http://foto.jpg',
      );

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(prisma.usuario.create).toHaveBeenCalledWith({
        data: {
          nombres: 'Juan',
          apellidos: 'Pérez',
          celular: '3001234567',
          email: 'juan@test.com',
          password: 'hashed-password-123',
          foto: 'http://foto.jpg',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tokenVersion: mockUser.tokenVersion,
      });
      expect(tokens.emitir).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
        refreshToken: 'refresh-token-xyz',
        user: {
          id: mockUser.id,
          nombres: mockUser.nombres,
          apellidos: mockUser.apellidos,
          celular: mockUser.celular,
          email: mockUser.email,
          foto: mockUser.foto,
          role: mockUser.role,
          tokenVersion: mockUser.tokenVersion,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
      expect((result.user as any).password).toBeUndefined();
    });

    it('debe lanzar BadRequestException si falta algún campo obligatorio', async () => {
      await expect(
        service.register('', 'Pérez', '3001234567', 'juan@test.com', 'pass'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.register('Juan', '', '3001234567', 'juan@test.com', 'pass'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.register('Juan', 'Pérez', '', 'juan@test.com', 'pass'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.register('Juan', 'Pérez', '3001234567', '', 'pass'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.register('Juan', 'Pérez', '3001234567', 'juan@test.com', ''),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar ConflictException si el email ya existe (código Prisma P2002)', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashed-password-123');
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.9.0',
        },
      );
      prisma.usuario.create.mockRejectedValue(prismaError);

      await expect(
        service.register(
          'Juan',
          'Pérez',
          '3001234567',
          'juan@test.com',
          'password123',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('debe propagar otros errores no controlados', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(async () => 'hashed-password-123');
      prisma.usuario.create.mockRejectedValue(new Error('Database error'));

      await expect(
        service.register(
          'Juan',
          'Pérez',
          '3001234567',
          'juan@test.com',
          'password123',
        ),
      ).rejects.toThrow('Database error');
    });
  });

  describe('login', () => {
    it('debe iniciar sesión exitosamente y retornar token con datos públicos', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login(' Juan@Test.COM ', 'password123');

      expect(prisma.usuario.findUnique).toHaveBeenCalledWith({
        where: { email: 'juan@test.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        mockUser.password,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        tokenVersion: mockUser.tokenVersion,
      });
      expect(tokens.emitir).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({
        accessToken: 'mocked-jwt-token',
        refreshToken: 'refresh-token-xyz',
        user: {
          id: mockUser.id,
          nombres: mockUser.nombres,
          apellidos: mockUser.apellidos,
          celular: mockUser.celular,
          email: mockUser.email,
          foto: mockUser.foto,
          role: mockUser.role,
          tokenVersion: mockUser.tokenVersion,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
      expect((result.user as any).password).toBeUndefined();
    });

    it('debe lanzar BadRequestException si falta email o password', async () => {
      await expect(service.login('', 'password123')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.login('juan@test.com', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      prisma.usuario.findUnique.mockResolvedValue(null);

      await expect(
        service.login('inexistente@test.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        service.login('juan@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
