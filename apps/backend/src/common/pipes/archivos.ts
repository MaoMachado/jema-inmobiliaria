import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';

// Mismo limite que anuncia el frontend.
export const MAX_BYTES = 10 * 1024 * 1024;

export const TIPOS_IMAGEN = /^image\/(jpeg|png|webp)$/;
export const TIPOS_DOCUMENTO = /^(application\/pdf|image\/(jpeg|png|webp))$/;

// Valida el tipo real por magic number (no la extension) y responde 422 si no coincide.
export const archivosValidos = (fileType: RegExp) =>
  new ParseFilePipeBuilder()
    .addFileTypeValidator({ fileType })
    .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY });
