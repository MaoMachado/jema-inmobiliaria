"use client";

import { useEffect } from "react";
import { useManagementPayments } from "../hooks/useManagementPayments";
import Button from "@/app/components/Button";

const formatearPrecio = (n: number) => `$${n.toLocaleString("es-CO")}`;

export default function ManagementPayment() {
  const {
    pagos,
    loading,
    message,
    refresh,
    verComprobante,
    cambiarEstado,
    urlComprobante,
    setUrlComprobante,
  } = useManagementPayments();

  useEffect(() => {
    refresh();
  }, []);

  return (
    <article className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Gestionar Pagos y Suscripciones</h2>
          <p className="text-xs text-gray-400">
            Verifica comprobantes y activa planes Básico y Premium.
          </p>

          <span className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full font-semibold">
            Total: {pagos.length} solicitudes
          </span>
        </div>

        {message && (
          <div
            className={`p-3.5 rounded-xl text-xs text-center border font-medium ${
              message.type === "ok"
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/50 border-red-500/40 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}
      </header>

      {message && (
        <p
          className={`text-center mb-4 ${
            message.type === "ok" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      {loading && pagos.length === 0 ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-20 bg-gray-900 rounded-xl" />
          <div className="h-20 bg-gray-900 rounded-xl" />
          <div className="h-20 bg-gray-900 rounded-xl" />
        </div>
      ) : pagos.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/30 border border-gray-800 rounded-2xl">
          <p className="text-gray-400 text-sm">
            No hay registros de pago pendientes ni completados.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagos.map((p) => (
            <div
              key={p.id}
              className="bg-gray-900/50 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-5 backdrop-blur transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">
                    {p.usuario.nombres} {p.usuario.apellidos}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({p.usuario.email})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-300 mt-1">
                  <span className="font-semibold text-sky-400">
                    Plan {p.plan}
                  </span>
                  <span>•</span>
                  <span>{formatearPrecio(p.monto)}</span>
                  <span>•</span>
                  <span className="text-gray-500 font-mono">
                    {new Date(p.createAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    p.estado === "APROBADO"
                      ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                      : p.estado === "RECHAZADO"
                        ? "bg-red-950/80 border border-red-500/40 text-red-300"
                        : "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                  }`}
                >
                  {p.estado}
                </span>

                <div className="flex items-center gap-2">
                  {p.comprobante && (
                    <Button
                      title="Ver Comprobante"
                      variant="secondary"
                      onClick={() => verComprobante(p.id)}
                      className="text-xs py-1.5"
                    />
                  )}

                  {p.estado === "PENDIENTE" && (
                    <>
                      <Button
                        title="Aprobar"
                        variant="primary"
                        onClick={() => cambiarEstado(p.id, "APROBADO")}
                        className="text-xs py-1.5 bg-emerald-600 hover:bg-emerald-500"
                      />
                      <Button
                        title="Rechazar"
                        variant="danger"
                        onClick={() => cambiarEstado(p.id, "RECHAZADO")}
                        className="text-xs py-1.5"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {urlComprobante && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in"
          onClick={() => setUrlComprobante(null)}
        >
          <div
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 max-w-2xl w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                Comprobante de Pago Adjunto
              </h3>
              <button
                onClick={() => setUrlComprobante(null)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </header>

            <div className="flex items-center justify-center max-h-[70vh] overflow-auto">
              {/\.pdf$/i.test(urlComprobante) ? (
                <div className="text-center py-10 space-y-3">
                  <span className="text-4xl block">📄</span>
                  <a
                    href={urlComprobante}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
                  >
                    Abrir Documento PDF en pestaña nueva
                  </a>
                </div>
              ) : (
                <img
                  src={urlComprobante}
                  alt="Comprobante de Pago"
                  className="max-w-full rounded-xl object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
