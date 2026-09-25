"use client";

import { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Propiedad } from "@/app/lib/types";
import api from "@/app/lib/api";
import CarruselPropiedad from "./components/CarruselPropiedad";
import BotonWhatsApp from "./components/BotonWhatsApp";

const MapaPropiedad = dynamic(() => import("./components/MapaPropiedad"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-800/40 rounded-2xl animate-pulse flex items-center justify-center text-gray-500 border border-gray-700/50">
      <span>Cargando Mapa Interactivo...</span>
    </div>
  ),
});

export default function PropiedadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [propiedad, setPropiedad] = useState<Propiedad | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPropiedad = async () => {
      try {
        const res = await api.get<Propiedad>(`/propiedades/${id}`);
        setPropiedad(res.data);
      } catch (error: any) {
        setError(error.response?.data?.message || "Propiedad No Encontrada");
      } finally {
        setLoading(false);
      }
    };

    fetchPropiedad();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-7xl w-full mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-1/3" />
          <div className="h-112.5 w-full bg-gray-800 rounded-2xl " />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-64 bg-gray-800 rounded-2xl" />
            <div className="h-64 bg-gray-800 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !propiedad) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <span className="text-6xl">🏚️</span>
        <h1 className="text-2xl font-bold text-red-400">
          {error || "Propiedad no encontrada"}
        </h1>
        <p className="text-gray-400">
          La propiedad que estás buscando no existe o no se encuentra
          disponible.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 text-sky-400 hover:text-sky-300 font-semibold"
        >
          ⬅️ Volver a buscar propiedades
        </Link>
      </main>
    );
  }

  const precioCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(propiedad.precio);

  const getEmbedVideoUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "www.youtube.com/embed/");
    }
    return url;
  };

  const embedVideo = getEmbedVideoUrl(propiedad.video);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 text-sm font-semibold transition-colors"
          >
            ⬅️ Volver a propiedades
          </Link>
          {propiedad.destacada && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 rounded-full font-bold">
              ⭐ Propiedad Destacada
            </span>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {propiedad.titulo}
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-1.5 text-sm md:text-base">
              📍 {propiedad.direccion}, {propiedad.barrio}, {propiedad.ciudad}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase tracking-wider text-gray-400 block">
              Precio de venta
            </span>
            <span className="text-3xl md:text-4xl font-black text-green-400">
              {precioCOP}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <section className="lg:col-span-2 space-y-8">
          <CarruselPropiedad
            fotografias={propiedad.fotografias}
            titulo={propiedad.titulo}
          />
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/60 shadow-lg space-y-4">
            <h2 className="text-xl font-bold tracking-wider">
              Características de la Propiedad
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">
                  Habitaciones
                </span>
                <span className="text-lg font-bold">
                  🛏️ {propiedad.habitaciones}
                </span>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">Baños</span>
                <span className="text-lg font-bold">🚿 {propiedad.banos}</span>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">Área</span>
                <span className="text-lg font-bold">
                  📐 {propiedad.area} m²
                </span>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">
                  Parqueaderos
                </span>
                <span className="text-lg font-bold">
                  🚗 {propiedad.parqueaderos ?? 0}
                </span>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">Estrato</span>
                <span className="text-lg font-bold">
                  🏛️ {propiedad.estrato}
                </span>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">Antigüedad</span>
                <span className="text-lg font-bold">
                  ⏳ {propiedad.antiguedad} años
                </span>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">Tipo</span>
                <span className="text-lg font-bold capitalize">
                  🏷️ {propiedad.tipo}
                </span>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-xl border border-gray-700/40">
                <span className="text-gray-400 block text-xs">
                  Calificación
                </span>
                <span className="text-lg font-bold text-sky-400">
                  📊 {propiedad.puntaje ?? 0}/100
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/60 shadow-lg space-y-3">
            <h2 className="text-xl font-bold tracking-wider">Descripción</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
              {propiedad.descripcion}
            </p>
          </div>

          {embedVideo && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/60 shadow-lg space-y-3">
              <h2 className="text-xl font-bold tracking-wider">
                Video del Inmueble
              </h2>
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-700/60">
                {embedVideo.includes("youtube") ? (
                  <iframe
                    src={embedVideo}
                    title="Video del Inmueble"
                    className="w-full h-full"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={embedVideo}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          )}

          {propiedad.ubicacionLat && propiedad.ubicacionLong && (
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/60 shadow-lg space-y-3">
              <h2 className="text-xl font-bold tracking-wider">Ubicación</h2>
              <p className="text-sm text-gray-400">
                {propiedad.direccion}, {propiedad.barrio}, {propiedad.ciudad}
              </p>
              <MapaPropiedad
                lat={propiedad.ubicacionLat}
                lng={propiedad.ubicacionLong}
                titulo={propiedad.titulo}
                direccion={propiedad.direccion}
              />
            </div>
          )}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-8">
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/60 shadow-xl space-y-6">
            <div>
              <span className="text-xs uppercase text-gray-400 tracking-wider">
                Precio Total
              </span>
              <p className="text-3xl font-black text-green-400">{precioCOP}</p>
            </div>

            <hr className="border-gray-700/50" />

            <div className="space-y-3">
              <span className="text-xs uppercase text-gray-400 tracking-wider block">
                Publicado por
              </span>

              <p className="text-base font-bold">
                {propiedad.publicadoPor?.nombres}{" "}
                {propiedad.publicadoPor?.apellidos}
              </p>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between bg-gray-800/60 px-3 py-2 rounded-lg">
                  <span className="text-gray-300">Celular Verificado</span>
                  <span className="font-semibold text-sm">
                    {propiedad.publicadoPor?.celularVerificado
                      ? "🆗 Sí"
                      : "⏳ No"}
                  </span>
                </div>

                <div className="flex items-center justify-between bg-gray-800/60 px-3 py-2 rounded-lg">
                  <span className="text-gray-300">Documento Verificado</span>
                  <span className="font-semibold text-sm">
                    {propiedad.publicadoPor?.documentoVerificado
                      ? "🆗 Sí"
                      : "⏳ No"}
                  </span>
                </div>
              </div>
            </div>

            <BotonWhatsApp
              propiedadId={propiedad.id}
              titulo={propiedad.titulo}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
