"use client";

import { Propiedad } from "@/app/lib/types";
import Button from "@/app/components/Button";

interface Props {
  onClick: () => void;
  initialData: Propiedad[];
  onRefresh: () => void;
  handleAprobar: (id: string) => Promise<void>;
  confirmarRechazo: () => Promise<void>;
  loading: boolean;
  pendingId: string | null;
  motivoModal: string | null;
  setMotivoModal: (id: string | null) => void;
  motivo: string;
  setMotivo: (v: string) => void;
  motivoError: boolean;
  setMotivoError: (v: boolean) => void;
  message: { tipo: "ok" | "error"; texto: string } | null;
}

export default function PublicationRequest({
  onClick,
  initialData,
  onRefresh,
  handleAprobar,
  confirmarRechazo,
  loading,
  pendingId,
  motivoModal,
  setMotivoModal,
  motivo,
  setMotivo,
  motivoError,
  setMotivoError,
  message,
}: Props) {
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
          ) : initialData.length === 0 ? (
            <p className="text-center font-semibold">
              No hay solicitudes de publicación
            </p>
          ) : (
            initialData.map((propiedad) => (
              <article
                key={propiedad.id}
                className="flex gap-6 bg-gray-500/70 backdrop-blur-xs p-2 rounded-md hover:bg-gray-500/90 hover:shadow"
              >
                <div>
                  <h2 className="text-md mb-2">{propiedad.titulo}</h2>
                  <p className="text-sm text-justify text-black/50">
                    {propiedad.descripcion}
                  </p>
                </div>

                <div className="flex flex-col justify-between">
                  {propiedad.publicadoPor && (
                    <p className="text-sm">
                      Propietario:{" "}
                      <span>
                        {propiedad.publicadoPor?.nombres}
                        {propiedad.publicadoPor?.apellidos}
                      </span>
                    </p>
                  )}
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
