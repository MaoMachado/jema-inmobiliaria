"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/app/lib/api";

export interface PlanInfo {
  plan: "GRATIS" | "BASICO" | "PREMIUM";
  propiedadesLimite: number;
  chatIaLimite: number;
  planVence: string | null;
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
  referencia?: string | null;
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
  const [pagando, setPagando] = useState<boolean>(false);
  const [telefono, setTelefono] = useState<string>("");
  const [comprobantePath, setComprobantePath] = useState<string | null>(null);
  const [referencia, setReferencia] = useState<string>("");
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
    if (!planSeleccionado) return;

    const referenciaLimpia = referencia.trim();
    if (!comprobantePath && !referenciaLimpia) {
      showTempMessage(
        "Pega la referencia del pago de Nequi o adjunta el comprobante",
      );
      return;
    }

    setLoading(true);

    try {
      const precio = planSeleccionado === "BASICO" ? 15000 : 30000;

      await api.post("/pagos", {
        monto: precio,
        plan: planSeleccionado,
        comprobante: comprobantePath,
        referencia: referenciaLimpia || undefined,
      });

      showTempMessage("Pago enviado, pendiente de verificación");

      setPlanSeleccionado(null);
      setComprobantePath(null);
      setReferencia("");
    } catch (error) {
      showTempMessage(getErrorMessage(error, "Error al registrar el pago"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Flujo automático: crea el pago en el backend, Wompi envía el push de Nequi
   * al celular del usuario y el backend activa el plan con el webhook.
   * Como Nequi es asíncrono, preguntamos el estado del pago hasta resolver.
   */
  const pagarConNequi = async (numero: string): Promise<boolean> => {
    if (!planSeleccionado) return false;

    setPagando(true);

    try {
      const { data } = await api.post<{ pagoId: string }>(
        "/pagos/wompi/nequi",
        { plan: planSeleccionado, telefono: numero },
      );

      showTempMessage("Acepta el pago en la app de Nequi de tu celular");

      for (let intento = 0; intento < 20; intento++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const { data: pago } = await api.get<{ estado: string }>(
          `/pagos/${data.pagoId}`,
        );

        if (pago.estado !== "PENDIENTE") {
          showTempMessage(
            pago.estado === "APROBADO"
              ? "¡Pago aprobado! Tu plan ya está activo"
              : "El pago fue rechazado. Intenta de nuevo",
          );

          setPlanSeleccionado(null);
          await load();
          return pago.estado === "APROBADO";
        }
      }

      showTempMessage(
        "Seguimos esperando la confirmación de Nequi. Revisa tu historial en unos minutos.",
      );
      return false;
    } catch (error) {
      showTempMessage(getErrorMessage(error, "Error al iniciar el pago"));
      return false;
    } finally {
      setPagando(false);
    }
  };

  return {
    planInfo,
    historial,
    loading,
    subiendo,
    pagando,
    telefono,
    setTelefono,
    pagarConNequi,
    comprobantePath,
    referencia,
    setReferencia,
    planSeleccionado,
    setPlanSeleccionado,
    handleSubirComprobante,
    handleSolicitar,
    message,
    refresh: load,
  };
}
