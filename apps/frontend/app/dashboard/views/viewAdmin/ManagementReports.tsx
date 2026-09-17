"use client";

import api from "@/app/lib/api";
import { Metricas } from "@/app/lib/types";
import { useEffect, useState } from "react";

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
      <article>
        <h2>Cargando Reportes...</h2>
      </article>
    );
  }

  return (
    <main>
      <h1 className="text-center text-xl lg:text-4xl mb-6">Reportes JEMA</h1>

      <section className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-3 border-2 border-gray-800/50 rounded p-2 bg-gray-500/20 backdrop-blur-xs">
          <h2 className="text-center text-xl font-semibold">Propiedades</h2>
          <p className="text-center">
            <strong>Total:</strong> {reportes?.propiedades?.total}
          </p>

          <div className="flex flex-col">
            <h2 className="text-center">Por Estado</h2>
            {reportes?.propiedades?.porEstado.map((estado) => (
              <span key={estado.estado} className="text-center">
                <strong>{estado.estado}:</strong> {estado._count}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-2 border-gray-800/50 rounded p-2 bg-gray-500/20 backdrop-blur-xs">
          <h2 className="text-center text-xl font-semibold">Usuarios</h2>
          <p className="text-center">
            <strong>Total:</strong> {reportes?.usuarios?.total}
          </p>

          <div className="flex flex-col">
            <h2 className="text-center mb-3">Por Rol</h2>
            {reportes?.usuarios?.porRol.map((rol) => (
              <span key={rol.role} className="text-center">
                {rol._count} - <strong>{rol.role}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-2 border-gray-800/50 rounded p-2 bg-gray-500/20 backdrop-blur-xs text-center">
          <h2>Fraudes</h2>
          <div>
            <p>{reportes?.reportesAbiertos}</p>
            <p>Abiertos</p>
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-3 border-2 border-gray-800/50 rounded p-2 bg-gray-500/20 backdrop-blur-xs text-center">
          <h2 className="text-center text-xl font-semibold">
            Propiedades Por Ciudad
          </h2>
          <div>
            {reportes?.propiedades?.porCiudad.map((ciudad) => (
              <span key={ciudad.ciudad} className="text-center">
                <strong>{ciudad.ciudad}:</strong> {ciudad._count} |
              </span>
            ))}
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-3 border-2 border-gray-800/50 rounded p-2 bg-gray-500/20 backdrop-blur-xs text-center">
          <h2 className="text-center text-xl font-semibold">
            Top 5 Mejor Calificadas
          </h2>

          <ul>
            {reportes?.propiedadesTop.map((propiedad, idx) => (
              <li key={propiedad.id}>
                <strong>{idx + 1}.</strong> {propiedad.titulo} (
                {propiedad.puntaje}) ➖ {propiedad.ciudad}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-3 flex flex-col gap-3 border-2 border-gray-800/50 rounded p-2 bg-gray-500/20 backdrop-blur-xs text-center">
          <h2 className="text-center text-xl font-semibold">
            Últimas Propiedades
          </h2>
          <ul className="flex flex-col gap-2">
            {reportes?.propiedadesRecientes.map((propiedad, idx) => (
              <li key={propiedad.id}>
                <strong>{idx + 1}.</strong> {propiedad.titulo} ➖{" "}
                {new Date(propiedad.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "America/Bogota",
                })}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
