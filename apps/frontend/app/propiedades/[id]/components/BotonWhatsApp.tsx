"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";

interface BotonWhatsAppProps {
  propiedadId: string;
  titulo: string;
}

export default function BotonWhatsapp({
  propiedadId,
  titulo,
}: BotonWhatsAppProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleContactar = async () => {
    setErrorMsg("");

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get<{ email?: string; celular?: string }>(
        `/propiedades/${propiedadId}/contacto`,
      );

      const celular = res.data.celular;
      if (!celular) {
        setErrorMsg("El propietario no tiene número de celular registrado");
        return;
      }

      const numeroLimpio = celular.replace(/\D/g, "");
      const telefonoCompleto =
        numeroLimpio.length === 10 ? `57${numeroLimpio}` : numeroLimpio;

      const mensaje = encodeURIComponent(
        `¡Hola! Estoy interesado en la propiedad "${titulo}" que vi en JEMA Inmobiliaria. ¿Sigue disponible?`,
      );

      window.open(
        `https://wa.me/${telefonoCompleto}?text=${mensaje}`,
        "_blank",
      );
    } catch (error: any) {
      if (error?.response?.status === 401) {
        router.push("/login");
      } else {
        setErrorMsg(
          error?.response?.data?.message ||
            "Error al obtener información de contacto",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleContactar}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer text-base disabled:opacity-50"
      >
        <span className="text-xl">💬</span>
        <span>{loading ? "Contactando..." : "Contactar por WhatsApp"}</span>
      </button>

      {errorMsg && (
        <p className="text-xs text-red-400 text-center font-medium bg-red-950/30 p-2 rounded-lg border border-red-900/50">
          {errorMsg}
        </p>
      )}
    </div>
  );
}
