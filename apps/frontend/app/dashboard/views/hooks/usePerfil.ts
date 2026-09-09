"use client";

import api from "@/app/lib/api";
import { useCallback, useEffect, useState } from "react";

interface PerfilData {
  id: string;
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  foto: string | null;
  celularVerificado: boolean;
  documentoVerificado: boolean;
}

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const cargarPerfil = useCallback(async () => {
    // setLoading(true);

    try {
      const res = await api.get("/usuarios/perfil");
      setPerfil(res.data);
    } catch {
      setError("Error al cargar perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarPerfil = async (data: {
    nombres?: string;
    apellidos?: string;
    celular?: string;
  }) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.patch("/usuarios/perfil", data);
      setPerfil(res.data);
      setSuccess("Perfil actualizado");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error al actualizar");
    } finally {
      setSaving(false);
    }
  };

  const subirFoto = async (file: File) => {
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("foto", file);

      const res = await api.post("/usuarios/foto", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPerfil((prev) => (prev ? { ...prev, foto: res.data.fotoUrl } : null));
      setSuccess("Foto actualizada");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error al subir foto");
    } finally {
      setSaving(false);
    }
  };

  const cambiarPassword = async (actual: string, nueva: string) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.patch("/usuarios/password", { actual, nueva });
      setSuccess("Contraseña actualizada");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void cargarPerfil();
  }, [cargarPerfil]);

  return {
    perfil,
    loading,
    saving,
    error,
    success,
    actualizarPerfil,
    subirFoto,
    cambiarPassword,
  };
}
