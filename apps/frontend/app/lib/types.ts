export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  foto: string | null;
  role: string;
  createdAt: string;
}

export interface Propiedad {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  ciudad: string;
  barrio: string;
  tipo: string;
  habitaciones: number;
  banos: number;
  area: number;
  fotografias: string[];
  video: string | null;
  ubicacionLat: number | null;
  ubicacionLong: number | null;
  puntaje: number | null;
}
