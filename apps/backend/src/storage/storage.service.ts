import { Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly bucket = 'propiedades-fotos';

  constructor(private readonly supabase: SupabaseClient) {}

  async subirFoto(file: Express.Multer.File): Promise<string> {
    const ruta = this.generarRuta(file.originalname);

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(ruta, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.supabase.storage.from(this.bucket).getPublicUrl(ruta);

    return data.publicUrl;
  }

  async subirFotos(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((file) => this.subirFoto(file)));
  }

  private generarRuta(original: string): string {
    const ext = original.split('.').pop()?.toLowerCase() ?? 'jpg';
    const base =
      original
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') || 'foto';

    return `public/${Date.now()}-${base}.${ext}`;
  }
}
