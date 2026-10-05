import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CambiarPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Debe ingresar su password actual' })
  actual: string;

  @IsString()
  @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  @MaxLength(50, {
    message: 'La nueva contraseña debe tener menos de 50 caracteres',
  })
  nueva: string;
}
