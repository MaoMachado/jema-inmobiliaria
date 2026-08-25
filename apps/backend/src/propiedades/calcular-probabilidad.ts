import { CreatePropiedad } from './propiedades.types';

const PESO_PRECIO_OCUPACION = 0.6;
const PESO_COMPLETITUD_OCUPACION = 0.2;
const PESO_CARACTERISTICAS_OCUPACION = 0.2;
const COMISION_MENSUAL = 0.006;
const MESES_POR_YEAR = 12;

export const probabilidadOcupacional = (
  propiedad: CreatePropiedad,
  propiedadesSimilares: CreatePropiedad[],
): number => {
  if (propiedadesSimilares.length === 0) {
    return propiedad.puntaje ?? 50;
  }

  const completitud = propiedad.puntaje ?? 50;

  const preciosSimilares = propiedadesSimilares.map((p) => p.precio);
  const precioPromedio =
    preciosSimilares.reduce((acc, precio) => acc + precio, 0) /
    propiedadesSimilares.length;

  const diferenciaPorcentual =
    precioPromedio > 0
      ? ((propiedad.precio - precioPromedio) / precioPromedio) * 100
      : 0;

  const precioScore = Math.max(0, Math.min(100, 100 - diferenciaPorcentual));

  const areasSimilares = propiedadesSimilares.map((p) => p.area);
  const habitacionesSimilares = propiedadesSimilares.map((p) => p.habitaciones);

  const areaPromedio =
    areasSimilares.reduce((a, b) => a + b, 0) / propiedadesSimilares.length;

  const habPromedio =
    habitacionesSimilares.reduce((a, b) => a + b, 0) /
    propiedadesSimilares.length;

  const areaScore =
    areaPromedio > 0 ? Math.min(100, (propiedad.area / areaPromedio) * 60) : 50;

  const habScore =
    habPromedio > 0
      ? Math.min(100, (propiedad.habitaciones / habPromedio) * 60)
      : 50;

  const caracteristicas = (areaScore + habScore) / 2;

  const probabilidad =
    completitud * PESO_COMPLETITUD_OCUPACION +
    precioScore * PESO_PRECIO_OCUPACION +
    caracteristicas * PESO_CARACTERISTICAS_OCUPACION;

  return Math.round(Math.max(0, Math.min(100, probabilidad)));
};

export const probabilidadVenta = (
  propiedad: CreatePropiedad,
  propiedadesSimilares: CreatePropiedad[],
): number => {
  if (propiedadesSimilares.length === 0) {
    return propiedad.puntaje ?? 50;
  }

  const completitud = propiedad.puntaje ?? 50;

  const preciosSimilares = propiedadesSimilares.map((p) => p.precio);
  const precioPromedio =
    preciosSimilares.reduce((acc, precio) => acc + precio, 0) /
    propiedadesSimilares.length;

  const diferenciaPorcentual =
    precioPromedio > 0
      ? ((propiedad.precio - precioPromedio) / precioPromedio) * 100
      : 0;

  const precioScore = Math.max(0, Math.min(100, 100 - diferenciaPorcentual));

  const probabilidad = completitud * 0.4 + precioScore * 0.6;

  return Math.round(Math.max(0, Math.min(100, probabilidad)));
};

export const tiempoEstimadoDias = (
  propiedad: CreatePropiedad,
  propiedadesSimilares: CreatePropiedad[],
): number => {
  const probabilidad = probabilidadVenta(propiedad, propiedadesSimilares);
  const dias = 90 - probabilidad * 0.6;
  return Math.round(Math.max(1, dias));
};

export const canonEsperado = (propiedad: CreatePropiedad): number => {
  return Math.round(propiedad.precio * COMISION_MENSUAL);
};

export const rentabilidadAnual = (propiedad: CreatePropiedad): number => {
  const canon = canonEsperado(propiedad);
  const rentabilidad = ((canon * MESES_POR_YEAR) / propiedad.precio) * 100;
  return Math.round(rentabilidad * 100) / 100;
};

export const tiempoEstimadoOcupacion = (
  propiedad: CreatePropiedad,
  propiedadesSimilares: CreatePropiedad[],
) => {
  const probabilidad = probabilidadOcupacional(propiedad, propiedadesSimilares);
  const dias = 60 - probabilidad * 0.57;
  return Math.round(Math.max(3, Math.min(60, dias)));
};
