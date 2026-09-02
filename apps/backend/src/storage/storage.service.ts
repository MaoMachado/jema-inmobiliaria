import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly bucketPropiedades = 'propiedades-fotos';
  private readonly bucketUsuarios = 'usuario-documento';
  private readonly bucketPropiedadesDocumentos = 'propiedades-documentos';

  constructor(private readonly supabase: SupabaseClient) {}

  async subirFoto(file: Express.Multer.File): Promise<string> {
    const ruta = this.generarRuta(file.originalname);

    const { error } = await this.supabase.storage
      .from(this.bucketPropiedades)
      .upload(ruta, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase.storage
      .from(this.bucketPropiedades)
      .getPublicUrl(ruta);

    return data.publicUrl;
  }

  async subirFotos(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.subirFoto(file)));
  }

  async subirDocumento(file: Express.Multer.File): Promise<string> {
    const ruta = this.generarRuta(file.originalname);

    const { error } = await this.supabase.storage
      .from(this.bucketUsuarios)
      .upload(ruta, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(error.message);
    }

    return ruta;
  }

  async subirPropiedadDocumento(file: Express.Multer.File): Promise<string> {
    const ruta = this.generarRuta(file.originalname);

    const { error } = await this.supabase.storage
      .from(this.bucketPropiedadesDocumentos)
      .upload(ruta, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(error.message);
    }

    return ruta;
  }

  private generarRuta(original: string): string {
    const ext = original.split('.').pop()?.toLowerCase() ?? 'jpg';
    const base =
      original
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') || 'foto';

    const uuid = crypto.randomUUID();

    return `public/${Date.now()}-${base}-${uuid}.${ext}`;
  }

  async crearUrlFirmada(
    bucket: string,
    path: string,
    expiraEn = 900,
  ): Promise<string> {
    const cleanPath = this.extraerPath(path);

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(cleanPath, expiraEn);

    if (error) {
      throw new Error(error.message);
    }

    return data.signedUrl;
  }

  private extraerPath(valor: string): string {
    if (!valor.startsWith('http')) return valor;

    const url = new URL(valor);
    const parts = url.pathname.split('/');

    const allBuckets = [
      this.bucketPropiedades,
      this.bucketUsuarios,
      this.bucketPropiedadesDocumentos,
    ];

    for (const bucketName of allBuckets) {
      const idx = parts.indexOf(bucketName);

      if (idx !== -1) {
        return parts.slice(idx + 1).join('/');
      }
    }

    return valor;
  }

  async getUrlDocumentoPropiedad(path: string): Promise<string> {
    return this.crearUrlFirmada(this.bucketPropiedadesDocumentos, path);
  }

  async getUrlDocumentoUsuario(path: string): Promise<string> {
    return this.crearUrlFirmada(this.bucketUsuarios, path);
  }
}
