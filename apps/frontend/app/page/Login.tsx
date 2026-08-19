"use client";

import { useState } from "react";

interface FormLoginProps {
  type: "register" | "login";
  loading: boolean;
  error: string;
  success: string;
  setType: (type: "register" | "login") => void;
  handleSubmitLogin: (
    e: React.FormEvent,
    email: string,
    password: string,
  ) => void;
}

export function Login({
  setType,
  loading,
  error,
  success,
  handleSubmitLogin,
}: FormLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => handleSubmitLogin(e, email, password)}
      className="max-w-lg bg-cyan-800/20 backdrop-blur-lg p-8 mx-auto mt-20 rounded-xl relative"
    >
      <div className="w-20 h-20 bg-red-900/50 -z-10 left-50 -top-5 absolute rounded-full blur-xl" />
      <h1 className="mb-6 text-center text-4xl font-bold">Inicio de Sesión</h1>

      {success && (
        <p className="absolute -bottom-15 left-1/2 -translate-x-1/2 bg-green-500/20 py-2 text-center w-full rounded-xl">
          {success}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-800/20 hover:bg-blue-800/40 transition-all py-2 rounded-xl font-bold tracking-wider cursor-pointer"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>
        <p className="text-center">
          ¿No tienes cuenta?{" "}
          <button
            type="button"
            disabled={loading}
            onClick={() => setType("register")}
            className="bg-blue-800/20 hover:bg-blue-800/40 transition-all py-2 px-4 rounded-xl font-bold tracking-wider cursor-pointer"
          >
            Regístrate
          </button>
        </p>
      </div>
      {error && (
        <p className="absolute -bottom-15 left-1/2 -translate-x-1/2 bg-red-500/20 py-2 text-center w-full rounded-xl">
          {error}
        </p>
      )}
    </form>
  );
}
