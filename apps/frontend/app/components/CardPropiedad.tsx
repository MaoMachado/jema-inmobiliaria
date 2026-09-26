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

  const [showModalDocumento, setShowModalDocumento] = useState<boolean>(false);
  const [showModalDocumentoImg, setShowModalDocumentoImg] =
    useState<boolean>(false);

  const handleShowDocumentoModal = () => {
    if (propiedad.documentos && propiedad.documentos.length > 0) {
      setShowModalDocumentoImg(true);
    } else {
      setShowModalDocumento(true);
    }
  };

  const esNavegable = !onEdit || propiedad.estado === "APROBADA";

  return (
    <article
      className={`relative bg-gray-800/30 p-3 border  rounded-lg shadow-xs ${
        propiedad.destacada ? "border-2 border-sky-700/50" : "border-gray-600"
      }`}
    >
      {onEdit && (
        <span>
          <p
            className={
              propiedad.estado === "RECHAZADA"
                ? "text-red-400 text-center text-sm"
                : propiedad.estado === "PENDIENTE"
                  ? "text-yellow-400 text-center text-sm"
                  : "text-green-400 text-center text-sm"
            }
          >
            {propiedad.estado === "RECHAZADA"
              ? "Publicación Rechazada"
              : propiedad.estado === "PENDIENTE"
                ? "Publicación Pendiente"
                : "Publicación Aprobada"}
          </p>
        </span>
      )}

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
          className={`absolute -top-2 -left-2 cursor-pointer transition-all duration-200 ease-in-out ${
            propiedad.estado !== "APROBADA"
              ? "opacity-30 cursor-not-allowed grayscale"
              : "hover:scale-125"
          }`}
          aria-label="Destacar Propiedad"
        >
          {propiedad.destacada ? "✨" : "⭐"}
        </button>
      )}

      <header className="relative mt-3">
        {esNavegable ? (
          <Link
            href={`/propiedades/${propiedad.id}`}
            className="block overflow-hidden rounded-lg group"
          >
            {propiedad.fotografias?.[0] ? (
              <img
                src={propiedad.fotografias[0]}
                alt={propiedad.titulo}
                className="rounded-lg w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-48 bg-gray-700/50 rounded-lg flex flex-col items-center justify-center text-gray-400 group-hover:bg-gray-700/70 transition-colors">
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
                className="rounded-lg w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-700/50 rounded-lg flex flex-col items-center justify-center text-gray-400">
                <span className="text-3xl mb-1">🏠</span>
                <span className="text-xs">Sin fotografías</span>
              </div>
            )}
          </div>
        )}

        {propiedad.puntaje !== undefined && propiedad.puntaje !== null && (
          <p className="absolute -translate-y-8 translate-x-4 opacity-80">
            Calificación:{" "}
            <span className="bg-blue-700/80 rounded-full px-3 py-1.5 font-semibold">
              {propiedad.puntaje}
            </span>
          </p>
        )}

        <h3 className="text-xl font-semibold tracking-wider text-center mt-2">
          {esNavegable ? (
            <Link
              href={`/propiedades/${propiedad.id}`}
              className="hover:text-sky-400 transition-colors line-clamp-1"
            >
              {propiedad.titulo}
            </Link>
          ) : (
            <span className="line-clamp-1 cursor-default">
              {propiedad.titulo}
            </span>
          )}
        </h3>
      </header>

      <section className="flex flex-col justify-between md:p-4 leading-normal">
        <p className="text-lg">
          Precio:{" "}
          <span className="font-semibold text-green-400 tracking-wider">
            {precioFormateado}
          </span>
        </p>
        <p className="text-lg">
          Ciudad:{" "}
          <span className="font-semibold text-blue-400 tracking-wider">
            {propiedad.ciudad}
          </span>
        </p>
      </section>

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

      <section className="flex flex-col justify-between md:p-4 leading-normal">
        <p className="flex items-center justify-between">
          Celular Verificado:{" "}
          <span className="font-semibold text-yellow-400 tracking-wider text-xl">
            {propiedad.publicadoPor?.celularVerificado ? "🆗" : "😒"}
          </span>
        </p>

        <p className="flex items-center justify-between">
          Documento Verificado:{" "}
          <span className="font-semibold text-green-400 tracking-wider text-xl">
            {propiedad.documentos && propiedad.documentos.length > 0
              ? propiedad.documentos.every((doc) => doc.verificado)
                ? "🆗"
                : "⏳"
              : "😒"}
          </span>
        </p>
      </section>

      <section className="flex justify-between items-center md:p-4 leading-normal">
        {onDocumento && (
          <Button
            title="📄"
            placeHolder="Subir Documento"
            onClick={handleShowDocumentoModal}
            variant="secondary"
            ariaLabel="Subir Documento"
          />
        )}
        <div className="flex justify-end gap-3">
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

          {onProbabilidad && (
            <Button
              title="📊"
              placeHolder="Ver Probabilidad"
              onClick={() => onProbabilidad(propiedad.id)}
              variant="secondary"
              ariaLabel="Ver Probabilidad"
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
        </div>
      </section>

      <span className="absolute -bottom-2.5 left-12 px-3 bg-gray-500 rounded-md opacity-80">
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
    </article>
  );
}
