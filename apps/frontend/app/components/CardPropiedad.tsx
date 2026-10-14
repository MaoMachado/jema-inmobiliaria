"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Propiedad } from "../lib/types";
import { SubirDocumentoModal } from "../dashboard/Modal/SubirDocumentoModal";
import { DocumentoImgModal } from "../dashboard/Modal/DocumentoImgModal";
import Button from "./Button";
import Icon from "./Icons";
import api from "../lib/api";

interface CardPropiedadProps {
  propiedad: Propiedad;
  onEdit?: (propiedad: Propiedad) => void;
  onDelete?: (id: string) => void;
  onProbabilidad?: (id: string) => void;
  onDocumento?: (id: string, file: File, tipo: string) => void;
  onReportar?: (propiedadId: string) => void;
  onDestacar?: (propiedadId: string, nuevoEstado: boolean) => void;
  isDashboard?: boolean;
}

export function CardPropiedad({
  propiedad,
  onEdit,
  onDelete,
  onProbabilidad,
  onDocumento,
  onReportar,
  onDestacar,
  isDashboard: isDashboardProp,
}: CardPropiedadProps) {
  const router = useRouter();

  const [showModalDocumento, setShowModalDocumento] = useState<boolean>(false);
  const [showModalDocumentoImg, setShowModalDocumentoImg] =
    useState<boolean>(false);

  const isDashboard = Boolean(
    isDashboardProp || onEdit || onDelete || onProbabilidad || onDocumento,
  );

  const handleShowDocumentoModal = () => {
    if (propiedad.documentos && propiedad.documentos.length > 0) {
      setShowModalDocumentoImg(true);
    } else {
      setShowModalDocumento(true);
    }
  };

  const handleVerDetalle = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await api.get("/auth/me");
      router.push(`/propiedades/${propiedad.id}`);
    } catch {
      router.push(`/login?redirect=/propiedades/${propiedad.id}`);
    }
  };

  const precioFormateado = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(propiedad.precio);

  const documentos = propiedad.documentos ?? [];
  const todosDocsVerificados =
    documentos.length > 0 && documentos.every((d) => d.verificado);

  return (
    <section
      className={`relative flex flex-col justify-between bg-gray-900/70 border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm ${
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
          className={`absolute top-3 left-3 z-10 min-h-11 min-w-11 flex items-center justify-center rounded-full bg-gray-900/80 backdrop-blur-md border border-gray-700 transition ${
            propiedad.estado !== "APROBADA"
              ? "opacity-30 cursor-not-allowed grayscale"
              : "hover:scale-110 cursor-pointer"
          }`}
          aria-label="Destacar Propiedad"
        >
          <Icon
            name="star"
            className={`w-5 h-5 ${
              propiedad.destacada ? "text-amber-400" : "text-gray-300"
            }`}
          />
        </button>
      )}

      {isDashboard && (
        <div
          className={`text-center py-1 text-xs font-semibold tracking-wider ${
            propiedad.estado === "RECHAZADA"
              ? "bg-red-950/60 text-red-300 border-b border-red-500/30"
              : propiedad.estado === "PENDIENTE"
                ? "bg-yellow-950/60 text-yellow-300 border-b border-yellow-500/30"
                : "bg-emerald-950/60 text-emerald-300 border-b border-emerald-500/30"
          }`}
        >
          {propiedad.estado === "RECHAZADA"
            ? "Publicación Rechazada"
            : propiedad.estado === "PENDIENTE"
              ? "Publicación Pendiente de Revisión"
              : "Publicación Aprobada"}
        </div>
      )}

      <header className="relative">
        <button
          type="button"
          onClick={handleVerDetalle}
          aria-label={`Ver detalles de ${propiedad.titulo}`}
          className="block w-full text-left overflow-hidden group aspect-video bg-gray-950 cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset"
        >
          {propiedad.fotografias?.[0] ? (
            <img
              src={propiedad.fotografias[0]}
              alt={propiedad.titulo}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 768px) 100vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900">
              <Icon name="home" className="w-8 h-8 mb-1" />
              <span className="text-xs">Sin fotografías</span>
            </div>
          )}
        </button>

        <span className="absolute bottom-3 left-3 max-w-[60%] truncate bg-gray-950/85 backdrop-blur-md border border-gray-700 text-gray-200 text-xs px-2.5 py-1 rounded-md font-medium">
          <Icon
            name="pin"
            className="w-3.5 h-3.5 inline-block align-[-2px] mr-1"
          />
          {propiedad.ciudad}
        </span>

        {propiedad.puntaje !== undefined && propiedad.puntaje !== null && (
          <span
            title="Puntaje de completitud de la publicación"
            className="absolute bottom-3 right-3 bg-sky-950/90 border border-sky-500/50 text-sky-300 text-xs px-2.5 py-1 rounded-md font-bold"
          >
            {propiedad.puntaje}/100
          </span>
        )}
      </header>

      <article className="p-4 flex flex-col grow justify-between gap-3">
        <div>
          <span className="text-2xl font-black text-emerald-400 tracking-tight block">
            {precioFormateado}
          </span>

          <h3
            onClick={handleVerDetalle}
            className="cursor-pointer text-base font-bold mt-1 line-clamp-1 hover:text-sky-400 transition-colors duration-200"
            title={propiedad.titulo}
          >
            {propiedad.titulo}
          </h3>

          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
            {propiedad.barrio ? `${propiedad.barrio}, ` : ""}
            {propiedad.direccion}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 py-2 border-y border-gray-800 text-xs text-gray-300 font-medium">
          <span title="Habitaciones" className="flex items-center gap-1.5">
            <Icon name="bed" className="w-4 h-4 text-gray-400" />
            {propiedad.habitaciones ?? 0}
          </span>
          <span title="Baños" className="flex items-center gap-1.5">
            <Icon name="bath" className="w-4 h-4 text-gray-400" />
            {propiedad.banos ?? 0}
          </span>
          <span title="Área" className="flex items-center gap-1.5">
            <Icon name="area" className="w-4 h-4 text-gray-400" />
            {propiedad.area ?? 0} m²
          </span>
          <span title="Estrato" className="flex items-center gap-1.5">
            <Icon name="building" className="w-4 h-4 text-gray-400" />
            {propiedad.estrato ?? "-"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {propiedad.publicadoPor?.celularVerificado ? (
            <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1">
              <Icon name="check" className="w-3 h-3" />
              Vendedor verificado
            </span>
          ) : (
            <span className="text-gray-400 bg-gray-800/80 px-1.5 py-0.5 rounded text-[11px]">
              Sin verificar
            </span>
          )}

          {onDocumento && (
            <span
              className={`px-1.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${
                todosDocsVerificados
                  ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
                  : "text-amber-400 bg-amber-950/60 border border-amber-500/30"
              }`}
            >
              <Icon
                name={todosDocsVerificados ? "check" : "clock"}
                className="w-3 h-3"
              />
              {todosDocsVerificados ? "Docs auditados" : "Docs pendientes"}
            </span>
          )}
        </div>

        {onDocumento && (
          <div className="pt-2 border-t border-gray-800/60">
            <p className="text-[11px] text-gray-400 font-medium mb-1.5">
              Documentos adjuntos:
            </p>
            {documentos.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {documentos.map((doc) => (
                  <button
                    key={doc.id || doc.tipo}
                    type="button"
                    onClick={() => setShowModalDocumentoImg(true)}
                    className={`px-2 py-1 min-h-8 text-[11px] font-medium rounded-md cursor-pointer transition flex items-center gap-1 ${
                      doc.verificado
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                        : "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/25"
                    }`}
                  >
                    <Icon
                      name={doc.verificado ? "check" : "clock"}
                      className="w-3 h-3"
                    />
                    {doc.tipo}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-gray-500 italic">
                Sin documentos cargados
              </p>
            )}
          </div>
        )}

        {(onEdit ||
          onDelete ||
          onProbabilidad ||
          onReportar ||
          onDocumento) && (
          <article className="flex flex-wrap justify-end items-center gap-2 pt-2 border-t border-gray-800">
            {onDocumento && (
              <Button
                title="Subir documento"
                placeHolder="Subir Documento"
                onClick={handleShowDocumentoModal}
                ariaLabel="Subir Documento"
                className="text-xs min-h-11"
              />
            )}

            {onProbabilidad && (
              <Button
                title="Probabilidad"
                placeHolder="Ver Probabilidad"
                onClick={() => onProbabilidad(propiedad.id)}
                variant="secondary"
                ariaLabel="Ver Probabilidad"
                className="text-xs min-h-11"
              />
            )}

            {onEdit && (
              <Button
                title="Editar"
                placeHolder="Editar Propiedad"
                onClick={() => onEdit(propiedad)}
                variant="secondary"
                ariaLabel="Editar Propiedad"
                className="text-xs min-h-11"
              />
            )}

            {onDelete && (
              <Button
                title="Eliminar"
                placeHolder="Eliminar Propiedad"
                onClick={() => onDelete(propiedad.id)}
                variant="danger"
                ariaLabel="Eliminar Propiedad"
                className="text-xs min-h-11"
              />
            )}

            {onReportar && (
              <Button
                title="Reportar"
                placeHolder="Reportar Propiedad"
                onClick={() => onReportar(propiedad.id)}
                variant="secondary"
                ariaLabel="Reportar Propiedad"
                className="text-xs min-h-11"
              />
            )}
          </article>
        )}
      </article>

      {isDashboard && !onDocumento && (
        <span className="px-3 py-1">
          {documentos.length === 0 ? (
            <p className="text-red-400 text-center text-sm">
              Publicación No Verificada
            </p>
          ) : (
            <p className="text-green-400 text-center text-sm">
              Publicación Verificada
            </p>
          )}
        </span>
      )}

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
