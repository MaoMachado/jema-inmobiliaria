import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  private firmarAccess(usuario: {
    id: string;
    email: string;
    role: Role;
    tokenVersion: number;
  }) {
    return this.jwtService.sign({
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
      tokenVersion: usuario.tokenVersion,
    });
  }

  private async emitirSession(usuario: {
    id: string;
    email: string;
    role: Role;
    tokenVersion: number;
    password: string;
  }) {
    const accessToken = this.firmarAccess(usuario);
    const refreshToken = await this.tokens.emitir(usuario.id);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userPublic } = usuario;
    return { accessToken, refreshToken, user: userPublic };
  }

  async register(
    nombres: string,
    apellidos: string,
    celular: string,
    email: string,
    password: string,
    foto?: string,
  ) {
    if (!email || !password || !nombres || !apellidos || !celular) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanNombre = nombres.trim();
    const cleanApellido = apellidos.trim();
    const cleanCelular = celular.trim();

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.usuario.create({
        data: {
          nombres: cleanNombre,
          apellidos: cleanApellido,
          celular: cleanCelular,
          email: cleanEmail,
          password: hashedPassword,
          foto,
        },
      });

      return this.emitirSession(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Ese email ya está registrado');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email y contraseña son obligatorios');
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await this.prisma.usuario.findUnique({
      where: {
        email: cleanEmail,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.emitirSession(user);
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Sesión Expirada');
    }

    const { usuarioId, refreshToken: nuevoRefresh } =
      await this.tokens.rotar(refreshToken);

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new UnauthorizedException('Sesión Expirada');
    }

    const accessToken = this.firmarAccess(usuario);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userPublic } = usuario;
    return { accessToken, refreshToken: nuevoRefresh, user: userPublic };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await this.tokens.revocar(refreshToken);
    }
  }
}
