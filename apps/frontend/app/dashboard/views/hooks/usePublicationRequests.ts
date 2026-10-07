"use client";

import { isAxiosError } from "axios";
import { useState } from "react";
import { Propiedad } from "@/app/lib/types";
import api from "@/app/lib/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }

  return fallback;
};

export function usePublicationReq() {
  const [pendientes, setPendientes] = useState<Propiedad[]>([]);
  const [motivoModal, setMotivoModal] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<string>("");
  const [motivoError, setMotivoError] = useState<boolean>(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "ok" | "error";
    text: string;
  } | null>(null);

  const fetchPendientes = async () => {
    setLoading(true);

    try {
      const res = await api.get<Propiedad[]>("/propiedades/pendientes");
      setPendientes(res.data);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Error al cargar las solicitudes"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async (id: string) => {
    setLoading(true);
    setMessage(null);

    try {
      await api.patch(`/propiedades/${id}/aprobar`);
      setPendientes((prev) => prev.filter((p) => p.id !== id));
      setMessage({
        type: "ok",
        text: "Propiedad aprobada",
      });
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Error al aprobar la propiedad"),
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmarRechazo = async () => {
    if (!motivoModal) return;
    if (!motivo.trim()) {
      setMotivoError(true);
      return;
    }

    setPendingId(motivoModal);
    setMessage(null);

    try {
      await api.patch(`/propiedades/${motivoModal}/rechazar`, {
        motivoRechazo: motivo.trim(),
      });

      setPendientes((prev) => prev.filter((p) => p.id !== motivoModal));
      setMotivoModal(null);
      setMotivo("");
      setMotivoError(false);
      setMessage({
        type: "ok",
        text: "Propiedad rechazada",
      });
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: getErrorMessage(error, "Error al rechazar la propiedad"),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    pendientes,
    loading,
    message,
    refresh: fetchPendientes,
    handleAprobar,
    confirmarRechazo,
    motivoError,
    pendingId,
    motivoModal,
    setMotivoModal,
    setMotivo,
    setMotivoError,
    motivo,
  };
}
