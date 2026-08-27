import { CreatePropiedad } from './propiedades.types';

interface ReglaPuntaje {
  peso: number;
  evaluar: (propiedad: CreatePropiedad) => number;
}

const escalar = (valor: number, esperado: number, peso: number) =>
  Math.min((valor / esperado) * peso, peso);

const reglas: ReglaPuntaje[] = [
  { peso: 5, evaluar: (p) => escalar(p.titulo.trim().length, 60, 5) },
  { peso: 15, evaluar: (p) => escalar(p.descripcion.trim().length, 300, 15) },
  {
    peso: 10,
    evaluar: (p) => (p.precio > 0 ? (p.precio > 100000 ? 10 : 5) : 0),
  },
  { peso: 5, evaluar: (p) => (p.ciudad.trim() ? 5 : 0) },
  { peso: 5, evaluar: (p) => (p.barrio.trim() ? 5 : 0) },
  { peso: 5, evaluar: (p) => (p.tipo.trim() ? 5 : 0) },
  { peso: 5, evaluar: (p) => (p.habitaciones > 0 ? 5 : 0) },
  { peso: 5, evaluar: (p) => (p.banos > 0 ? 5 : 0) },
  { peso: 5, evaluar: (p) => escalar(p.area, 150, 5) },
  { peso: 5, evaluar: (p) => escalar(p.antiguedad, 50, 5) },
  { peso: 5, evaluar: (p) => (p.direccion.trim() ? 5 : 0) },
  { peso: 2, evaluar: (p) => (p.estrato > 0 ? 2 : 0) },
  { peso: 15, evaluar: (p) => Math.min((p.fotografias?.length ?? 0) * 3, 15) },
  { peso: 2, evaluar: (p) => (p.parqueaderos > 0 ? 2 : 0) },
  { peso: 3, evaluar: (p) => ((p.ubicacionLat ?? 0) > 0 ? 3 : 0) },
  { peso: 3, evaluar: (p) => ((p.ubicacionLong ?? 0) > 0 ? 3 : 0) },
  { peso: 2, evaluar: (p) => ((p.video ?? '').trim() ? 2 : 0) },
];

export const calcularPuntaje = (propiedad: CreatePropiedad): number => {
  const total = reglas.reduce(
    (acc, regla) => acc + regla.evaluar(propiedad),
    0,
  );

  return Math.round(Math.min(total, 100));
};
