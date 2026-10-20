import { randomBytes } from 'crypto';
import { authenticator } from 'otplib';
import { TotpService } from './totp.service';

process.env.TOTP_ENC_KEY ??= randomBytes(32).toString('hex');

describe('TotpService', () => {
  const service = new TotpService();
  const secreto = 'JBSWY3DPEHPK3PXP';

  it('debe cifrar y descifrar el secreto', () => {
    const cifrado = service.cifrar(secreto);

    expect(cifrado).not.toContain(secreto);
    expect(service.descifrar(cifrado)).toBe(secreto);
  });

  it('debe aceptar el código vigente del secreto', () => {
    const codigo = authenticator.generate(secreto);

    expect(service.valido(service.cifrar(secreto), codigo)).toBe(true);
  });

  it('debe rechazar un código incorrecto', () => {
    expect(service.valido(service.cifrar(secreto), '000000')).toBe(false);
  });

  it('debe rechazar un secreto corrupto sin lanzar', () => {
    expect(service.valido('basura', '123456')).toBe(false);
  });

  it('debe devolver un QR en data URL', async () => {
    const { qr } = await service.crear('admin@test.com');

    expect(qr.startsWith('data:image/png;base64,')).toBe(true);
  });
});
