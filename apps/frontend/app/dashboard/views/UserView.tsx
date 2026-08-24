"use client";

import { useEffect, useState } from "react";
import SearchProperty from "@/app/dashboard/views/viewUser/SearchProperty";
import api from "@/app/lib/api";
import { Propiedad } from "@/app/lib/types";
import { NewPropertyModal } from "../Modal/NewProperty";

export default function UserView() {
  const [initialData, setInitialData] = useState<Propiedad[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editingPropiedad, setEditingPropiedad] = useState<Propiedad | null>(
    null,
  );

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<"" | string>("");

  const loadInitial = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get<{ data: Propiedad[] }>("/propiedades");
      setInitialData(res.data.data);
      setIsSearching(false);
    } catch (error) {
      console.error("Error al cargar propiedades", error);
      setError("Error al cargar las propiedades");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPropiedad(null);
    setModalOpen(true);
  };

  const openEdit = (propiedad: Propiedad) => {
    setEditingPropiedad(propiedad);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingPropiedad(null);
    setModalOpen(false);
  };

  useEffect(() => {
    loadInitial();
  }, []);

  const handleSubmitPropiedad = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
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
      if (editingPropiedad) {
        const body = {
          titulo: String(formData.get("titulo")),
          descripcion: String(formData.get("descripcion")),
          precio: Number(formData.get("precio")),
          ciudad: String(formData.get("ciudad")),
          barrio: String(formData.get("barrio")),
          tipo: String(formData.get("tipo")),
          habitaciones: Number(formData.get("habitaciones")),
          banos: Number(formData.get("banos")),
          area: Number(formData.get("area")),
          antiguedad: Number(formData.get("antiguedad")),
          direccion: String(formData.get("direccion")),
          estrato: Number(formData.get("estrato")),
        };
        await api.patch(`/propiedades/${editingPropiedad.id}`, body);
      } else {
        await api.post("/propiedades", formData);
      }

      closeModal();
      loadInitial();
      setMessage(
        editingPropiedad
          ? "Propiedad actualizada correctamente"
          : "Propiedad creada correctamente",
      );
    } catch (error) {
      console.error(
        editingPropiedad
          ? "Error al actualizar la propiedad"
          : "Error al crear la propiedad",
        error,
      );
      setError(
        editingPropiedad
          ? "Error al actualizar la propiedad"
          : "Error al crear la propiedad",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar esta propiedad?",
    );
    if (!confirmar) return;

    setLoading(true);
    setError("");

    try {
      await api.delete(`/propiedades/${id}`);
      loadInitial();
      setMessage("Propiedad eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar la propiedad", error);
      setError("Error al eliminar la propiedad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <article>
      <header className="flex justify-between items-center mb-3">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Propiedades
        </h2>

        <button
          onClick={openCreate}
          className="text-white bg-blue-700/40 hover:bg-blue-500/50 rounded-md box-border border border-transparent hover:bg-brand-strong  shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer"
        >
          Nueva Propiedad
        </button>
      </header>

      <SearchProperty
        onResult={(data) => {
          setInitialData(data);
          setIsSearching(true);
        }}
        onClear={() => {
          setIsSearching(false);
          loadInitial();
        }}
      />

      <section>
        {!isSearching && loading ? (
          <p>Cargando...</p>
        ) : (
          <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {initialData.map((propiedad) => (
              <div
                key={propiedad.id}
                className="relative border border-blue-900/30 p-6 rounded-md shadow-sm shadow-blue-500/30"
              >
                <h3 className="text-center font-semibold mb-3 text-lg">
                  {propiedad.titulo}
                </h3>
                <p className="text-center mb-3">Ciudad: {propiedad.ciudad}</p>
                <p className="text-center mb-3">Precio: {propiedad.precio}</p>

                <span className="absolute -bottom-4 -right-4 bg-blue-700/80 rounded-full p-1.5 font-semibold">
                  {propiedad.puntaje}
                </span>

                {propiedad.fotografias?.[0] && (
                  <img
                    src={propiedad.fotografias[0]}
                    alt={propiedad.titulo}
                    className="mt-2 w-full h-32 object-cover rounded"
                  />
                )}

                <button
                  onClick={() => handleDeleteProperty(propiedad.id)}
                  className="absolute -top-3 -right-3 text-3xl cursor-pointer"
                >
                  🚮
                </button>

                <button
                  className="absolute -top-3 right-5 text-3xl cursor-pointer"
                  onClick={() => openEdit(propiedad)}
                >
                  📝
                </button>
              </div>
            ))}
            {initialData.length === 0 && (
              <p className="text-center col-span-full">No hay propiedades</p>
            )}
          </article>
        )}

        {message && (
          <div className="fixed top-0 right-0 m-4 bg-green-500/30 p-2 rounded-md">
            <p>{message}</p>
          </div>
        )}
      </section>

      {modalOpen && (
        <NewPropertyModal
          handleSubmit={handleSubmitPropiedad}
          onClose={() => setModalOpen(false)}
          error={error}
          saving={saving}
          mode={editingPropiedad ? "edit" : "create"}
          propiedad={editingPropiedad ?? undefined}
        />
      )}
    </article>
  );
}
