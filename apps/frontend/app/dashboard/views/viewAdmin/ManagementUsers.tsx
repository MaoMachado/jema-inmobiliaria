"use client";

import { useEffect, useState } from "react";
import { Usuario } from "@/app/lib/types";
import api from "@/app/lib/api";
import PropiedadesTabs from "../components/PropiedadesTabs";

export default function ManagementUsers() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [verificandoId, setVerificandoId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/usuarios");
      setUsers(res.data);
    } catch {
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async (docId: string, current: boolean) => {
    setVerificandoId(docId);

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
    } catch {
      setError("No se pudo actualizar la verificación del documento");
    } finally {
      setVerificandoId(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers();
  }, []);

  const pendientes = users.reduce(
    (acc, u) =>
      acc +
      (u.propiedades?.reduce(
        (a, p) => a + p.documentos.filter((d) => !d.verificado).length,
        0,
      ) ?? 0),
    0,
  );

  return (
    <article className="space-y-6">
      <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-3xl font-bold">Gestión De Usuarios</h2>
          <p className="text-xs text-gray-400">
            Audita Perfiles, Roles, Documentación Legal Asociada
          </p>
        </div>

        <div className="flex gap-2">
          <span className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-full font-semibold">
            {users.length} Usuarios
          </span>

          <span
            className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
              pendientes > 0
                ? "text-amber-300 bg-amber-950/60 border-amber-800/50"
                : "text-emerald-300 bg-emerald-950/60 border-emerald-800/50"
            }`}
          >
            {pendientes > 0
              ? `${pendientes} documentos por verificar`
              : "Documentación al día"}
          </span>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-60 bg-gray-900 rounded-2xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/30 border border-gray-800 rounded-2xl">
          <p className="text-gray-400 text-sm">
            No se encontraron usuarios registrados.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-gray-900/50 border border-gray-800 hover:border-gray-700/80 p-5 rounded-2xl backdrop-blur flex flex-col justify-between transition-all"
            >
              <div>
                <header className="flex items-center gap-3 mb-4">
                  <img
                    src={user?.foto ?? "https://placehold.co/100x100?text=U"}
                    alt={`Foto de ${user.nombres} ${user.apellidos}`}
                    loading="lazy"
                    className="w-12 h-12 rounded-full object-cover border border-gray-700"
                  />

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold truncate">
                        {user.nombres} {user.apellidos}
                      </h3>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.role === "ADMIN"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-800/50"
                            : "bg-sky-950/80 text-sky-300 border border-sky-800/50"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>

                    <p className="text-[11px] text-gray-500 font-mono">
                      {user.celular || "Sin Celular"}
                    </p>
                  </div>
                </header>

                <div className="pt-3 border-t border-gray-800/80">
                  <h4 className="text-xs font-semibold text-gray-300 mb-2">
                    Inmuebles y Documentos ({user.propiedades?.length ?? 0})
                  </h4>

                  {user.propiedades && user.propiedades.length > 0 ? (
                    <PropiedadesTabs
                      propiedades={user.propiedades}
                      onVerificar={handleVerificar}
                      verificandoId={verificandoId}
                    />
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Sin Propiedades Registradas
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {error && (
        <p
          role="alert"
          className="text-red-400 bg-red-950/40 border border-red-800/60 p-3 rounded-xl text-center text-sm"
        >
          {error}
        </p>
      )}
    </article>
  );
}
