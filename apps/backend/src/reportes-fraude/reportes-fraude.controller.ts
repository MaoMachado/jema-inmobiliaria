import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportesFraudeServices } from './reportes-fraude.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ChangeEstadoReporteDto,
  ReportesFraudeDto,
} from './dto/reporte-fraude.dto';
import { type RequestWithUser } from '../common/types/request-with-user';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('reportes-fraude')
export class ReportesFraudeController {
  constructor(private readonly reportesFraude: ReportesFraudeServices) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('/metricas')
  getMetricas() {
    return this.reportesFraude.getMetricas();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: ReportesFraudeDto, @Req() req: RequestWithUser) {
    return this.reportesFraude.createReporteFraude(body, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  getAll() {
    return this.reportesFraude.getReporteFraudeAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('/:id')
  change(@Param('id') id: string, @Body() body: ChangeEstadoReporteDto) {
    return this.reportesFraude.changeEstado(id, body.estado);
  }
}
