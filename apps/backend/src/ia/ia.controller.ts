import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user';
import { ChatDto } from './dto/chat.dto';
import { IaServices } from './ia.service';
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

@Controller('ia')
export class IaController {
  constructor(private readonly IaServices: IaServices) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Body() dto: ChatDto, @Req() req: RequestWithUser) {
    return this.IaServices.chat(dto.mensaje, req.user.id);
  }
}
