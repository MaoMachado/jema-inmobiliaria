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
    nombres: string,
    apellidos: string,
    celular: string,
    email: string,
    password: string,
    confirmPassword: string,
    confirmEmail: string,
    foto?: string,
  ) => void;
}

export function Register({
  setType,
  loading,
  error,
  handleSubmitRegister,
}: FormRegisterProps) {
  const [nombres, setNombres] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [celular, setCelular] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [confirmEmail, setConfirmEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  return (
    <form
      onSubmit={(e) =>
        handleSubmitRegister(
          e,
          nombres,
          apellidos,
          celular,
          email,
          password,
          confirmPassword,
          confirmEmail,
        )
      }
      className="max-w-lg bg-cyan-800/20 backdrop-blur-lg p-8 mx-auto mt-20 rounded-xl relative"
    >
      <div className="w-20 h-20 bg-red-900/50 -z-10 left-50 -top-5 absolute rounded-full blur-xl" />

      <h1 className="mb-6 text-center text-4xl font-bold">Registrarse</h1>

      <div className="flex flex-col gap-4">
        {/* Nombre - Apellidos */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="nombres">Nombres</label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="John"
              className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
            />
          </div>

          <div>
            <label htmlFor="apellidos">Apellidos</label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Doe"
              className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
            />
          </div>
        </div>

        {/* correo - confirmar correo */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john_doe@tucorreo.com"
              className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
            />
          </div>

          <div>
            <label htmlFor="confirmEmail">Confirmar Correo Electrónico</label>
            <input
              type="email"
              id="confirmEmail"
              name="confirmEmail"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="john_doe@tucorreo.com"
              className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
            />
          </div>
        </div>

        {/* contraseña - confirmar contraseña */}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <label htmlFor="password">Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*****"
              className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2 top-1/2"
            >
              {showPassword ? "👍" : "👎"}
            </button>
          </div>

          <div className="relative">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="*****"
              className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-2 top-1/2"
            >
              {showConfirmPassword ? "👍" : "👎"}
            </button>
          </div>
        </div>

        {/* celular - foto */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="celular">Celular</label>
            <input
              type="text"
              id="celular"
              name="celular"
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="+57 000 000 00 00"
              className="w-full rounded-lg border border-gray-600 px-4 py-2 focus:border-none focus:outline-none focus:ring-1 focus:ring-cyan-800"
            />
          </div>
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
