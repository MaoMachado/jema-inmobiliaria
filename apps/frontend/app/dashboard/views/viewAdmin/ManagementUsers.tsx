"use client";

import { useEffect, useState } from "react";
import { Usuario } from "@/app/lib/types";
import Button from "@/app/components/Button";
import api from "@/app/lib/api";

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

  const handleVerDocumento = async (id: string) => {
    try {
      const res = await api.get(`/usuarios/${id}/documento`);
      if (res.data.url) {
        window.open(res.data.url, "_blank");
      }
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
          users.map((user) => {
            return (
              <div
                key={user.id}
                className="w-full lg:w-xs bg-gray-800/50 backdrop-blur flex flex-col gap-y-2 relative border border-blue-900/30 p-3 rounded-md shadow-sm shadow-blue-500/30 text-center"
              >
                <div className="absolute w-20 h-full bg-sky-800/10 blur-md top-0 left-0 -z-10 rounded-l-md" />
                <header className="flex items-center">
                  <div>
                    <img
                      src={`https://placehold.co/600x400?text=${user.nombres}`}
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

                <p className="text-lg">{user.email}</p>

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

                <Button
                  title="Ver Documento"
                  onClick={() => handleVerDocumento(user.id)}
                />
              </div>
            );
          })
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
