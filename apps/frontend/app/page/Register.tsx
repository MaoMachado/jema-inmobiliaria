"use client";

import { useState } from "react";

type Type = "register" | "login";

interface FormRegisterProps {
  type: Type;
  loading: boolean;
  error: string;
  setType: (type: Type) => void;
  handleSubmitRegister: (
    e: React.FormEvent,
    email: string,
    password: string,
  ) => void;
}

export function Register({
  type,
  setType,
  loading,
  error,
  handleSubmitRegister,
}: FormRegisterProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => handleSubmitRegister(e, email, password)}
      className="max-w-lg bg-cyan-800/20 backdrop-blur-lg p-8 mx-auto mt-20 rounded-xl relative"
    >
      <div className="w-20 h-20 bg-red-900/50 -z-10 left-50 -top-5 absolute rounded-full blur-xl" />
      <h1 className="mb-6 text-center text-4xl font-bold">Registrarse</h1>
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
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        <p className="text-center">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            disabled={loading}
            onClick={() => setType("login")}
            className="bg-blue-800/20 hover:bg-blue-800/40 transition-all py-2 px-4 rounded-xl font-bold tracking-wider cursor-pointer"
          >
            Inicia sesión
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
