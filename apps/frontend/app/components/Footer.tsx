"use client";

import { useState } from "react";
import Link from "next/link";
import LegalModal, { TipoDocumentoLegal } from "./LegalModal";

interface FooterProps {
  onOpenLegal?: (tipo: TipoDocumentoLegal) => void;
}

export default function Footer({ onOpenLegal }: FooterProps) {
  const [modalTipo, setModalTipo] = useState<TipoDocumentoLegal | null>(null);

  const handleOpenDoc = (tipo: TipoDocumentoLegal) => {
    if (onOpenLegal) {
      onOpenLegal(tipo);
    } else {
      setModalTipo(tipo);
    }
  };

  return (
    <>
      <footer className="mt-16 border-t border-gray-800/80 bg-gray-950/90 text-gray-400 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <Link
              href="/"
              className="text-xl font-bold text-sky-400 flex items-center gap-2 hover:text-sky-300 transition"
            >
              <span className="text-2xl">🏢</span>
              <span>JEMA Inmobiliaria</span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Plataforma inmobiliaria con verificación de identidad, valuación
              inteligente con IA y trato directo sin intermediarios
              innecesarios.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-white">Explorar</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/buscar" className="hover:text-sky-400 transition">
                  Buscar Inmuebles
                </Link>
              </li>
              <li>
                <Link
                  href="/#destacadas"
                  className="hover:text-sky-400 transition"
                >
                  Propiedades Destacadas
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-sky-400 transition"
                >
                  Publicar una Propiedad
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-white">Seguridad & Legal</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc("terminos")}
                  className="text-gray-400 hover:text-sky-400 transition cursor-pointer text-left"
                >
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc("privacidad")}
                  className="text-gray-400 hover:text-sky-400 transition cursor-pointer text-left"
                >
                  Política de Privacidad
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleOpenDoc("habeas_data")}
                  className="text-gray-400 hover:text-sky-400 transition cursor-pointer text-left"
                >
                  Tratamiento de Datos (Ley 1581)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-sm">
            <h4 className="font-semibold text-white">Atención & Contacto</h4>
            <p className="text-xs text-gray-300">
              soporte@jemainmobiliaria.com
            </p>
            <p className="text-xs font-mono text-emerald-400">
              WhatsApp: +57 300 123 4567
            </p>
            <p className="text-[11px] text-gray-500">Colombia</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-gray-900 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} JEMA Inmobiliaria. Todos los derechos
          reservados.
        </div>
      </footer>

      <LegalModal
        isOpen={modalTipo !== null}
        tipo={modalTipo}
        onClose={() => setModalTipo(null)}
      />
    </>
  );
}
