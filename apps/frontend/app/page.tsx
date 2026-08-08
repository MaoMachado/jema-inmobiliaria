"use client";

import api from "./lib/api";
import { Login } from "./page/Login";
import { Register } from "./page/Register";
import { useState } from "react";

export default function Home() {
  const [type, setType] = useState<"register" | "login">("register");
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
      const response = await api.post("/auth/login", { email, password });
      if (!response.data.token) {
        throw new Error("Token no proporcionado en la respuesta");
      }

      localStorage.setItem("access_token", response.data.token);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError("Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegister = async (
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
      await api.post("/auth/register", { email, password });
      setSuccess("Te registraste, ahora inicia sesión");
      setType("login");
    } catch (error) {
      console.error("Error al registrarse:", error);
      setError("Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

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
