export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  foto: string | null;
  documentoUrl: string | null;
  role: string;
  createdAt: string;
  documentoVerificado: boolean;
  celularVerificado: boolean;
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
  ubicacionLat?: number | null;
  ubicacionLong?: number | null;
  video?: string;
  puntaje?: number;
  createdAt: string;
  publicadoPorId: string;
  publicadoPor: {
    nombres: string;
    apellidos: string;
    email: string;
    celular: string;
    documentoUrl: string;
    celularVerificado: boolean;
    documentoVerificado?: boolean;
  };
  documentos?: { tipo: string; verificado: boolean }[];
}

export interface DocumentoPropiedad {
  id: string;
  url: string;
  tipo: string;
  verificado: boolean;
  createdAt: string;
  propiedadId: string;
}
