"use client";

import api from "@/app/lib/api";
import { useCallback, useEffect, useState } from "react";

const getErrorMessage = (error: unknown, fallback: string) => {
  const e = error as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
};

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
    setLoading(true);

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
    } catch (error) {
      const fallback = getErrorMessage(error, "Error al actualizar");
      setError(fallback);
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
    } catch (error) {
      const fallback = getErrorMessage(error, "Error al subir foto");
      setError(fallback);
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
    } catch (error) {
      const fallback = getErrorMessage(error, "Error al cambiar contraseña");
      setError(fallback);
    } finally {
      setSaving(false);
    }
  };

  const solicitarOtp = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/otp/solicitar");
      setSuccess(res.data.message);
      return true;
    } catch (error) {
      const fallback = getErrorMessage(error, "Error al solicitar OTP");
      setError(fallback);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const verificarOtp = async (codigo: string) => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/otp/verificar", { codigo });
      setPerfil((prev) => (prev ? { ...prev, celularVerificado: true } : prev));
      setSuccess(res.data.message);
      return true;
    } catch (error) {
      const fallback = getErrorMessage(error, "Error al verificar OTP");
      setError(fallback);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    solicitarOtp,
    verificarOtp,
  };
}
