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

  const router = useRouter();

  const handleSubmitLogin = async (
    e: React.FormEvent,
    email: string,
    password: string,
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Todos los campos son obligatorios");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        { email, password },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.data.token) {
        throw new Error("Token no proporcionado en la respuesta");
      }

      localStorage.setItem("access_token", response.data.token);
      setSuccess("Inicio de sesión exitoso");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        setError(
          error.response?.data?.message ??
            "Credenciales inválidas. Verifica tu correo y contraseña.",
        );
      } else {
        setError("Error al iniciar sesión. Inténtalo de nuevo.");
      }
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
          handleSubmitLogin={handleSubmitLogin}
        />
      </div>
      <Footer />
      <CookieBanner />
    </main>
  );
}
