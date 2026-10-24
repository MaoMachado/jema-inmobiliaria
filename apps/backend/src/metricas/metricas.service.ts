import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Métricas del dashboard admin. Vive fuera de reportes-fraude porque
// cuenta propiedades, usuarios y pagos, no solo reportes.
@Injectable()
export class MetricasService {
  constructor(private readonly prisma: PrismaService) {}

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
