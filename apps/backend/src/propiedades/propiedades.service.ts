import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropiedad } from './propiedades.types';


@Injectable()
export class PropiedadesService {
  constructor(private readonly prisma: PrismaService) {}

  private validate(propiedad: CreatePropiedad) {
    if (
      !propiedad.titulo?.trim() ||
      !propiedad.descripcion?.trim() ||
      propiedad.precio <= 0 ||
      !propiedad.ciudad?.trim() ||
      !propiedad.barrio?.trim() ||
      !propiedad.tipo?.trim() ||
      propiedad.habitaciones <= 0 ||
      propiedad.banos <= 0 ||
      propiedad.area <= 0
    ) {
      throw new BadRequestException('Todos los campos son obligatorios');
    }
  }

  async create(propiedad: CreatePropiedad, userId: string) {
    this.validate(propiedad);

    const prop = await this.prisma.propiedad.create({
      data: {
        titulo: propiedad.titulo,
        descripcion: propiedad.descripcion,
        precio: propiedad.precio,
        ciudad: propiedad.ciudad,
        barrio: propiedad.barrio,
        tipo: propiedad.tipo,
        habitaciones: propiedad.habitaciones,
        banos: propiedad.banos,
        area: propiedad.area,
        publicadoPorId: userId,
      },
    });

    const { createdAt, updatedAt, ...result } = prop;
    return result;
  }

  async findAll() {
    return this.prisma.propiedad.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const propiedad = await this.prisma.propiedad.findUnique({ where: { id } });

    if (!propiedad) {
      throw new NotFoundException('Propiedad no encontrada');
    }
    return propiedad;
  }

  async update(id: string, data: Partial<CreatePropiedad>, userId: string) {
    const propiedad = await this.findOne(id);
    if (propiedad.publicadoPorId !== userId) {
      throw new ForbiddenException(
        'No tenes permiso para editar esta propiedad',
      );
    }

    return this.prisma.propiedad.update({
      where: { id },
      data: {
        ...(data.titulo !== undefined && { titulo: data.titulo }),
        ...(data.descripcion !== undefined && {
          descripcion: data.descripcion,
        }),
        ...(data.precio !== undefined && { precio: data.precio }),
        ...(data.ciudad !== undefined && { ciudad: data.ciudad }),
        ...(data.barrio !== undefined && { barrio: data.barrio }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.habitaciones !== undefined && {
          habitaciones: data.habitaciones,
        }),
        ...(data.banos !== undefined && { banos: data.banos }),
        ...(data.area !== undefined && { area: data.area }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const propiedad = await this.findOne(id);
    if (propiedad.publicadoPorId !== userId) {
      throw new ForbiddenException(
        'No tenes permiso para eliminar esta propiedad',
      );
    }

    await this.prisma.propiedad.delete({ where: { id } });

    return { message: 'Propiedad eliminada' };
  }
}
