"use client";

import { useCallback, useState } from "react";
import { isAxiosError } from "axios";
import { borrarEstimacionCache } from "@/app/lib/estimacionesCache";
import { Propiedad } from "@/app/lib/types";
import api from "@/app/lib/api";

export interface PropertyFormState {
  titulo: string;
  descripcion: string;
  precio: string;
  tipo: string;
  ciudad: string;
  barrio: string;
  direccion: string;
  estrato: string;
  habitaciones: string;
  banos: string;
  area: string;
  antiguedad: string;
  parqueaderos: string;
  video: string;
}

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }

  return fallback;
};

export function usePropiedades(onCreated?: (id: string) => void) {
  const [initialData, setInitialData] = useState<Propiedad[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [editingPropiedad, setEditingPropiedad] = useState<Propiedad | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<"" | string>("");

  const showTempMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 4000);
  };

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get<Propiedad[]>("/propiedades/mis-propiedades");
      setInitialData(res.data);
      setIsSearching(false);
    } catch (error) {
      const fallback = "Error al cargar las propiedades";
      console.error(fallback, error);
      setError(getErrorMessage(error, fallback));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmitPropiedad = async (
    data: PropertyFormState,
    files: File[],
  ) => {
    setSaving(true);
    setMessage("");
    setError("");

    const camposRequeridos: (keyof PropertyFormState)[] = [
      "titulo",
      "descripcion",
      "precio",
      "ciudad",
      "barrio",
      "tipo",
      "habitaciones",
      "banos",
      "area",
      "antiguedad",
      "direccion",
      "estrato",
    ];

    for (const campo of camposRequeridos) {
      if (!data[campo] || String(data[campo]).trim() === "") {
        setError(`El campo "${campo}" es obligatorio`);
        setSaving(false);
        return;
      }
    }

    try {
      if (editingPropiedad) {
        const body = {
          titulo: data.titulo,
          descripcion: data.descripcion,
          precio: Number(data.precio),
          ciudad: data.ciudad,
          barrio: data.barrio,
          tipo: data.tipo,
          habitaciones: Number(data.habitaciones),
          banos: Number(data.banos),
          area: Number(data.area),
          antiguedad: Number(data.antiguedad),
          direccion: data.direccion,
          estrato: Number(data.estrato),
          parqueaderos: Number(data.parqueaderos),
          video: data.video || null,
        };

        await api.patch(`/propiedades/${editingPropiedad.id}`, body);
        showTempMessage("Propiedad actualizada correctamente");
      } else {
        const fd = new FormData();
        Object.entries(data).forEach(([k, v]) => {
          if (v !== "") fd.append(k, v);
        });
        files.forEach((f) => fd.append("fotografias", f));

        const res = await api.post("/propiedades", fd);
        onCreated?.(res.data.id);
        showTempMessage("Propiedad creada correctamente y enviada a revisión");
      }

      closeModal();
      await loadInitial();
    } catch (error) {
      const fallback = editingPropiedad
        ? "Error al actualizar la propiedad"
        : "Error al crear la propiedad";
      console.error(fallback, error);
      setError(getErrorMessage(error, fallback));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProperty = async (id: string) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar esta propiedad?",
    );
    if (!confirmar) return;

    setLoading(true);
    setError("");

    try {
      await api.delete(`/propiedades/${id}`);
      borrarEstimacionCache(id);
      setInitialData((prev) => prev.filter((p) => p.id !== id));
      showTempMessage("Propiedad eliminada correctamente");
    } catch (error) {
      const fallback = "Error al eliminar la propiedad";
      console.error(fallback, error);
      setError(getErrorMessage(error, fallback));
    } finally {
      setLoading(false);
    }
  };

  const handleDocumento = async (id: string, file: File, tipo: string) => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("documentos", file);
    formData.append("tipo", tipo);

    try {
      await api.post(`/propiedades/${id}/documentos`, formData);
      showTempMessage("Documento cargado correctamente");
      await loadInitial();
    } catch (error) {
      const fallback = "Error al cargar el documento";
      console.error(fallback, error);
      setError(getErrorMessage(error, fallback));
    } finally {
      setLoading(false);
    }
  };

  const handleDestacar = async (id: string, nuevoEstado: boolean) => {
    setLoading(true);
    setError("");

    try {
      const res = await api.patch(`/propiedades/${id}/destacada`, {
        destacada: nuevoEstado,
      });

      setInitialData((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, destacada: res.data.destacada } : p,
        ),
      );

      showTempMessage(
        nuevoEstado
          ? "Propiedad destacada correctamente ⭐"
          : "Propiedad retirada de destacadas",
      );
    } catch (error) {
      const fallback = "Error al actualizar propiedad destacada";
      console.error(fallback, error);
      setError(getErrorMessage(error, fallback));
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPropiedad(null);
    setModalOpen(true);
  };

  const openEdit = (propiedad: Propiedad) => {
    setEditingPropiedad(propiedad);
    setModalOpen(true);
  };

  const closeModal = () => {
    setEditingPropiedad(null);
    setModalOpen(false);
  };

  const handleSearchResult = (data: Propiedad[]) => {
    setInitialData(data);
    setIsSearching(true);
  };

  const handleSearchClear = () => {
    setIsSearching(false);
    loadInitial();
  };

  return {
    initialData,
    isSearching,
    loading,
    error,
    editingPropiedad,
    modalOpen,
    saving,
    message,
    loadInitial,
    openCreate,
    openEdit,
    closeModal,
    handleSubmitPropiedad,
    handleDeleteProperty,
    handleSearchResult,
    handleSearchClear,
    handleDocumento,
    handleDestacar,
  };
}
