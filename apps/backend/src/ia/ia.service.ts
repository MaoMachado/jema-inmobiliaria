import {
  BadGatewayException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenAI, ApiError } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';
import {
  canonEsperado,
  probabilidadOcupacional,
  probabilidadVenta,
  rentabilidadAnual,
  tiempoEstimadoDias,
  tiempoEstimadoOcupacion,
} from '../propiedades/calcular-probabilidad';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);
  private genAI: GoogleGenAI | null = null;
  private readonly MODELO = 'gemini-3.6-flash';
  private readonly MAX_REINTENTOS = 3;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn(
        'GEMINI_API_KEY no está configurada. Las funciones de IA estarán deshabilitadas.',
      );
    }
  }

  private async generarRespuesta(prompt: string): Promise<string | null> {
    if (!this.genAI) {
      throw new BadGatewayException(
        'El servicio de IA no se encentra configurado en el servidor',
      );
    }

    for (let intento = 1; intento <= this.MAX_REINTENTOS; intento++) {
      try {
        const response = await this.genAI.models.generateContent({
          model: this.MODELO,
          contents: prompt,
        });

        return response?.text ?? null;
      } catch (error) {
        const esReintentable =
          error instanceof ApiError &&
          (error.status === 503 ||
            error.status === 429 ||
            error.status === 500);

        if (!esReintentable || intento === this.MAX_REINTENTOS) {
          this.logger.error(
            `Error al llamar Gemini (intento ${intento}/${this.MAX_REINTENTOS}):`,
            error,
          );
          throw error;
        }

        const backoffMs = intento * intento * 1000;
        this.logger.warn(
          `Reintentando consulta IA en ${backoffMs}ms por error transitorio (${error.status})`,
        );

        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    return null;
  }

  private inicioHoy(): Date {
    const zona = process.env.APP_TIMEZONE ?? 'America/Bogota';
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const map: Record<string, string> = {};
    for (const p of partes) if (p.type !== 'literal') map[p.type] = p.value;

    return new Date(`${map.year}-${map.month}-${map.day}T00:00:00.000Z`);
  }

  async chat(mensaje: string, userId: string): Promise<string> {
    const hoy = this.inicioHoy();

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { chatIaLimite: true, chatUsados: true, chatFecha: true },
    });

    if (!usuario) {
      throw new ForbiddenException('Usuario no autorizado');
    }

    const esDiaNuevo = !usuario.chatFecha || usuario.chatFecha < hoy;

    if (esDiaNuevo) {
      await this.prisma.usuario.update({
        where: { id: userId },
        data: { chatUsados: 1, chatFecha: hoy },
      });
    } else {
      const reserva = await this.prisma.usuario.updateMany({
        where: { id: userId, chatUsados: { lt: usuario.chatIaLimite } },
        data: { chatUsados: { increment: 1 } },
      });

      if (reserva.count === 0) {
        throw new ForbiddenException(
          `Alcanzaste el limite de ${usuario.chatIaLimite} consultas del dia. Mejora tu plan para ampliarlo.`,
        );
      }
    }

    try {
      const propiedades = await this.prisma.propiedad.findMany({
        where: { estado: 'APROBADA' },
        take: 15,
        orderBy: { puntaje: 'desc' },
        select: {
          id: true,
          titulo: true,
          precio: true,
          ciudad: true,
          barrio: true,
          tipo: true,
          habitaciones: true,
          area: true,
          puntaje: true,
        },
      });

      const catalogoFormateado =
        propiedades.length > 0
          ? propiedades
              .map(
                (p) =>
                  `• ${p.titulo} en ${p.ciudad} (${p.barrio || 'Zona céntrica'}) - Tipo: ${p.tipo}, Precio: $${p.precio.toLocaleString('es-CO')} COP, ${p.habitaciones} habs, ${p.area}m²`,
              )
              .join('\n')
          : 'No hay inmuebles disponibles en este momento';

      const prompt = `
        Eres el asesor inmobiliario virtual de "JEMA Inmobiliaria" en Colombia.
        Tu labor es orientar amablemente a los clientes sobre opciones de vivienda, compra y arriendo basándote en nuestro inventario.

        Inventario de propiedades aprobadas:
        ${catalogoFormateado}

        Instrucciones:
        1. Responde de forma concisa, cálida y profesional (máximo 3-4 párrafos breves).
        2. Si el usuario pregunta por una ciudad o tipo de inmueble disponible en la lista, sugiérele las opciones más acordes con su precio.
        3. Si no hay propiedades que coincidan exactamente, explícalo con amabilidad e invítalo a revisar el catálogo general.
        4. No respondas temas no relacionados con bienes raíces ni inventes propiedades fuera del catálogo.

        <consulta_usuario>
        ${mensaje}
        </consulta_usuario>`;

      const respuesta = await this.generarRespuesta(prompt);
      return (
        respuesta ??
        'En este momento no tengo respuesta a tu solicitud. Intenta nuevamente'
      );
    } catch (error) {
      await this.prisma.usuario
        .update({
          where: { id: userId },
          data: { chatUsados: { decrement: 1 } },
        })
        .catch(() => null);

      this.logger.error(`Fallo al generar respuesta de chat: ${error}`);
      throw new BadGatewayException(
        'No se pudo generar una respuesta en este momento',
      );
    }
  }

  async estimacionPropiedad(propiedadId: string, userId: string) {
    const propiedad = await this.prisma.propiedad.findUnique({
      where: { id: propiedadId },
    });

    if (!propiedad || propiedad.publicadoPorId !== userId) {
      throw new NotFoundException('Propiedad no encontrada');
    }

    const similares = await this.prisma.propiedad.findMany({
      where: {
        id: { not: propiedadId },
        tipo: propiedad.tipo,
        ciudad: propiedad.ciudad,
      },
      take: 10,
    });

    const valores = {
      venta: probabilidadVenta(propiedad, similares),
      ocupacional: probabilidadOcupacional(propiedad, similares),
      tiempoDias: tiempoEstimadoDias(propiedad, similares),
      canon: canonEsperado(propiedad),
      rentabilidad: rentabilidadAnual(propiedad),
      tiempoOcupacion: tiempoEstimadoOcupacion(propiedad, similares),
    };

    let mensajeIA: string | null = null;

    try {
      const prompt = `Eres un asesor financiero inmobiliario senior en Colombia.
        Analiza la siguiente propiedad de tipo ${propiedad.tipo} ubicada en ${propiedad.ciudad} (Precio: $${propiedad.precio.toLocaleString('es-CO')} COP, Área: ${propiedad.area}m²).

        Métricas calculadas:
        - Probabilidad de venta estimada: ${valores.venta}%
        - Probabilidad de ocupación en arriendo: ${valores.ocupacional}%
        - Tiempo promedio para cierre: ${valores.tiempoDias} días
        - Canon de arrendamiento sugerido: $${valores.canon.toLocaleString('es-CO')} COP/mes
        - Rentabilidad anual estimada: ${valores.rentabilidad}%

        Genera un resumen ejecutivo de 2 a 3 frases en español dirigido al propietario con una recomendación estratégica de precio o competitividad.`;

      const response = await this.generarRespuesta(prompt);
      mensajeIA = response;
    } catch (error) {
      this.logger.warn(
        `Estimación IA no disponible para propiedad ${propiedadId}, se retornan solo valores numéricos:`,
        error,
      );
    }

    return {
      mensajeIA,
      valores: {
        probabilidadVenta: valores.venta,
        probabilidadOcupacional: valores.ocupacional,
        tiempoEstimadoDias: valores.tiempoDias,
        canonEsperado: valores.canon,
        rentabilidadAnual: valores.rentabilidad,
        tiempoEstimadoOcupacion: valores.tiempoOcupacion,
      },
    };
  }
}
