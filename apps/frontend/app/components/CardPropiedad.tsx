"use client";

import { useState } from "react";
import { Propiedad } from "../lib/types";
import Button from "./Button";
import { SubirDocumentoModal } from "../dashboard/Modal/SubirDocumentoModal";

interface CardPropiedadProps {
  propiedad: Propiedad;
  onEdit?: (propiedad: Propiedad) => void;
  onDelete?: (id: string) => void;
  onProbabilidad?: (id: string) => void;
  onDocumento?: (id: string, file: File) => void;
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

  return (
    <article className="relative bg-gray-800/30 p-3 border border-gray-600 rounded-lg shadow-xs">
      <div className="relative">
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
      </div>

      <h3 className="text-xl font-semibold tracking-wider text-center">
        {propiedad.titulo}
      </h3>

      <div className="flex flex-col justify-between md:p-4 leading-normal">
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
      </div>

      <div className="flex flex-col justify-between md:p-4 leading-normal">
        <p>
          Celular Verificado:{" "}
          <span className="font-semibold text-green-400 tracking-wider">
            {propiedad.publicadoPor?.celularVerificado ? "🆗" : "No"}
          </span>
        </p>

        <p>
          Documento Verificado:{" "}
          <span className="font-semibold text-green-400 tracking-wider">
            {propiedad.publicadoPor?.documentoVerificado
              ? "🆗"
              : "Subir Documento"}
          </span>
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Button
          title="📄"
          onClick={() => setShowModalDocumento(true)}
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
      </div>

      <span className="absolute -bottom-5 left-15 px-3 bg-gray-500 rounded-md">
        {propiedad.publicadoPor?.documentoVerificado &&
        propiedad.publicadoPor?.celularVerificado ? (
          <p className="text-green-400 text-center text-sm">
            &#10003; Publicación Verificada
          </p>
        ) : (
          <p className="text-yellow-400 text-center text-sm">
            &#9734; Publicación No Verificada
          </p>
        )}
      </span>

      {showModalDocumento && (
        <SubirDocumentoModal
          isOpen={showModalDocumento}
          onClose={() => setShowModalDocumento(false)}
          onSubmit={(file) => onDocumento?.(propiedad.id, file)}
        />
      )}
    </article>
  );
}
