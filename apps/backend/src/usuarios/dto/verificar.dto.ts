import { Type } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class VerificarDto {
  @IsBoolean()
  verificado: boolean;
}

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombres: string;

  @IsString()
  @IsNotEmpty()
  apellidos: string;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  celular: number;
}
