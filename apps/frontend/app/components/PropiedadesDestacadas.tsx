"use client";

import { useEffect, useState } from "react";
import { Propiedad } from "../lib/types";
import { CardPropiedad } from "./CardPropiedad";
import api from "../lib/api";

export default function PropiedadesDestacadas() {
  const [propiedades, setPropiedades] = useState<Propiedad[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api
      .get<Propiedad[]>("/propiedades/destacadas")
      .then((res) => setPropiedades(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-center py-10">Cargando propiedades...</p>;

  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10">
          Propiedades Destacadas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {propiedades.map((p) => (
            <CardPropiedad key={p.id} propiedad={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
