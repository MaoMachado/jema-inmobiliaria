"use client";

import Link from "next/link";
import { useState } from "react";

interface FormLoginProps {
  loading: boolean;
  error: string;
  success: string;

  handleSubmitLogin: (
    e: React.FormEvent,
    email: string,
    password: string,
  ) => void;
}

export function Login({
  loading,
  error,
  success,
  handleSubmitLogin,
}: FormLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className="w-full max-w-md mx-auto p-4 sm:p-6">
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
            Iniciar Sesión
          </h1>

          <p className="text-xs sm:text-sm text-gray-400">
            Ingresa tu cuenta de{" "}
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

        <form
          onSubmit={(e) => handleSubmitLogin(e, email, password)}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-gray-300"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full bg-gray-950 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3.5 py-2.5 pr-10 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition cursor-pointer"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-gray-950 font-bold text-xs rounded-xl shadow-md transition cursor-pointer mt-2"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-400 border-t border-gray-800/80">
          ¿No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-sky-400 hover:text-sky-300 font-semibold transition"
          >
            Regístrate aquí
          </Link>
        </div>
      </div>
    </section>
  );
}
