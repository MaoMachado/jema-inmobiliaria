import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EstadoReporte } from '../../generated/prisma';

export class ReportesFraudeDto {
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  propiedadId: string;
}

export class ChangeEstadoReporteDto {
  @IsEnum(EstadoReporte)
  estado: EstadoReporte;
}
