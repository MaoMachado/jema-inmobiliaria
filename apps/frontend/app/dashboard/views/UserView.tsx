"use client";

import { useEffect, useState } from "react";
import { NewPropertyModal } from "../Modal/NewProperty";
import { usePropiedades } from "./hooks/usePropiedades";
import { CardPropiedad } from "@/app/components/CardPropiedad";
import { usePagos } from "./hooks/usePagos";
import SearchProperty from "@/app/dashboard/views/viewUser/SearchProperty";
import ChatIA from "@/app/components/ChatIA";
import PlanSuscripcion from "./viewUser/PlanSuscripcion";
import { EstimacionPropiedad } from "../Modal/EstimacionPropiedad";

type FiltroEstadoPropiedad = "TODAS" | "APROBADA" | "PENDIENTE" | "RECHAZADA";
type TabActiva = "propiedades" | "plan";

export default function UserView() {
  const [probabilidadId, setProbabilidadId] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<TabActiva>("propiedades");
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstadoPropiedad>("TODAS");

  const { planInfo } = usePagos();
  const esPremium = planInfo?.plan === "PREMIUM";

  const {
    initialData,
    isSearching,
    loading,
    error,
    editingPropiedad,
    modalOpen,
    saving,
    message,
    loadInitial,
    openCreate,
    openEdit,
    closeModal,
    handleSubmitPropiedad,
    handleDeleteProperty,
    handleSearchResult,
    handleSearchClear,
    handleDocumento,
    handleDestacar,
  } = usePropiedades((id) => setProbabilidadId(id));

  useEffect(() => {
    loadInitial();
  }, []);

  const propiedadesFiltradas = initialData.filter((p) => {
    if (filtroEstado === "TODAS") return true;
    return p.estado === filtroEstado;
  });

  const destacadasCount = initialData.filter(
    (p) => p.destacada && p.estado === "APROBADA",
  ).length;

  return (
    <article className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>Panel de Propietario</span>
            {esPremium && (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-full font-semibold">
                ⭐ Destacadas: {destacadasCount} / 3
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gestiona tus propiedades inmobiliarias, suscripciones y analíticas
            de valor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex bg-gray-900 border border-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setTabActiva("propiedades")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                tabActiva === "propiedades"
                  ? "bg-sky-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Mis Propiedades
            </button>

            <button
              onClick={() => setTabActiva("plan")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                tabActiva === "plan"
                  ? "bg-sky-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Mi Suscripción
            </button>
          </div>

          {tabActiva === "propiedades" && (
            <button
              onClick={openCreate}
              className="bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>➕</span>
              <span>Nueva Propiedad</span>
            </button>
          )}
        </div>
      </header>

      {tabActiva === "plan" ? (
        <PlanSuscripcion />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {(["TODAS", "APROBADA", "PENDIENTE", "RECHAZADA"] as const).map(
                (estado) => (
                  <button
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      filtroEstado === estado
                        ? "bg-gray-800 border-sky-500/60 text-sky-400"
                        : "bg-gray-900/50 border-gray-800 text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {estado === "TODAS"
                      ? `Todas (${initialData.length})`
                      : estado === "APROBADA"
                        ? `Aprobadas (${initialData.filter((p) => p.estado === "APROBADA").length})`
                        : estado === "PENDIENTE"
                          ? `Pendientes (${initialData.filter((p) => p.estado === "PENDIENTE").length})`
                          : `Rechazadas (${initialData.filter((p) => p.estado === "RECHAZADA").length})`}
                  </button>
                ),
              )}
            </div>

            <SearchProperty
              onResult={handleSearchResult}
              onClear={handleSearchClear}
            />

            {isSearching && (
              <div className="flex gap-6 items-center justify-between bg-sky-950/40 border border-sky-500/30 px-4 py-2.5 rounded-xl text-xs text-sky-200">
                <span className="flex items-center gap-2">
                  <span>🔍</span>
                  <span>
                    Mostrando <strong>{propiedadesFiltradas.length}</strong>{" "}
                    {propiedadesFiltradas.length === 1
                      ? "propiedad encontrada"
                      : "propiedades encontradas"}
                  </span>
                </span>
                <button
                  onClick={handleSearchClear}
                  className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
                >
                  Limpiar búsqueda y ver todas
                </button>
              </div>
            )}
          </div>

          <section className="min-h-75">
            {!isSearching && loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                <div className="h-72 bg-gray-800/40 rounded-2xl" />
                <div className="h-72 bg-gray-800/40 rounded-2xl" />
                <div className="h-72 bg-gray-800/40 rounded-2xl" />
              </div>
            ) : !isSearching ? (
              <article className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {propiedadesFiltradas.map((propiedad) => (
                  <CardPropiedad
                    key={propiedad.id}
                    propiedad={propiedad}
                    onDocumento={handleDocumento}
                    onEdit={openEdit}
                    onDelete={handleDeleteProperty}
                    onProbabilidad={setProbabilidadId}
                    onDestacar={esPremium ? handleDestacar : undefined}
                  />
                ))}

                {propiedadesFiltradas.length === 0 && (
                  <div className="col-span-full py-16 text-center bg-gray-900/30 border border-dashed border-gray-800 rounded-2xl">
                    <span className="text-4xl block mb-3">🏡</span>
                    <h3 className="text-lg font-semibold text-gray-200">
                      No hay propiedades en esta sección
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto">
                      Crea una nueva publicación para empezar a ofertar
                      inmuebles en la plataforma.
                    </p>
                    <button
                      onClick={openCreate}
                      className="mt-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Publicar Inmueble
                    </button>
                  </div>
                )}
              </article>
            ) : null}
          </section>

          {message && (
            <div className="fixed bottom-6 right-6 z-50 bg-emerald-900/90 border border-emerald-500 text-emerald-200 px-4 py-3 rounded-xl font-medium shadow-2xl backdrop-blur">
              {message}
            </div>
          )}

          {error && (
            <div className="fixed bottom-6 right-6 z-50 bg-red-900/90 border border-red-500 text-red-200 px-4 py-3 rounded-xl font-medium shadow-2xl backdrop-blur">
              {error}
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <NewPropertyModal
          handleSubmit={handleSubmitPropiedad}
          onClose={closeModal}
          error={error}
          saving={saving}
          mode={editingPropiedad ? "edit" : "create"}
          propiedad={editingPropiedad ?? undefined}
        />
      )}

      {probabilidadId && (
        <EstimacionPropiedad
          id={probabilidadId}
          onClose={() => setProbabilidadId(null)}
        />
      )}

      <ChatIA />
    </article>
  );
}
