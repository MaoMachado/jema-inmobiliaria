"use client";

import { useEffect, useState } from "react";

export const COOKIE_CONSENT_KEY = "jema_cookie_consent";

interface CookieBannerProps {
  onOpenLegal?: (tipo: "habeas_data" | "privacidad") => void;
}

export default function CookieBanner({ onOpenLegal }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const guardarConsentimiento = (tipo: "accepted" | "essential") => {
    try {
      const data = {
        status: tipo,
        timestamp: new Date().toISOString(),
        version: "1.0",
      };
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Error al guardar consentimiento de cookies:", e);
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      role="complementary"
      aria-label="Aviso de cookies y privacidad"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-lg z-50 bg-gray-950/95 border border-sky-500/40 text-white p-5 rounded-2xl shadow-2xl backdrop-blur-xl animate-fade-in flex flex-col gap-4"
    >
      <div className="flex items-start gap-3.5">
        <span className="text-3xl select-none">🍪</span>
        <div className="text-xs leading-relaxed text-gray-300 space-y-1">
          <p className="font-bold text-white text-sm">
            Tratamiento de Datos y Cookies
          </p>
          <p>
            Utilizamos cookies técnicas y tratamiento de datos para garantizar
            la seguridad de tu sesión, verificación de identidad y mejorar tu
            experiencia según la normativa de Habeas Data (Ley 1581 de
            Colombia).
          </p>
          {onOpenLegal && (
            <button
              type="button"
              onClick={() => onOpenLegal("habeas_data")}
              className="text-sky-400 hover:text-sky-300 underline font-medium cursor-pointer"
            >
              Conocer política de tratamiento de datos
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-1 border-t border-gray-800">
        <button
          type="button"
          onClick={() => guardarConsentimiento("essential")}
          className="text-xs text-gray-400 hover:text-white px-3.5 py-2 rounded-lg hover:bg-gray-800/80 transition"
        >
          Solo esenciales
        </button>
        <button
          type="button"
          onClick={() => guardarConsentimiento("accepted")}
          className="text-xs font-bold bg-sky-500 hover:bg-sky-400 text-gray-950 px-4 py-2 rounded-lg shadow-md hover:scale-105 active:scale-95 transition"
        >
          Aceptar todas
        </button>
      </div>
    </aside>
  );
}
