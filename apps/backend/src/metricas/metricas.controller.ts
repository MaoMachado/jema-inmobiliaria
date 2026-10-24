import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MetricasService } from './metricas.service';

// La ruta se mantiene en /reportes-fraude/metricas: el frontend ya la consume.
@Controller('reportes-fraude')
export class MetricasController {
  constructor(private readonly metricasService: MetricasService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('metricas')
  getMetricas() {
    return this.metricasService.getMetricas();
  }
}
