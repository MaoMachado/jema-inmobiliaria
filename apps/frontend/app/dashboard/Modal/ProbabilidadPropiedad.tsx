"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import Button from "@/app/components/Button";

interface ProbabilidadPropiedades {
  probabilidadVenta: number;
  probabilidadOcupacional: number;
  tiempoEstimadoDias: number;
  tiempoEstimadoOcupacion: number;
  canonEsperado: number;
  rentabilidadAnual: number;
}

interface Props {
  id: string;
  onClose: () => void;
}

export function ProbabilidadPropiedad({ id, onClose }: Props) {
  const [probabilidad, setProbabilidad] =
    useState<ProbabilidadPropiedades | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadProbabilidad = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get<ProbabilidadPropiedades>(
          `/propiedades/${id}/probabilidades`,
        );

        setProbabilidad(res.data);
      } catch (error) {
        setError("Error al cargar la probabilidad");
      } finally {
        setLoading(false);
      }
    };

    loadProbabilidad();
  }, [id]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <section className="bg-gray-800/90 border border-gray-600/80 p-4 backdrop-blur-xs rounded-lg w-full max-w-lg mx-4">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Probabilidad de la propiedad</h2>
            <p className="text-sm text-gray-500">
              Análisis de venta, ocupación y rentabilidad
            </p>
          </div>
          <Button onClick={onClose} title="✕" variant="secondary" />
        </header>

        {loading && <p className="text-sm text-gray-500">Cargando...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {probabilidad && (
          <article className="mt-4 space-y-2">
            <p>Probabilidad de venta: {probabilidad?.probabilidadVenta}%</p>
            <p>
              Tiempo estimado de venta: {probabilidad?.tiempoEstimadoDias} días
            </p>
            <p>
              Probabilidad de ocupación: {probabilidad?.probabilidadOcupacional}
              %
            </p>
            <p>
              Tiempo estimado de ocupación:{" "}
              {probabilidad?.tiempoEstimadoOcupacion} días
            </p>
            <p>
              Canon esperado mensual: $
              {probabilidad?.canonEsperado.toLocaleString()}
            </p>
            <p>Rentabilidad anual: {probabilidad?.rentabilidadAnual}%</p>
          </article>
        )}
      </section>
    </div>
  );
}
