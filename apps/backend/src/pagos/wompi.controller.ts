import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user';
import { PagoNequiDto } from './dto/pagos.dto';
import type { EventWompi } from './wompi.client';
import { WompiService } from './wompi.service';

@Controller('pagos/wompi')
export class WompiController {
  constructor(private readonly wompiService: WompiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('nequi')
  iniciar(@Body() body: PagoNequiDto, @Req() req: RequestWithUser) {
    return this.wompiService.iniciarPagoNequi(
      body.plan,
      body.telefono,
      req.user.id,
    );
  }

  @Post('evento')
  async evento(@Body() body: EventWompi) {
    await this.wompiService.procesarEvento(body);
    return { recibido: true };
  }
}
