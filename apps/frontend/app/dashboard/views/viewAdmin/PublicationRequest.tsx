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
  message: { type: "ok" | "error"; text: string } | null;
}

const MOTIVOS_SUGERIDOS = [
  "Fotografías ilegibles o de baja calidad",
  "Documentación de propiedad incompleta o faltante",
  "Inconsistencia en el precio o dirección registrada",
  "No cumple con los términos de publicación de la plataforma",
];

export default function PublicationRequest({
  onClick,
  initialData,
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
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={onClick}
      />
      <aside className="slide-in-right fixed z-50 top-0 right-0 w-full sm:w-120 md:w-135 h-full bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col justify-between">
        <header className="flex items-center justify-between px-6 py-5 border-b border-gray-800 bg-gray-950/80">
          <div className="flex items-center gap-2">
            <span className="text-lg">📬</span>
            <h2 className="text-base font-bold text-white">
              Solicitudes de Publicación
            </h2>
            <span className="bg-sky-950 border border-sky-500/40 text-sky-300 text-xs px-2 py-0.5 rounded-full font-semibold ml-1">
              {initialData.length}
            </span>
          </div>

          <button
            onClick={onClick}
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Cerrar panel"
          >
            ✕
          </button>
        </header>

        {message && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs font-medium border ${
              message.type === "ok"
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/60 border-red-500/40 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {loading && initialData.length === 0 ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-32 bg-gray-800/50 rounded-xl" />
              <div className="h-32 bg-gray-800/50 rounded-xl" />
            </div>
          ) : initialData.length === 0 ? (
            <div className="text-center py-16 text-gray-500 space-y-2">
              <span className="text-4xl block">✨</span>
              <p className="text-sm font-semibold text-gray-300">
                Bandeja al día
              </p>
              <p className="text-xs text-gray-500">
                No hay inmuebles pendientes por auditoría.
              </p>
            </div>
          ) : (
            initialData.map((propiedad) => {
              const isProcessing = pendingId === propiedad.id;

              return (
                <article
                  key={propiedad.id}
                  className="bg-gray-950/60 border border-gray-800 hover:border-gray-700/80 rounded-2xl p-4 transition space-y-3"
                >
                  <div className="flex gap-3.5">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-900 shrink-0 border border-gray-800">
                      {propiedad.fotografias?.[0] ? (
                        <img
                          src={propiedad.fotografias[0]}
                          alt={propiedad.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl text-gray-600">
                          🏠
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-xs font-bold text-white line-clamp-1">
                          {propiedad.titulo}
                        </h3>
                        {propiedad.puntaje !== undefined &&
                          propiedad.puntaje !== null && (
                            <span className="bg-sky-950 border border-sky-500/30 text-sky-300 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                              ★ {propiedad.puntaje} pts
                            </span>
                          )}
                      </div>

                      <p className="text-xs font-black text-emerald-400">
                        ${propiedad.precio.toLocaleString("es-CO")} COP
                      </p>

                      <p className="text-[11px] text-gray-400 truncate">
                        📍 {propiedad.ciudad}{" "}
                        {propiedad.barrio ? `• ${propiedad.barrio}` : ""}
                      </p>

                      <div className="text-[10px] text-gray-500 flex gap-2">
                        <span>🛏️ {propiedad.habitaciones} hab</span>
                        <span>🚿 {propiedad.banos} baños</span>
                        <span>📐 {propiedad.area} m²</span>
                      </div>
                    </div>
                  </div>

                  {propiedad.publicadoPor && (
                    <div className="bg-gray-900/60 rounded-xl p-2.5 text-[11px] text-gray-300 flex justify-between items-center border border-gray-800/60">
                      <div>
                        <span className="text-gray-500 block text-[10px]">
                          Anunciante:
                        </span>
                        <span className="font-semibold text-white">
                          {propiedad.publicadoPor.nombres}{" "}
                          {propiedad.publicadoPor.apellidos}
                        </span>
                        <span className="text-gray-400 block text-[10px]">
                          {propiedad.publicadoPor.email}
                        </span>
                      </div>
                      <div className="text-right">
                        {propiedad.publicadoPor.celularVerificado ? (
                          <span className="text-emerald-400 text-[10px] bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded font-semibold">
                            ✓ Tel. Verificado
                          </span>
                        ) : (
                          <span className="text-gray-500 text-[10px]">
                            Tel. No Verificado
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800/60">
                    <Button
                      title="Rechazar"
                      variant="danger"
                      disabled={isProcessing}
                      onClick={() => {
                        setMotivo("");
                        setMotivoError(false);
                        setMotivoModal(propiedad.id);
                      }}
                      className="text-xs py-1.5 px-3"
                    />

                    <Button
                      title={
                        isProcessing ? "Aprobando..." : "Aprobar Publicación"
                      }
                      variant="primary"
                      disabled={isProcessing}
                      loading={isProcessing}
                      onClick={() => handleAprobar(propiedad.id)}
                      className="text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500"
                    />
                  </div>
                </article>
              );
            })
          )}
        </main>

        <footer className="p-4 border-t border-gray-800 bg-gray-950/60 text-center">
          <p className="text-[11px] text-gray-500">
            Las publicaciones aprobadas serán visibles inmediatamente en la
            búsqueda pública.
          </p>
        </footer>

        {motivoModal && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fade-in"
            onClick={() => {
              setMotivoModal(null);
              setMotivo("");
              setMotivoError(false);
            }}
          >
            <div
              className="bg-gray-900 border border-gray-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-gray-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  Motivo del Rechazo
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  El propietario recibirá una notificación con este motivo para
                  subsanar los datos.
                </p>
              </div>

              {/* Motivos rápidos sugeridos */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-gray-400">
                  Sugerencias rápidas:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MOTIVOS_SUGERIDOS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setMotivo(sug);
                        if (motivoError) setMotivoError(false);
                      }}
                      className="text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-2.5 py-1 rounded-lg border border-gray-700/50 transition cursor-pointer text-left"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={motivo}
                placeholder="Escribe o selecciona un motivo detallado..."
                onChange={(e) => {
                  setMotivo(e.target.value);
                  if (motivoError) setMotivoError(false);
                }}
                className="w-full bg-gray-950 border border-gray-700 focus:border-sky-500 rounded-xl p-3 text-xs text-gray-200 focus:outline-none transition resize-none"
                rows={4}
              />

              {motivoError && (
                <p className="text-red-400 text-xs font-semibold">
                  ⚠️ Debes indicar un motivo de rechazo.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
                <Button
                  title="Cancelar"
                  variant="secondary"
                  disabled={pendingId !== null}
                  onClick={() => {
                    setMotivoModal(null);
                    setMotivo("");
                    setMotivoError(false);
                  }}
                  className="text-xs py-1.5"
                />
                <Button
                  title={
                    pendingId !== null ? "Rechazando..." : "Confirmar Rechazo"
                  }
                  variant="danger"
                  disabled={pendingId !== null}
                  loading={pendingId !== null}
                  onClick={confirmarRechazo}
                  className="text-xs py-1.5"
                />
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
