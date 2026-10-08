"use client";

import Button from "@/app/components/Button";
import { useEffect, useState } from "react";

interface VerificacionCelularProps {
  celularVerificado: boolean;
  celular: string;
  onSolicitar: () => Promise<boolean>;
  onVerificar: (codigo: string) => Promise<boolean>;
}

export function VerificacionCelular({
  celularVerificado,
  celular,
  onSolicitar,
  onVerificar,
}: VerificacionCelularProps) {
  const [solicitado, setSolicitado] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSolicitar = async () => {
    setEnviando(true);
    const ok = await onSolicitar();
    if (ok) {
      setSolicitado(true);
      setCooldown(60);
    }
    setEnviando(false);
  };

  const handleVerificar = async () => {
    if (codigo.length !== 6) return;
    setEnviando(true);

    const ok = await onVerificar(codigo);

    if (ok) {
      setSolicitado(false);
      setCodigo("");
    }

    setEnviando(false);
  };

  const handleCancelar = () => {
    setSolicitado(false);
    setCodigo("");
  };

  return (
    <section className="text-center flex flex-col items-center gap-4 p-4 border border-gray-700/40 rounded-xl bg-gray-900/30 w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold tracking-wider">
        Verificación de celular
      </h2>

      {celularVerificado ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-sm font-medium">
          <span className="text-lg">✅</span>
          <span>Celular verificado ({celular})</span>
        </div>
      ) : solicitado ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <p className="text-sm text-gray-300">
            Te enviamos un código de 6 dígitos a{" "}
            <span className="font-semibold text-sky-400">{celular}</span>{" "}
            (válido por 5 min).
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            autoFocus
            placeholder="000000"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className="text-center text-2xl tracking-[0.5em] font-mono px-4 py-2 border-2 border-sky-500/50 bg-gray-950 rounded-lg focus:outline-none focus:border-sky-400 w-48 text-white placeholder:text-gray-600"
          />

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              title="Confirmar Código"
              type="button"
              onClick={handleVerificar}
              loading={enviando}
              disabled={enviando || codigo.length !== 6}
            />
            <Button
              title="Cancelar"
              type="button"
              variant="secondary"
              onClick={handleCancelar}
              disabled={enviando}
            />
          </div>

          <button
            type="button"
            onClick={handleSolicitar}
            disabled={enviando || cooldown > 0}
            className="text-xs text-sky-400 hover:text-sky-300 hover:underline disabled:text-gray-500 disabled:no-underline transition"
          >
            {cooldown > 0
              ? `Reenviar código en ${cooldown}s`
              : "Reenviar Código"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-gray-400">
            Verifica tu número ({celular}) para aumentar la confianza en tus
            publicaciones.
          </p>
          <Button
            title="Verificar celular"
            type="button"
            onClick={handleSolicitar}
            loading={enviando}
            disabled={enviando}
          />
        </div>
      )}
    </section>
  );
}
