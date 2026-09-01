"use client";

import { useState } from "react";
import Button from "@/app/components/Button";

interface SubirDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, tipo: string) => void;
}

export function SubirDocumentoModal({
  isOpen,
  onClose,
  onSubmit,
}: SubirDocumentoModalProps) {
  if (!isOpen) return null;

  const [file, setFile] = useState<File | null>(null);
  const [tipo, setTipo] = useState<string>("escritura");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubirDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (file) {
      onSubmit(file, tipo);
    }
  };

  return (
    <section
      className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="flex flex-col gap-6 bg-gray-500/30 border-2 border-gray-700/50 p-4 rounded-md backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-xl">Subir Documento</h2>
        <form className="flex flex-col gap-6" onSubmit={handleSubirDocumento}>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border border-blue-500/50 rounded-md p-1.5"
          >
            <option className="bg-gray-800/50 text-white" disabled value="">
              Seleccione un tipo de documento
            </option>
            <option className="bg-gray-800/50 text-white" value="escritura">
              Escritura
            </option>
            <option className="bg-gray-800/50 text-white" value="certificado">
              Certificado
            </option>
            <option className="bg-gray-800/50 text-white" value="planos">
              Planos
            </option>
            <option className="bg-gray-800/50 text-white" value="otro">
              Otro
            </option>
          </select>

          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files![0])}
            className="border border-blue-500/50 rounded-md p-1.5"
          />

          <div className="flex justify-end gap-3 mt-3">
            <Button
              type="submit"
              title={loading ? "Subiendo..." : "Subir"}
              variant="primary"
              ariaLabel="Subir Documento"
            />
            <Button
              title="Cancelar"
              variant="secondary"
              onClick={onClose}
              ariaLabel="Cancelar"
            />
          </div>

          {error && <p>{error}</p>}
        </form>
      </div>
    </section>
  );
}
