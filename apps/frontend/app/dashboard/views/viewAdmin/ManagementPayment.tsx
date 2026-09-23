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
    <article>
      <h1 className="text-4xl font-bold text-center mb-6">Gestionar Pagos</h1>

      {message && (
        <p
          className={`text-center mb-4 ${
            message.type === "ok" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.text}
        </p>
      )}

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : pagos.length === 0 ? (
        <p className="text-center text-gray-400">Sin Pagos</p>
      ) : (
        <div className="space-y-4">
          {pagos.map((p) => (
            <div
              key={p.id}
              className="bg-gray-800/50 border border-gray-600 rounded-lg p-4"
            >
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <p className="font-semibold">
                    {p.usuario.nombres} {p.usuario.apellidos} ({p.usuario.email}
                    )
                  </p>

                  <p>
                    {p.plan} · {formatearPrecio(p.monto)} ·{" "}
                    {new Date(p.createAt).toLocaleDateString("es-CO")}
                  </p>
                </div>

                <span
                  className={`text-sm px-2 py-1 rounded ${
                    p.estado === "APROBADO"
                      ? "bg-green-500/20 text-green-400"
                      : p.estado === "RECHAZADO"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {p.estado}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                {p.comprobante && (
                  <Button
                    title="Ver Comprobante"
                    variant="secondary"
                    onClick={() => verComprobante(p.id)}
                  />
                )}

                {p.estado === "PENDIENTE" && (
                  <>
                    <Button
                      title="Aprobar"
                      variant="primary"
                      onClick={() => cambiarEstado(p.id, "APROBADO")}
                    />
                    <Button
                      title="Rechazar"
                      variant="danger"
                      onClick={() => cambiarEstado(p.id, "RECHAZADO")}
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {urlComprobante && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setUrlComprobante(null)}
        >
          <div
            className="bg-gray-900 rounded-lg p-4 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Comprobante de pago</h3>

              <button
                onClick={() => setUrlComprobante(null)}
                className="text-xl cursor-pointer hover:text-red-400"
              >
                ✖️
              </button>
            </header>

            {/\.pdf$/i.test(urlComprobante) ? (
              <a
                href={urlComprobante}
                target="_blank"
                rel="noreferrer"
                className="text-sky-400 underline"
              >
                Abrir PDF
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urlComprobante}
                alt="Comprobante"
                className="max-w-full rounded-md"
              />
            )}
          </div>
        </div>
      )}
    </article>
  );
}
