import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class VerificarOtpDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'El código OTP debe tener 6 dígitos numéricos',
  })
  codigo: string;
}
