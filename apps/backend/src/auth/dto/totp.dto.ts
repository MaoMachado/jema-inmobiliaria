import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class TotpCodigoDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código debe tener 6 dígitos' })
  codigo: string;
}

export class DesactivarTotpDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
