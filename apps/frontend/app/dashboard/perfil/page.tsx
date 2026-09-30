"use client";

import { useState } from "react";
import { usePerfil } from "../views/hooks/usePerfil";
import { VerificacionCelular } from "./VerificarCelular";
import Image from "next/image";
import Link from "next/link";
import Button from "@/app/components/Button";

export default function PerfilEditar() {
  const [file, setFile] = useState<File | null>(null);
  const [nombres, setNombres] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [celular, setCelular] = useState<string>("");
  const [passwordActual, setPasswordActual] = useState<string>("");
  const [passwordNueva, setPasswordNueva] = useState<string>("");

  const {
    perfil,
    saving,
    error,
    success,
    actualizarPerfil,
    subirFoto,
    cambiarPassword,
    solicitarOtp,
    verificarOtp,
  } = usePerfil();

  const handleActualizarDatos = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...(nombres.trim() && { nombres: nombres.trim() }),
      ...(apellidos.trim() && { apellidos: apellidos.trim() }),
      ...(celular.trim() && { celular: celular.trim() }),
    };

    if (Object.keys(data).length > 0) {
      await actualizarPerfil(data);
    }
  };

  const handleSubirFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) await subirFoto(file);
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordActual && passwordNueva) {
      await cambiarPassword(passwordActual, passwordNueva);
      setPasswordActual("");
      setPasswordNueva("");
    }
  };

  return (
    <main className="min-h-screen py-10 px-4 flex items-center justify-center">
      <section className="relative flex flex-col gap-8 w-full max-w-3xl border border-gray-700/50 bg-gray-900/40 p-6 md:p-10 rounded-2xl shadow-xl backdrop-blur-sm">
        <Link
          href="/dashboard"
          className="absolute top-4 left-5 text-2xl hover:text-sky-400 hover:scale-105 transition"
          title="Volver al dashboard"
        >
          ⬅
        </Link>

        {success && (
          <div className="fixed top-5 right-5 z-50 bg-sky-950/90 border border-sky-500/60 text-sky-200 px-4 py-2 text-sm font-semibold rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <span>{success}</span>
            <span>👍</span>
          </div>
        )}
        {error && (
          <div className="fixed top-5 right-5 z-50 bg-red-950/90 border border-red-500/60 text-red-200 px-4 py-2 text-sm font-semibold rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
            <span>{error}</span>
            <span>⚠️</span>
          </div>
        )}

        <form
          onSubmit={handleSubirFoto}
          className="flex flex-col items-center gap-4"
        >
          <h2 className="text-center text-xl font-semibold tracking-wider">
            Foto de Perfil
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-6">
            {perfil?.foto ? (
              <Image
                src={perfil.foto}
                alt="Foto Perfil"
                width={120}
                height={120}
                unoptimized
                className="w-28 h-28 object-cover rounded-full border-2 border-sky-500/40"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center text-4xl text-gray-400">
                👤
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="file:cursor-pointer block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-slate-200 hover:file:bg-gray-700 transition"
            />
          </div>

          <Button
            title="Subir foto"
            type="submit"
            className="mx-auto text-sm"
            loading={saving}
            disabled={saving || !file}
          />
        </form>

        <hr className="border-gray-800" />

        <form
          onSubmit={handleActualizarDatos}
          className="text-center flex flex-col gap-4"
        >
          <h2 className="text-center text-xl font-semibold tracking-wider">
            Datos Personales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto w-full">
            <article className="flex flex-col gap-1">
              <label htmlFor="nombres" className="text-xs text-gray-400">
                Nombres
              </label>
              <input
                type="text"
                id="nombres"
                placeholder={perfil?.nombres || "Tus nombres"}
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </article>

            <article className="flex flex-col gap-1">
              <label htmlFor="apellidos" className="text-xs text-gray-400">
                Apellidos
              </label>
              <input
                type="text"
                id="apellidos"
                placeholder={perfil?.apellidos || "Tus apellidos"}
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </article>

            <article className="flex flex-col gap-1 sm:col-span-2">
              <label htmlFor="celular" className="text-xs text-gray-400">
                Celular
              </label>
              <input
                type="tel"
                id="celular"
                placeholder={perfil?.celular || "Ej. 3001234567"}
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </article>
          </div>

          <Button
            title="Actualizar Datos"
            type="submit"
            loading={saving}
            disabled={saving}
            className="mx-auto text-sm mt-2"
          />
        </form>

        {perfil?.celular && (
          <>
            <hr className="border-gray-800" />
            <VerificacionCelular
              celularVerificado={perfil.celularVerificado}
              celular={perfil.celular}
              onSolicitar={solicitarOtp}
              onVerificar={verificarOtp}
            />
          </>
        )}

        <hr className="border-gray-800" />

        <form
          onSubmit={handleCambiarPassword}
          className="text-center flex flex-col gap-4"
        >
          <h2 className="text-center text-xl font-semibold tracking-wider">
            Cambiar Contraseña
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-xl mx-auto w-full">
            <article className="flex flex-col gap-1">
              <label htmlFor="actual" className="text-xs text-gray-400">
                Contraseña actual
              </label>
              <input
                type="password"
                id="actual"
                placeholder="******"
                value={passwordActual}
                onChange={(e) => setPasswordActual(e.target.value)}
                className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </article>
            <article className="flex flex-col gap-1">
              <label htmlFor="nueva" className="text-xs text-gray-400">
                Contraseña nueva
              </label>
              <input
                type="password"
                id="nueva"
                placeholder="******"
                value={passwordNueva}
                onChange={(e) => setPasswordNueva(e.target.value)}
                className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </article>
          </div>

          <Button
            title="Cambiar Contraseña"
            type="submit"
            loading={saving}
            disabled={saving || !passwordActual || !passwordNueva}
            className="mx-auto text-sm mt-2"
          />
        </form>
      </section>
    </main>
  );
}
