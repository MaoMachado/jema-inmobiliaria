import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly bucketPropiedades = 'propiedades-fotos';
  private readonly bucketUsuarios = 'usuario-documento';
  private readonly bucketPropiedadesDocumentos = 'propiedades-documentos';
  private readonly bucketFotoPerfil = 'foto-perfil';
  private readonly bucketPagosComprobantes = 'pagos-comprobantes';

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

  async subirFotoPerfil(file: Express.Multer.File): Promise<string> {
    const ruta = this.generarRuta(file.originalname);

    const { error } = await this.supabase.storage
      .from(this.bucketFotoPerfil)
      .upload(ruta, file.buffer, { contentType: file.mimetype, upsert: true });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase.storage
      .from(this.bucketFotoPerfil)
      .getPublicUrl(ruta);

    return data.publicUrl;
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

  async subirComprobantePago(file: Express.Multer.File): Promise<string> {
    const ruta = this.generarRuta(file.originalname);

    const { error } = await this.supabase.storage
      .from(this.bucketPagosComprobantes)
      .upload(ruta, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      throw new Error(error.message);
    }

    return ruta;
  }

  async getUrlComprobantePago(path: string): Promise<string> {
    return this.crearUrlFirmada(this.bucketPagosComprobantes, path);
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
    expiraEn = 300,
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
      this.bucketFotoPerfil,
      this.bucketPagosComprobantes,
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

  async eliminarDocumentosPropiedad(paths: string[]): Promise<void> {
    await this.eliminar(this.bucketPropiedadesDocumentos, paths);
  }

  async eliminarDocumentoUsuario(path: string): Promise<void> {
    await this.eliminar(this.bucketUsuarios, [path]);
  }

  async eliminarFotosPropiedad(urls: string[]): Promise<void> {
    await this.eliminar(this.bucketPropiedades, urls);
  }

  async eliminarFotoPerfil(url: string): Promise<void> {
    await this.eliminar(this.bucketFotoPerfil, [url]);
  }

  // Borra varios objetos en una sola llamada. Supabase ignora los paths que ya
  // no existen, así que reintentar después de un fallo parcial es seguro.
  private async eliminar(bucket: string, paths: string[]): Promise<void> {
    const limpios = paths
      .map((path) => this.extraerPath(path))
      .filter((path) => path.length > 0);

    if (limpios.length === 0) return;

    // shortcut: remove acepta hasta 1000 paths por llamada; trocear si una
    // propiedad llega a superar ese número.
    const { error } = await this.supabase.storage.from(bucket).remove(limpios);

    if (error) throw new Error(error.message);
  }
}
