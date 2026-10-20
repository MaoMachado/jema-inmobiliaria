import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import bcrypt from 'bcryptjs';
import { Prisma, Role } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';
import { TotpService } from './totp.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { sign: jest.Mock };
  let tokens: { emitir: jest.Mock; rotar: jest.Mock; revocar: jest.Mock };
  let totp: {
    cifrar: jest.Mock;
    descifrar: jest.Mock;
    crear: jest.Mock;
    valido: jest.Mock;
  };
  let prisma: {
    usuario: {
      create: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
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

    totp = {
      cifrar: jest.fn().mockReturnValue('cifrado'),
      descifrar: jest.fn().mockReturnValue('secreto'),
      crear: jest
        .fn()
        .mockResolvedValue({ secreto: 'ABC', qr: 'data:image/png' }),
      valido: jest.fn().mockReturnValue(true),
    };

    prisma = {
      usuario: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: tokens },
        { provide: TotpService, useValue: totp },
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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

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
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.login('juan@test.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('reautenticar', () => {
    const admin = { ...mockUser, role: Role.ADMIN };

    it('debe firmar un token de documentos por 5 minutos', async () => {
      prisma.usuario.findUnique.mockResolvedValue(admin);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const token = await service.reautenticar(admin.id, 'password123');

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: admin.id, scope: 'documentos' },
        { expiresIn: '5m' },
      );
      expect(token).toBe('mocked-jwt-token');
    });

    it('debe rechazar una contraseña incorrecta', async () => {
      prisma.usuario.findUnique.mockResolvedValue(admin);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.reautenticar(admin.id, 'incorrecta'),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe rechazar a un usuario que no es admin', async () => {
      prisma.usuario.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(
        service.reautenticar(mockUser.id, 'password123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe bloquear con 429 después de 5 intentos fallidos', async () => {
      prisma.usuario.findUnique.mockResolvedValue(admin);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      for (let i = 0; i < 5; i += 1) {
        await expect(
          service.reautenticar(admin.id, 'incorrecta'),
        ).rejects.toThrow(UnauthorizedException);
      }

      await expect(
        service.reautenticar(admin.id, 'incorrecta'),
      ).rejects.toMatchObject({ status: 429 });
    });

    it('debe pedir el código cuando TOTP está activo', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpActivado: true,
        totpSecret: 'cifrado',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(
        service.reautenticar(admin.id, 'password123'),
      ).rejects.toThrow(/TOTP_REQUIRED/);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe rechazar un código inválido aunque la contraseña sea correcta', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpActivado: true,
        totpSecret: 'cifrado',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      totp.valido.mockReturnValue(false);

      await expect(
        service.reautenticar(admin.id, 'password123', '000000'),
      ).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe firmar el token con contraseña y código válidos', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpActivado: true,
        totpSecret: 'cifrado',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await service.reautenticar(admin.id, 'password123', '123456');

      expect(totp.valido).toHaveBeenCalledWith('cifrado', '123456');
      expect(jwtService.sign).toHaveBeenCalled();
    });
  });

  describe('totp', () => {
    const admin = {
      ...mockUser,
      role: Role.ADMIN,
      totpActivado: false,
      totpSecret: null,
    };

    it('debe crear un secreto, guardarlo cifrado y devolver el QR', async () => {
      prisma.usuario.findUnique.mockResolvedValue(admin);

      const result = await service.iniciarTotp(admin.id);

      expect(totp.cifrar).toHaveBeenCalledWith('ABC');
      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: admin.id },
        data: { totpSecret: 'cifrado' },
      });
      expect(result).toEqual({ qr: 'data:image/png' });
    });

    it('no debe regenerar el secreto si ya está activo', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpActivado: true,
        totpSecret: 'cifrado',
      });

      await expect(service.iniciarTotp(admin.id)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe activar TOTP al confirmar un código válido', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpSecret: 'cifrado',
      });

      await service.confirmarTotp(admin.id, '123456');

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: admin.id },
        data: { totpActivado: true },
      });
    });

    it('no debe activar TOTP con un código inválido', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpSecret: 'cifrado',
      });
      totp.valido.mockReturnValue(false);

      await expect(service.confirmarTotp(admin.id, '000000')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    it('debe desactivar TOTP con la contraseña correcta', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpActivado: true,
        totpSecret: 'cifrado',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await service.desactivarTotp(admin.id, 'password123');

      expect(prisma.usuario.update).toHaveBeenCalledWith({
        where: { id: admin.id },
        data: { totpSecret: null, totpActivado: false },
      });
    });

    it('no debe desactivar TOTP con contraseña incorrecta', async () => {
      prisma.usuario.findUnique.mockResolvedValue({
        ...admin,
        totpActivado: true,
        totpSecret: 'cifrado',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(
        service.desactivarTotp(admin.id, 'incorrecta'),
      ).rejects.toThrow(UnauthorizedException);
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });
  });
});
