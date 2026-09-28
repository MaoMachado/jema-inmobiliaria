"use client";

import Button from "@/app/components/Button";
import { useState } from "react";

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

  const handleSolicitar = async () => {
    setEnviando(true);
    const ok = await onSolicitar();
    if (ok) setSolicitado(true);
    setEnviando(false);
  };

  const handleVerificar = async () => {
    setEnviando(true);
    const ok = await onVerificar(codigo);
    if (ok) setSolicitado(false);
    setEnviando(false);
  };

  return (
    <section className="text-center flex flex-col gap-4">
      <h2 className="lg:text-2xl font-semibold tracking-wider">
        Verificación de celular
      </h2>
      {celularVerificado ? (
        <p>Celular Verificado</p>
      ) : solicitado ? (
        <>
          <p>Te enviamos un codigo a {celular} (válido 5 min)</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Código de 6 dígitos"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className="mx-auto px-3 py-1 border-2 border-gray-800/50 rounded-lg focus:outline-0 focus:border-gray-800"
          />

          <Button
            title="Confirmar Código"
            type="button"
            onClick={handleVerificar}
            loading={enviando}
            disabled={enviando || codigo.length !== 6}
            className="mx-auto"
          />

          <button
            type="button"
            onClick={handleSolicitar}
            disabled={enviando}
            className="text-sm text-sky-500 hover:underline mx-auto"
          >
            Reenviar Código
          </button>
        </>
      ) : (
        <Button
          title="Verificar celular"
          type="button"
          onClick={handleSolicitar}
          loading={enviando}
          disabled={enviando}
          className="mx-auto"
        />
      )}
    </section>
  );
}
