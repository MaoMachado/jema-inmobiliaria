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

  // Sube a un bucket y devuelve la ruta. Fotos y perfil devuelven ademas la URL publica.
  private async subirBase(
    bucket: string,
    file: Express.Multer.File,
    upsert = false,
  ): Promise<string> {
    const ruta = this.generarRuta(file.originalname);

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(ruta, file.buffer, { contentType: file.mimetype, upsert });

    if (error) {
      throw new Error(error.message);
    }

    return ruta;
  }

  private urlPublica(bucket: string, ruta: string): string {
    return this.supabase.storage.from(bucket).getPublicUrl(ruta).data.publicUrl;
  }

  async subirFoto(file: Express.Multer.File): Promise<string> {
    const ruta = await this.subirBase(this.bucketPropiedades, file, true);
    return this.urlPublica(this.bucketPropiedades, ruta);
  }

  async subirFotos(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.subirFoto(file)));
  }

  async subirFotoPerfil(file: Express.Multer.File): Promise<string> {
    const ruta = await this.subirBase(this.bucketFotoPerfil, file, true);
    return this.urlPublica(this.bucketFotoPerfil, ruta);
  }

  async subirDocumento(file: Express.Multer.File): Promise<string> {
    return this.subirBase(this.bucketUsuarios, file);
  }

  async subirPropiedadDocumento(file: Express.Multer.File): Promise<string> {
    return this.subirBase(this.bucketPropiedadesDocumentos, file);
  }

  async subirComprobantePago(file: Express.Multer.File): Promise<string> {
    return this.subirBase(this.bucketPagosComprobantes, file);
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

  async getUrlComprobantePago(path: string): Promise<string> {
    return this.crearUrlFirmada(this.bucketPagosComprobantes, path);
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

  eliminarDocumentosPropiedad(paths: string[]): Promise<void> {
    return this.eliminar(this.bucketPropiedadesDocumentos, paths);
  }

  eliminarDocumentoUsuario(path: string): Promise<void> {
    return this.eliminar(this.bucketUsuarios, [path]);
  }

  eliminarFotosPropiedad(urls: string[]): Promise<void> {
    return this.eliminar(this.bucketPropiedades, urls);
  }

  eliminarFotoPerfil(url: string): Promise<void> {
    return this.eliminar(this.bucketFotoPerfil, [url]);
  }
}
