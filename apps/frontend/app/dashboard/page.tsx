"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import { type Sesion } from "../hooks/useSession";
import AdminView from "./views/AdminView";
import UserView from "./views/UserView";
import UserMenu from "./UserMenu";

export default function Dashboard() {
  const [user, setUser] = useState<Sesion | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const loadUser = async () => {
    setLoading(true);
    setError("");

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

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => null);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-gray-950 via-gray-950 to-black text-gray-100">
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-md border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 mg:p-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-2xl font-black bg-linear-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent hover:opacity-90 transition"
            >
              JEMA
            </Link>
            <span className="hidden sm:inline-block text-xs uppercase tracking-widest text-gray-500 font-semibold px-2 py-0.5 border border-gray-800 rounded">
              Panel {user?.role === "ADMIN" ? "Administrador" : "Inmobiliario"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <UserMenu
                email={user.email}
                role={user.role}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-10 bg-gray-800/60 rounded-xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-44 bg-gray-800/40 rounded-2xl" />
              <div className="h-44 bg-gray-800/40 rounded-2xl" />
              <div className="h-44 bg-gray-800/40 rounded-2xl" />
            </div>
          </div>
        ) : user?.role === "ADMIN" ? (
          <AdminView />
        ) : user?.role === "USER" ? (
          <UserView />
        ) : (
          <div className="text-center py-20 bg-gray-900/40 border border-gray-800 rounded-2xl">
            <p className="text-gray-400">
              Rol de usuario no reconocido o sin permisos asignados.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm text-center">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}
