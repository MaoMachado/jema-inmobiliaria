import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChatDto {
  @IsString({ message: 'El mensaje debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MinLength(2, { message: 'El mensaje debe tener al menos 2 caracteres' })
  @MaxLength(600, { message: 'El mensaje no puede superar 600 caracteres' })
  mensaje: string;
}
