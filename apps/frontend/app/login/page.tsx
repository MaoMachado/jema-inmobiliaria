"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { Login } from "./Login";
import api from "@/app/lib/api";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";

export default function LoginPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pideCodigo, setPideCodigo] = useState(false);
  const [usarRecuperacion, setUsarRecuperacion] = useState(false);

  const router = useRouter();

  const handleSubmitLogin = async (
    e: React.FormEvent,
    email: string,
    password: string,
    codigo: string,
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (pideCodigo && !codigo) {
      setError("Ingresa el código");
      return;
    }

    setLoading(true);

    try {
      await api.post(
        "/auth/login",
        usarRecuperacion
          ? { email, password, codigoRecuperacion: codigo }
          : { email, password, ...(codigo && { codigo }) },
      );
      setSuccess("Inicio de sesión exitoso");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: unknown) {
      const mensaje = isAxiosError(error)
        ? error.response?.data?.message
        : undefined;

      if (typeof mensaje === "string" && mensaje.startsWith("TOTP_REQUIRED")) {
        setPideCodigo(true);
        setError("Ingresa el código de tu app autenticadora");
        return;
      }

      setError(
        typeof mensaje === "string"
          ? mensaje
          : "Credenciales inválidas. Verifica tu correo y contraseña.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center py-10">
        <Login
          loading={loading}
          error={error}
          success={success}
          pideCodigo={pideCodigo}
          usarRecuperacion={usarRecuperacion}
          onRecuperacion={() => {
            setUsarRecuperacion((prev) => !prev);
            setError("");
          }}
          handleSubmitLogin={handleSubmitLogin}
        />
      </div>
      <Footer />
      <CookieBanner />
    </main>
  );
}
