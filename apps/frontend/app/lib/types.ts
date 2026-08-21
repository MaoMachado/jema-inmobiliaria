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
  precio: number;
  ciudad: string;
  barrio: string;
  tipo: string;
  habitaciones: number;
  banos: number;
  area: number;
  fotografias: string[];
  puntaje: number;
  createdAt: string;
  publicadoPor: {
    nombres: string;
    apellidos: string;
    email: string;
    celular: string;
  };
}
