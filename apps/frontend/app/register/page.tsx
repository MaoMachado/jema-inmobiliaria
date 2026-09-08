"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/api";
import { Register } from "./Register";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmitRegister = async (
    e: React.FormEvent,
    nombres: string,
    apellidos: string,
    celular: string,
    email: string,
    password: string,
    confirmPassword: string,
    confirmEmail: string,
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password || !nombres || !apellidos || !celular) {
      setLoading(false);
      setError("Todos los campos son obligatorios");
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setLoading(false);
      setError("Las contraseñas no coinciden");
      return;
    }

    if (email !== confirmEmail) {
      setLoading(false);
      setError("Los correos no coinciden");
      return;
    }

    try {
      await api.post("/auth/register", {
        nombres,
        apellidos,
        celular,
        email,
        password,
      });

      setSuccess("Te registraste, ahora inicia sesión");
    } catch (error) {
      console.error("Error al registrarse:", error);
      const msg = (error as any)?.response?.data?.message;
      setError(msg ?? "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) setTimeout(() => setSuccess(""), 3000);
    if (error) setTimeout(() => setError(""), 3000);
  }, [error, success]);

  return (
    <main>
      <Register
        type="register"
        loading={loading}
        error={error}
        setType={() => router.push("/login")}
        handleSubmitRegister={handleSubmitRegister}
      />
    </main>
  );
}
