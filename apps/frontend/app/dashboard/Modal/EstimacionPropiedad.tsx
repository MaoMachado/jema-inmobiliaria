"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Button from "@/app/components/Button";
import {
  borrarEstimacionCache,
  Estimacion,
  guardarEstimacionCache,
  leerEstimacionCache,
} from "@/app/lib/estimacionesCache";

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? fallback;

export function EstimacionPropiedad({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [reload, setReload] = useState(0);
  const [data, setData] = useState<Estimacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cached = leerEstimacionCache()[id];
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    api
      .get<Estimacion>(`/ia/${id}/estimacion`)
      .then((res) => {
        setData(res.data);
        if (res.data.mensajeIA) {
          guardarEstimacionCache(id, res.data);
        }
      })
      .catch((e) =>
        setError(getErrorMessage(e, "Error al estimar la propiedad")),
      )
      .finally(() => setLoading(false));
  }, [id, reload]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <section className="bg-gray-800/90 border border-gray-600/80 p-4 backdrop-blur-xs rounded-lg w-full max-w-lg mx-4">
        <header className="flex justify-between items-center ">
          <div>
            <h2 className="text-lg font-bold">Estimación de tu propiedad 🤖</h2>
            <p className="text-sm text-gray-500">
              Análisis IA · venta, ocupación y rentabilidad
            </p>
          </div>
          <Button
            onClick={onClose}
            title="✕"
            placeHolder="Cerrar"
            variant="secondary"
          />
        </header>

        {loading && (
          <p className="text-sm text-gray-500 text-center mt-6">
            Calculando...
          </p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center mt-6">{error}</p>
        )}

        {data && (
          <article className="my-4 space-y-2">
            {data.mensajeIA ? (
              <div className="bg-sky-600/20 border border-sky-600/40 rounded-lg p-3">
                <h3 className="text-lg font-bold mb-3 text-center">
                  Interpretación IA
                </h3>
                <p>{data.mensajeIA}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Sin interpretación disponible.
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <p className="flex flex-col items-center">
                <span>Probabilidad de venta</span>
                <strong>{data.valores.probabilidadVenta}%</strong>
              </p>
              <p className="flex flex-col items-center">
                <span>Tiempo estimado de venta</span>
                <strong>{data.valores.tiempoEstimadoDias} días</strong>
              </p>
              <p className="flex flex-col items-center">
                <span>Probabilidad de ocupación</span>
                <strong>{data.valores.probabilidadOcupacional}%</strong>
              </p>
              <p className="flex flex-col items-center">
                <span>Tiempo estimado de ocupación</span>
                <strong>{data.valores.tiempoEstimadoOcupacion} días</strong>
              </p>
              <p className="flex flex-col items-center">
                <span>Canon esperado mensual</span>
                <strong>${data.valores.canonEsperado.toLocaleString()}</strong>
              </p>
              <p className="flex flex-col items-center">
                <span>Rentabilidad anual</span>
                <strong>{data.valores.rentabilidadAnual}%</strong>
              </p>
            </div>
          </article>
        )}

        <footer className="mt-4 flex items-center justify-end">
          {data && (
            <Button
              title="Regenerar interpretación"
              placeHolder="Regenerar Interpretación"
              variant="secondary"
              onClick={() => {
                borrarEstimacionCache(id);
                setData(null);
                setError("");
                setLoading(true);
                setReload((r) => r + 1);
              }}
            />
          )}
        </footer>
      </section>
    </div>
  );
}
