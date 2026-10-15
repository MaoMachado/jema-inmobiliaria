"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DocumentoPropiedad } from "@/app/lib/types";
import api from "@/app/lib/api";
import Icon from "@/app/components/Icons";
import Button from "@/app/components/Button";

interface Props {
  propiedadId?: string;
  documentos?: DocumentoPropiedad[];
  onVerificar?: (docId: string, current: boolean) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentoImgModal({
  propiedadId,
  documentos: documentosProp,
  onVerificar,
  isOpen,
  onClose,
}: Props) {
  const [documentos, setDocumentos] = useState<DocumentoPropiedad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const cerrarRef = useRef<HTMLButtonElement>(null);
  const focusPrevioRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    /* eslint-disable react-hooks/set-state-in-effect */
    if (documentosProp) {
      setDocumentos(documentosProp);
      return;
    }

    if (!propiedadId) return;

    setLoading(true);
    setError("");
    /* eslint-enable react-hooks/set-state-in-effect */

    api
      .get(`propiedades/${propiedadId}/documentos`)
      .then((res) => {
        setDocumentos(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los documentos. Intenta de nuevo.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, propiedadId, documentosProp]);

  useEffect(() => {
    if (!isOpen) return;

    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    focusPrevioRef.current = document.activeElement;
    document.addEventListener("keydown", cerrarConEscape);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cerrarRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = scrollPrevio;
      (focusPrevioRef.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url);
  const isPDF = (url: string) => /\.pdf/i.test(url);

  const recargar = () => {
    if (!propiedadId) return;

    setLoading(true);
    setError("");

    api
      .get(`propiedades/${propiedadId}/documentos`)
      .then((res) => {
        setDocumentos(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError("No se pudieron cargar los documentos. Intenta de nuevo.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return createPortal(
    <article className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="documentos-titulo"
        className="relative z-10 flex w-full max-w-4xl max-h-[90vh] flex-col gap-4 bg-gray-900/95 border border-gray-800 rounded-2xl p-5 shadow-2xl backdrop-blur animate-fade-in"
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-800 pb-3">
          <div>
            <h2
              id="documentos-titulo"
              className="text-lg font-bold text-white"
            >
              Documentos de la propiedad
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              {documentos.length} documento(s) adjunto(s)
            </p>
          </div>

          <button
            ref={cerrarRef}
            type="button"
            aria-label="cerrar"
            onClick={onClose}
            className="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            ✕
          </button>
        </header>

        <div className="overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-600 border-t-sky-400" />
              <p className="text-sm">Cargando...</p>
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 py-16 text-center"
            >
              <Icon name="alert" className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-400 font-medium">{error}</p>

              <Button
                title="Reintentar"
                variant="secondary"
                onClick={recargar}
                className="text-xs min-h-11 px-4"
              />
            </div>
          ) : documentos.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
              <Icon name="document" className="w-8 h-8" />
              <p className="text-sm">Sin documentos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {documentos.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-xl border border-gray-800 bg-gray-950/40 p-4 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon name="document" className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-200 capitalize">
                        {doc.tipo}
                      </span>

                      <span
                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                          doc.verificado
                            ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
                            : "text-amber-400 bg-amber-950/60 border border-amber-500/30"
                        }`}
                      >
                        <Icon
                          name={doc.verificado ? "check" : "clock"}
                          className="w-3 h-3"
                        />
                        {doc.verificado ? "Verificado" : "Sin verificar"}
                      </span>
                    </div>

                    {onVerificar && (
                      <Button
                        title={
                          doc.verificado
                            ? "Quitar verificación"
                            : "Verificar documento"
                        }
                        onClick={() => onVerificar(doc.id, doc.verificado)}
                        variant={doc.verificado ? "secondary" : "primary"}
                        className="text-xs min-h-11 px-4"
                      />
                    )}
                  </div>

                  {isImage(doc.url) ? (
                    <img
                      src={doc.url}
                      alt={`Documento ${doc.tipo} de la propiedad`}
                      loading="lazy"
                      className="max-h-[65vh] w-full rounded-lg object-contain bg-gray-950"
                    />
                  ) : isPDF(doc.url) ? (
                    <iframe
                      src={doc.url}
                      title={`Documento ${doc.tipo} en PDF`}
                      className="h-[65vh] w-full rounded-lg border-0 bg-gray-950"
                    />
                  ) : (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 underline"
                    >
                      <Icon name="upload" className="w-4 h-4" />
                      Abrir documento
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </article>,
    document.body,
  );
}
