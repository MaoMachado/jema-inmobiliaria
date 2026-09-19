import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GoogleGenAI, ApiError } from '@google/genai';
import { PrismaService } from '../prisma/prisma.service';

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

  async chat(mensaje: string) {
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
      console.error('Error en chat IA:', error);
      throw new HttpException(
        'No se pudo procesar la consulta. Inténtalo de nuevo',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
