"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/app/components/Button";

interface SubirDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, tipo: string) => void | Promise<void>;
  message?: string;
}

const TIPOS = [
  { value: "escritura", label: "Escritura" },
  { value: "certificado", label: "Certificado de tradición" },
  { value: "planos", label: "Planos" },
  { value: "otro", label: "Otro" },
];

const MAX_MB = 10;
const TIPOS_ACEPTADO = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
];

export function SubirDocumentoModal({
  isOpen,
  onClose,
  onSubmit,
  message,
}: SubirDocumentoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<string>("escritura");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [arrastrando, setArrastrando] = useState<boolean>(false);

  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", cerrarConEscape);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = scrollPrevio;
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    /* eslint-disable react-hooks/set-state-in-effect */
    setFile(null);
    setError("");
    setLoading(false);
    selectRef.current?.focus();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [isOpen]);

  const validar = (archivo: File): string | null => {
    if (!TIPOS_ACEPTADO.includes(archivo.type)) {
      return "Solo se admiten archivos PDF, JPG, PNG o WEBP";
    }

    if (archivo.size > MAX_MB * 1024 * 1024) {
      return `El archivo no puede superar los ${MAX_MB} MB`;
    }

    return null;
  };

  const seleccionar = (archivo: File | undefined | null) => {
    if (!archivo) return;

    const problema = validar(archivo);

    setError(problema ?? "");
    setFile(problema ? null : archivo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Por favor, selecciona un documento para subir.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onSubmit(file, tipo);
      onClose();
    } catch {
      setError("No se pudo subir el documento. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const errorVisible = error || message || "";

  // Portal al body: la tarjeta tiene backdrop-blur, que crea un contexto de
  // posicionamiento y atraparía el modal dentro de la card.
  return createPortal(
    <article
      aria-label="Subir documento"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subir-documento-titulo"
        className="relative z-10 w-full max-w-md bg-gray-900/95 border border-gray-800 rounded-2xl p-6 space-y-5 shadow-2xl backdrop-blur animate-fade-in"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 id="subir-documento-titulo" className="text-lg font-bold">
              Subir Documento
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              PDF, JPG, PNG o WEBP - Máximo {MAX_MB}MB
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-gray-400 hover:text-white text-sm leading-none p-2 -m-2 rounded-lg cursor-pointer transition focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            ✕
          </button>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label
              htmlFor="tipo-documento"
              className="block text-xs font-semibold text-gray-300"
            >
              Tipo De Documento
            </label>

            <select
              id="tipo-documento"
              ref={selectRef}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-gray-950/60 border border-gray-800 rounded-xl px-3 py-3 text-sm text-white cursor-pointer focus:border-sky-500 outline-none transition"
            >
              {TIPOS.map((t) => (
                <option value={t.value} key={t.value} className="bg-gray-900">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-semibold text-gray-300">
              Documento
            </span>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setArrastrando(true);
              }}
              onDragLeave={() => setArrastrando(false)}
              onDrop={(e) => {
                e.preventDefault();
                setArrastrando(false);
                seleccionar(e.dataTransfer.files?.[0]);
              }}
              className={`rounded-xl border-2 border-dashed p-5 text-center transition ${
                arrastrando
                  ? "border-sky-500 bg-sky-950/30"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              <input
                type="file"
                id="documento"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                aria-describedby={errorVisible ? "documento-error" : undefined}
                onChange={(e) => seleccionar(e.target.files?.[0])}
                className="sr-only peer"
              />

              <label
                htmlFor="documento"
                className="block cursor-pointer rounded-lg peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-gray-900"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  aria-hidden="true"
                  className="w-7 h-7 mx-auto mb-2 text-gray-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-.41-8.98 5.25 5.25 0 0 1 10.32-1.98 3.75 3.75 0 0 1 .99 7.4"
                  />
                </svg>

                <span className="text-xs text-sky-400 font-semibold block">
                  Selecciona un archivo
                </span>
                <span className="text-[11px] text-gray-500">
                  o arrástralo aquí
                </span>
              </label>

              {file && (
                <p className="text-xs text-emerald-400 font-medium mt-3 truncate">
                  ✓ {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>
          </div>

          {errorVisible && (
            <p
              id="documento-error"
              role="alert"
              className="text-xs text-red-400 font-medium"
            >
              {errorVisible}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button
              title="Cancelar"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="text-xs min-h-11 px-4"
            />

            <Button
              type="submit"
              title={loading ? "Subiendo..." : "Subir"}
              variant="primary"
              loading={loading}
              disabled={loading || !file}
              className="text-xs min-h-11 px-4"
            />
          </div>
        </form>
      </div>
    </article>,
    document.body,
  );
}
