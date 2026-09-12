"use client";

import { useState } from "react";
import Button from "@/app/components/Button";

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

  if (!isOpen) return null;

  return (
    <article className="fixed inset-0 flex flex-col gap-3 items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <section className="relative bg-gray-800 rounded-lg p-6 w-96 z-50 border border-red-500/50">
        <h2 className="text-xl font-semibold mb-4 text-red-400">
          Reportar Propiedad
        </h2>

        <select
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 mb-3"
        >
          {MOTIVOS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción (opcional)"
          className="w-full p-2 rounded bg-gray-700 h-20 mb-4"
        />

        <div className="flex gap-3">
          <Button title="Cancelar" onClick={onClose} variant="secondary" />
          <Button
            title="Enviar Reporte"
            onClick={() => onSubmit(motivo, descripcion, propiedadId)}
            variant="danger"
            loading={loading}
            disabled={loading}
          />
        </div>
      </section>

      {message && (
        <p className="font-semibold tracking-wider text-xl">{message}</p>
      )}
    </article>
  );
}
