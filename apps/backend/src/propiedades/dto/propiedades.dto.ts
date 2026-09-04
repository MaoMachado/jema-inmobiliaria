import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePropiedadDto {
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @IsString()
  @IsNotEmpty()
  ciudad: string;

  @IsString()
  @IsNotEmpty()
  barrio: string;

  @IsString()
  @IsNotEmpty()
  direccion: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  estrato: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  habitaciones: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  banos: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  parqueaderos: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  area: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  antiguedad: number;

  @IsArray()
  @IsOptional()
  fotografias?: string[];

  @IsString()
  @IsOptional()
  video?: string | null;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  ubicacionLat?: number | null;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  ubicacionLong?: number | null;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  puntaje?: number | null;
}

export class RechazarPropiedadDto {
  @IsString()
  @IsNotEmpty()
  motivoRechazo: string;
}
