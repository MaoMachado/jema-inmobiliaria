"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "../lib/api";

import Button from "../components/Button";
import AdminView from "./views/AdminView";
import UserView from "./views/UserView";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(
    null,
  );

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const role = user?.role;

  const loadUser = async () => {
    setLoading(true);

    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error("Error al cargar el usuario", error);
      setError("Error al cargar el usuario");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/");
  };

  return (
    <main className="min-h-screen">
      <header className="bg-blue-900/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto p-6 flex flex-col md:flex-row justify-between items-center border-b border-blue-900/50">
          <h1 className="text-3xl font-bold text-blue-700 text-center mb-3">
            JEMA Inmobiliaria
          </h1>

          <section className="flex flex-col md:flex-row items-center gap-x-10 gap-y-3">
            {user ? (
              <p className="flex items-center gap-2">
                Bienvenido, {user.email}
                <span className="bg-blue-800/50 text-blue-300 px-2 py-1 rounded-full text-xs">
                  {user.role}
                </span>
              </p>
            ) : (
              <p>Bienvenido</p>
            )}

            <Button
              title="Cerrar Sesión"
              onClick={handleLogout}
              variant="warning"
            />
          </section>
        </div>
      </header>

      <section>
        <div className="max-w-7xl mx-auto px-6 mt-10">
          {loading ? (
            <p>Cargando...</p>
          ) : role === "ADMIN" ? (
            <AdminView />
          ) : role === "USER" ? (
            <UserView />
          ) : (
            <p>Rol no reconocido</p>
          )}

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </section>
    </main>
  );
}
