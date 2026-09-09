"use client";

import { useState } from "react";
import Button from "@/app/components/Button";
import Link from "next/link";
import { usePerfil } from "../views/hooks/usePerfil";

export default function PerfilEditar() {
  const [file, setFile] = useState<File | null>(null);
  const [nombres, setNombres] = useState<string>("");
  const [apellidos, setApellidos] = useState<string>("");
  const [celular, setCelular] = useState<string>("");
  const [passwordActual, setPasswordActual] = useState<string>("");
  const [passwordNueva, setPasswordNueva] = useState<string>("");

  const {
    perfil,
    loading,
    saving,
    error,
    success,
    actualizarPerfil,
    subirFoto,
    cambiarPassword,
  } = usePerfil();

  const handleActualizarDatos = async () => {
    const data = {
      ...(nombres && { nombres }),
      ...(apellidos && { apellidos }),
      ...(celular && { celular }),
    };

    await actualizarPerfil(data);
  };

  const handleSubirFoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (file) await subirFoto(file);
  };

  const handleCambiarPassword = async () => {
    if (passwordActual && passwordNueva) {
      await cambiarPassword(passwordActual, passwordNueva);
    }
  };

  return (
    <main className="h-dvh place-content-center">
      <section className="relative flex flex-col justify-center max-w-3xl mx-auto border border-gray-400/50 bg-gray-400/10 p-10 rounded-lg">
        <Link
          href="/dashboard"
          className="absolute top-3 left-5 text-3xl hover:text-sky-600 hover:scale-105 transition"
        >
          ⬅
        </Link>

        <form onSubmit={handleSubirFoto} className="flex flex-col gap-6 mb-10">
          <h2 className="text-center text-2xl font-semibold tracking-wider">
            Foto Perfil
          </h2>

          <div className="flex flex-wrap justify-center items-center gap-6">
            <img
              src={perfil?.foto ?? "https://placehold.co/600x400?text=Foto"}
              alt="Foto Perfil"
              className="rounded-full max-w-25"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="file:cursor-pointer block text-sm text-gray-500s file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-slate-200 hover:file:bg-gray-700/50"
            />
          </div>

          <Button
            title="Subir foto"
            type="submit"
            className="mx-auto"
            loading={saving}
            disabled={saving}
          />
          {success && (
            <p className="ml-auto bg-sky-600/20 w-fit p-1 text-sm font-semibold rounded-lg">
              {success} 👍
            </p>
          )}
        </form>

        <form
          onSubmit={handleActualizarDatos}
          className="text-center flex flex-col gap-6 mb-10"
        >
          <h2 className="text-center text-2xl font-semibold tracking-wider">
            Datos Personales
          </h2>

          <article>
            <label htmlFor="nombres">Nombres </label>
            <input
              type="text"
              id="nombres"
              placeholder={perfil?.nombres}
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="px-3 py-1 border-2 border-gray-800/50 rounded-lg focus:outline-0 focus:border-gray-800"
            />
          </article>

          <article>
            <label htmlFor="apellidos">Apellidos </label>
            <input
              type="text"
              id="apellidos"
              placeholder={perfil?.apellidos}
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              className="px-3 py-1 border-2 border-gray-800/50 rounded-lg focus:outline-0 focus:border-gray-800"
            />
          </article>

          <article className="text-center">
            <label htmlFor="celular" className="mr-4">
              Celular{" "}
            </label>
            <input
              type="text"
              id="celular"
              placeholder={perfil?.celular}
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              className="px-3 py-1 border-2 border-gray-800/50 rounded-lg focus:outline-0 focus:border-gray-800"
            />
          </article>

          <Button
            title="Actualizar Datos"
            type="submit"
            loading={saving}
            disabled={saving}
            className="mx-auto"
          />
        </form>

        <form
          onSubmit={handleCambiarPassword}
          className="text-center flex flex-col gap-6 mb-10"
        >
          <h2 className="text-center text-2xl font-semibold tracking-wider">
            Cambiar Contraseña
          </h2>
          <article>
            <label htmlFor="actual">Contraseña actual </label>
            <input
              type="password"
              id="actual"
              placeholder="******"
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              className="px-3 py-1 border-2 border-gray-800/50 rounded-lg focus:outline-0 focus:border-gray-800"
            />
          </article>
          <article>
            <label htmlFor="nueva">Contraseña nueva </label>
            <input
              type="password"
              id="nueva"
              placeholder="******"
              value={passwordNueva}
              onChange={(e) => setPasswordNueva(e.target.value)}
              className="px-3 py-1 border-2 border-gray-800/50 rounded-lg focus:outline-0 focus:border-gray-800"
            />
          </article>

          <Button
            title="Cambiar Contraseña"
            type="submit"
            loading={saving}
            disabled={saving}
            className="mx-auto"
          />
        </form>
      </section>

      {error && <p>{error}</p>}
    </main>
  );
}
