"use client";

import { useState } from "react";
import { Propiedad } from "../lib/types";
import { SubirDocumentoModal } from "../dashboard/Modal/SubirDocumentoModal";
import { DocumentoImgModal } from "../dashboard/Modal/DocumentoImgModal";
import Button from "./Button";
import Link from "next/link";

interface CardPropiedadProps {
  propiedad: Propiedad;
  onEdit?: (propiedad: Propiedad) => void;
  onDelete?: (id: string) => void;
  onProbabilidad?: (id: string) => void;
  onDocumento?: (id: string, file: File, tipo: string) => void;
  onReportar?: (propiedadId: string) => void;
  onDestacar?: (propiedadId: string, nuevoEstado: boolean) => void;
}

export function CardPropiedad({
  propiedad,
  onEdit,
  onDelete,
  onProbabilidad,
  onDocumento,
  onReportar,
  onDestacar,
}: CardPropiedadProps) {
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(propiedad.precio);

  const [showModalDocumento, setShowModalDocumento] = useState(false);
  const [showModalDocumentoImg, setShowModalDocumentoImg] = useState(false);

  const handleShowDocumentoModal = () => {
    if (propiedad.documentos && propiedad.documentos.length > 0) {
      setShowModalDocumentoImg(true);
    } else {
      setShowModalDocumento(true);
    }
  };

  const esNavegable = !onEdit || propiedad.estado === "APROBADA";

  return (
    <section
      className={`relative flex flex-col justify-between bg-gray-900/60 border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm ${
        propiedad.destacada
          ? "border-2 border-sky-500/50 ring-sky-500/30"
          : "border-gray-800 hover:border-gray-700"
      }`}
    >
      {onDestacar && (
        <button
          disabled={propiedad.estado !== "APROBADA"}
          onClick={() => onDestacar?.(propiedad.id, !propiedad.destacada)}
          title={
            propiedad.estado !== "APROBADA"
              ? "Solo se pueden destacar propiedades aprobadas"
              : propiedad.destacada
                ? "Quitar de destacadas"
                : "Destacar en landing"
          }
          className={`absolute top-3 left-3 z-10 p-1.5 rounded-full bg-gray-900/80 backdrop-blur-md border border-gray-700 cursor-  pointer transition ${
            propiedad.estado !== "APROBADA"
              ? "opacity-30 cursor-not-allowed grayscale"
              : "hover:scale-110 cursor-pointer"
          }`}
          aria-label="Destacar Propiedad"
        >
          {propiedad.destacada ? "✨" : "⭐"}
        </button>
      )}

      {onEdit && (
        <p
          className={
            propiedad.estado === "RECHAZADA"
              ? "text-red-400 text-center text-sm"
              : propiedad.estado === "PENDIENTE"
                ? "text-yellow-400 text-center text-sm"
                : "text-green-400 text-center text-sm"
          }
        >
          <span>
            {propiedad.estado === "RECHAZADA"
              ? "Publicación Rechazada"
              : propiedad.estado === "PENDIENTE"
                ? "Publicación Pendiente"
                : "Publicación Aprobada"}
          </span>
        </p>
      )}

      <header className="relative">
        {esNavegable ? (
          <Link
            href={`/propiedades/${propiedad.id}`}
            className="block overflow-hidden group aspect-video w-full bg-gray-950"
          >
            {propiedad.fotografias?.[0] ? (
              <img
                src={propiedad.fotografias[0]}
                alt={propiedad.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                <span className="text-3xl mb-1">🏠</span>
                <span className="text-xs">Sin fotografías</span>
              </div>
            )}
          </Link>
        ) : (
          <div className="block overflow-hidden rounded-lg">
            {propiedad.fotografias?.[0] ? (
              <img
                src={propiedad.fotografias[0]}
                alt={propiedad.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
                <span className="text-3xl mb-1">🏠</span>
                <span className="text-xs">Sin fotografías</span>
              </div>
            )}
          </div>
        )}

        <span className="absolute bottom-3 left-3 bg-gray-950/85 backdrop-blur-md border border-gray-700 text-gray-200 text-xs px-2.5 py-1 rounded-md font-medium">
          📍{propiedad.ciudad}
        </span>

        {propiedad.puntaje !== undefined && propiedad.puntaje !== null && (
          <span className="absolute bottom-3 right-3 bg-sky-950/90 border border-sky-500/50 text-sky-300 text-xs px-2.5 py-1 rounded-md font-bold">
            Calificación: {propiedad.puntaje}
          </span>
        )}
      </header>

      <article className="p-4 flex flex-col grow justify-between gap-3">
        <div>
          <span className="text-2xl font-black text-emerald-400 tracking-tight block">
            {precioFormateado}
          </span>

          <h3 className="cursor-pointer text-base font-bold mt-1 line-clamp-1 hover:text-sky-400 transition-colors duration-200">
            {esNavegable ? (
              <Link href={`/propiedades/${propiedad.id}`}>
                {propiedad.titulo}
              </Link>
            ) : (
              propiedad.titulo
            )}
          </h3>

          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {propiedad.barrio ? `${propiedad.barrio}, ` : ""}
            {propiedad.direccion}
          </p>
        </div>

        <div className="flex items-center justify-between py-2 border-y border-gray-800 text-xs text-gray-300 font-medium">
          <span title="Habitaciones">🛏️ {propiedad.habitaciones ?? 0} Hab</span>
          <span title="Baños">🚿 {propiedad.banos ?? 0} Baños</span>
          <span title="Área">📐 {propiedad.area ?? 0} m²</span>
          <span title="Estrato">🏛️ Est. {propiedad.estrato ?? "-"}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            {propiedad.publicadoPor?.celularVerificado ? (
              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                ✓ Verificado
              </span>
            ) : (
              <span className="text-gray-400 bg-gray-800/80 px-1.5 py-0.5 rounded text-[11px]">
                Sin Verificar
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">Docs:</span>
            {propiedad.documentos &&
            propiedad.documentos.length > 0 &&
            propiedad.documentos.every((d) => d.verificado) ? (
              <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                ✓ Auditados
              </span>
            ) : (
              <span className="text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded text-[11px]">
                Pendiente
              </span>
            )}
          </div>
        </div>

        {(onEdit ||
          onDelete ||
          onProbabilidad ||
          onReportar ||
          onDocumento) && (
          <article className="flex justify-end items-center gap-2 pt-2 border-t border-gray-800">
            {onDocumento && (
              <Button
                title="📄"
                placeHolder="Subir Documento"
                onClick={handleShowDocumentoModal}
                variant="secondary"
                ariaLabel="Subir Documento"
              />
            )}

            {onProbabilidad && (
              <Button
                title="📊"
                placeHolder="Ver Probabilidad"
                onClick={() => onProbabilidad(propiedad.id)}
                variant="secondary"
                ariaLabel="Ver Probabilidad"
              />
            )}

            {onEdit && (
              <Button
                title="✏️"
                placeHolder="Editar Propiedad"
                onClick={() => onEdit(propiedad)}
                variant="secondary"
                ariaLabel="Editar Propiedad"
              />
            )}

            {onDelete && (
              <Button
                title="🗑️"
                placeHolder="Eliminar Propiedad"
                onClick={() => onDelete(propiedad.id)}
                variant="danger"
                ariaLabel="Eliminar Propiedad"
              />
            )}

            {onReportar && (
              <Button
                title="⚠️"
                placeHolder="Reportar Propiedad"
                onClick={() => onReportar(propiedad.id)}
                variant="secondary"
                ariaLabel="Reportar Propiedad"
              />
            )}
          </article>
        )}
      </article>

      {onDocumento && (
        <section className="flex flex-col gap-1 md:p-4">
          <p className="text-sm font-semibold">Documentos de la propiedad</p>
          {propiedad.documentos && propiedad.documentos.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {propiedad.documentos.map((doc) => (
                <button
                  key={doc.tipo}
                  onClick={() => setShowModalDocumentoImg(true)}
                  className={`px-2 py-1 text-sm rounded-md cursor-pointer ${doc.verificado ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-500"}`}
                >
                  {doc.tipo} {doc.verificado ? "✓" : "⏳"}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Sin Documentos</p>
          )}
        </section>
      )}

      <span className="absolute bottom-5 left-4 px-3 bg-gray-500 rounded-md opacity-80">
        {!propiedad.documentos || propiedad.documentos.length === 0 ? (
          <p className="text-red-400 text-center text-sm">
            &#9734; Publicación No Verificada
          </p>
        ) : (
          <p className="text-green-400 text-center text-sm">
            &#10003; Publicación Verificada
          </p>
        )}
      </span>

      {showModalDocumento && (
        <SubirDocumentoModal
          isOpen={showModalDocumento}
          onClose={() => setShowModalDocumento(false)}
          onSubmit={(file, tipo) => onDocumento?.(propiedad.id, file, tipo)}
        />
      )}

      {showModalDocumentoImg && (
        <DocumentoImgModal
          propiedadId={propiedad.id}
          isOpen={showModalDocumentoImg}
          onClose={() => setShowModalDocumentoImg(false)}
        />
      )}
    </section>
  );
}
