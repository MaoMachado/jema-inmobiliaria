"use client";

import { useCallback, useEffect, useState } from "react";
import { Propiedad } from "../lib/types";
import { CardPropiedad } from "./CardPropiedad";
import { useReporteFraude } from "../hooks/useReporteFraude";
import api from "../lib/api";
import ReportarModal from "../dashboard/Modal/ReportarModal";
import Link from "next/link";

export default function PropiedadesDestacadas() {
  const {
    openModalReport,
    closeModalReport,
    handleEnviarReporte,
    propiedadId,
    message,
    loading: loadingReporte,
    openReporteModal,
  } = useReporteFraude();

  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDestacadas = async () => {
      try {
        const res = await api.get<Propiedad[]>("/propiedades/destacadas");
        if (isMounted) {
          setPropiedades(res.data);
        }
      } catch (error) {
        console.error("Error al cargar las propiedades destacadas", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDestacadas();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && propiedades.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h2 className="text-3xl font-bold text-center tracking-tight">
            ⭐ Propiedades Destacadas
          </h2>
          <p className="text-gray-400 mt-2 text-sm md:text-base">
            Descubre las mejores oportunidades seleccionadas y verificadas
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/30 p-4 border border-gray-700/50 rounded-lg animate-pulse h-96 flex flex-col justify-between"
                >
                  <div className="bg-gray-700/50 h-48 rounded-md w-full" />
                  <div className="space-y-3 mt-4">
                    <div className="bg-gray-700/40 h-6 rounded w-3/4" />
                    <div className="bg-gray-700/40 h-4 rounded w-1/2" />
                    <div className="bg-gray-700/40 h-4 rounded w-2/3" />
                  </div>
                  <div className="bg-gray-700/40 h-10 rounded w-full mt-4" />
                </div>
              ))
            : propiedades.map((p) => (
                <CardPropiedad
                  key={p.id}
                  propiedad={p}
                  onReportar={openModalReport}
                />
              ))}
        </div>

        {!loading && propiedades.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/buscar"
              className="inline-flex items-center gap-2 border border-sky-600/60 bg-sky-950/20 hover:bg-sky-900/40 text-sky-400 font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Explorar todas las propiedades →
            </Link>
          </div>
        )}
      </div>

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
