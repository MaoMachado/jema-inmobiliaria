"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";
import { NewPropertyModal } from "./Modal/NewProperty";

export interface Propiedad {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  ciudad: string;
  barrio: string;
  tipo: string;
  habitaciones: number;
  banos: number;
  area: number;
}

export default function Dashboard() {
  const [error, setError] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState<boolean>(false);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [properties, setProperties] = useState<Propiedad[]>([]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const loadUser = async () => {
    setLoadingUser(true);

    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error("Error al cargar el usuario", error);
      setError("Error al cargar el usuario");
      window.location.href = "/";
    } finally {
      setLoadingUser(false);
    }
  };

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

    for (const key of ["precio", "habitaciones", "banos", "area"]) {
      payload[key] = Number(payload[key]);
    }

    if (
      !payload.titulo ||
      !payload.descripcion ||
      !payload.precio ||
      !payload.ciudad ||
      !payload.barrio ||
      !payload.tipo ||
      !payload.habitaciones ||
      !payload.banos ||
      !payload.area
    ) {
      setError("Todos los campos son obligatorios");
      setSaving(false);
      return;
    }

    try {
      await api.post("/propiedades", payload);
      loadProperties();
      setModalOpen(false);
    } catch (error) {
      console.error("Error al crear la propiedad", error);
      setError("Error al crear la propiedad");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadProperties();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen">
      <header className="bg-blue-900/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto p-6 flex justify-between items-center border-b border-blue-900/50">
          <h1 className="text-3xl font-bold text-blue-700">
            JEMA Inmobiliaria
          </h1>

          <section className="flex items-center gap-6">
            {user ? <p>Bienvenido, {user.email}</p> : <p>Bienvenido</p>}

            <button
              onClick={() => setModalOpen(true)}
              className="text-white bg-blue-700/40 hover:bg-blue-500/50 rounded-md box-border border border-transparent hover:bg-brand-strong  shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer"
            >
              Nueva Propiedad
            </button>

            <button
              onClick={handleLogout}
              className="text-white bg-orange-500/30 hover:bg-orange-600 box-border border border-transparent focus:ring-4 focus:ring-orange-600 shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer rounded-md"
            >
              Cerrar sesión
            </button>
          </section>
        </div>
      </header>

      <section className="mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-6">Propiedades</h2>

          {loadingProperties ? (
            <p>Cargando propiedades</p>
          ) : properties.length > 0 ? (
            <article className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {properties.map((propiedad) => (
                <div
                  key={propiedad.id}
                  className="border border-blue-900/30 p-3 rounded-md shadow-sm shadow-blue-500/30"
                >
                  <h3 className="text-center font-semibold mb-3 text-lg">
                    {propiedad.titulo}
                  </h3>
                  <p className="text-center mb-3">Ciudad: {propiedad.ciudad}</p>
                  <p className="text-center">Precio: {propiedad.precio}</p>
                </div>
              ))}
            </article>
          ) : (
            <p>Sin propiedades</p>
          )}
        </div>
      </section>

      {modalOpen && (
        <NewPropertyModal
          handleSubmit={handleSubmitPropiedad}
          onClose={() => setModalOpen(false)}
          error={error}
          saving={saving}
        />
      )}
    </main>
  );
}
