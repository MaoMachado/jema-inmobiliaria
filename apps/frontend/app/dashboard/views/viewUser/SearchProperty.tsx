"use client";

import Button from "@/app/components/Button";
import { Propiedad } from "@/app/lib/types";
import { Ciudad, Tipo, useSearchProperty } from "../hooks/useSearchProperty";

interface SearchPropertyProps {
  onResult: (data: Propiedad[]) => void;
  onClear: () => void;
}

export default function SearchProperty({
  onResult,
  onClear,
}: SearchPropertyProps) {
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
    pagination,
    page,
    loading,
    error,
    hasSearched,
    hasActiveFiltros,
    handleSearch,
    changePage,
    handleClear,
  } = useSearchProperty({ onResult, onClear });

  return (
    <article className="space-y-4 my-6">
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        <section className="flex items-center gap-3">
          <label htmlFor="ciudad">Ciudad</label>
          <select
            id="ciudad"
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value as Ciudad)}
            className="border border-blue-500/50 rounded-md p-1.5"
          >
            <option value="" className="bg-cyan-800/50 text-black">
              Todos
            </option>
            <option value="Medellin" className="bg-cyan-800/50 text-black">
              Medellin
            </option>
            <option value="Ibague" className="bg-cyan-800/50 text-black">
              Ibague
            </option>
            <option value="Bogota" className="bg-cyan-800/50 text-black">
              Bogota
            </option>
          </select>
        </section>

        <section className="flex items-center gap-3">
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as Tipo)}
            className="border border-blue-500/50 rounded-md p-1.5"
          >
            <option value="" className="bg-cyan-800/50 text-black">
              Todos
            </option>
            <option value="Casa" className="bg-cyan-800/50 text-black">
              Casa
            </option>
            <option value="Apartamento" className="bg-cyan-800/50 text-black">
              Apartamento
            </option>
            <option value="Local" className="bg-cyan-800/50 text-black">
              Local
            </option>
            <option value="Oficina" className="bg-cyan-800/50 text-black">
              Oficina
            </option>
            <option value="Lote" className="bg-cyan-800/50 text-black">
              Lote
            </option>
          </select>
        </section>

        {/* <section className="flex items-center gap-3">
          <label htmlFor="habitaciones">Habitaciones</label>
          <input
            type="number"
            id="habitaciones"
            min={1}
            value={habitaciones}
            onChange={(e) =>
              setHabitaciones(
                e.target.value === "" ? "" : Number(e.target.value),
              )
            }
            className="border border-blue-500/50 rounded-md p-1.5 w-15"
          />
        </section>

        <section className="flex items-center gap-3">
          <label htmlFor="precioMin">Precio Mínimo</label>
          <input
            type="number"
            id="precioMin"
            min={0}
            value={precioMin}
            onChange={(e) =>
              setPrecioMin(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="border border-blue-500/50 rounded-md p-1.5 w-20"
          />
        </section>

        <section className="flex items-center gap-3">
          <label htmlFor="precioMax">Precio Máximo</label>
          <input
            type="number"
            id="precioMax"
            min={0}
            value={precioMax}
            onChange={(e) =>
              setPrecioMax(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="border border-blue-500/50 rounded-md p-1.5 w-20"
          />
        </section>

        <section className="flex items-center gap-3">
          <label htmlFor="orderBy">Ordenar</label>
          <select
            id="orderBy"
            value={orderBy}
            onChange={(e) =>
              setOrderBy(e.target.value as "precio" | "createdAt" | "puntaje")
            }
            className="border border-blue-500/50 rounded-md p-1.5"
          >
            <option value="createdAt" className="bg-cyan-800/50 text-black">
              Fecha
            </option>
            <option value="precio" className="bg-cyan-800/50 text-black">
              Precio
            </option>
            <option value="puntaje" className="bg-cyan-800/50 text-black">
              Puntaje
            </option>
          </select>
        </section>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
          className="border border-blue-500/50 rounded-md p-1.5"
        >
          <option value="desc" className="bg-cyan-800/50 text-black">
            Descendente
          </option>
          <option value="asc" className="bg-cyan-800/50 text-black">
            Ascendente
          </option>
        </select> */}

        <Button title={loading ? "Buscando..." : "Buscar"} type="submit" />

        {hasActiveFiltros && (
          <Button
            title="Limpiar"
            type="button"
            onClick={handleClear}
            variant="secondary"
          />
        )}
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {hasSearched && (
        <ul className="space-y-2">
          {resultados?.map((p) => (
            <li key={p.id} className="border p-3 rounded">
              <h3 className="font-semibold">{p.titulo}</h3>
              <p>
                {p.ciudad} - {p.barrio} - {p.tipo}
              </p>
              <p>
                ${p.precio.toLocaleString()} - {p.habitaciones} habitaciones -{" "}
                {p.banos} baños - {p.area} m²
              </p>
            </li>
          ))}
          {!loading && resultados?.length === 0 && !error && (
            <p className="text-gray-500">Sin Resultados.</p>
          )}
        </ul>
      )}

      {hasSearched && pagination && pagination.totalPages > 1 && (
        <div>
          <Button
            title="Anterior"
            type="button"
            onClick={() => changePage(Math.max(1, page - 1))}
          />
          <span>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <Button
            title="Siguiente"
            type="button"
            onClick={() =>
              changePage(Math.min(pagination.totalPages, page + 1))
            }
          />
        </div>
      )}
    </article>
  );
}
