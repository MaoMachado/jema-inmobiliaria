"use client";

import api from "@/app/lib/api";
import { useEffect, useState } from "react";
import { Usuario } from "@/app/lib/types";

export default function AdminView() {
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
      <header>
        <h2>Usuarios Registrados</h2>
      </header>

      <section className="flex gap-6 mt-6">
        {loading ? (
          <p>Cargando...</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="border border-blue-900/30 p-3 rounded-md shadow-sm shadow-blue-500/30 text-center"
            >
              <p>{user.email}</p>
              <p>{user.nombres}</p>
              <p>{user.apellidos}</p>
              <p>{user.celular}</p>
              <p
                className={
                  user.role === "ADMIN" ? "bg-orange-500" : "bg-blue-500"
                }
              >
                {user.role}
              </p>
            </div>
          ))
        )}
      </section>

      {error && (
        <p className="text-red-500 border border-red-500 rounded-md p-2 text-center">
          {error}
        </p>
      )}
    </article>
  );
}
