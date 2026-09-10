"use client";

import { useEffect, useState } from "react";
import { Usuario } from "@/app/lib/types";
import api from "@/app/lib/api";
import PropiedadesTabs from "../components/PropiedadesTabs";

export default function ManagementUsers() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/usuarios");
      setUsers(res.data);
    } catch (error) {
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (docId: string, current: boolean) => {
    try {
      await api.patch(`/propiedades/documentos/${docId}/verificar`, {
        verificado: !current,
      });

      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          propiedades: u.propiedades?.map((p) => ({
            ...p,
            documentos: p.documentos.map((d) =>
              d.id === docId ? { ...d, verificado: !current } : d,
            ),
          })),
        })),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <article>
      <h1 className="text-4xl font-bold text-center">Gestión De Usuarios</h1>

      <section className="flex gap-6  mt-6">
        {loading ? (
          <p>Cargando...</p>
        ) : users.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="w-full lg:w-xs bg-gray-800/50 backdrop-blur flex flex-col relative border border-blue-900/30 p-3 rounded-md shadow-sm shadow-blue-500/30 text-center"
            >
              <div className="absolute w-15 h-15 rounded-full bg-sky-600/15 blur-md top-3 left-3 -z-10 rounded-l-md" />

              <header className="flex items-center mb-6">
                <div>
                  <img
                    src={user?.foto ?? "https://placehold.co/600x400?text=Foto"}
                    alt="Foto"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>
                <div className="ml-auto flex flex-col">
                  <h1 className="text-2xl font-bold">
                    {user.nombres} {user.apellidos}
                  </h1>
                  <p className="text-sm text-slate-400 font-semibold text-right">
                    {user.celular}
                  </p>
                </div>
              </header>

              <span
                className={`absolute -top-3 left-3 tracking-wider font-semibold px-2 rounded-md text-xs ${user.role === "ADMIN" ? "bg-cyan-500/50" : "bg-sky-500"}`}
              >
                Rol: {user.role}
              </span>

              <p className="text-md truncate text-start border-r-3 border-slate-600 mb-3">
                Correo: <span>{user.email}</span>
              </p>

              <div className="w-full h-1 bg-linear-to-r from-sky-600/20 to-gray-600/20 rounded mb-3" />

              <h2 className="text-lg tracking-wider font-semibold mb-3">
                Propiedades
              </h2>

              {user.propiedades && user.propiedades.length > 0 ? (
                <PropiedadesTabs
                  propiedades={user.propiedades}
                  onVerificar={handleVerificar}
                />
              ) : (
                <p className="text-sm text-gray-500">Sin Propiedades</p>
              )}
            </div>
          ))
        )}
        {error && (
          <p className="text-red-500 border border-red-500 rounded-md p-2 text-center">
            {error}
          </p>
        )}
      </section>
    </article>
  );
}
