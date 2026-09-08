"use client";

import Link from "next/link";
import PublicSearchProperty from "../components/PublicSearchProperty";

export default function BuscarPage() {
  return (
    <main>
      <header className="bg-linear-to-br from-gray-500/20 to-blue-800/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-6 py-5">
          <Link
            href="/"
            className="text-sky-400 hover:text-sky-300 font-semibold tracking-wider"
          >
            ⬅️ Volver
          </Link>
          <h1 className="text-2xl font-bold text-sky-400 tracking-wider">
            Buscar tu propiedad
          </h1>
        </div>
      </header>

      <PublicSearchProperty />
    </main>
  );
}
