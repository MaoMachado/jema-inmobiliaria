"use client";

import { useState } from "react";
import { Propiedad } from "../lib/types";
import { SubirDocumentoModal } from "../dashboard/Modal/SubirDocumentoModal";
import { DocumentoImgModal } from "../dashboard/Modal/DocumentoImgModal";
import Button from "./Button";

interface CardPropiedadProps {
  propiedad: Propiedad;
  onEdit?: (propiedad: Propiedad) => void;
  onDelete?: (id: string) => void;
  onProbabilidad?: (id: string) => void;
  onDocumento?: (id: string, file: File, tipo: string) => void;
}

export function CardPropiedad({
  propiedad,
  onEdit,
  onDelete,
  onProbabilidad,
  onDocumento,
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

  return (
    <article className="relative bg-gray-800/30 p-3 border border-gray-600 rounded-lg shadow-xs">
      <section className="relative">
        {propiedad.fotografias?.[0] && (
          <img
            src={propiedad.fotografias[0]}
            alt={propiedad.titulo}
            className="rounded-lg"
          />
        )}

        <p className="absolute -translate-y-8 translate-x-4 opacity-80">
          Calificación:{" "}
          <span className="bg-blue-700/80 rounded-full px-3 py-1.5 font-semibold">
            {propiedad.puntaje}
          </span>
        </p>
      </section>

      <h3 className="text-xl font-semibold tracking-wider text-center">
        {propiedad.titulo}
      </h3>

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
        <p className="text-lg">
          Dueño:{" "}
          <span className="font-semibold text-blue-400 tracking-wider">
            {propiedad.publicadoPor?.nombres}{" "}
            {propiedad.publicadoPor?.apellidos}
          </span>
        </p>
      </section>

      <section className="flex flex-col gap-1 md:p-4">
        <p className="text-sm font-semibold">Documentos de la propiedad</p>
        {propiedad.documentos && propiedad.documentos.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {propiedad.documentos.map((doc) => (
              <button
                key={doc.id}
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
        <Button
          title="📄"
          onClick={handleShowDocumentoModal}
          variant="secondary"
          ariaLabel="Subir Documento"
        />
        <div className="flex justify-end gap-3">
          {onEdit && (
            <Button
              title="✏️"
              onClick={() => onEdit(propiedad)}
              variant="secondary"
              ariaLabel="Editar Propiedad"
            />
          )}

          {onDelete && (
            <Button
              title="🗑️"
              onClick={() => onDelete(propiedad.id)}
              variant="danger"
              ariaLabel="Eliminar Propiedad"
            />
          )}

          {onProbabilidad && (
            <Button
              title="📊"
              onClick={() => onProbabilidad(propiedad.id)}
              variant="secondary"
              ariaLabel="Ver Probabilidad"
            />
          )}
        </div>
      </section>

      <span className="absolute -bottom-5 left-15 px-3 bg-gray-500 rounded-md">
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
          isOpen={showModalDocumentoImg}
          onClose={() => setShowModalDocumentoImg(false)}
          documentos={propiedad.documentos}
        />
      )}
    </article>
  );
}
