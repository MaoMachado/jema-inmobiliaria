import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatDto } from './dto/chat.dto';
import { IaServices } from './ia.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';

@Controller('ia')
export class IaController {
  constructor(private readonly IaServices: IaServices) {}

  @UseGuards(JwtAuthGuard)
  @Post('chat')
  async chat(@Body() dto: ChatDto) {
    return this.IaServices.chat(dto.mensaje);
  }
}
