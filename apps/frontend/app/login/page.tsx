"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/api";
import { Login } from "./Login";

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
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      setError("Todos los campos son obligatorios");
      return;
    }

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
      router.push("/dashboard");
      setSuccess("Inicio de sesión exitoso");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const msg = (error as any)?.response?.data?.message;
      setError(msg ?? "Credenciales incorrectas");
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
      <Login
        type="login"
        loading={loading}
        error={error}
        success={success}
        setType={() => router.push("/register")}
        handleSubmitLogin={handleSubmitLogin}
      />
    </main>
  );
}
