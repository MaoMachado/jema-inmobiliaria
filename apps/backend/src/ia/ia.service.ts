import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
export class IaServices {
  private genAI: GoogleGenAI;
  private readonly MODELO = 'gemini-3.6-flash';
  private readonly MAX_REINTENTOS = 3;

  constructor(private readonly prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Falta la variable de entorno');
    }

    this.genAI = new GoogleGenAI({ apiKey });
  }

  private async generarRespuesta(prompt: string) {
    for (let intento = 1; intento <= this.MAX_REINTENTOS; intento++) {
      try {
        return await this.genAI.models.generateContent({
          model: this.MODELO,
          contents: prompt,
        });
      } catch (error) {
        const esReintentable =
          error instanceof ApiError &&
          (error.status === 503 ||
            error.status === 429 ||
            error.status === 500);

        if (!esReintentable || intento === this.MAX_REINTENTOS) throw error;
        await new Promise((resolve) =>
          setTimeout(resolve, intento * intento * 1000),
        );
      }
    }
  }

  private inicioHoy() {
    const zona = process.env.APP_TIMEZONE ?? 'America/Bogota';
    const partes = new Intl.DateTimeFormat('en', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());

    const map: Record<string, string> = {};
    for (const p of partes) if (p.type !== 'literal') map[p.type] = p.value;

    return new Date(`${map.year}-${map.month}-${map.day}T00:00:00Z`);
  }

  async chat(mensaje: string, userId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: userId },
      select: { chatIaLimite: true, chatUsados: true, chatFecha: true },
    });

    if (!usuario)
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);

    const esDiaNuevo =
      !usuario.chatFecha || usuario.chatFecha < this.inicioHoy();

    if (esDiaNuevo) {
      await this.prisma.usuario.update({
        where: { id: userId },
        data: { chatUsados: 1, chatFecha: this.inicioHoy() },
      });
    } else {
      const reserva = await this.prisma.usuario.updateMany({
        where: { id: userId, chatUsados: { lt: usuario.chatIaLimite } },
        data: { chatUsados: { increment: 1 } },
      });

      if (reserva.count === 0) {
        throw new HttpException(
          `Alcanzaste el limite de ${usuario.chatIaLimite} consultas del dia. Mejora tu plan para ampliarlo.`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    try {
      const propiedades = await this.prisma.propiedad.findMany({
        where: { estado: 'APROBADA' },
        take: 20,
        select: {
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

      const prompt = `Eres un asesor inmobiliario de JEMA Inmobiliaria.
      Estas son las propiedades disponibles:
      ${JSON.stringify(propiedades)}

      Pregunta del usuario: ${mensaje}

      Responde de forma y concisa y util. Si no hay propiedades relevantes, menciona que no se encontraron resultados.
      `;

      const response = await this.generarRespuesta(prompt);
      return response?.text;
    } catch (error) {
      await this.prisma.usuario.update({
        where: { id: userId },
        data: { chatUsados: { decrement: 1 } },
      });
      console.error('Error en chat IA:', error);
      throw new HttpException(
        'No se pudo procesar la consulta. Inténtalo de nuevo',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async estimacionPropiedad(propiedadId: string, userId: string) {
    const propiedad = await this.prisma.propiedad.findUnique({
      where: { id: propiedadId },
    });

    if (!propiedad)
      throw new HttpException('Propiedad no encontrada', HttpStatus.NOT_FOUND);

    if (propiedad.publicadoPorId !== userId) {
      throw new HttpException('Propiedad no encontrada', HttpStatus.NOT_FOUND);
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
      const prompt = `Eres un asesor inmobiliario de JEMA para una propiedad ${propiedad.tipo} en ${propiedad.ciudad}.
      Interpreta estos valores: ${JSON.stringify(valores)}.
      Responde en 2-3 frases comerciales, en español, orientadas a un propietario.`;

      const response = await this.generarRespuesta(prompt);
      mensajeIA = response?.text ?? null;
    } catch (error) {
      console.error('Error en estimación de propiedad:', error);
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
