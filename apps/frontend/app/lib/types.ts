export interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  celularVerificado: boolean;
  foto: string | null;
  documentoUrl: string | null;
  documentoVerificado: boolean;
  role: string;
  createdAt: string;

  propiedades?: {
    id: string;
    titulo: string;

    documentos: {
      id: string;
      tipo: string;
      verificado: boolean;
      url: string;
    }[];
  }[];
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
  destacada: boolean;
  destacadaHasta?: string | null;

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
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  motivoRechazo?: string;
}

export interface DocumentoPropiedad {
  id: string;
  url: string;
  tipo: string;
  verificado: boolean;
  createdAt: string;
  propiedadId: string;
}

export interface Reporte {
  id: string;
  motivo: string;
  descripcion: string | null;
  estado: string;
  createAt: string;
  creadoPor: { id: string; nombres: string; apellidos: string; email: string };
  propiedad: { id: string; titulo: string; ciudad: string; estado: string };
}

export interface Metricas {
  propiedades: {
    total: number;
    porEstado: {
      estado: string;
      _count: number;
    }[];
    porCiudad: {
      ciudad: string;
      _count: number;
    }[];
  };

  usuarios: {
    total: number;
    porRol: {
      role: string;
      _count: number;
    }[];
  };

  reportesAbiertos: number;
  propiedadesTop: {
    id: string;
    titulo: string;
    puntaje: number | null;
    ciudad: string;
    precio: number;
  }[];
  propiedadesRecientes: {
    id: string;
    titulo: string;
    ciudad: string;
    createdAt: string;
  }[];
}
