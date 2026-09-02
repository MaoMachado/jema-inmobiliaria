"use client";

import { useEffect, useState } from "react";
import { DocumentoPropiedad } from "@/app/lib/types";
import api from "@/app/lib/api";

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

  useEffect(() => {
    if (!isOpen) return;
    if (documentosProp) {
      setDocumentos(documentosProp);
      return;
    }

    if (!propiedadId) return;

    setLoading(true);

    api
      .get(`propiedades/${propiedadId}/documentos`)
      .then((res) => {
        setDocumentos(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, propiedadId, documentosProp]);

  if (!isOpen) return null;

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)/i.test(url);
  const isPDF = (url: string) => /\.pdf/i.test(url);

  return (
    <article className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <section className="relative w-[90vw] sm:w-[80vw] max-w-3xl z-50 bg-gray-800 rounded-lg p-4 border-2 border-blue-700/50">
        <h2 className="text-xl lg:text-2xl text-center font-semibold mb-5">
          Documentos De la propiedad
        </h2>
        <div>
          {loading ? (
            <p className="text-center text-gray-400">Cargando...</p>
          ) : documentos.length === 0 ? (
            <p className="text-center text-gray-400">Sin documentos</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {documentos.map((doc) => (
                <div key={doc.id}>
                  {isImage(doc.url) ? (
                    <img
                      src={doc.url}
                      alt={doc.tipo}
                      className="rounded-md max-h-64 object-contain"
                    />
                  ) : isPDF(doc.url) ? (
                    <iframe src={doc.url} className="w-full h-96 rounded-md" />
                  ) : (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline"
                    >
                      Abrir documento
                    </a>
                  )}

                  <div>
                    <p
                      className={`text-sm ${doc.verificado ? "text-green-400" : "text-yellow-400"}`}
                    >
                      {doc.verificado ? "Verificado" : "No Verificado"}
                    </p>

                    <button
                      onClick={() => onVerificar?.(doc.id, doc.verificado)}
                      className={`px-2 py-1 text-sm font-semibold rounded-md cursor-pointer ${doc.verificado ? "text-green-400 bg-green-400/10 hover:bg-green-400/20" : "text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20"}`}
                    >
                      {doc.verificado ? "No Verificado" : "Verificado"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
