"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Button from "@/app/components/Button";

interface Estimacion {
  mensajeIA: string | null;
  valores: {
    probabilidadVenta: number;
    probabilidadOcupacional: number;
    tiempoEstimadoDias: number;
    tiempoEstimadoOcupacion: number;
    canonEsperado: number;
    rentabilidadAnual: number;
  };
}

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? fallback;

export function EstimacionPropiedad({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<Estimacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Estimacion>(`/ia/${id}/estimacion`)
      .then((res) => setData(res.data))
      .catch((e) =>
        setError(getErrorMessage(e, "Error al estimar la propiedad")),
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <section className="bg-gray-800/90 border border-gray-600/80 p-4 backdrop-blur-xs rounded-lg w-full max-w-lg mx-4">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Estimación de tu propiedad 🤖</h2>
            <p className="text-sm text-gray-500">
              Análisis IA · venta, ocupación y rentabilidad
            </p>
          </div>
          <Button onClick={onClose} title="✕" variant="secondary" />
        </header>

        {loading && <p className="text-sm text-gray-500">Calculando...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {data && (
          <article className="mt-4 space-y-2">
            {data.mensajeIA ? (
              <p className="bg-sky-600/20 border border-sky-600/40 rounded-lg p-3">
                {data.mensajeIA}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Sin interpretación disponible.
              </p>
            )}
            <p>Probabilidad de venta: {data.valores.probabilidadVenta}%</p>
            <p>
              Tiempo estimado de venta: {data.valores.tiempoEstimadoDias} días
            </p>
            <p>
              Probabilidad de ocupación: {data.valores.probabilidadOcupacional}%
            </p>
            <p>
              Tiempo estimado de ocupación:{" "}
              {data.valores.tiempoEstimadoOcupacion} días
            </p>
            <p>
              Canon esperado mensual: $
              {data.valores.canonEsperado.toLocaleString()}
            </p>
            <p>Rentabilidad anual: {data.valores.rentabilidadAnual}%</p>
          </article>
        )}
      </section>
    </div>
  );
}
