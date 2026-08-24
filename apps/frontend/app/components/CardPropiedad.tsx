"use client";

import { Propiedad } from "../lib/types";
import Button from "./Button";

interface CardPropiedadProps {
  propiedad: Propiedad;
  onEdit?: (propiedad: Propiedad) => void;
  onDelete?: (id: string) => void;
}

export function CardPropiedad({
  propiedad,
  onEdit,
  onDelete,
}: CardPropiedadProps) {
  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(propiedad.precio);

  return (
    <article className="bg-gray-800/30 p-3 border border-gray-600 rounded-lg shadow-xs">
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
        <p className="text-center">Ciudad: {propiedad.ciudad}</p>
        <p className="text-center">Precio: {precioFormateado}</p>
        <p className="text-center">
          Dueño: {propiedad.publicadoPor?.nombres}{" "}
          {propiedad.publicadoPor?.apellidos}
        </p>
      </div>

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
      </div>
    </article>
  );
}
