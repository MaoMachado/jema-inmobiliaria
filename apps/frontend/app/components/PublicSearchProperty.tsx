"use client";

import { useReporteFraude } from "../hooks/useReporteFraude";
import { CardPropiedad } from "./CardPropiedad";
import ReportarModal from "../dashboard/Modal/ReportarModal";
import {
  Ciudad,
  Tipo,
  usePublicSearchProperty,
} from "../hooks/usePublicSearchProperty";

export default function PublicSearchProperty() {
  const {
    handleSearch,
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

  const {
    openModalReport,
    closeModalReport,
    handleEnviarReporte,
    propiedadId,
    message,
    loading: loadingReporte,
    openReporteModal,
  } = useReporteFraude();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div className="bg-gray-900/90 border border-gray-800 p-5 rounded-2xl shadow-2xl backdrop-blur-md">
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="ciudad"
              className="text-xs font-semibold text-gray-300"
            >
              Ciudad:{" "}
            </label>
            <select
              id="ciudad"
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value as Ciudad)}
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs focus:border-sky-500 outline-none transition"
            >
              <option value="">Todas las ciudades</option>
              <option value="Medellin">Medellin</option>
              <option value="Ibague">Ibague</option>
              <option value="Fresno">Fresno</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="tipo"
              className="text-xs font-semibold text-gray-300"
            >
              Tipo de Inmueble
            </label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Tipo)}
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs focus:border-sky-500 outline-none transition"
            >
              <option value="">Todos</option>
              <option value="Casa">Casa</option>
              <option value="Apartamento">Apartamento</option>
              <option value="Local">Local</option>
              <option value="Oficina">Oficina</option>
              <option value="Lote">Lote</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="habitaciones"
              className="text-xs font-semibold text-gray-300"
            >
              Habitaciones
            </label>
            <select
              id="habitaciones"
              value={habitaciones}
              onChange={(e) =>
                setHabitaciones(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs focus:border-sky-500 outline-none transition"
            >
              <option value="">Cualquier cantidad</option>
              <option value="1">1+ hab</option>
              <option value="2">2+ habs</option>
              <option value="3">3+ habs</option>
              <option value="4">4+ habs</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="precioMin"
              className="text-xs font-semibold text-gray-300"
            >
              Precio Mínimo (COP)
            </label>
            <input
              type="number"
              id="precioMin"
              min={0}
              placeholder="$ Min"
              value={precioMin}
              onChange={(e) =>
                setPrecioMin(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs focus:border-sky-500 outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="precioMax"
              className="text-xs font-semibold text-gray-300"
            >
              Precio Máximo (COP)
            </label>
            <input
              type="number"
              id="precioMax"
              min={0}
              placeholder="$ Max"
              value={precioMax}
              onChange={(e) =>
                setPrecioMax(
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
              className="w-full bg-gray-950 border border-gray-700 text-white rounded-xl px-3 py-2 text-xs focus:border-sky-500 outline-none transition"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-gray-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              {loading ? "Buscando..." : "Buscar"}
            </button>

            {hasActiveFiltros && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-xl transition cursor-pointer"
                title="Limpiar filtros"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="h-80 bg-gray-800/40 rounded-2xl border border-gray-800"
            />
          ))}
        </div>
      ) : (
        <>
          {hasSearched && (
            <div>
              <div className="flex items-center justify-baseline mb-4">
                <p className="text-xs text-gray-400 font-medium">
                  {pagination?.total
                    ? `Mostrado ${resultados.length} de ${pagination.total}`
                    : `${resultados.length} propiedades encontradas`}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <label htmlFor="ordenarPor">Ordenar:</label>
                  <select
                    id="ordenarPor"
                    value={`${orderBy}_${order}`}
                    onChange={(e) => {
                      const [nuevoOrderBy, nuevoOrder] = e.target.value.split(
                        "_",
                      ) as ["precio" | "createdAt" | "puntaje", "asc" | "desc"];
                      setOrderBy(nuevoOrderBy);
                      setOrder(nuevoOrder);
                    }}
                    className="bg-gray-950 border border-gray-700 text-white rounded-lg px-2.5 py-1 text-xs outline-none"
                  >
                    <option value="createdAt_desc">Más recientes</option>
                    <option value="precio_asc">Precio: Menor a Mayor</option>
                    <option value="precio_desc">Precio: Mayor a Menor</option>
                    <option value="puntaje_desc">Mayor Puntaje JEMA</option>
                  </select>
                </div>
              </div>

              {resultados.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {resultados.map((propiedad) => (
                    <CardPropiedad
                      key={propiedad.id}
                      propiedad={propiedad}
                      onReportar={openModalReport}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-gray-900/40 border border-gray-800/80 rounded-2xl space-y-3">
                  <span className="text-4xl">🔍</span>
                  <p className="text-white font-semibold text-base">
                    No encontramos propiedades con esos filtros
                  </p>
                  <p className="text-xs text-gray-400 max-w-md mx-auto">
                    Prueba cambiando la ciudad, ajustando el rango de precios o
                    limpiando los filtros activos.
                  </p>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="mt-2 px-4 py-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Restablecer filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs font-semibold text-white transition cursor-pointer"
          >
            ← Anterior
          </button>
          <span className="text-xs text-gray-400 font-mono">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => changePage(page + 1)}
            className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs font-semibold text-white transition cursor-pointer"
          >
            Siguiente →
          </button>
        </div>
      )}

      {openReporteModal && (
        <ReportarModal
          propiedadId={propiedadId}
          message={message}
          loading={loadingReporte}
          isOpen={openReporteModal}
          onClose={closeModalReport}
          onSubmit={handleEnviarReporte}
        />
      )}
    </section>
  );
}
