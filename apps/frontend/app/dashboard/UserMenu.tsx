"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Icon from "@/app/components/Icons";
import { usePerfil } from "./views/hooks/usePerfil";

interface UserMenuProps {
  email: string;
  role: string;
  onLogout: () => void;
}

function Avatar({
  foto,
  inicial,
  size = "sm",
}: {
  foto?: string | null;
  inicial: string;
  size?: "sm" | "lg";
}) {
  const clases = size === "lg" ? "w-11 h-11" : "w-8 h-8";

  if (foto) {
    return (
      <Image
        src={foto}
        alt=""
        width={44}
        height={44}
        unoptimized
        className={`${clases} rounded-full object-cover border border-gray-700`}
      />
    );
  }

  return (
    <div
      className={`${clases} rounded-full bg-linear-to-tr from-sky-600 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow`}
    >
      {inicial}
    </div>
  );
}

export default function UserMenu({ email, role, onLogout }: UserMenuProps) {
  const [abierto, setAbierto] = useState(false);

  const contenedor = useRef<HTMLDivElement>(null);

  const { perfil } = usePerfil();

  const nombre = perfil
    ? `${perfil.nombres} ${perfil.apellidos}`.trim()
    : email;

  const inicial = (perfil?.nombres || email).charAt(0).toUpperCase();

  // Cierra con clic fuera y con Escape; Escape devuelve el foco al botón.
  useEffect(() => {
    if (!abierto) return;

    const alClicFuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };

    const alEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        contenedor.current?.querySelector("button")?.focus();
      }
    };

    document.addEventListener("mousedown", alClicFuera);
    document.addEventListener("keydown", alEscape);

    return () => {
      document.removeEventListener("mousedown", alClicFuera);
      document.removeEventListener("keydown", alEscape);
    };
  }, [abierto]);

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label="Menú de usuario"
        className="flex items-center hover:bg-gray-800 hover:border-gray-700 rounded-full transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <Avatar foto={perfil?.foto} inicial={inicial} size="lg" />

        <Icon
          name="chevronDown"
          className={`hidden md:block w-4 h-4 text-gray-500 transition-transform ${
            abierto ? "rotate-180" : ""
          }`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-800 bg-gray-900/95 backdrop-blur-md shadow-2xl shadow-black/40 p-2 z-50">
          <div className="flex items-center gap-3 p-2.5 border-b border-gray-800 mb-1">
            <Avatar foto={perfil?.foto} inicial={inicial} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-100 truncate">
                {nombre}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{email}</p>
            </div>
          </div>

          <Link
            href="/dashboard/perfil"
            onClick={() => setAbierto(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition"
          >
            <Icon name="user" />
            Mi Perfil
          </Link>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-950/40 transition cursor-pointer"
          >
            <Icon name="logout" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
