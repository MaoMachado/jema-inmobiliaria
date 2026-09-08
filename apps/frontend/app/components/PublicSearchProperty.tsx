"use client";

import {
  Ciudad,
  Tipo,
  usePublicSearchProperty,
} from "../hooks/usePublicSearchProperty";
import Button from "./Button";
import { CardPropiedad } from "./CardPropiedad";

export default function PublicSearchProperty() {
  const {
    handleSearch,
    ciudad,
    setCiudad,
    tipo,
    setTipo,
    precioMin,
    setPrecioMin,
    precioMax,
    setPrecioMax,
    order,
    setOrder,
    loading,
    error,
    hasSearched,
    resultados,
    pagination,
    page,
    changePage,
    hasActiveFiltros,
    handleClear,
  } = usePublicSearchProperty();

  return (
    <section>
      <div className="max-w-7xl mx-auto">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-4 justify-center items-center text-sm"
        >
          <div>
            <label htmlFor="ciudad">Ciudad: </label>
            <select
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value as Ciudad)}
              className="bg-gray-500 px-2 py-1 rounded-lg border border-gray-600"
            >
              <option value="">Todos</option>
              <option value="Medellin">Medellin</option>
              <option value="Ibague">Ibague</option>
              <option value="Fresno">Fresno</option>
            </select>
          </div>

          <div>
            <label htmlFor="tipo">Tipo: </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Tipo)}
              className="bg-gray-500 px-2 py-1 rounded-lg border border-gray-600"
            >
              <option value="">Todos</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Local">Local</option>
              <option value="Oficina">Oficina</option>
              <option value="Lote">Lote</option>
            </select>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <section>
              <label htmlFor="precioMin">Precio Mínimo: </label>
              <input
                type="number"
                id="precioMin"
                min={0}
                value={precioMin}
                onChange={(e) =>
                  setPrecioMin(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="px-2 py-1 rounded-lg border border-gray-600 hover:border-sky-800 focus:border-sky-800 focus:outline-none"
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
                  setPrecioMax(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                className="px-2 py-1 rounded-lg border border-gray-600 hover:border-sky-800 focus:border-sky-800 focus:outline-none"
              />
            </section>
          </div>

          <div>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as "asc" | "desc")}
              className="bg-gray-500 px-2 py-1 rounded-lg border border-gray-600"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>

          <Button title={loading ? "Buscando..." : "Buscar"} type="submit" />

          {hasActiveFiltros && (
            <Button
              title="Limpiar filtros"
              type="button"
              onClick={handleClear}
              variant="secondary"
            />
          )}
        </form>

        {error && <p className="text-red-500">{error}</p>}

        {hasSearched && (
          <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10 p-2 md:p-0">
            {resultados.map((propiedad) => (
              <CardPropiedad key={propiedad.id} propiedad={propiedad} />
            ))}

            {hasSearched && resultados.length === 0 && !loading && (
              <p className="text-center text-gray-400 py-10 col-span-full">
                No se encontraron propiedades con esos filtros
              </p>
            )}
          </article>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div>
            <Button title="Anterior" onClick={() => changePage(page - 1)} />
            <span>
              {pagination.page} de {pagination.totalPages}
            </span>
            <Button title="Siguiente" onClick={() => changePage(page + 1)} />
          </div>
        )}
      </div>
    </section>
  );
}
