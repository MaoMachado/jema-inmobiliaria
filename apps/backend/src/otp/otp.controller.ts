import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OtpService } from './otp.service';
import type { RequestWithUser } from '../common/types/request-with-user';
import { VerificarOtpDto } from './dto/verificar.dto';

@Controller('otp')
@UseGuards(JwtAuthGuard)
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post('solicitar')
  solicitar(@Req() req: RequestWithUser) {
    return this.otpService.solicitar(req.user.id);
  }

  @Post('verificar')
  verificar(@Req() req: RequestWithUser, @Body() body: VerificarOtpDto) {
    return this.otpService.verificar(req.user.id, body.codigo);
  }
}
