"use client";

import HeaderAuth from "./HeaderAuth";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-950/80 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-wider text-sky-400 hover:text-sky-300 transition group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">
            🏢
          </span>
          <span>
            JEMA{" "}
            <span className="text-white font-light text-base sm:text-lg">
              Inmobiliaria
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link href="/buscar" className="hover:text-sky-400 transition">
            Explorar Propiedades
          </Link>
          <Link href="/#destacadas" className="hover:text-sky-400 transition">
            Destacadas
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <HeaderAuth />
        </div>

        <button
          type="button"
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
          aria-label="Abrir menú"
        >
          {menuAbierto ? "✕" : "☰"}
        </button>

        {/* Menú móvil */}
        {menuAbierto && (
          <div className="md:hidden px-4 pt-2 pb-6 border-t border-gray-800 bg-gray-950/95 absolute top-19 left-0 right-0 gap-4 animate-fade-in">
            <nav className="flex flex-col gap-3 text-base text-gray-300">
              <Link
                href="/buscar"
                className="py-1 hover:text-sky-400"
                onClick={() => setMenuAbierto(false)}
              >
                🔍 Explorar Propiedades
              </Link>
              <Link
                href="/#destacadas"
                className="py-1 hover:text-sky-400"
                onClick={() => setMenuAbierto(false)}
              >
                ⭐ Destacadas
              </Link>
              <hr className="border-gray-800" />
              <div className="flex flex-col gap-2">
                <HeaderAuth />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
