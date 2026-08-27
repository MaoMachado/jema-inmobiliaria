"use client";

import { useState } from "react";
import Button from "@/app/components/Button";

interface SubirDocumentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => void;
}

export function SubirDocumentoModal({
  isOpen,
  onClose,
  onSubmit,
}: SubirDocumentoModalProps) {
  if (!isOpen) return null;

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubirDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <section
      className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-gray-500/30 border-2 border-gray-700/50 p-4 rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center mb-3 text-xl">Subir Documento</h2>
        <form className="flex flex-col" onSubmit={handleSubirDocumento}>
          <input
            type="file"
            required
            onChange={(e) => setFile(e.target.files![0])}
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
