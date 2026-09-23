import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { EstadoPago, Plan } from '../../generated/prisma';

export class SolicitudPagoDto {
  @IsNumber()
  monto: number;

  @IsEnum(Plan)
  plan: Plan;

  @IsString()
  @IsOptional()
  comprobante?: string;
}

export class ChangeEstadoPagoDto {
  @IsEnum(EstadoPago)
  estado: EstadoPago;
}
