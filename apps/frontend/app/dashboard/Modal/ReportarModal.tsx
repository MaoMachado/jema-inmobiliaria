"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/app/components/Button";
import { createPortal } from "react-dom";
import Icon from "@/app/components/Icons";

interface Props {
  propiedadId: string;
  isOpen: boolean;
  message: string;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (motivo: string, descripcion: string, propiedadId: string) => void;
}

const MOTIVOS = [
  "Precio sospechoso",
  "Propiedad falsa",
  "Estafa",
  "Información engañosa",
  "Otro",
];

const MIN_DESCRIPCION = 10;
const MAX_DESCRIPCION = 500;

const INPUT_CLASS =
  "w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-3 text-sm text-white cursor-pointer focus:border-sky-500 outline-none transition";
const LABEL_CLASS = "block text-xs font-semibold text-gray-300 mb-1.5";

export default function ReportarModal({
  propiedadId,
  isOpen,
  message,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string>("");

  const cerrarRef = useRef<HTMLButtonElement>(null);
  const focoPrevioRef = useRef<Element | null>(null);
  const salirRef = useRef<() => void>(() => {});

  const salir = () => {
    if (loading) return;
    onClose();
  };

  useEffect(() => {
    salirRef.current = salir;
  });

  useEffect(() => {
    if (!isOpen) return;

    focoPrevioRef.current = document.activeElement;
    cerrarRef.current?.focus();

    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") salirRef.current();
    };

    document.addEventListener("keydown", cerrarConEscape);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = scrollPrevio;
      (focoPrevioRef.current as HTMLElement | null)?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const enviar = () => {
    if (loading) return;

    const texto = descripcion.trim();

    if (motivo === "Otro" && texto.length < MIN_DESCRIPCION) {
      setError(
        `Cuéntanos qué pasó (mínimo ${MIN_DESCRIPCION} caracteres) para poder revisarlo.`,
      );
      return;
    }

    setError("");
    onSubmit(motivo, texto, propiedadId);
  };

  const esExito = /exitosamente|éxito/i.test(message);

  return createPortal(
    <article className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={salir}
        aria-hidden="true"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="reportar-titulo"
        className="relative z-10 w-full max-w-md bg-gray-900/95 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur animate-fade-in"
      >
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="min-h-11 min-w-11 flex items-center justify-center rounded-xl bg-red-950/60 border border-red-500/30 text-red-400">
              <Icon name="alert" className="w-5 h-5" />
            </span>

            <div>
              <h2 id="reportar-titulo" className="text-lg font-bold text-white">
                Reportar Propiedad
              </h2>

              <p className="text-xs text-gray-400 mt-0.5">
                Nuestro equipo revisará el reporte antes de actuar
              </p>
            </div>
          </div>

          <button
            ref={cerrarRef}
            type="button"
            onClick={salir}
            disabled={loading}
            aria-label="Cerrar"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/60 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 disabled:opacity-40"
          >
            ✕
          </button>
        </header>

        <div className="space-y-4">
          <div>
            <label htmlFor="motivo" className={LABEL_CLASS}>
              Motivo del reporte
            </label>

            <select
              id="motivo"
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (error) setError("");
              }}
              className={INPUT_CLASS}
            >
              {MOTIVOS.map((m) => (
                <option value={m} key={m} className="bg-gray-900">
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="descripcion" className={LABEL_CLASS}>
                Descripción {motivo === "Otro" ? "*" : "(opcional)"}
              </label>

              <span className="text-[11px] text-gray-500">
                {descripcion.length}/{MAX_DESCRIPCION}
              </span>
            </div>

            <textarea
              id="descripcion"
              value={descripcion}
              maxLength={MAX_DESCRIPCION}
              onChange={(e) => {
                setDescripcion(e.target.value);
                if (error) setError("");
              }}
              placeholder="Ej: El precio publicado no coincide con el que pide el vendedor..."
              className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 focus:border-sky-500 outline-none transition resize-none h-28"
            />

            {error && (
              <p role="alert" className="mt-2 text-xs text-red-400 font-medium">
                {error}
              </p>
            )}
          </div>
        </div>

        {message && (
          <p
            role={esExito ? "status" : "alert"}
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              esExito
                ? "bg-emerald-950/50 border-emerald-500/30 text-emerald-300"
                : "bg-red-950/50 border-red-500/30 text-red-300"
            }`}
          >
            <Icon
              name={esExito ? "check" : "alert"}
              className="w-4 h-4 shrink-0"
            />
            {message}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-1">
          <Button
            title="Cancelar"
            onClick={salir}
            variant="secondary"
            disabled={loading}
            className="text-xs min-h-11 px-4"
          />

          <Button
            title={loading ? "Enviando..." : "Enviar reporte"}
            onClick={enviar}
            variant="danger"
            loading={loading}
            disabled={loading}
            className="text-xs min-h-11 px-4"
          />
        </div>
      </section>
    </article>,
    document.body,
  );
}
