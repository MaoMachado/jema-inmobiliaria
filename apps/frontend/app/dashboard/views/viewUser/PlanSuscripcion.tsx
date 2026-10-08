"use client";

import { useRef } from "react";
import { usePagos } from "../hooks/usePagos";
import Button from "@/app/components/Button";

const PLANES: Record<
  "BASICO" | "PREMIUM",
  { etiqueta: string; precio: number; popular?: boolean; beneficios: string[] }
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
    popular: true,
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
    <section className="space-y-8">
      <header className="bg-linear-to-r from-gray-900 via-gray-900 to-gray-950 border border-gray-800 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
              Estado Actual
            </span>

            <div className="flex items-center gap-3 mt-1">
              <h2 className="text-2xl font-bold text-white">
                Plan Actual:{" "}
                <span className="text-sky-400">
                  {planInfo?.plan ?? "GRATIS"}
                </span>
              </h2>

              <span className="bg-sky-950/80 border border-sky-500/40 text-sky-300 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                Activo
              </span>
            </div>
          </div>

          <div className="text-[13px] text-gray-400 bg-gray-950/60 border border-gray-800 p-3 rounded-xl flex flex-wrap gap-x-4 gap-y-1">
            <span>
              📦{" "}
              <strong>
                {formatearIlimitado(planInfo?.beneficios.propiedades ?? 0)}
              </strong>{" "}
              Inmuebles
            </span>
            <span>
              💬{" "}
              <strong>
                {formatearIlimitado(planInfo?.beneficios.chatDiario ?? 0)}
              </strong>{" "}
              Chats IA/día
            </span>
            <span>
              📸{" "}
              <strong>
                {formatearIlimitado(planInfo?.beneficios.fotos ?? 0)}
              </strong>{" "}
              Fotos c/u
            </span>
          </div>
        </div>
      </header>

      <article>
        <div className="text-center mb-6">
          <h3 className="text-[25px] font-bold">
            Mejora tu Alcance Inmobiliario
          </h3>
          <p className="text-gray-400 text-[15px] mt-1">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {(Object.keys(PLANES) as ("BASICO" | "PREMIUM")[]).map((clave) => {
            const plan = PLANES[clave];
            const esSeleccionado = planSeleccionado === clave;
            const esPlanActual = planInfo?.plan === clave;

            return (
              <section
                key={clave}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 transition-all ${
                  esSeleccionado
                    ? "border-sky-500 bg-sky-950/20 shadow-xl shadow-sky-500/10"
                    : "border-gray-800 bg-gray-900/40 hover:border-gray-700"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-linear-to-r from-amber-500 to-orange-500 text-black text-[11px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow">
                    Recomendado
                  </span>
                )}

                <div>
                  <h4 className="text-xl font-bold">{plan.etiqueta}</h4>
                  <div className="mt-2 mb-4">
                    <span className="text-3xl font-black">
                      {formatearPrecio(plan.precio)}
                    </span>
                    <span className="text-xs text-gray-400"> / mes</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-gray-300 border-t border-gray-800/80 pt-4">
                    {plan.beneficios.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="text-[15px]">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800">
                  <Button
                    title={
                      esPlanActual
                        ? "Plan Actual"
                        : esSeleccionado
                          ? "Plan Seleccionado"
                          : "Elegir este Plan"
                    }
                    disabled={esPlanActual || esSeleccionado}
                    onClick={() => setPlanSeleccionado(clave)}
                    className="w-full text-xs font-bold py-2.5"
                  />
                </div>
              </section>
            );
          })}
        </div>
      </article>

      {planSeleccionado && (
        <article className="max-w-2xl mx-auto bg-gray-900/70 border border-sky-500/40 rounded-2xl p-6 space-y-4 backdrop-blur shadow-2xl animate-fade-in">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <div>
              <h4 className="font-bold text-lg">
                Completar Suscripción ({PLANES[planSeleccionado].etiqueta}){" "}
              </h4>

              <p className="text-[15px] text-gray-400">
                Monto a consignar:{" "}
                {formatearPrecio(PLANES[planSeleccionado].precio)}
              </p>
            </div>

            <button
              onClick={() => setPlanSeleccionado(null)}
              className="text-gray-400 hover:text-white text-[15px] cursor-pointer"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-md font-semibold text-gray-300 block">
              Adjunta el comprobante de transferencia bancaria o pago (PDF, PNG,
              JPG)
            </label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*, .pdf"
              disabled={subiendo}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSubirComprobante(file);
              }}
              className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[15px] file:font-semibold file:bg-gray-800 file:text-sky-400 hover:file:bg-gray-700 transition cursor-pointer"
            />
          </div>

          {subiendo && (
            <p className="text-xs text-sky-400 animate-pulse">
              Subiendo comprobante al servidor seguro...
            </p>
          )}
          {comprobantePath && (
            <p className="text-xs text-emerald-400 font-medium">
              ✓ Comprobante cargado exitosamente.
            </p>
          )}

          <Button
            title={
              loading
                ? "Procesando pago..."
                : "Confirmar y Enviar Solicitud de Pago"
            }
            loading={loading}
            disabled={!comprobantePath || loading}
            onClick={handleSolicitar}
            className="w-full text-[15px] font-bold py-2.5"
          />
        </article>
      )}

      {message && (
        <div className="max-w-xl mx-auto p-4 rounded-xl text-xs font-medium text-center border bg-sky-950/50 border-sky-500/50 text-sky-300">
          {message}
        </div>
      )}

      <div className="space-y-3 max-w-2xl mx-auto">
        <h3 className="text-2xl font-bold text-white">Historial de Pagos</h3>

        {historial.length === 0 ? (
          <div className="text-center py-8 bg-gray-900/20 border border-dashed border-gray-800 rounded-xl">
            <p className="text-xs text-gray-500">
              No hay pagos registrados en tu cuenta.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {historial.map((p) => (
              <div
                key={p.id}
                className="bg-gray-900/40 border border-gray-800 hover:border-gray-700/70 rounded-xl p-3.5 flex justify-between items-center text-xs transition"
              >
                <div>
                  <p className="font-bold text-gray-200 text-[15px]">
                    Plan {p.plan} ·{" "}
                    <span className="text-sky-400">
                      {formatearPrecio(p.monto)}
                    </span>
                  </p>
                  <p className="text-[13px] text-gray-500 font-mono mt-0.5">
                    {new Date(p.createAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    p.estado === "APROBADO"
                      ? "bg-emerald-950/80 border border-emerald-500/40 text-emerald-300"
                      : p.estado === "PENDIENTE"
                        ? "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                        : "bg-red-950/80 border border-red-500/40 text-red-300"
                  }`}
                >
                  {p.estado}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
