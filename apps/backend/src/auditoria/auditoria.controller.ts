import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ListarAccesosDto } from './dto/listar-accesos.dto';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('documentos')
  listar(@Query() query: ListarAccesosDto) {
    return this.auditoriaService.listar(query);
  }
}
