export interface CreatePropiedad {
  titulo: string;
  descripcion: string;
  precio: number;
  ciudad: string;
  barrio: string;
  tipo: string;
  habitaciones: number;
  banos: number;
  area: number;
  antiguedad: number;
  direccion: string;
  estrato: number;
  fotografias?: string[];
  parqueaderos: number;
  ubicacionLat?: number | null;
  ubicacionLong?: number | null;
  video?: string;
  puntaje?: number;
}
