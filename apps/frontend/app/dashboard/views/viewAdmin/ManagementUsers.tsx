"use client";

import api from "@/app/lib/api";
import { Usuario } from "@/app/lib/types";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <article>
      <h1 className="text-4xl font-bold text-center">Gestión De Usuarios</h1>

      <section className="flex gap-6 mt-6">
        {loading ? (
          <p>Cargando...</p>
        ) : users.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-y-2 relative border border-blue-900/30 p-3 rounded-md shadow-sm shadow-blue-500/30 text-center"
            >
              <div className="absolute w-10 h-full bg-sky-800/20 blur-sm top-0 left-0 -z-10 rounded-l-md" />
              <p className="text-lg">{user.email}</p>
              <p className="text-sm text-slate-500">
                {user.nombres} {user.apellidos}
              </p>
              <p className="text-sm text-slate-500">{user.celular}</p>
              <p
                className={`py-1 rounded-md text-sm ${user.role === "ADMIN" ? "bg-orange-500" : "bg-blue-500"}`}
              >
                {user.role}
              </p>
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
