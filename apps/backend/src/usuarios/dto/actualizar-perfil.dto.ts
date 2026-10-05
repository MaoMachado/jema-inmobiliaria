import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActualizarPerfilDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Los nombres no pueden superar 100 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  nombres?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Los apellidos no pueden superar 100 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  apellidos?: string;

  @IsString()
  @IsOptional()
  @MaxLength(30, { message: 'El celular no puede superar 30 caracteres' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  celular?: string;
}
