"use client";

import { useEffect, useState } from "react";
import { NewPropertyModal } from "../Modal/NewProperty";
import { usePropiedades } from "./hooks/usePropiedades";
import { CardPropiedad } from "@/app/components/CardPropiedad";
import { ProbabilidadPropiedad } from "../Modal/ProbabilidadPropiedad";
import SearchProperty from "@/app/dashboard/views/viewUser/SearchProperty";

export default function UserView() {
  const [probabilidadId, setProbabilidadId] = useState<string | null>(null);

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
  } = usePropiedades();

  useEffect(() => {
    loadInitial();
  }, []);

  return (
    <article>
      <header className="flex justify-between items-center mb-3">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Propiedades
        </h2>

        <button
          onClick={openCreate}
          className="text-white bg-blue-700/40 hover:bg-blue-500/50 rounded-md box-border border border-transparent hover:bg-brand-strong  shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer"
        >
          Nueva Propiedad
        </button>
      </header>

      <SearchProperty
        onResult={handleSearchResult}
        onClear={handleSearchClear}
      />

      <section>
        {!isSearching && loading ? (
          <p>Cargando...</p>
        ) : !isSearching ? (
          <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {initialData.map((propiedad) => (
              <CardPropiedad
                key={propiedad.id}
                propiedad={propiedad}
                onEdit={openEdit}
                onDelete={handleDeleteProperty}
                onProbabilidad={setProbabilidadId}
              />
            ))}

            {initialData.length === 0 && (
              <p className="text-center col-span-full">No hay propiedades</p>
            )}
          </article>
        ) : null}

        {message && (
          <div className="fixed bottom-0 right-0 m-4 bg-green-500/30 p-2 rounded-md font-semibold tracking-wide">
            <p>{message}</p>
          </div>
        )}
      </section>

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
        <ProbabilidadPropiedad
          id={probabilidadId}
          onClose={() => setProbabilidadId(null)}
        />
      )}
    </article>
  );
}
