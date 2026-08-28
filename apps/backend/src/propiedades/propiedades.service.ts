import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/index';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { calcularPuntaje } from './calcular-puntaje';
import {
  canonEsperado,
  probabilidadOcupacional,
  probabilidadVenta,
  rentabilidadAnual,
  tiempoEstimadoDias,
  tiempoEstimadoOcupacion,
} from './calcular-probabilidad';
import { CreatePropiedadDto } from './dto/propiedades.dto';

@Injectable()
export class PropiedadesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  private validate(propiedad: CreatePropiedadDto) {
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

  async create(
    propiedad: CreatePropiedadDto,
    files: Express.Multer.File[],
    userId: string,
  ) {
    const data: CreatePropiedadDto = {
      ...propiedad,
      precio: Number(propiedad.precio),
      habitaciones: Number(propiedad.habitaciones),
      banos: Number(propiedad.banos),
      area: Number(propiedad.area),
      antiguedad: Number(propiedad.antiguedad),
      estrato: Number(propiedad.estrato),
      parqueaderos: Number(propiedad.parqueaderos ?? 0),
    };

    this.validate(data);

    data.fotografias =
      files.length > 0 ? await this.storage.subirFotos(files) : [];

    const puntaje = calcularPuntaje(data);

    const prop = await this.prisma.propiedad.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        precio: data.precio,
        ciudad: data.ciudad,
        barrio: data.barrio,
        tipo: data.tipo,
        habitaciones: data.habitaciones,
        banos: data.banos,
        area: data.area,
        publicadoPorId: userId,
        antiguedad: data.antiguedad,
        direccion: data.direccion,
        estrato: data.estrato,
        fotografias: data.fotografias,
        parqueaderos: data.parqueaderos,
        ubicacionLat: data.ubicacionLat ? Number(data.ubicacionLat) : null,
        ubicacionLong: data.ubicacionLong ? Number(data.ubicacionLong) : null,
        video: data.video ?? null,
        puntaje,
      },
    });

    const { createdAt, updatedAt, ...result } = prop;
    return result;
  }

  async findAll(filtros: {
    ciudad?: string;
    tipo?: string;
    precioMin?: number;
    precioMax?: number;
    habitaciones?: number;
    page?: number;
    limit?: number;
    orderBy?: 'precio' | 'createdAt' | 'puntaje';
    order?: 'asc' | 'desc';
  }) {
    const page = Math.max(1, filtros.page ?? 1);
    const limit = Math.min(100, Math.max(1, filtros.limit ?? 10));

    const where: Prisma.PropiedadWhereInput = {
      ...(filtros.ciudad && {
        ciudad: { equals: filtros.ciudad, mode: 'insensitive' },
      }),
      ...(filtros.tipo && { tipo: filtros.tipo }),
      ...((filtros.precioMin !== undefined ||
        filtros.precioMax !== undefined) && {
        precio: {
          ...(filtros.precioMin !== undefined && { gte: filtros.precioMin }),
          ...(filtros.precioMax !== undefined && { lte: filtros.precioMax }),
        },
      }),
      ...(filtros.habitaciones !== undefined && {
        habitaciones: filtros.habitaciones,
      }),
    };

    const orderByField = filtros.orderBy ?? 'puntaje';
    const orderDirection = filtros.order ?? 'desc';

    const [total, data] = await Promise.all([
      this.prisma.propiedad.count({ where }),
      this.prisma.propiedad.findMany({
        where,
        orderBy: { [orderByField]: orderDirection },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          publicadoPor: {
            select: {
              nombres: true,
              apellidos: true,
              celularVerificado: true,
              documentoVerificado: true,
            },
          },

          documentos: {
            select: { id: true, url: true, tipo: true, verificado: true },
          },
        },
      }),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const propiedad = await this.prisma.propiedad.findUnique({ where: { id } });

    if (!propiedad) {
      throw new NotFoundException('Propiedad no encontrada');
    }
    return propiedad;
  }

  async obtenerContacto(id: string) {
    const propiedad = await this.prisma.propiedad.findUnique({
      where: { id },
      include: {
        publicadoPor: {
          select: {
            email: true,
            celular: true,
          },
        },
      },
    });

    if (!propiedad) {
      throw new NotFoundException('Propiedad no encontrada');
    }
    return {
      email: propiedad.publicadoPor?.email,
      celular: propiedad.publicadoPor?.celular,
    };
  }

  async update(id: string, data: Partial<CreatePropiedadDto>, userId: string) {
    const propiedad = await this.findOne(id);
    if (propiedad.publicadoPorId !== userId) {
      throw new ForbiddenException(
        'No tenes permiso para editar esta propiedad',
      );
    }

    const cambios: CreatePropiedadDto = {
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
      ubicacionLat: data.ubicacionLat ?? propiedad.ubicacionLat ?? null,
      ubicacionLong: data.ubicacionLong ?? propiedad.ubicacionLong ?? null,
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

  async calcularProbabilidad(id: string) {
    const propiedad = await this.findOne(id);

    const similares = await this.prisma.propiedad.findMany({
      where: {
        id: { not: id },
        tipo: propiedad.tipo,
        ciudad: propiedad.ciudad,
      },
      take: 10,
    });

    return {
      probabilidadVenta: probabilidadVenta(propiedad, similares),
      probabilidadOcupacional: probabilidadOcupacional(propiedad, similares),
      tiempoEstimadoDias: tiempoEstimadoDias(propiedad, similares),
      canonEsperado: canonEsperado(propiedad),
      rentabilidadAnual: rentabilidadAnual(propiedad),
      tiempoEstimadoOcupacion: tiempoEstimadoOcupacion(propiedad, similares),
    };
  }

  // Servicios para documentos propiedad
  async subirDocumentos(
    propiedadId: string,
    userId: string,
    files: Express.Multer.File[],
    tipo: string,
  ) {
    const propiedad = await this.findOne(propiedadId);
    if (propiedad.publicadoPorId !== userId) {
      throw new ForbiddenException(
        'No tenes permiso para subir documentos a esta propiedad',
      );
    }

    const urls = await Promise.all(
      files.map((file) => this.storage.subirPropiedadDocumento(file)),
    );

    const documentos = await Promise.all(
      urls.map((url) =>
        this.prisma.documentoPropiedad.create({
          data: {
            url,
            tipo,
            propiedadId,
          },
        }),
      ),
    );

    return documentos;
  }

  async getDocumentos(propiedadId: string) {
    return this.prisma.documentoPropiedad.findMany({
      where: { propiedadId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async eliminarDocumento(docId: string, userId: string) {
    const doc = await this.prisma.documentoPropiedad.findUnique({
      where: { id: docId },
      include: { propiedad: { select: { publicadoPorId: true } } },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');
    if (doc.propiedad.publicadoPorId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este documento',
      );
    }

    await this.prisma.documentoPropiedad.delete({ where: { id: docId } });
    return { message: 'Documento eliminado' };
  }

  async verificarDocumentoPropiedad(docId: string, verificado: boolean) {
    const doc = await this.prisma.documentoPropiedad.findUnique({
      where: { id: docId },
    });

    if (!doc) throw new NotFoundException('Documento no encontrado');

    await this.prisma.documentoPropiedad.update({
      where: { id: docId },
      data: { verificado },
    });

    return { verificado };
  }
}
