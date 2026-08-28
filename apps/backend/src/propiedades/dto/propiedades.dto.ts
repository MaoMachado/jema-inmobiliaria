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

  @IsNumber()
  @IsNotEmpty()
  estrato: number;

  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsNumber()
  @IsNotEmpty()
  habitaciones: number;

  @IsNumber()
  @IsNotEmpty()
  banos: number;

  @IsNumber()
  @IsNotEmpty()
  parqueaderos: number;

  @IsNumber()
  @IsNotEmpty()
  area: number;

  @IsNumber()
  @IsNotEmpty()
  antiguedad: number;

  @IsArray()
  @IsOptional()
  fotografias?: string[];

  @IsString()
  @IsOptional()
  video?: string | null;

  @IsNumber()
  @IsOptional()
  ubicacionLat?: number | null;

  @IsNumber()
  @IsOptional()
  ubicacionLong?: number | null;

  @IsNumber()
  @IsOptional()
  puntaje?: number | null;
}
