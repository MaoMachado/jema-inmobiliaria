"use client";

import { useEffect, useState } from "react";
import { Propiedad } from "../lib/types";
import { CardPropiedad } from "./CardPropiedad";
import { useReporteFraude } from "../hooks/useReporteFraude";
import Link from "next/link";
import api from "../lib/api";
import ReportarModal from "../dashboard/Modal/ReportarModal";

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

  return (
    <section
      id="destacadas"
      className="scroll-mt-24 py-16 px-4 sm:px-6 bg-linear-to-br from-gray-900/20 to-sky-900/20"
    >
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-3">
            <span>⭐</span>
            <span>Selección Exclusiva</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Propiedades Destacadas
          </h2>

          <p className="text-gray-400 mt-2 text-sm md:text-base max-w-xl mx-auto">
            Descubre las mejores oportunidades seleccionadas y verificadas
          </p>
        </header>

        <article className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-900/40 p-4 border border-gray-800 rounded-2xl animate-pulse flex flex-col justify-between h-105"
              >
                <div className="bg-gray-800 h-52 rounded-xl w-full" />
                <div className="space-y-3 mt-4">
                  <div className="bg-gray-800 h-6 rounded w-3/4" />
                  <div className="bg-gray-700/40 h-4 rounded w-1/2" />
                  <div className="bg-gray-700/40 h-4 rounded w-2/3" />
                </div>
                <div className="bg-gray-700/40 h-10 rounded w-full mt-4" />
              </div>
            ))
          ) : propiedades.length > 0 ? (
            propiedades.map((p) => (
              <CardPropiedad
                key={p.id}
                propiedad={p}
                onReportar={openModalReport}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 px-4 rounded-2xl bg-gray-900/30 border border-gray-800">
              <span className="text-4xl mb-2 block">🏠</span>
              <p className="text-gray-300 font-semibold text-lg">
                No hay propiedades destacadas en este momento
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Explora el catálogo completo para encontrar tu próximo inmueble.
              </p>
            </div>
          )}
        </article>

        <article className="text-center mt-12">
          <Link
            href="/buscar"
            className="inline-flex items-center gap-2 border border-sky-500/40 bg-sky-950/30 hover:bg-sky-900/50 text-sky-300 hover:text-white font-bold px-7 py-3 rounded-xl transition-all duration-200 shadow-md hover:scale-105"
          >
            <span>Explorar todas las propiedades</span>
            <span>→</span>
          </Link>
        </article>
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
