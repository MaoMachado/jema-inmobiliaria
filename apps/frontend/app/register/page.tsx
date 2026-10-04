"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import { Register, RegisterFormData } from "./Register";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";

export default function RegisterPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmitRegister = async (
    e: React.FormEvent,
    data: RegisterFormData,
    confirmPassword: string,
    confirmEmail: string,
  ) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { nombres, apellidos, celular, email, password } = data;

    if (!email || !password || !nombres || !apellidos || !celular) {
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (email !== confirmEmail) {
      setError("Los correos no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        celular: celular.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      setSuccess(
        "¡Cuenta creada con éxito! Redirigiendo a inicio de sesión...",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Error al registrarse");
      } else {
        setError("Error inesperado al registrarse. Inténtalo más tarde.");
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
        <Register
          loading={loading}
          error={error}
          success={success}
          handleSubmitRegister={handleSubmitRegister}
        />
      </div>
      <Footer />
      <CookieBanner />
    </main>
  );
}
