import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(
    nombres: string,
    apellidos: string,
    celular: string,
    email: string,
    password: string,
    foto?: string,
  ) {
    if (!email || !password || !nombres || !apellidos) {
      throw new BadRequestException('Faltan campos obligatorios');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.usuario.create({
        data: {
          nombres,
          apellidos,
          celular,
          email,
          password: hashedPassword,
          foto,
        },
      });

      const { password: _, ...result } = user;
      return result;
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

    const user = await this.prisma.usuario.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userPublic } = user;

    return {
      token,
      user: userPublic,
    };
  }
}
