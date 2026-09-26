"use client";

export interface Estimacion {
  mensajeIA: string | null;
  valores: {
    probabilidadVenta: number;
    probabilidadOcupacional: number;
    tiempoEstimadoDias: number;
    tiempoEstimadoOcupacion: number;
    canonEsperado: number;
    rentabilidadAnual: number;
  };
}

const CACHE_KEY = "estimacionesIA";

export function leerEstimacionCache(): Record<string, Estimacion> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function guardarEstimacionCache(id: string, data: Estimacion) {
  const cache = leerEstimacionCache();
  cache[id] = data;
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function borrarEstimacionCache(id: string) {
  const cache = leerEstimacionCache();
  delete cache[id];
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}
