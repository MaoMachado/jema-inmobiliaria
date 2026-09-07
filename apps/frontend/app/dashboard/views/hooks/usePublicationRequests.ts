"use client";

import api from "@/app/lib/api";
import { useState } from "react";
import { Propiedad } from "@/app/lib/types";

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? fallback;

export function usePublicationReq() {
  const [pendientes, setPendientes] = useState<Propiedad[]>([]);
  const [motivoModal, setMotivoModal] = useState<string | null>(null);
  const [motivo, setMotivo] = useState("");
  const [motivoError, setMotivoError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const fetchPendientes = async () => {
    setLoading(true);

    try {
      const res = await api.get<Propiedad[]>("/propiedades/pendientes");
      setPendientes(res.data);
    } catch (error) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al cargar las solicitudes"),
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
        tipo: "ok",
        texto: "Propiedad aprobada",
      });
    } catch (error: any) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al aprobar la propiedad"),
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
        tipo: "ok",
        texto: "Propiedad rechazada",
      });
    } catch (error: any) {
      setMessage({
        tipo: "error",
        texto: getErrorMessage(error, "Error al rechazar la propiedad"),
      });
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => fetchPendientes();

  return {
    pendientes,
    loading,
    message,
    refresh,
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
