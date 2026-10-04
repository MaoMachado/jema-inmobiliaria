"use client";

import Link from "next/link";
import { useState } from "react";

type Type = "register" | "login";

export interface RegisterFormData {
  nombres: string;
  apellidos: string;
  celular: string;
  email: string;
  password: string;
}

interface FormRegisterProps {
  loading: boolean;
  error: string;
  success: string;

  handleSubmitRegister: (
    e: React.FormEvent,
    data: RegisterFormData,
    confirmEmail: string,
    confirmPassword: string,
  ) => void;
}

export function Register({
  loading,
  error,
  success,
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

  const onSubmit = (e: React.FormEvent) => {
    handleSubmitRegister(
      e,
      { nombres, apellidos, celular, email, password },
      confirmEmail,
      confirmPassword,
    );
  };

  return (
    <section className="w-full max-w-xl mx-auto p-4 sm:p-6">
      <div className="relative bg-gray-900/90 border border-gray-800 p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-md space-y-6">

      <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="px-2 py-1 rounded-xl hover:bg-sky-400 font-bold text-lg transition cursor-pointer"
          >
            ←
          </Link>
        </div>

        <header className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Crear Cuenta
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Regístrate en{" "}
            <span className="text-sky-400 font-semibold">JEMA</span>
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"
          >
            <span className="shrink-0 text-base">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2"
          >
            <span className="shrink-0 text-base">✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="nombres"
                className="block text-xs font-semibold text-gray-300"
              >
                Nombres
              </label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                aria-label="Nombres"
                autoComplete="given-name"
                autoFocus
                required
                value={nombres}
                placeholder="Escribe tus nombres"
                onChange={(e) => setNombres(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="apellidos"
                className="block text-xs font-semibold text-gray-300"
              >
                Apellidos
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                aria-label="Apellidos"
                autoComplete="family-name"
                required
                value={apellidos}
                placeholder="Escribe tus apellidos"
                onChange={(e) => setApellidos(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="celular"
                className="block text-xs font-semibold text-gray-300"
              >
                Celular (WhatsApp)
              </label>
              <input
                type="tel"
                id="celular"
                name="celular"
                aria-label="Celular"
                autoComplete="tel"
                required
                value={celular}
                placeholder="300 123 4567"
                onChange={(e) => setCelular(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-gray-300"
              >
                Correo
              </label>
              <input
                type="email"
                id="email"
                name="email"
                aria-label="Correo"
                autoComplete="email"
                required
                placeholder="Escribe tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmEmail"
                className="block text-xs font-semibold text-gray-300"
              >
                Confirmar Correo
              </label>
              <input
                type="email"
                id="confirmEmail"
                name="confirmEmail"
                aria-label="Confirmar Correo"
                autoComplete="confirmEmail"
                required
                placeholder="Escribe tu correo"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  aria-label="Contraseña"
                  autoComplete="new-password"
                  required
                  placeholder="Escribe tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-gray-300"
              >
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  aria-label="Confirmar Contraseña"
                  autoComplete="new-password"
                  required
                  placeholder="Escribe tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar contraseña"
                      : "Ver contraseña"
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-gray-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer mt-2"
          >
            {loading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-800/80">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-sky-400 hover:text-sky-300 font-semibold transition"
          >
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </section>
  );
}
