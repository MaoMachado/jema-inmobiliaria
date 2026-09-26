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

export default function UserView() {
  const [probabilidadId, setProbabilidadId] = useState<string | null>(null);
  const [showPlan, setShowPlan] = useState(false);

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

  return (
    <article>
      <header className="flex justify-between items-center mb-3">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold flex flex-col gap-2">
          Propiedades
          {esPremium && (
            <div className="inline-flex items-center gap-2 bg-amber-500/50 border border-amber-500/30 text-amber-300 text-sm px-3 py-1.5 rounded-lg">
              <span>⭐ Propiedades Destacadas:</span>
              <span>
                {
                  initialData.filter(
                    (p) => p.destacada && p.estado === "APROBADA",
                  ).length
                }{" "}
                / 3
              </span>
            </div>
          )}
        </h2>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPlan((v) => !v)}
            className="bg-sky-700/40 hover:bg-sky-500/50 rounded-md cursor-pointer px-4 py-2.5 text-sm"
          >
            {showPlan ? "Mis Propiedades" : "Mi Plan"}
          </button>

          {!showPlan && (
            <button
              onClick={openCreate}
              className="text-white bg-blue-700/40 hover:bg-blue-500/50 rounded-md box-border border border-transparent hover:bg-brand-strong  shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer"
            >
              Nueva Propiedad
            </button>
          )}
        </div>
      </header>

      {showPlan ? (
        <PlanSuscripcion />
      ) : (
        <>
          <SearchProperty
            onResult={handleSearchResult}
            onClear={handleSearchClear}
          />

          <section>
            {!isSearching && loading ? (
              <p>Cargando...</p>
            ) : !isSearching ? (
              <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                {initialData.map((propiedad) => (
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

                {initialData.length === 0 && (
                  <p className="text-center col-span-full text-2xl mt-10 ">
                    No hay propiedades 🧹
                  </p>
                )}
              </article>
            ) : null}

            {message && (
              <div className="fixed bottom-4 right-4 z-50 bg-green-500/80 text-white px-4 py-2 rounded-md font-semibold shadow-lg">
                <p>{message}</p>
              </div>
            )}

            {error && (
              <div className="fixed bottom-4 right-4 z-50 bg-red-500/80 text-white px-4 py-2 rounded-md font-semibold shadow-lg">
                <p>{error}</p>
              </div>
            )}
          </section>
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
