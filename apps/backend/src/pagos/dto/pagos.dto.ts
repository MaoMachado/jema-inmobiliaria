import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { EstadoPago, Plan } from '../../generated/prisma';

export class SolicitudPagoDto {
  @IsNumber()
  monto: number;

  @IsEnum(Plan)
  plan: Plan;

  @IsString()
  @IsOptional()
  comprobante?: string;

  @IsString()
  @IsOptional()
  @Length(4, 40, {
    message: 'La referencia debe tener entre 4 y 40 caracteres',
  })
  @Matches(/^[A-Za-z0-9-./]+$/, {
    message: 'La referencia solo admite letras, números, guiones y puntos',
  })
  referencia?: string;
}

export class ChangeEstadoPagoDto {
  @IsEnum(EstadoPago)
  estado: EstadoPago;
}

export class PagoNequiDto {
  @IsEnum(Plan)
  plan: Plan;

  @IsString()
  @Matches(/^3\d{9}$/, {
    message: 'El celular debe ser Nequi: 10 dígitos iniciando en 3',
  })
  telefono: string;
}
