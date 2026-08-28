"use client";

interface Props {
  documentos: { id: string; url: string; tipo: string; verificado: boolean }[];
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentoImgModal({ documentos, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  const isPDF = (url: string) => /\.pdf$/i.test(url);

  return (
    <article className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <section className="relative w-[90vw] sm:w-[80vw] max-w-3xl z-50 bg-gray-800 rounded-lg p-4 border-2 border-blue-700/50">
        <h2 className="text-xl lg:text-2xl text-center font-semibold mb-5">
          Documento De la propiedad
        </h2>
        <div>
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
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
