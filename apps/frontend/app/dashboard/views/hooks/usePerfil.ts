"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import api from "@/app/lib/api";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }

  return fallback;
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
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const showTempMessage = (text: string) => {
    setSuccess(text);
    setTimeout(() => setSuccess(""), 4000);
  };

  const cargarPerfil = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get<PerfilData>("/usuarios/perfil");
      setPerfil(res.data);
    } catch (error) {
      setError(getErrorMessage(error, "Error al cargar perfil"));
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

    try {
      const res = await api.patch<PerfilData>("/usuarios/perfil", data);
      setPerfil(res.data);
      showTempMessage("Perfil actualizado correctamente");
    } catch (error) {
      setError(getErrorMessage(error, "Error al actualizar perfil"));
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

      const res = await api.post<{ fotoUrl: string }>(
        "/usuarios/foto",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      setPerfil((prev) => (prev ? { ...prev, foto: res.data.fotoUrl } : null));
      showTempMessage("Foto actualizada correctamente");
    } catch (error) {
      setError(getErrorMessage(error, "Error al subir foto"));
    } finally {
      setSaving(false);
    }
  };

  const cambiarPassword = async (actual: string, nueva: string) => {
    setSaving(true);
    setError("");

    try {
      await api.patch("/usuarios/password", { actual, nueva });
      showTempMessage("Contraseña actualizada correctamente");
    } catch (error) {
      setError(getErrorMessage(error, "Error al cambiar contraseña"));
    } finally {
      setSaving(false);
    }
  };

  const solicitarOtp = async (): Promise<boolean> => {
    setSaving(true);
    setError("");

    try {
      const res = await api.post<{ message: string }>("/otp/solicitar");
      showTempMessage(res.data.message || "Código OTP enviado correctamente");
      return true;
    } catch (error) {
      setError(getErrorMessage(error, "Error al solicitar OTP"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const verificarOtp = async (codigo: string): Promise<boolean> => {
    setSaving(true);
    setError("");

    try {
      const res = await api.post<{ message: string }>("/otp/verificar", {
        codigo,
      });
      setPerfil((prev) => (prev ? { ...prev, celularVerificado: true } : prev));
      showTempMessage(res.data.message || "Celular verificado exitosamente");
      return true;
    } catch (error) {
      setError(getErrorMessage(error, "Error al verificar OTP"));
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPerfil();
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
