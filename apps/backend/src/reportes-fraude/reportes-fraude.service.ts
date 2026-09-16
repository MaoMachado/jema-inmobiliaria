import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoReporte, Prisma } from '../generated/prisma';
import { ReportesFraudeDto } from './dto/reporte-fraude.dto';

@Injectable()
export class ReportesFraudeServices {
  constructor(private readonly prisma: PrismaService) {}

  async createReporteFraude(dto: ReportesFraudeDto, userId: string) {
    if (!dto.motivo?.trim()) {
      throw new BadRequestException('El motivo es obligatorio');
    }

    const propiedad = await this.prisma.propiedad.findUnique({
      where: { id: dto.propiedadId },
    });

    if (!propiedad) {
      throw new NotFoundException('Propidad no encontrada');
    }

    try {
      return await this.prisma.reporteFraude.create({
        data: {
          motivo: dto.motivo,
          descripcion: dto.descripcion,
          usuarioId: userId,
          propiedadId: dto.propiedadId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Reporte ya creado');
      }
      throw error;
    }
  }

  async getReporteFraudeAll() {
    const reportes = await this.prisma.reporteFraude.findMany({
      select: {
        id: true,
        motivo: true,
        descripcion: true,
        estado: true,
        createAt: true,

        creadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },

        propiedad: {
          select: {
            id: true,
            titulo: true,
            ciudad: true,
            estado: true,
          },
        },
      },
      orderBy: { createAt: 'desc' },
    });

    return reportes;
  }

  async changeEstado(reporteId: string, estado: EstadoReporte) {
    const reporteFraude = await this.prisma.reporteFraude.findUnique({
      where: { id: reporteId },
    });

    if (!reporteFraude) throw new NotFoundException('Reporte no encontrado');

    return await this.prisma.reporteFraude.update({
      where: { id: reporteId },
      data: { estado },
    });
  }

  async getMetricas() {
    const [
      totalPropiedades,
      propiedadesPorEstado,
      totalUsuarios,
      usuariosPorRol,
      propiedadesPorCiudad,
      reportesAbiertos,
      propiedadesTop,
      propiedadesRecientes,
    ] = await Promise.all([
      this.prisma.propiedad.count(),
      this.prisma.propiedad.groupBy({ by: ['estado'], _count: true }),
      this.prisma.usuario.count(),
      this.prisma.usuario.groupBy({ by: ['role'], _count: true }),
      this.prisma.propiedad.groupBy({ by: ['ciudad'], _count: true }),
      this.prisma.reporteFraude.count({ where: { estado: 'ABIERTO' } }),
      this.prisma.propiedad.findMany({
        orderBy: { puntaje: 'desc' },
        take: 5,
        select: {
          id: true,
          titulo: true,
          puntaje: true,
          ciudad: true,
          precio: true,
        },
      }),
      this.prisma.propiedad.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, titulo: true, ciudad: true, createdAt: true },
      }),
    ]);

    return {
      propiedades: {
        total: totalPropiedades,
        porEstado: propiedadesPorEstado,
        porCiudad: propiedadesPorCiudad,
      },

      usuarios: { total: totalUsuarios, porRol: usuariosPorRol },

      reportesAbiertos,
      propiedadesTop,
      propiedadesRecientes,
    };
  }
}
