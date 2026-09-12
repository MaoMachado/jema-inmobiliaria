"use client";

import { useEffect } from "react";
import Button from "@/app/components/Button";
import { useReporteFraude } from "@/app/hooks/useReporteFraude";

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

  return (
    <article>
      <h1 className="text-4xl font-bold text-center mb-6">
        Reportes de Fraude
      </h1>

      <div className="flex gap-3 justify-center mb-6">
        {["ABIERTO", "RESUELTO", "IGNORADO", "TODOS"].map((e) => (
          <button
            key={e}
            onClick={() => setFiltro(e)}
            className={`px-3 py-1 rounded-md text-sm font-semibold ${filtro === e ? "bg-sky-600" : "bg-gray-700"}`}
          >
            {e}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-center text-gray-400">Sin reportes</p>
      ) : (
        <div className="space-y-4">
          {filtrados.map((r) => (
            <div
              key={r.id}
              className="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
            >
              <div>
                <p className="font-semibold">{r.motivo}</p>
                <p className="text-sm text-gray-400">{r.descripcion}</p>
                <p>
                  Por: {r.creadoPor.nombres} {r.creadoPor.apellidos} |
                  Propiedad: {r.propiedad.titulo} {r.propiedad.ciudad}
                </p>
              </div>

              <div className="flex gap-2">
                {r.estado === "ABIERTO" && (
                  <>
                    <Button
                      title="Resolver"
                      onClick={() => handleCambiarEstado(r.id, "RESUELTO")}
                      variant="secondary"
                    />

                    <Button
                      title="Ignorar"
                      onClick={() => handleCambiarEstado(r.id, "IGNORADO")}
                    />
                  </>
                )}

                <span
                  className={`text-sm px-2 py-1 rounded ${r.estado === "ABIERTO" ? "bg-red-500/20 text-red-400" : r.estado === "RESUELTO" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}
                >
                  {r.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
