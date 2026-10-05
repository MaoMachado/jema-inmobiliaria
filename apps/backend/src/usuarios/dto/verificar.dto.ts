import { IsBoolean } from 'class-validator';

export class VerificarDto {
  @IsBoolean({ message: 'El campo verificado debe ser booleano' })
  verificado: boolean;
}
