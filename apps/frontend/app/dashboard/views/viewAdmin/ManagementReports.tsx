"use client";

import { useEffect, useState } from "react";
import { Metricas } from "@/app/lib/types";
import api from "@/app/lib/api";

export default function ManagementReports() {
  const [reportes, setReportes] = useState<Metricas | null>(null);
  const [loading, setLoading] = useState(true);

  const getReportes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reportes-fraude/metricas");
      setReportes(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getReportes();
  }, []);

  if (loading) {
    return (
      <article className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-900/50 border border-gray-800/80 rounded-2xl animate-pulse"
          ></div>
        ))}
      </article>
    );
  }

  return (
    <main className="space-y-6">
      <header>
        <h2 className="text-xl font-bold">Métricas y Analítica Global</h2>
        <p className="text-xs text-gray-400">
          Resumen Operativo de la Plataforma <span className="">JEMA</span>
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Total Inmuebles
            </span>
            <span className="text-xl">🏢</span>
          </div>

          <span className="text-3xl font-black text-white mt-2 block">
            {reportes?.propiedades?.total ?? 0}
          </span>

          <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
            {reportes?.propiedades?.porEstado.map((e) => (
              <span
                key={e.estado}
                className="bg-gray-800 px-2 py-0.5 rounded text-gray-300"
              >
                {e.estado}: <strong>{e._count}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Usuarios Registrados
            </span>
            <span className="text-xl">👥</span>
          </div>
          <span className="text-3xl font-black text-white mt-2 block">
            {reportes?.usuarios?.total ?? 0}
          </span>
          <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
            {reportes?.usuarios?.porRol.map((r) => (
              <span
                key={r.role}
                className="bg-gray-800 px-2 py-0.5 rounded text-gray-300"
              >
                {r.role}: <strong>{r._count}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-linear-to-br from-gray-900 to-gray-950 border border-gray-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase">
              Alertas de Fraude
            </span>
            <span className="text-xl">🛡️</span>
          </div>
          <span className="text-3xl font-black text-red-400 mt-2 block">
            {reportes?.reportesAbiertos ?? 0}
          </span>
          <p className="text-xs text-gray-500 mt-3">
            Casos abiertos requiriendo revisión.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-gray-200 mb-4">
            Inmuebles por Ciudad
          </h3>
          <div className="space-y-2">
            {reportes?.propiedades?.porCiudad.map((c) => (
              <div
                key={c.ciudad}
                className="flex justify-between items-center text-xs py-1.5 border-b border-gray-800/50"
              >
                <span className="text-gray-300 font-medium">{c.ciudad}</span>
                <span className="bg-sky-950 text-sky-300 font-bold px-2 py-0.5 rounded">
                  {c._count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-gray-800 p-5 rounded-2xl">
          <h3 className="text-sm font-bold text-gray-200 mb-4">
            Top 5 Calificación de Inmuebles
          </h3>
          <div className="space-y-2">
            {reportes?.propiedadesTop.map((p, idx) => (
              <div
                key={p.id}
                className="flex justify-between items-center text-xs py-1.5 border-b border-gray-800/50"
              >
                <span className="text-gray-300 truncate max-w-[220px]">
                  <strong>{idx + 1}.</strong> {p.titulo} ({p.ciudad})
                </span>
                <span className="bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded">
                  ★ {p.puntaje ?? 0} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
