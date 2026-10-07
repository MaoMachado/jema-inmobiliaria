"use client";

import { useState } from "react";
import { Propiedad } from "@/app/lib/types";
import { Ciudad, Tipo, useSearchProperty } from "../hooks/useSearchProperty";
import Button from "@/app/components/Button";
import { CardPropiedad } from "@/app/components/CardPropiedad";

interface SearchPropertyProps {
  onResult: (data: Propiedad[]) => void;
  onClear: () => void;
  onEdit?: (propiedad: Propiedad) => void;
  onDelete?: (id: string) => void;
  onProbabilidad?: (id: string) => void;
  onDocumento?: (id: string, file: File, tipo: string) => void;
  onDestacar?: (id: string, nuevoEstado: boolean) => void;
}

export default function SearchProperty({
  onResult,
  onClear,
  onEdit,
  onDelete,
  onProbabilidad,
  onDocumento,
  onDestacar,
}: SearchPropertyProps) {
  const [mostrarAvanzados, setMostrarAvanzados] = useState(false);

  const {
    ciudad,
    setCiudad,
    tipo,
    setTipo,
    habitaciones,
    setHabitaciones,
    precioMin,
    setPrecioMin,
    precioMax,
    setPrecioMax,
    orderBy,
    setOrderBy,
    order,
    setOrder,
    resultados,
    loading,
    error,
    hasSearched,
    hasActiveFiltros,
    handleSearch,
    handleClear,
  } = useSearchProperty({ onResult, onClear });

  return (
    <article className="w-full bg-gray-900/60 border border-gray-800 p-4 rounded-2xl shadow-lg backdrop-blur-sm space-x-3">
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="ciudad"
              className="text-xs font-medium text-gray-400"
            >
              Ciudad
            </label>
            <select
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value as Ciudad)}
              className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500 transition"
            >
              <option value="">Todas las ciudades</option>
              <option value="Medellin">Medellín</option>
              <option value="Ibague">Ibagué</option>
              <option value="Bogota">Bogotá</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="tipo" className="text-xs font-medium text-gray-400">
              Tipo de Inmueble
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Tipo)}
              className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500 transition"
            >
              <option value="">Todos los tipos</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Local">Local</option>
              <option value="Oficina">Oficina</option>
              <option value="Lote">Lote</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="ordenar"
              className="text-xs font-medium text-gray-400"
            >
              Ordenar por
            </label>
            <select
              id="ordenar"
              value={`${orderBy}_${order}`}
              onChange={(e) => {
                const [newOrderBy, newOrder] = e.target.value.split("_") as [
                  "precio" | "createdAt" | "puntaje",
                  "asc" | "desc",
                ];
                setOrderBy(newOrderBy);
                setOrder(newOrder);
              }}
              className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500 transition"
            >
              <option value="puntaje_desc">Mayor Puntaje</option>
              <option value="createdAt_desc">Más recientes</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
            </select>
          </div>

          <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-2">
            <Button
              title={loading ? "Buscando..." : "Buscar"}
              type="submit"
              disabled={loading}
              className="flex-1 text-xs py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold transition cursor-pointer"
            />

            {hasActiveFiltros && (
              <Button
                title="Limpiar"
                type="button"
                variant="secondary"
                onClick={handleClear}
                className="text-xs py-2 rounded-xl"
              />
            )}

            <button
              type="button"
              onClick={() => setMostrarAvanzados(!mostrarAvanzados)}
              className="p-2 text-xs text-gray-400 hover:text-sky-400 transition"
              title="Filtros avanzados"
            >
              ⚙️ {mostrarAvanzados ? "Menos" : "Más"}
            </button>
          </div>
        </div>

        {mostrarAvanzados && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-800/60 animate-fade-in">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="habitaciones"
                className="text-xs font-medium text-gray-400"
              >
                Habitaciones mínimas
              </label>
              <input
                type="number"
                id="habitaciones"
                min={1}
                placeholder="Ej. 2"
                value={habitaciones}
                onChange={(e) =>
                  setHabitaciones(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="precioMin"
                className="text-xs font-medium text-gray-400"
              >
                Precio Mínimo (COP)
              </label>
              <input
                type="number"
                id="precioMin"
                min={0}
                placeholder="$ 0"
                value={precioMin}
                onChange={(e) =>
                  setPrecioMin(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="precioMax"
                className="text-xs font-medium text-gray-400"
              >
                Precio Máximo (COP)
              </label>
              <input
                type="number"
                id="precioMax"
                min={0}
                placeholder="$ Sin límite"
                value={precioMax}
                onChange={(e) =>
                  setPrecioMax(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>
        )}
      </form>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/20 p-2 rounded-lg">
          ⚠️ {error}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse pt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-72 bg-gray-800/40 rounded-2xl" />
          ))}
        </div>
      )}

      {hasSearched && !loading && resultados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {resultados.map((propiedad) => (
            <CardPropiedad
              key={propiedad.id}
              propiedad={propiedad}
              onDocumento={onDocumento}
              onEdit={onEdit}
              onDelete={onDelete}
              onProbabilidad={onProbabilidad}
              onDestacar={onDestacar}
            />
          ))}
        </div>
      )}
    </article>
  );
}
