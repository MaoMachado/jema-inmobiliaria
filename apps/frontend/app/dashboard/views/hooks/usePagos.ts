"use client";

import api from "@/app/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface PlanInfo {
  plan: "GRATIS" | "BASICO" | "PREMIUM";
  propiedadesLimite: number;
  chatIaLimite: number;
  beneficios: {
    precio: number;
    propiedades: number;
    chatDiario: number;
    fotos: number;
    destacada: boolean;
    analytics: boolean;
  };
}

export interface Pago {
  id: string;
  plan: "GRATIS" | "BASICO" | "PREMIUM";
  monto: number;
  comprobante?: string | null;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  createAt: string;
}

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message ?? fallback;
};

export function usePagos() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [historial, setHistorial] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [comprobantePath, setComprobantePath] = useState<string | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<
    "BASICO" | "PREMIUM" | null
  >(null);
  const [message, setMessage] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [planRes, hitRes] = await Promise.all([
        api.get<PlanInfo>("/pagos/plan"),
        api.get<Pago[]>("/pagos/historial"),
      ]);

      setPlanInfo(planRes.data);
      setHistorial(hitRes.data);
    } catch (error) {
      console.error("Error al cargar la información", error);
      setMessage({
        tipo: "error",
        texto: getErrorMessage(
          error,
          "Error al cargar la información del plan",
        ),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubirComprobante = async (file: File) => {
    setSubiendo(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("comprobante", file);

      const res = await api.post<{ path: string }>(
        "pagos/comprobante",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setComprobantePath(res.data.path);
    } catch (error) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al subir el comprobante"),
      });
      setComprobantePath(null);
    } finally {
      setSubiendo(false);
    }
  };

  const handleSolicitar = async () => {
    if (!planSeleccionado || !comprobantePath) return;

    setLoading(true);
    setMessage(null);

    try {
      const precio = planSeleccionado === "BASICO" ? 15000 : 30000;

      await api.post("/pagos", {
        monto: precio,
        plan: planSeleccionado,
        comprobante: comprobantePath,
      });

      setMessage({
        tipo: "ok",
        texto: "Pago enviado, pendiente de verificación",
      });

      setPlanSeleccionado(null);
      setComprobantePath(null);
    } catch (error) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al solicitar el pago"),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    planInfo,
    historial,
    loading,
    subiendo,
    comprobantePath,
    planSeleccionado,
    setPlanSeleccionado,
    handleSubirComprobante,
    handleSolicitar,
    message,
    refresh: load,
  };
}
