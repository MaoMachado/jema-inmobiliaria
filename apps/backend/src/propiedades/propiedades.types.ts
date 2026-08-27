export interface CreatePropiedad {
  titulo: string;
  descripcion: string;
  precio: number;
  ciudad: string;
  barrio: string;
  direccion: string;
  estrato: number;
  tipo: string;
  habitaciones: number;
  banos: number;
  parqueaderos: number;
  area: number;
  antiguedad: number;
  fotografias?: string[];
  video?: string | null;
  ubicacionLat?: number | null;
  ubicacionLong?: number | null;
  puntaje?: number | null;
}
