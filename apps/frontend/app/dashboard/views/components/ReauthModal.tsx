"use client";

import { useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";

export default function ReauthModal({
  onCancelar,
  onConfirmar,
}: {
  onCancelar: () => void;
  onConfirmar: (credenciales: {
    password: string;
    codigo?: string;
  }) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [pideCodigo, setPideCodigo] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Escape cierra el diálogo y Tab se queda dentro mientras esté abierto.
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancelar();
        return;
      }

      if (e.key !== "Tab" || !formRef.current) return;

      const enfocables = Array.from(
        formRef.current.querySelectorAll<HTMLElement>("input, button"),
      );

      if (enfocables.length === 0) return;

      const primero = enfocables[0];
      const ultimo = enfocables[enfocables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [onCancelar]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError("");

    try {
      await onConfirmar({
        password,
        codigo: pideCodigo ? codigo : undefined,
      });
    } catch (err) {
      const mensaje = isAxiosError(err)
        ? (err.response?.data?.message as string | undefined)
        : undefined;

      // El backend pide el segundo factor: se muestra el campo y se reintenta.
      if (mensaje?.startsWith("TOTP_REQUIRED")) {
        setPideCodigo(true);
        setError("Ingresa el código de tu app autenticadora");
        return;
      }

      setError(mensaje ?? "No se pudo verificar la contraseña");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reauth-titulo"
    >
      <form
        ref={formRef}
        onSubmit={enviar}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-gray-700 bg-gray-900 p-6"
      >
        <h2 id="reauth-titulo" className="text-lg font-semibold text-gray-100">
          Confirma tu identidad
        </h2>
        <p className="text-sm text-gray-400">
          Para ver documentos debes ingresar tu contraseña. La confirmación dura
          5 minutos.
        </p>

        <label className="block text-sm text-gray-300">
          Contraseña
          <input
            type="password"
            autoFocus
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-gray-100"
          />
        </label>

        {pideCodigo && (
          <label className="block text-sm text-gray-300">
            Código de 6 dígitos
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 tracking-widest text-gray-100"
            />
          </label>
        )}

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={enviando}
            className="min-h-11 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando || !password || (pideCodigo && codigo.length !== 6)}
            className="min-h-11 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
          >
            Ver documento
          </button>
        </div>
      </form>
    </div>
  );
}
