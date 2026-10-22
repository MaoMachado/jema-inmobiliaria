import { Injectable } from '@nestjs/common';
import { AccionDocumento, Prisma, RecursoDocumento } from '../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import type { ContextoAcceso } from './contexto-acceso';

export interface RegistroAcceso {
  accion: AccionDocumento;
  recursoTipo: RecursoDocumento;
  recursoId: string;
  documento?: string | null;
  usuarioId: string;
}

export interface FiltroAccesos {
  recursoTipo?: RecursoDocumento;
  recursoId?: string;
  usuarioId?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * (fail-closed) Si no se puede registrar el acceso, no se entrega el documento
   * @param registros Lista de registros de acceso a documentos
   * @param contexto Contexto de la solicitud (IP y UserAgent)
   */
  async registrarAccesos(
    registros: RegistroAcceso[],
    contexto: ContextoAcceso,
    cliente: Prisma.TransactionClient = this.prisma,
  ): Promise<void> {
    if (registros.length === 0) return;

    await cliente.accesoDocumento.createMany({
      data: registros.map((registro) => ({
        ...registro,
        ip: contexto.ip,
        userAgent: contexto.userAgent,
      })),
    });
  }

  /**
   * Listar todos los accesos a documentos
   * @param filtros Filtros para la búsqueda de accesos
   * @returns Lista de accesos a documentos
   */
  async listar(filtros: FiltroAccesos) {
    const page = Math.max(1, filtros.page ?? 1);
    const limit = Math.min(100, Math.max(1, filtros.limit ?? 20));

    const where: Prisma.AccesoDocumentoWhereInput = {
      ...(filtros.recursoTipo && { recursoTipo: filtros.recursoTipo }),
      ...(filtros.recursoId && { recursoId: filtros.recursoId }),
      ...(filtros.usuarioId && { usuarioId: filtros.usuarioId }),
    };

    const [total, data] = await Promise.all([
      this.prisma.accesoDocumento.count({ where }),
      this.prisma.accesoDocumento.findMany({
        where,
        orderBy: { createAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
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
}
