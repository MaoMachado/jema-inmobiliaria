import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { RecursoDocumento } from '../../generated/prisma';

export class ListarAccesosDto {
  @IsEnum(RecursoDocumento)
  @IsOptional()
  recursoTipo?: RecursoDocumento;

  @IsString()
  @IsOptional()
  recursoId?: string;

  @IsString()
  @IsOptional()
  usuarioId?: string;

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
}
