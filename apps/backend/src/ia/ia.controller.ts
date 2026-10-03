import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '../common/types/request-with-user';
import { ChatDto } from './dto/chat.dto';
import { IaService } from './ia.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

@Controller('ia')
@UseGuards(JwtAuthGuard)
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('chat')
  async chat(@Body() dto: ChatDto, @Req() req: RequestWithUser) {
    return this.iaService.chat(dto.mensaje, req.user.id);
  }

  @Get(':id/estimacion')
  ia(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.iaService.estimacionPropiedad(id, req.user.id);
  }
}
