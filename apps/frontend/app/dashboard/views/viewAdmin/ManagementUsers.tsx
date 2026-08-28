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

  const handleVerifyDocumentoUser = async (id: string, current: boolean) => {
    try {
      await api.patch(`/usuarios/${id}/verificar-documento`, {
        verificado: !current,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, documentoVerificado: !current } : u,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerifyPhoneUser = async (id: string, current: boolean) => {
    try {
      await api.patch(`/usuarios/${id}/verificar-telefono`, {
        verificado: !current,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, celularVerificado: !current } : u,
        ),
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
              <p
                className={`absolute -top-2 left-0 tracking-wider font-semibold px-2 rounded-md text-xs ${user.role === "ADMIN" ? "bg-cyan-500/50" : "bg-sky-500"}`}
              >
                Rol: {user.role}
              </p>
              <p className="text-lg">{user.email}</p>
              <p className="text-sm text-slate-500">
                {user.nombres} {user.apellidos}
              </p>
              <p className="text-sm text-slate-500">{user.celular}</p>

              <p
                className={`text-sm font-semibold ${user.celularVerificado ? "text-green-400" : "text-yellow-400"}`}
              >
                {user.celularVerificado
                  ? "Celular Verificado"
                  : "No verificado"}
              </p>

              <p
                className={`text-sm font-semibold ${
                  user.documentoVerificado
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {user.documentoVerificado
                  ? "Documento verificado"
                  : "Documento no verificado"}
              </p>

              <button
                onClick={() =>
                  handleVerifyPhoneUser(user.id, user.celularVerificado)
                }
                className={`px-2 py-1 text-sm font-semibold rounded-md cursor-pointer ${
                  user.celularVerificado
                    ? "text-green-400 bg-green-400/10"
                    : "text-yellow-400 bg-yellow-400/10"
                }`}
              >
                {user.celularVerificado
                  ? "Celular Verificado ✓"
                  : "Verificar Celular"}
              </button>

              <button
                onClick={() =>
                  handleVerifyDocumentoUser(user.id, user.documentoVerificado)
                }
                className={`px-2 py-1 text-sm font-semibold rounded-md cursor-pointer ${
                  user.documentoVerificado
                    ? "text-green-400 bg-green-400/10"
                    : "text-yellow-400 bg-yellow-400/10"
                }`}
              >
                {user.documentoVerificado
                  ? "Documento Verificado ✓"
                  : "Verificar Documento"}
              </button>
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
