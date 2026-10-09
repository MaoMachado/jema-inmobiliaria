"use client";

import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";
import Link from "next/link";
import api from "../lib/api";

interface HeaderAuthProps {
  onAction?: () => void;
}

export default function HeaderAuth({ onAction }: HeaderAuthProps) {
  const sesion = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await api.post("/auth/logout").catch(() => null);
    if (onAction) onAction();

    router.push("/login");
  };

  if (sesion === undefined) {
    return (
      <div className="flex gap-2 animate-pulse">
        <div className="w-24 h-8 bg-gray-800 rounded-lg" />
        <div className="w-24 h-8 bg-gray-800 rounded-lg" />
      </div>
    );
  }

  if (sesion) {
    return (
      <section className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className=" bg-sky-500/20 text-sky-300 border border-sky-500/40 px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-sky-500/30 transition flex items-center gap-1.5 shadow-sm"
        >
          <span>👤</span>
          <span>Dashboard</span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="text-xs text-gray-400 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-gray-800/60 transition"
          title="Cerrar sesión"
        >
          Salir
        </button>
      </section>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <Link
        href="/login"
        onClick={onAction}
        className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-gray-800/60 transition font-medium"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/register"
        onClick={onAction}
        className="bg-sky-500 hover:bg-sky-400 text-gray-950 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition shadow-sm"
      >
        Registrarse
      </Link>
    </div>
  );
}
