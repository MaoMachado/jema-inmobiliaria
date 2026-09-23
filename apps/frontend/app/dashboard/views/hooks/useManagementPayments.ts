"use client";

import api from "@/app/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface PagoAdmin {
  id: string;
  plan: "GRATIS" | "BASICO" | "PREMIUM";
  monto: number;
  comprobante?: string | null;
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
  createAt: string;
  usuario: {
    nombres: string;
    apellidos: string;
    email: string;
  };
}

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? fallback;

export function useManagementPayments() {
  const [pagos, setPagos] = useState<PagoAdmin[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);
  const [urlComprobante, setUrlComprobante] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);

    try {
      const res = await api.get<PagoAdmin[]>("/pagos");
      setPagos(res.data);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Error al cargar los pagos"),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const verComprobante = async (id: string) => {
    setMessage(null);

    try {
      const res = await api.get<{ url: string }>(`/pagos/${id}/comprobante`);
      setUrlComprobante(res.data.url);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Error al cargar el comprobante"),
      });
    }
  };

  const cambiarEstado = async (
    id: string,
    estado: "APROBADO" | "RECHAZADO",
  ) => {
    setLoading(true);
    setMessage(null);

    try {
      await api.patch(`/pagos/${id}`, { estado });
      setMessage({
        type: "ok",
        text: `Pago ${estado === "APROBADO" ? "aprobado" : "rechazado"}`,
      });
      refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Error al actualizar el pago"),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    pagos,
    loading,
    message,
    refresh,
    verComprobante,
    cambiarEstado,
    urlComprobante,
    setUrlComprobante,
  };
}
