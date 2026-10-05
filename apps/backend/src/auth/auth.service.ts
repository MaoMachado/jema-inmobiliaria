import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
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

      const token = this.jwtService.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userPublic } = user;

      return {
        token,
        user: userPublic,
      };
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

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userPublic } = user;

    return {
      token,
      user: userPublic,
    };
  }
}
