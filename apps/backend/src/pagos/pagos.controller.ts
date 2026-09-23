import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PagosService } from './pagos.service';
import type { RequestWithUser } from '../common/types/request-with-user';
import { ChangeEstadoPagoDto, SolicitudPagoDto } from './dto/pagos.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @UseGuards(JwtAuthGuard)
  @Get('plan')
  planActual(@Req() req: RequestWithUser) {
    return this.pagosService.planActualUsuario(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comprobante')
  @UseInterceptors(FileInterceptor('comprobante'))
  subirComprobante(
    @Req() req: RequestWithUser,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.pagosService.subirComprobante(req.user.id, file);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  solicitar(@Body() dto: SolicitudPagoDto, @Req() req: RequestWithUser) {
    return this.pagosService.solicitarPago(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('historial')
  historial(@Req() req: RequestWithUser) {
    return this.pagosService.pagosUsuario(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  listarPagos() {
    return this.pagosService.listarPagos();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id/comprobante')
  comprobante(@Param('id') id: string) {
    return this.pagosService.comprobanteUrl(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id')
  cambiarEstado(@Param('id') id: string, @Body() dto: ChangeEstadoPagoDto) {
    return this.pagosService.cambiarEstado(id, dto.estado);
  }
}
