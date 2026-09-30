import { Test, TestingModule } from '@nestjs/testing';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';

describe('OtpController', () => {
  let controller: OtpController;
  let otpService: any;

  beforeEach(async () => {
    otpService = {
      solicitar: jest
        .fn()
        .mockResolvedValue({ message: 'Código enviado a tu celular' }),
      verificar: jest.fn().mockResolvedValue({
        message: 'Celular verificado exitosamente',
        celularVerificado: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtpController],
      providers: [{ provide: OtpService, useValue: otpService }],
    }).compile();

    controller = module.get<OtpController>(OtpController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('solicitar debe llamar a otpService.solicitar con req.user.id', async () => {
    const req = { user: { id: 'user-123' } } as any;
    const result = await controller.solicitar(req);

    expect(otpService.solicitar).toHaveBeenCalledWith('user-123');
    expect(result).toEqual({ message: 'Código enviado a tu celular' });
  });

  it('verificar debe llamar a otpService.verificar con req.user.id y codigo', async () => {
    const req = { user: { id: 'user-123' } } as any;
    const dto = { codigo: '654321' };
    const result = await controller.verificar(req, dto);

    expect(otpService.verificar).toHaveBeenCalledWith('user-123', '654321');
    expect(result).toEqual({
      message: 'Celular verificado exitosamente',
      celularVerificado: true,
    });
  });
});
