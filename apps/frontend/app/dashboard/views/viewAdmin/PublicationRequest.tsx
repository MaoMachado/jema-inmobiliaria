"use client";

import { useEffect, useState } from "react";
import { Propiedad } from "@/app/lib/types";
import Button from "@/app/components/Button";
import api from "@/app/lib/api";

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? fallback;

export default function PublicationRequest({
  onClick,
}: {
  onClick: () => void;
}) {
  const [propiedadesPendientes, setPropiedadesPendientes] = useState<
    Propiedad[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [motivoModal, setMotivoModal] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState(false);
  const [message, setMessage] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const buscarPropiedadesPendientes = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await api.get<Propiedad[]>("/propiedades/pendientes");
      setPropiedadesPendientes(res.data);
    } catch (error: any) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al cargar las solicitudes"),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarPropiedadesPendientes();

    setTimeout(() => {
      setMessage(null);
    }, 5000);
  }, []);

  const handleAprobar = async (id: string) => {
    setLoading(true);
    setMessage(null);

    try {
      await api.patch(`/propiedades/${id}/aprobar`);
      setPropiedadesPendientes((prev) => prev.filter((p) => p.id !== id));
      setMessage({
        tipo: "ok",
        texto: "Propiedad aprobada",
      });
    } catch (error: any) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al aprobar la propiedad"),
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmarRechazo = async () => {
    if (!motivoModal) return;
    if (!motivo.trim()) {
      setMotivoError(true);
      return;
    }

    setPendingId(motivoModal);
    setMessage(null);

    try {
      await api.patch(`/propiedades/${motivoModal}/rechazar`, {
        motivoRechazo: motivo.trim(),
      });
      setPropiedadesPendientes((prev) =>
        prev.filter((p) => p.id !== motivoModal),
      );

      setMotivoModal(null);
      setMotivo("");
      setMotivoError(false);
      setMessage({
        tipo: "ok",
        texto: "Propiedad rechazada",
      });
    } catch (error: any) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al rechazar la propiedad"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20" onClick={onClick} />
      <article className="slide-in-right bg-blue-600/20 backdrop-blur-xs fixed z-10 top-0 right-0 w-full md:w-sm h-full">
        <header className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold">Solicitudes de Publicación</h2>

          <button
            onClick={onClick}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2 rounded-md"
          >
            X
          </button>
        </header>

        {message && (
          <p
            className={`mx-6 mb-2 px-3 py-2 rounded-md text-sm ${message.tipo === "ok" ? "bg-green-600/40" : "bg-red-600/40"}`}
          >
            {message.texto}
          </p>
        )}

        <main className="p-1">
          {loading ? (
            <p>Cargando...</p>
          ) : propiedadesPendientes.length === 0 ? (
            <p className="text-center font-semibold">
              No hay solicitudes de publicación
            </p>
          ) : (
            propiedadesPendientes.map((propiedad) => (
              <article
                key={propiedad.id}
                className="flex gap-6 items-end bg-gray-500/70 backdrop-blur-xs p-2 rounded-md hover:bg-gray-500/90 hover:shadow"
              >
                <div>
                  <h2 className="text-md mb-2">{propiedad.titulo}</h2>
                  <p className="text-sm text-justify text-black/50">
                    {propiedad.descripcion}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    title="👍"
                    onClick={() => handleAprobar(propiedad.id)}
                    disabled={pendingId === propiedad.id}
                    loading={pendingId === propiedad.id}
                  />
                  <Button
                    title="👎"
                    onClick={() => {
                      setMotivo("");
                      setMotivoError(false);
                      setMotivoModal(propiedad.id);
                    }}
                    variant="danger"
                    disabled={pendingId === propiedad.id}
                  />
                </div>
              </article>
            ))
          )}
        </main>

        {motivoModal && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-20"
            onClick={() => {
              setMotivoModal(null);
              setMotivo("");
              setMotivoError(false);
            }}
          >
            <div
              className="bg-slate-900 p-6 rounded-md w-80 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-semibold">Motivo Rechazo</h3>
              <textarea
                value={motivo}
                placeholder="Indica el motivo del rechazo"
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (motivoError) setMotivoError(false);
                }}
                className="w-full bg-gray-800/60 border border-blue-500/40 rounded-md p-2 text-sm"
                rows={4}
              />
              {motivoError && (
                <p className="text-red-400 text-sm">El motivo es obligatorio</p>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  title="Cancelar"
                  variant="secondary"
                  disabled={pendingId !== null}
                  onClick={() => {
                    setMotivoModal(null);
                    setMotivo("");
                    setMotivoError(false);
                  }}
                />
                <Button
                  title={pendingId !== null ? "Rechazando..." : "Confirmar"}
                  variant="danger"
                  disabled={pendingId !== null}
                  onClick={confirmarRechazo}
                />
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  );
}
