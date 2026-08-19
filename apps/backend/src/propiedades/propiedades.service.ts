import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calcularPuntaje } from './calcular-puntaje.js';
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

    const puntaje = calcularPuntaje(propiedad);

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
        antiguedad: propiedad.antiguedad,
        direccion: propiedad.direccion,
        estrato: propiedad.estrato,
        fotografias: propiedad.fotografias,
        parqueaderos: propiedad.parqueaderos,
        ubicacionLat: propiedad.ubicacionLat,
        ubicacionLong: propiedad.ubicacionLong,
        video: propiedad.video,
        puntaje,
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

    const cambios: CreatePropiedad = {
      titulo: data.titulo ?? propiedad.titulo ?? '',
      descripcion: data.descripcion ?? propiedad.descripcion ?? '',
      precio: data.precio ?? propiedad.precio ?? 0,
      ciudad: data.ciudad ?? propiedad.ciudad ?? '',
      barrio: data.barrio ?? propiedad.barrio ?? '',
      tipo: data.tipo ?? propiedad.tipo ?? '',
      habitaciones: data.habitaciones ?? propiedad.habitaciones ?? 0,
      banos: data.banos ?? propiedad.banos ?? 0,
      area: data.area ?? propiedad.area ?? 0,
      antiguedad: data.antiguedad ?? propiedad.antiguedad ?? 0,
      direccion: data.direccion ?? propiedad.direccion ?? '',
      estrato: data.estrato ?? propiedad.estrato ?? 0,
      fotografias: data.fotografias ?? propiedad.fotografias ?? [],
      parqueaderos: data.parqueaderos ?? propiedad.parqueaderos ?? 0,
      ubicacionLat: data.ubicacionLat ?? propiedad.ubicacionLat ?? 0,
      ubicacionLong: data.ubicacionLong ?? propiedad.ubicacionLong ?? 0,
      video: data.video ?? propiedad.video ?? '',
    };

    const puntaje = calcularPuntaje(cambios);

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
        ...(data.antiguedad !== undefined && { antiguedad: data.antiguedad }),
        ...(data.direccion !== undefined && { direccion: data.direccion }),
        ...(data.estrato !== undefined && { estrato: data.estrato }),
        ...(data.fotografias !== undefined && {
          fotografias: data.fotografias,
        }),
        ...(data.parqueaderos !== undefined && {
          parqueaderos: data.parqueaderos,
        }),
        ...(data.ubicacionLat !== undefined && {
          ubicacionLat: data.ubicacionLat,
        }),
        ...(data.ubicacionLong !== undefined && {
          ubicacionLong: data.ubicacionLong,
        }),
        ...(data.video !== undefined && { video: data.video }),
        puntaje,
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
