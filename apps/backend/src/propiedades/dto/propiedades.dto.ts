import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ToggleDestacadaDto {
  @IsBoolean({ message: 'El estado de destacada debe ser un booleano' })
  destacada: boolean;
}

export class CreatePropiedadDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(150, { message: 'El título no puede superar 150 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(2000, {
    message: 'La descripción no puede superar 2000 caracteres',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  descripcion: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(1, { message: 'El precio debe ser mayor a 0' })
  precio: number;

  @IsString()
  @IsNotEmpty({ message: 'La ciudad es obligatoria' })
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ciudad: string;

  @IsString()
  @IsNotEmpty({ message: 'El barrio es obligatorio' })
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  barrio: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @MaxLength(200)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  direccion: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'El estrato debe ser un número' })
  @Min(1, { message: 'El estrato mínimo es 1' })
  @Max(6, { message: 'El estrato máximo es 6' })
  estrato: number;

  @IsString()
  @IsNotEmpty({ message: 'El tipo de propiedad es obligatorio' })
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  tipo: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Debe tener al menos 1 habitación' })
  habitaciones: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Debe tener al menos 1 baño' })
  banos: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  parqueaderos?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'El área debe ser mayor a 0 m²' })
  area: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'La antigüedad no puede ser negativa' })
  antiguedad: number;

  @IsArray()
  @IsOptional()
  fotografias?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(300)
  video?: string | null;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  ubicacionLat?: number | null;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  ubicacionLong?: number | null;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  puntaje?: number | null;
}

export class UpdatePropiedadDto {
  @IsString()
  @IsOptional()
  @MaxLength(150)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  titulo?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  descripcion?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  precio?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ciudad?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  barrio?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  direccion?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(6)
  @IsOptional()
  estrato?: number;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  tipo?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  habitaciones?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  banos?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  parqueaderos?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  area?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  antiguedad?: number;

  @IsArray()
  @IsOptional()
  fotografias?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(300)
  video?: string | null;

  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  ubicacionLat?: number | null;

  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  ubicacionLong?: number | null;
}

export class FiltroPropiedadesDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  ciudad?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  tipo?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El precio mínimo debe ser mayor o igual a 0' })
  @IsOptional()
  precioMin?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'El precio máximo debe ser mayor o igual a 0' })
  @IsOptional()
  precioMax?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Las habitaciones deben ser al menos 1' })
  @IsOptional()
  habitaciones?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsIn(['precio', 'createdAt', 'puntaje'], {
    message: 'orderBy debe ser precio, createdAt o puntaje',
  })
  @IsOptional()
  orderBy?: 'precio' | 'createdAt' | 'puntaje';

  @IsIn(['asc', 'desc'], { message: 'order debe ser asc o desc' })
  @IsOptional()
  order?: 'asc' | 'desc';
}

export class RechazarPropiedadDto {
  @IsString()
  @IsNotEmpty({ message: 'El motivo de rechazo es obligatorio' })
  @MaxLength(500, { message: 'El motivo no puede superar 500 caracteres' })
  motivoRechazo: string;
}

export class SubirDocumentoDto {
  @IsString()
  @IsNotEmpty({ message: 'El tipo de documento es obligatorio' })
  @MaxLength(50)
  tipo: string;
}
