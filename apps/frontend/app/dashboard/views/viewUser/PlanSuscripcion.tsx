"use client";

import { useRef } from "react";
import { usePagos } from "../hooks/usePagos";
import Button from "@/app/components/Button";

const PLANES: Record<
  "BASICO" | "PREMIUM",
  { etiqueta: string; precio: number; beneficios: string[] }
> = {
  BASICO: {
    etiqueta: "Básico",
    precio: 15000,
    beneficios: [
      "15 Propiedades",
      "20 Chats IA por día",
      "10 Fotos por Propiedad",
      "Sin Propiedades Destacadas En Home",
      "Analíticas básicas",
    ],
  },

  PREMIUM: {
    etiqueta: "Premium",
    precio: 30000,
    beneficios: [
      "30 Propiedades",
      "30 Chat IA Por Día",
      "20 Fotos Por Propiedad",
      "Propiedades Destacadas En Home",
      "Analíticas Básicas",
    ],
  },
};

const formatearIlimitado = (n: number) => {
  return n >= 999999 ? "Ilimitado" : String(n);
};

const formatearPrecio = (n: number) => `${n.toLocaleString("es-CO")}`;

export default function PlanSuscripcion() {
  const {
    planInfo,
    historial,
    loading,
    subiendo,
    comprobantePath,
    planSeleccionado,
    setPlanSeleccionado,
    handleSubirComprobante,
    handleSolicitar,
    message,
  } = usePagos();

  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <section className="p-4">
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Mi Suscripción</h2>

      {loading && !planInfo ? (
        <p>Cargando...</p>
      ) : (
        <div className="mb-6 bg-gray-700/30 border border-gray-600 rounded-lg p-4 max-w-md">
          <p className="mb-3">
            Plan actual: <strong className="bg-yellow-300/50 p-1 rounded">{planInfo?.plan ?? "--"}</strong>
          </p>

          <p className="text-sm text-gray-400">
            Total Propiedades Que Puede Publicar:{" "}
            {formatearIlimitado(planInfo?.beneficios.propiedades ?? 0)} · Chats
            IA/Día: {formatearIlimitado(planInfo?.beneficios.chatDiario ?? 0)} ·
            Fotos por propiedad:{" "}
            {formatearIlimitado(planInfo?.beneficios.fotos ?? 0)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mb-6">
        {(Object.keys(PLANES) as ("BASICO" | "PREMIUM")[]).map((clave) => (
          <div
            key={clave}
            className={`rounded-lg border p-4 ${
              planSeleccionado === clave
                ? "border-sky-500 bg-sky-600/10"
                : "border-gray-600 bg-gray-700/30"
            }`}
          >
            <h3 className="text-xl font-bold">{PLANES[clave].etiqueta}</h3>
            <p className="text-2xl font-semibold text-sky-400">
              {formatearPrecio(PLANES[clave].precio)} COP
            </p>
            <ul className="text-sm text-gray-300 mb-4 space-y-1">
              {PLANES[clave].beneficios.map((b) => (
                <li key={b}>· {b}</li>
              ))}
            </ul>
            <Button
              title={
                planSeleccionado === clave ? "Seleccionado" : "Elegir Plan"
              }
              disabled={planSeleccionado === clave}
              onClick={() => setPlanSeleccionado(clave)}
            />
          </div>
        ))}
      </div>

      {planSeleccionado && (
        <div className="max-w-md bg-gray-700/30 border border-gray-600 rounded-lg p-4 mb-6 space-y-3">
          <p className="font-semibold">
            Sube el comprobante del pago(
            {formatearPrecio(PLANES[planSeleccionado].precio)}) para{" "}
            {PLANES[planSeleccionado].etiqueta}
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*, .pdf"
            disabled={subiendo}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleSubirComprobante(file);
            }}
          />

          {comprobantePath && (
            <p className="text-xs text-green-400">Comprobante subido</p>
          )}

          <Button
            title={loading ? "Enviando..." : "Enviar Pago"}
            loading={loading}
            disabled={!comprobantePath || loading}
            onClick={handleSolicitar}
          />
        </div>
      )}

      {message && (
        <p
          className={`mb-4 ${
            message.tipo === "ok" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message.texto}
        </p>
      )}

      <h3 className="text-2xl font-semibold mb-2">Historial</h3>

      {historial.length === 0 ? (
        <p className="text-gray-400">Sin Pago Registrados</p>
      ) : (
        <div className="space-y-2 max-w-2xl">
          {historial.map((p) => (
            <div
              key={p.id}
              className="bg-gray-700/30 border border-gray-600 rounded p-3 flex justify-between"
            >
              <div>
                <p className="font-semibold">
                  {p.plan} · {formatearPrecio(p.monto)}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(p.createAt).toLocaleDateString("es-CO")}
                </p>
              </div>

              <span
                className={`text-sm px-2 py-1 rounded ${
                  p.estado === "APROBADO"
                    ? "bg-green-500/20 text-green-400"
                    : p.estado === "PENDIENTE"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {p.estado}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
