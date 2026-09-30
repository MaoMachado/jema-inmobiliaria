"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  return (
    <section className="relative overflow-hidden py-6 md:py-10 px-4 sm:px-6">
      <div className="relative max-w-7xl mx-auto rounded-3xl bg-linear-to-b from-blue-950/60 via-gray-900/80 border border-blue-500/20 p-8 sm:p-14 lg:p-16 text-center backdrop-blur-xl shadow-2xl">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span>✨</span>
          <span>Plataforma Inmobiliaria Inteligente & Segura</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
          Encuentra o publica tu propiedad con{" "}
          <span className="bg-linear-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            total confianza
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Propiedades verificadas, precios transparentes y la mejor experiencia
          para comprar, arrendar o invertir en bienes raíces.
        </p>

        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center max-w-md mx-auto">
          <Link
            href="/buscar"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-gray-950 font-bold text-base shadow-lg shadow-sky-500/20 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="text-lg">🔍</span>
            <span>Buscar Propiedades</span>
          </Link>

          <Link
            href={isLoggedIn ? "/dashboard" : "/login"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700/80 hover:border-gray-500 text-white font-semibold text-base hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="text-lg">➕</span>
            <span>Publicar Propiedad</span>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left sm:text-center text-xs sm:text-sm text-gray-400">
          <div className="flex items-center sm:justify-center gap-2 bg-gray-900/40 p-2.5 rounded-xl border border-gray-800/50">
            <span className="text-lg">🛡️</span>
            <span>Celular y documentos auditados</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2 bg-gray-900/40 p-2.5 rounded-xl border border-gray-800/50">
            <span className="text-lg">🤖</span>
            <span>Estimación de precios con IA</span>
          </div>
          <div className="flex items-center sm:justify-center gap-2 bg-gray-900/40 p-2.5 rounded-xl border border-gray-800/50">
            <span className="text-lg">⚡</span>
            <span>Trato directo por WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}
