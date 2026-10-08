"use client";

import { useEffect } from "react";
import { useReporteFraude } from "@/app/hooks/useReporteFraude";
import Button from "@/app/components/Button";

export default function ManagementFrauds() {
  const {
    filtro,
    setFiltro,
    loadReportes,
    handleCambiarEstado,
    filtrados,
    loading,
  } = useReporteFraude();

  useEffect(() => {
    loadReportes();
  }, []);

  const estados = [
    { id: "TODOS", label: "Todos" },
    { id: "ABIERTO", label: "Abiertos" },
    { id: "RESUELTO", label: "Resueltos" },
    { id: "IGNORADO", label: "Ignorados" },
  ];

  return (
    <article className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">
            Reportes de Fraude e Inconsistencias
          </h2>

          <p className="text-xs text-gray-400">
            Revisa denuncias de usuarios sobre inmuebles sospechosos.
          </p>
        </div>

        <div className="inline-flex bg-gray-900 border border-gray-800 p-1 rounded-xl">
          {estados.map((e) => (
            <button
              key={e.id}
              onClick={() => setFiltro(e.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                filtro === e.id
                  ? "bg-sky-600 text-white shadow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </header>

      {loading && filtrados.length === 0 ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-24 bg-gray-900 rounded-xl" />
          <div className="h-24 bg-gray-900 rounded-xl" />
          <div className="h-24 bg-gray-900 rounded-xl" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/30 border border-gray-800 rounded-2xl">
          <span className="text-3xl block mb-2">🛡️</span>
          <p className="text-gray-400 text-sm">
            No hay reportes bajo el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map((r) => (
            <div
              key={r.id}
              className="bg-gray-900/50 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-5 backdrop-blur transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-400">
                    ⚠️ {r.motivo}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      r.estado === "ABIERTO"
                        ? "bg-red-950/80 border border-red-500/40 text-red-300"
                        : r.estado === "RESUELTO"
                          ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                          : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {r.estado}
                  </span>
                </div>

                {r.descripcion && (
                  <p className="text-xs text-gray-300 bg-gray-950/60 p-2.5 rounded-lg border border-gray-800/80">
                    &ldquo;{r.descripcion}&rdquo;
                  </p>
                )}

                <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-4">
                  <span>
                    Reportado por:{" "}
                    <strong>
                      {r.creadoPor.nombres} {r.creadoPor.apellidos}
                    </strong>{" "}
                    ({r.creadoPor.email})
                  </span>
                  <span>•</span>
                  <span>
                    Inmueble: <strong>{r.propiedad.titulo}</strong> (
                    {r.propiedad.ciudad})
                  </span>
                </div>
              </div>

              {r.estado === "ABIERTO" && (
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <Button
                    title="Resolver Caso"
                    variant="primary"
                    onClick={() => handleCambiarEstado(r.id, "RESUELTO")}
                    className="text-xs py-1.5 bg-emerald-600 hover:bg-emerald-500"
                  />
                  <Button
                    title="Ignorar"
                    variant="secondary"
                    onClick={() => handleCambiarEstado(r.id, "IGNORADO")}
                    className="text-xs py-1.5"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
