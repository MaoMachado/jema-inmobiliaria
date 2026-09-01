import { IsBoolean } from 'class-validator';

export class VerificarDto {
  @IsBoolean()
  verificado: boolean;
}
