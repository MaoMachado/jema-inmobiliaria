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
  antiguedad: number;
  direccion: string;
  estrato: number;
  fotografias: string[];
  parqueaderos: number;
  puntaje: number;
  createdAt: string;
  publicadoPorId: string;
  publicadoPor: {
    nombres: string;
    apellidos: string;
    email: string;
    celular: string;
  };
}
