"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/app/lib/api";

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

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }

  return fallback;
};

export function usePagos() {
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [historial, setHistorial] = useState<Pago[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [subiendo, setSubiendo] = useState<boolean>(false);
  const [comprobantePath, setComprobantePath] = useState<string | null>(null);
  const [planSeleccionado, setPlanSeleccionado] = useState<
    "BASICO" | "PREMIUM" | null
  >(null);
  const [message, setMessage] = useState<string>("");

  const showTempMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [planRes, hitRes] = await Promise.all([
        api.get<PlanInfo>("/pagos/plan"),
        api.get<Pago[]>("/pagos/historial"),
      ]);

      setPlanInfo(planRes.data);
      setHistorial(hitRes.data);
      showTempMessage("Información cargada correctamente");
    } catch (error) {
      showTempMessage(getErrorMessage(error, "Error al cargar la información"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleSubirComprobante = async (file: File) => {
    setSubiendo(true);

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
      showTempMessage("Comprobante cargado correctamente");
    } catch (error) {
      showTempMessage(getErrorMessage(error, "Error al subir el comprobante"));
      setComprobantePath(null);
    } finally {
      setSubiendo(false);
    }
  };

  const handleSolicitar = async () => {
    if (!planSeleccionado || !comprobantePath) return;

    setLoading(true);

    try {
      const precio = planSeleccionado === "BASICO" ? 15000 : 30000;

      await api.post("/pagos", {
        monto: precio,
        plan: planSeleccionado,
        comprobante: comprobantePath,
      });

      showTempMessage("Pago enviado, pendiente de verificación");

      setPlanSeleccionado(null);
      setComprobantePath(null);
    } catch (error) {
      showTempMessage(getErrorMessage(error, "Error al registrar el pago"));
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
