import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.usuario.findMany({
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        celular: true,
        email: true,
        foto: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
