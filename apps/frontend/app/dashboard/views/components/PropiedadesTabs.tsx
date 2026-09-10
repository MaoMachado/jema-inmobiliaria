import { useState } from "react";
import { Usuario } from "@/app/lib/types";

export default function PropiedadesTabs({
  propiedades,
  onVerificar,
}: {
  propiedades: Usuario["propiedades"];
  onVerificar: (docId: string, current: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section>
      <div>
        {propiedades?.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActiveTab(i)}
            className={`cursor-pointer px-2 py-1 text-xs rounded-md whitespace-nowrap ${activeTab === i ? "bg-sky-600" : "bg-gray-700 text-gray-300"}`}
          >
            {p.titulo}
          </button>
        ))}
      </div>

      <div>
        {propiedades?.[activeTab]?.documentos.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between text-xs"
          >
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 underline truncate max-w-20"
            >
              {doc.tipo}
            </a>

            <button
              onClick={() => onVerificar(doc.id, doc.verificado)}
              className={`px-1.5 py-0.5 rounded ${doc.verificado ? "text-green-400 bg-green-400/10" : "text-yellow-400 bg-yellow-400/10"}`}
            >
              {doc.verificado ? "✓" : "⏳"}
            </button>
          </div>
        ))}

        {propiedades?.[activeTab]?.documentos.length === 0 && (
          <p className="text-xs text-gray-500">Sin documentos</p>
        )}
      </div>
    </section>
  );
}
