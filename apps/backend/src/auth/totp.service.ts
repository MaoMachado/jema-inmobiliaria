import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const EMISOR = 'JEMA Inmobiliaria';

// Acepta la ventana anterior y la siguiente (±30 s).
authenticator.options = { window: 1 };

@Injectable()
export class TotpService {
  private readonly clave = this.leerClave();

  private leerClave(): Buffer {
    const clave = process.env.TOTP_ENC_KEY;

    if (!clave || clave.length !== 64) {
      throw new Error('TOTP_ENC_KEY debe ser de 32 bytes en hex');
    }

    return Buffer.from(clave, 'hex');
  }

  // El secreto debe poder recuperarse para recalcular el código: se cifra, no se hashea.
  cifrar(secreto: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.clave, iv);
    const datos = Buffer.concat([
      cipher.update(secreto, 'utf8'),
      cipher.final(),
    ]);

    return [iv, cipher.getAuthTag(), datos]
      .map((parte) => parte.toString('base64'))
      .join('.');
  }

  descifrar(cifrado: string): string {
    const [iv, tag, datos] = cifrado
      .split('.')
      .map((parte) => Buffer.from(parte, 'base64'));

    const decipher = createDecipheriv('aes-256-gcm', this.clave, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(datos), decipher.final()]).toString(
      'utf8',
    );
  }

  async crear(email: string) {
    const secreto = authenticator.generateSecret();
    const qr = await QRCode.toDataURL(
      authenticator.keyuri(email, EMISOR, secreto),
    );

    return { secreto, qr };
  }

  valido(cifrado: string, codigo: string): boolean {
    try {
      return authenticator.check(codigo, this.descifrar(cifrado));
    } catch {
      return false;
    }
  }
}
