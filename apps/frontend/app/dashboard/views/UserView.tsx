"use client";

import { useEffect, useState } from "react";

import SearchProperty from "@/app/dashboard/views/viewUser/SearchProperty";
import api from "@/app/lib/api";
import { Propiedad } from "@/app/lib/types";
import { NewPropertyModal } from "../Modal/NewProperty";

export default function UserView() {
  const [resultados, setResultados] = useState<any[]>([]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const handleSubmitPropiedad = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const isEmpty = (v: FormDataEntryValue | null) =>
      v === "" || v === null || v === undefined;

    if (
      isEmpty(formData.get("titulo")) ||
      isEmpty(formData.get("descripcion")) ||
      isEmpty(formData.get("precio")) ||
      isEmpty(formData.get("ciudad")) ||
      isEmpty(formData.get("barrio")) ||
      isEmpty(formData.get("tipo")) ||
      isEmpty(formData.get("habitaciones")) ||
      isEmpty(formData.get("banos")) ||
      isEmpty(formData.get("area")) ||
      isEmpty(formData.get("antiguedad")) ||
      isEmpty(formData.get("direccion")) ||
      isEmpty(formData.get("estrato"))
    ) {
      setError("Todos los campos son obligatorios");
      setSaving(false);
      return;
    }

    try {
      await api.post("/propiedades", formData);
      setModalOpen(false);
    } catch (error) {
      console.error("Error al crear la propiedad", error);
      setError("Error al crear la propiedad");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);

      try {
        const res = await api.get<{ data: Propiedad[]; pagination: any }>(
          "/propiedades",
        );
        setResultados(res.data.data);
      } catch (err) {
        console.error("Error al cargar propiedades", err);
        setError("Error al cargar las propiedades");
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
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

      <SearchProperty onResults={(data) => setResultados(data)} />

      <section>
        {resultados.length > 0 ? (
          <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {resultados.map((propiedad) => (
              <div
                key={propiedad.id}
                className="relative border border-blue-900/30 p-6 rounded-md shadow-sm shadow-blue-500/30"
              >
                <h3 className="text-center font-semibold mb-3 text-lg">
                  {propiedad.titulo}
                </h3>
                <p className="text-center mb-3">Ciudad: {propiedad.ciudad}</p>
                <p className="text-center">Precio: ${propiedad.precio}</p>
                <span className="absolute -bottom-4 -right-4 bg-blue-700/80 rounded-full p-1.5 font-semibold">
                  {propiedad.puntaje}
                </span>
                {propiedad.fotografias?.[0] && (
                  <img
                    src={propiedad.fotografias[0]}
                    alt={propiedad.titulo}
                    className=""
                  />
                )}
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
