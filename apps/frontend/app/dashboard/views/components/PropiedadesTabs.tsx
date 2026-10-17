import { useState } from "react";
import { Usuario } from "@/app/lib/types";
import Icon from "@/app/components/Icons";

export default function PropiedadesTabs({
  propiedades,
  onVerificar,
  verificandoId,
}: {
  propiedades: Usuario["propiedades"];
  onVerificar: (docId: string, current: boolean) => void;
  verificandoId?: string | null;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const activa = propiedades?.[activeTab];

  return (
    <section>
      <div
        role="tablist"
        aria-label="Inmuebles del usuario"
        className="flex gap-1.5 overflow-x-auto pb-1"
      >
        {propiedades?.map((p, i) => (
          <button
            key={p.id}
            role="tab"
            id={`tab-${p.id}`}
            aria-selected={activeTab === i}
            aria-controls={`panel-${p.id}`}
            onClick={() => setActiveTab(i)}
            className={`shrink-0 cursor-pointer px-2.5 py-1.5 text-xs font-semibold rounded-lg transition min-h-9 ${
              activeTab === i
                ? "bg-sky-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700/50"
            }`}
          >
            {p.titulo}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activa?.id}`}
        aria-labelledby={`tab-${activa?.id}`}
        className="space-y-1.5 pt-2"
      >
        {activa?.documentos.map((doc) => {
          const enCurso = verificandoId === doc.id;

          return (
            <div
              key={doc.id}
              className={`flex items-center justify-between gap-2 text-xs rounded-lg px-1.5 py-1 transition ${
                enCurso ? "bg-sky-950/40 animate-pulse" : ""
              }`}
            >
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 hover:underline truncate min-h-9"
              >
                <Icon name="document" className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{doc.tipo}</span>
              </a>

              <button
                onClick={() => onVerificar(doc.id, doc.verificado)}
                disabled={enCurso}
                aria-label={`${doc.verificado ? "Marcar como pendiente" : "Verificar"}: ${doc.tipo} de ${activa.titulo}`}
                title={
                  doc.verificado
                    ? "Marcar como pendiente"
                    : "Verificar documentación"
                }
                className={`flex items-center gap-1 shrink-0 px-2 rounded-lg text-[10px] font-bold min-h-9 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 disabled:cursor-wait ${
                  doc.verificado
                    ? "text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 hover:bg-emerald-950"
                    : "text-amber-300 bg-amber-950/60 border border-amber-800/50 hover:bg-amber-950"
                }`}
              >
                <Icon
                  name={doc.verificado ? "check" : "clock"}
                  className="w-3.5 h-3.5"
                />
                {doc.verificado ? "Verificado" : "Pendiente"}
              </button>
            </div>
          );
        })}

        {activa?.documentos.length === 0 && (
          <div className="flex items-center gap-2 text-xs rounded-lg px-1.5 py-1 transition">
            <Icon name="alert" className="w-3.5 h-3.5 shrink-0" />
            <p className="text-xs text-gray-500 italic">
              Sin Documentos Asociados
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
