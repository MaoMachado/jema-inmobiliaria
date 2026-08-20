"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "./lib/api";
import { Login } from "./page/Login";
import { Register } from "./page/Register";

export default function Home() {
  const router = useRouter();

  const [type, setType] = useState<"register" | "login">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      const msg = (error as any)?.response?.data?.message;
      setError(msg ?? "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

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

      setType("login");
    } catch (error) {
      console.error("Error al registrarse:", error);
      const msg = (error as any)?.response?.data?.message;
      setError(msg ?? "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess("");
      }, 5000);
    }

    if (error) {
      setTimeout(() => {
        setError("");
      }, 5000);
    }
  });

  return (
    <main>
      {type === "register" ? (
        <Register
          type="register"
          setType={setType}
          loading={loading}
          error={error}
          handleSubmitRegister={handleSubmitRegister}
        />
      ) : (
        <Login
          type="login"
          setType={setType}
          loading={loading}
          error={error}
          success={success}
          handleSubmitLogin={handleSubmitLogin}
        />
      )}
    </main>
  );
}
