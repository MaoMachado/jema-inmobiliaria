import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReauthDto {
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsOptional()
  @IsString()
  codigo?: string;
}
