"use client";

import api from "@/app/lib/api";
import { Propiedad } from "@/app/lib/types";
import { useState } from "react";

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message ?? fallback;
};

export function usePropiedades() {
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

  const loadInitial = async () => {
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

  const handleSubmitPropiedad = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const formData = new FormData(e.currentTarget);

    const isEmpty = (v: FormDataEntryValue | null) =>
      v === "" || v === null || v === undefined;

    if (
      isEmpty(formData.get("titulo")) ||
      isEmpty(formData.get("descripcion")) ||
      isEmpty(formData.get("precio")) ||
      isEmpty(formData.get("ciudad")) ||
      isEmpty(formData.get("barrio")) ||
      isEmpty(formData.get("tipo")) ||
      isEmpty(formData.get("habitaciones")) ||
      isEmpty(formData.get("banos")) ||
      isEmpty(formData.get("area")) ||
      isEmpty(formData.get("antiguedad")) ||
      isEmpty(formData.get("direccion")) ||
      isEmpty(formData.get("estrato"))
    ) {
      setError("Todos los campos son obligatorios");
      setSaving(false);
      return;
    }

    try {
      if (editingPropiedad) {
        const body = {
          titulo: String(formData.get("titulo")),
          descripcion: String(formData.get("descripcion")),
          precio: Number(formData.get("precio")),
          ciudad: String(formData.get("ciudad")),
          barrio: String(formData.get("barrio")),
          tipo: String(formData.get("tipo")),
          habitaciones: Number(formData.get("habitaciones")),
          banos: Number(formData.get("banos")),
          area: Number(formData.get("area")),
          antiguedad: Number(formData.get("antiguedad")),
          direccion: String(formData.get("direccion")),
          estrato: Number(formData.get("estrato")),
        };
        await api.patch(`/propiedades/${editingPropiedad.id}`, body);
      } else {
        await api.post("/propiedades", formData);
      }

      closeModal();
      loadInitial();
      setMessage(
        editingPropiedad
          ? "Propiedad actualizada correctamente"
          : "Propiedad creada correctamente",
      );

      setTimeout(() => {
        setMessage("");
      }, 5000);
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
      loadInitial();
      setMessage("Propiedad eliminada correctamente");
    } catch (error) {
      const fallback = "Error al eliminar la propiedad";
      console.error(fallback, error);
      setError(getErrorMessage(error, fallback));
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResult = (data: Propiedad[]) => {
    setInitialData(data);
    setIsSearching(true);
  };

  const handleSearchClear = () => {
    setIsSearching(false);
    loadInitial();
  };

  const handleDocumento = async (id: string, file: File, tipo: string) => {
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("documentos", file);
    formData.append("tipo", tipo);

    try {
      await api.post(`/propiedades/${id}/documentos`, formData);
      setMessage("Documento cargado correctamente");
      loadInitial();
      setTimeout(() => setMessage(""), 5000);
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

      setMessage(
        nuevoEstado
          ? "Propiedad destacada correctamente ⭐"
          : "Propiedad retirada de destacadas",
      );
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      const fallback = "Error al actualizar propiedad destacada";
      console.error(fallback, error);
      const errorMsg = getErrorMessage(error, fallback);
      setError(errorMsg);
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
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
