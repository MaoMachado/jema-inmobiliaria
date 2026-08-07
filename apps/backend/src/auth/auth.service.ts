import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(email: string, password: string) {
    if (!email || !password) {
      throw new Error('Email y contraseña son obligatorios');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await this.prisma.usuario.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      console.error(error);
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
    });

    return {
      token,
    };
  }
}
