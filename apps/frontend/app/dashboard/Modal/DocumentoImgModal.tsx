"use client";

interface Props {
  documentos: { id: string; url: string; tipo: string; verificado: boolean }[];
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentoImgModal({ documentos, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative z-50 bg-gray-800 rounded-lg p-4">
        <h2 className="text-xl text-center font-semibold mb-5">
          Documento De la propiedad
        </h2>
        <div>
          {documentos.map((doc) => (
            <div key={doc.id} className="flex flex-col gap-1">
              <p className="text-sm text-gray-400">{doc.tipo}</p>
              <img src={doc.url} alt={doc.tipo} className="rounded-md" />
              <p
                className={`text-sm ${doc.verificado ? "text-green-400" : "text-yellow-400"}`}
              >
                {doc.verificado ? "Verificado" : "No Verificado"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
