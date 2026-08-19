"use client";

import { useEffect, useState } from "react";

import api from "@/app/lib/api";
import { Propiedad } from "@/app/lib/types";
import { NewPropertyModal } from "../Modal/NewProperty";

export default function UserView() {
  const [properties, setProperties] = useState<Propiedad[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const loadProperties = async () => {
    setLoadingProperties(true);
    setError("");

    try {
      const res = await api.get("/propiedades");
      setProperties(res.data);
    } catch (error) {
      console.error("Error al cargar las propiedades", error);
      setError("Error al cargar las propiedades");
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleSubmitPropiedad = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(
      formData.entries(),
    );

    for (const key of [
      "precio",
      "habitaciones",
      "banos",
      "area",
      "antiguedad",
      "estrato",
      "parqueaderos",
    ]) {
      payload[key] = Number(payload[key]);
    }

    if (typeof payload.fotografias === "string" && payload.fotografias.trim()) {
      payload.fotografias = payload.fotografias
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);
    } else {
      payload.fotografias = [];
    }

    const isEmpty = (v: unknown) =>
      v === "" || v === null || v === undefined || Number.isNaN(v);

    if (
      isEmpty(payload.titulo) ||
      isEmpty(payload.descripcion) ||
      isEmpty(payload.precio) ||
      isEmpty(payload.ciudad) ||
      isEmpty(payload.barrio) ||
      isEmpty(payload.tipo) ||
      isEmpty(payload.habitaciones) ||
      isEmpty(payload.banos) ||
      isEmpty(payload.area) ||
      isEmpty(payload.antiguedad) ||
      isEmpty(payload.direccion) ||
      isEmpty(payload.estrato)
    ) {
      setError("Todos los campos son obligatorios");
      setSaving(false);
      return;
    }

    try {
      await api.post("/propiedades", payload);
      setModalOpen(false);
      loadProperties();
    } catch (error) {
      console.error("Error al crear la propiedad", error);
      setError("Error al crear la propiedad");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  return (
    <article>
      <header className="flex justify-between items-center mb-3">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Propiedades
        </h2>

        <button
          onClick={() => setModalOpen(true)}
          className="text-white bg-blue-700/40 hover:bg-blue-500/50 rounded-md box-border border border-transparent hover:bg-brand-strong  shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer"
        >
          Nueva Propiedad
        </button>
      </header>

      <section>
        {loadingProperties ? (
          <p>Cargando propiedades</p>
        ) : properties.length > 0 ? (
          <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {properties.map((propiedad) => (
              <div
                key={propiedad.id}
                className="relative border border-blue-900/30 p-6 rounded-md shadow-sm shadow-blue-500/30"
              >
                <h3 className="text-center font-semibold mb-3 text-lg">
                  {propiedad.titulo}
                </h3>
                <p className="text-center mb-3">Ciudad: {propiedad.ciudad}</p>
                <p className="text-center">Precio: {propiedad.precio}</p>
                <span className="absolute -bottom-4 -right-4 bg-blue-700/80 rounded-full p-1.5 font-semibold">
                  {propiedad.puntaje}
                </span>
              </div>
            ))}
          </article>
        ) : (
          <p>Sin propiedades</p>
        )}
      </section>

      {modalOpen && (
        <NewPropertyModal
          handleSubmit={handleSubmitPropiedad}
          onClose={() => setModalOpen(false)}
          error={error}
          saving={saving}
        />
      )}
    </article>
  );
}
