import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';

const URL_SANDBOX = 'https://sandbox.wompi.co/v1';

export type StateWompi =
  'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';

export interface TransactionWompi {
  id: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  status: StateWompi;
  payment_method_details: string;
}

export interface EventWompi {
  event: string;
  data: {
    transaction: {
      id: string;
      reference: string;
      amount_in_cents: number;
      status: StateWompi;
    };
  };

  environment: string;
  signature: { properties: string[]; checksum: string };
  timestamp: number;
}

@Injectable()
export class WompiClient {
  private readonly logger = new Logger(WompiClient.name);

  private get baseUrl(): string {
    const url = process.env.WOMPI_URL?.trim();
    return (url && url.length > 0 ? url : URL_SANDBOX).replace(/\/+$/, '');
  }

  private require(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
      throw new InternalServerErrorException(
        `${name} no está configurado en el servidor`,
      );
    }

    return value;
  }

  private get publicKey(): string {
    return this.require('WOMPI_PUBLIC_KEY');
  }

  private get privateKey(): string {
    return this.require('WOMPI_PRIVATE_KEY');
  }

  private async llamar<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Wompi ${path} respondió ${response.status}: ${body}`);
      throw new BadGatewayException(
        'No se pudo comunicar con la pasarela de pagos',
      );
    }

    return (await response.json()) as T;
  }

  private async tokensAceptacion(): Promise<{ acceptance: string; data: string }> {
    const info = await this.llamar<{
      data: {
        presigned_acceptance: { acceptance_token: string };
        presigned_personal_data_auth: { acceptance_token: string };
      };
    }>('/merchants/info', {
      headers: { 'x-merchant-public-key': this.publicKey },
    });

    return {
      acceptance: info.data.presigned_acceptance.acceptance_token,
      data: info.data.presigned_personal_data_auth.acceptance_token,
    };
  }

  private firmaIntegridad(referencia: string, montoCentavos: number): string {
    const secreto = this.require('WOMPI_INTEGRITY_SECRET');

    return createHash('sha256')
      .update(`${referencia}${montoCentavos}COP${secreto}`)
      .digest('hex');
  }

  async crearTransaccionNequi(params: {
    referencia: string;
    montoCentavos: number;
    email: string;
    telefono: string;
  }): Promise<TransactionWompi> {
    const { acceptance, data } = await this.tokensAceptacion();

    const respuesta = await this.llamar<{ data: TransactionWompi }>(
      '/transactions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.privateKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          acceptance_token: acceptance,
          accept_personal_auth: data,
          amount_in_cents: params.montoCentavos,
          currency: 'COP',
          customer_email: params.email,
          reference: params.referencia,
          signature: this.firmaIntegridad(
            params.referencia,
            params.montoCentavos,
          ),
          payment_method_type: 'NEQUI',
          payment_method: {
            type: 'NEQUI',
            phone_number: params.telefono,
          },
        }),
      },
    );

    return respuesta.data;
  }

  async consultarTransaccion(id: string): Promise<TransactionWompi> {
    const respuesta = await this.llamar<{ data: TransactionWompi }>(
      `/transactions/${id}`,
      { headers: { Authorization: `Bearer ${this.privateKey}` } },
    );

    return respuesta.data;
  }

  eventoAutentico(evento: EventWompi): boolean {
    const secreto = this.require('WOMPI_EVENT_SECRET');

    const valores = evento.signature.properties.map((ruta) =>
      this.valorEnRuta(evento.data, ruta),
    );

    const calculado = createHash('sha256')
      .update(`${valores.join('')}${evento.timestamp}${secreto}`)
      .digest('hex');

    return this.comparar(calculado, evento.signature.checksum.toLowerCase());
  }

  private valorEnRuta(origen: unknown, ruta: string): string {
    const valor = ruta
      .split('.')
      .reduce<unknown>(
        (actual, clave) => (actual as Record<string, unknown>)?.[clave],
        origen,
      );

    return String(valor);
  }

  private comparar(calculado: string, recibido: string): boolean {
    const bufferCalculado = Buffer.from(calculado, 'hex');
    const bufferRecibido = Buffer.from(recibido, 'hex');

    if (bufferCalculado.length !== bufferRecibido.length) return false;

    return timingSafeEqual(bufferCalculado, bufferRecibido);
  }
}
