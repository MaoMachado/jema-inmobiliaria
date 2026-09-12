"use client";

import { useState } from "react";
import api from "../lib/api";
import { Reporte } from "../lib/types";

export const useReporteFraude = () => {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [filtro, setFiltro] = useState<string>("ABIERTO");
  const [propiedadId, setPropiedadId] = useState("");
  const [openReporteModal, setOpenReporteModal] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const openModalReport = (id: string) => {
    setPropiedadId(id);
    setMessage("");
    setOpenReporteModal(true);
  };

  const closeModalReport = () => {
    setOpenReporteModal(false);
    setMessage("");
  };

  const handleEnviarReporte = async (
    motivo: string,
    descripcion: string,
    id: string,
  ) => {
    if (!motivo) {
      setMessage("Se necesita el motivo para enviar el reporte");
      return;
    }

    if (!localStorage.getItem("access_token")) {
      setMessage("Inicia sesión para enviar un reporte");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.post("/reportes-fraude", {
        motivo,
        descripcion,
        propiedadId: id,
      });
      setMessage("Reporte Enviado");
      setOpenReporteModal(false);
    } catch {
      setMessage("Error al enviar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const loadReportes = async () => {
    setLoading(true);

    try {
      const res = await api.get("/reportes-fraude");
      setReportes(res.data);
    } catch (error) {
      console.error("Error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id: string, estado: string) => {
    try {
      await api.patch(`/reportes-fraude/${id}`, { estado });
      setReportes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, estado } : r)),
      );
    } catch (error) {
      console.error("error", error);
    }
  };

  const filtrados = reportes.filter(
    (r) => filtro === "TODOS" || r.estado === filtro,
  );

  return {
    filtro,
    setFiltro,
    loadReportes,
    handleCambiarEstado,
    filtrados,
    openModalReport,
    closeModalReport,
    handleEnviarReporte,
    propiedadId,
    message,
    loading,
    openReporteModal,
  };
};
