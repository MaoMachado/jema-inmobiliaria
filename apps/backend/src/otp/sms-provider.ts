import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

export interface SmsProvider {
  enviarCodigo(celular: string, codigo: string): Promise<void>;
}

@Injectable()
export class DevSmsProvider implements SmsProvider {
  private readonly logger = new Logger(DevSmsProvider.name);

  enviarCodigo(celular: string, codigo: string): Promise<void> {
    this.logger.log(`[DEV] OTP para ${celular}: ${codigo}`);
    return Promise.resolve();
  }
}

@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);

  async enviarCodigo(celular: string, codigo: string): Promise<void> {
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_TOKEN;
    const from = process.env.TWILIO_FROM;

    if (!sid || !token || !from) {
      this.logger.warn(
        'Credenciales de Twilio incompletas, usando DevSmsProvider como fallback',
      );

      return new DevSmsProvider().enviarCodigo(celular, codigo);
    }

    const client = twilio(sid, token);

    try {
      await client.messages.create({
        body: `Tu código OTP es: ${codigo}`,
        from,
        to: celular,
      });
    } catch (error) {
      this.logger.error('Error al enviar SMS con Twilio:', error);
      throw new Error('No se pudo enviar el SMS. Inténtalo de nuevo.');
    }
  }
}

@Injectable()
export class SmsProviderFactory {
  crear(): SmsProvider {
    const provider = (process.env.OTP_SMS_PROVIDER ?? 'auto').toLowerCase();
    const sid = process.env.TWILIO_SID;
    const token = process.env.TWILIO_TOKEN;
    const from = process.env.TWILIO_FROM;

    if (
      provider === 'twilio' ||
      (provider === 'auto' && sid && token && from)
    ) {
      return new TwilioSmsProvider();
    }

    return new DevSmsProvider();
  }
}
