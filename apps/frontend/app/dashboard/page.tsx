"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Dashboard() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [properties, setProperties] = useState<
    Array<{ id: string; titulo: string }>
  >([]);

  const loadUser = async () => {
    setLoading(true);

    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error("Error al cargar el usuario", error);
      setError("Error al cargar el usuario");
      window.location.href = "/";
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/propiedades");
      setProperties(res.data);
    } catch (error) {
      console.error("Error al cargar las propiedades", error);
      setError("Error al cargar las propiedades");
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-blue-700">JEMA Inmobiliaria</h1>

          <section className="flex items-center gap-6">
            {user ? <p>Bienvenido, {user.email}</p> : <p>Bienvenido</p>}

            <button
              onClick={handleLogout}
              className="text-white bg-orange-500/30 hover:bg-orange-600 box-border border border-transparent focus:ring-4 focus:ring-orange-600 shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none cursor-pointer rounded-md"
            >
              Cerrar sesión
            </button>
          </section>
        </div>
      </header>

      <section>
        {loading ? (
          <p>Cargando propiedades...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ul>
            {properties.map((property) => (
              <li key={property.id}>{property.titulo}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
