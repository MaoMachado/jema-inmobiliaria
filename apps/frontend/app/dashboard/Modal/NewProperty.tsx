"use client";

import { useEffect, useState } from "react";
import { Propiedad } from "@/app/lib/types";
import { PropertyFormState } from "@/app/dashboard/views/hooks/usePropiedades";
import Button from "@/app/components/Button";

interface PropsModalNewProperty {
  handleSubmit: (data: PropertyFormState, files: File[]) => void;
  onClose: () => void;
  saving: boolean;
  error: string;
  mode?: "create" | "edit";
  propiedad?: Propiedad;
}

const TIPOS_PROPIEDAD = [
  "Apartamento",
  "Casa",
  "Oficina",
  "Local Comercial",
  "Lote / Terreno",
  "Bodega",
  "Finca",
  "Otro",
];

const PASOS = [
  { id: 0, titulo: "Información General", icon: "📋" },
  { id: 1, titulo: "Ubicación", icon: "📍" },
  { id: 2, titulo: "Características", icon: "📐" },
  { id: 3, titulo: "Multimedia", icon: "📸" },
];

export function NewPropertyModal({
  onClose,
  handleSubmit,
  saving,
  error,
  mode = "create",
  propiedad,
}: PropsModalNewProperty) {
  const [step, setStep] = useState<number>(0);
  const [errorLocal, setErrorLocal] = useState<string>("");
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    tipo: "Apartamento",
    ciudad: "",
    barrio: "",
    direccion: "",
    estrato: "3",
    habitaciones: "1",
    banos: "1",
    area: "",
    antiguedad: "0",
    parqueaderos: "0",
    video: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (mode === "edit" && propiedad) {
      setFormData({
        titulo: propiedad.titulo || "",
        descripcion: propiedad.descripcion || "",
        precio: String(propiedad.precio || ""),
        tipo: propiedad.tipo || "Apartamento",
        ciudad: propiedad.ciudad || "",
        barrio: propiedad.barrio || "",
        direccion: propiedad.direccion || "",
        estrato: String(propiedad.estrato || "3"),
        habitaciones: String(propiedad.habitaciones || "1"),
        banos: String(propiedad.banos || "1"),
        area: String(propiedad.area || ""),
        antiguedad: String(propiedad.antiguedad ?? "0"),
        parqueaderos: String(propiedad.parqueaderos ?? "0"),
        video: propiedad.video || "",
      });
    }
  }, [mode, propiedad]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);

      const newUrls = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorLocal) setErrorLocal("");
  };

  const validarPasoActual = (): boolean => {
    setErrorLocal("");

    if (step === 0) {
      if (!formData.titulo.trim()) {
        setErrorLocal("El título es obligatorio");
        return false;
      }

      if (!formData.descripcion.trim()) {
        setErrorLocal("La descripción es obligatoria");
        return false;
      }

      if (!formData.precio || Number(formData.precio) <= 0) {
        setErrorLocal("El precio debe ser un valor mayor a 0");
        return false;
      }
    } else if (step === 1) {
      if (!formData.ciudad.trim()) {
        setErrorLocal("La ciudad es obligatoria");
        return false;
      }

      if (!formData.barrio.trim()) {
        setErrorLocal("El barrio es obligatorio");
        return false;
      }

      if (!formData.direccion.trim()) {
        setErrorLocal("La dirección es obligatoria");
        return false;
      }
    } else if (step === 2) {
      if (!formData.area || Number(formData.area) <= 0) {
        setErrorLocal("El área debe ser mayor a 0 m²");
        return false;
      }

      if (!formData.habitaciones || Number(formData.habitaciones) < 1) {
        setErrorLocal("Debe ingresar al menos 1 habitación");
        return false;
      }

      if (!formData.banos || Number(formData.banos) < 1) {
        setErrorLocal("Debe ingresar al menos 1 baño");
        return false;
      }
    }

    return true;
  };

  const siguiente = () => {
    if (validarPasoActual()) {
      setStep((s) => s + 1);
    }
  };

  const atras = () => {
    setErrorLocal("");
    setStep((s) => s - 1);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validarPasoActual()) return;
    handleSubmit(formData, selectedFiles);
  };

  const formattedPrecio = formData.precio
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(Number(formData.precio))
    : "";

  return (
    <section className="h-full fixed inset-0 z-100 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      <div onClick={onClose} className="fixed inset-0" />
      <aside className="relative z-60 w-full md:max-w-lg h-full bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        <header className="px-6 py-5 border-b border-gray-800 flex items-center justify-between bg-gray-950/60 backdrop-blur-md">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === "create"
                ? "Publicar Nueva Propiedad"
                : "Editar Propiedad"}
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              Completa los datos para publicar tu inmueble
            </p>
          </div>

          <Button
            title="✕"
            onClick={onClose}
            type="button"
            variant="secondary"
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer"
          />
        </header>

        <nav
          aria-label="Progreso del formulario"
          className="grid grid-cols-4 border-b border-gray-800 bg-gray-950/40 text-xs"
        >
          {PASOS.map((p) => {
            const isActive = step === p.id;
            const isDone = step > p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  if (p.id < step || validarPasoActual()) setStep(p.id);
                }}
                className={`py-2.5 px-2 flex flex-col items-center gap-1 border-b-2 transition cursor-pointer ${
                  isActive
                    ? "border-sky-500 text-sky-400 font-bold bg-sky-500/10"
                    : isDone
                      ? "border-emerald-500 text-emerald-400 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="text-sm">{p.icon}</span>
                <span className="truncate max-w-full">{p.titulo}</span>
              </button>
            );
          })}
        </nav>

        <form
          onSubmit={handleFormSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
              e.preventDefault();
            }
          }}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="titulo"
                  className="block text-xs font-semibold text-gray-300 mb-1"
                >
                  Título de la Publicación *
                </label>
                <input
                  id="titulo"
                  name="titulo"
                  type="text"
                  required
                  placeholder="Ej: Espectacular Apartamento en El Poblado"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="tipo"
                  className="block text-xs font-semibold text-gray-300 mb-1"
                >
                  Tipo de Propiedad *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-sky-500 outline-none cursor-pointer"
                >
                  {TIPOS_PROPIEDAD.map((t) => (
                    <option
                      key={t}
                      value={t}
                      className="bg-gray-900 text-white"
                    >
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="precio"
                    className="block text-xs font-semibold text-gray-300"
                  >
                    Precio (COP) *
                  </label>
                  {formattedPrecio && (
                    <span className="text-xs font-bold text-emerald-400">
                      {formattedPrecio}
                    </span>
                  )}
                </div>

                <input
                  id="precio"
                  name="precio"
                  type="number"
                  required
                  min="1"
                  placeholder="Ej: 350000000"
                  value={formData.precio}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="descripcion"
                  className="block text-xs font-semibold text-gray-300 mb-1"
                >
                  Descripción Detallada *
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={4}
                  required
                  placeholder="Describe las ventajas, acabados, comodidades del conjunto y entorno..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none resize-none"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="ciudad"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Ciudad *
                  </label>
                  <input
                    id="ciudad"
                    name="ciudad"
                    type="text"
                    required
                    placeholder="Ej: Medellín"
                    value={formData.ciudad}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="barrio"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Barrio / Sector *
                  </label>
                  <input
                    id="barrio"
                    name="barrio"
                    type="text"
                    required
                    placeholder="Ej: Laureles"
                    value={formData.barrio}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="direccion"
                  className="block text-xs font-semibold text-gray-300 mb-1"
                >
                  Dirección Exacta *
                </label>
                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  required
                  placeholder="Ej: Calle 33 # 74B - 20"
                  value={formData.direccion}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="estrato"
                  className="block text-xs font-semibold text-gray-300 mb-1"
                >
                  Estrato Socioeconómico *
                </label>
                <select
                  id="estrato"
                  name="estrato"
                  value={formData.estrato}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-sky-500 outline-none cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6].map((e) => (
                    <option
                      key={e}
                      value={e}
                      className="bg-gray-900 text-white"
                    >
                      Estrato {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="area"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Área Total (m²) *
                  </label>
                  <input
                    id="area"
                    name="area"
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 75"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="antiguedad"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Antigüedad (Años)
                  </label>
                  <input
                    id="antiguedad"
                    name="antiguedad"
                    type="number"
                    min="0"
                    placeholder="0 = A estrenar"
                    value={formData.antiguedad}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="habitaciones"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Habitaciones *
                  </label>
                  <input
                    id="habitaciones"
                    name="habitaciones"
                    type="number"
                    min="1"
                    value={formData.habitaciones}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="banos"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Baños *
                  </label>
                  <input
                    id="banos"
                    name="banos"
                    type="number"
                    min="1"
                    value={formData.banos}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="parqueaderos"
                    className="block text-xs font-semibold text-gray-300 mb-1"
                  >
                    Parqueaderos
                  </label>
                  <input
                    id="parqueaderos"
                    name="parqueaderos"
                    type="number"
                    min="0"
                    value={formData.parqueaderos}
                    onChange={handleChange}
                    className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-sky-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {mode === "create" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Fotografías del Inmueble (Hasta 20 fotos)
                  </label>

                  <div className="relative border-2 border-dashed border-gray-700 hover:border-sky-500/60 rounded-2xl p-6 text-center transition bg-gray-950/60">
                    <input
                      type="file"
                      id="fotografias"
                      name="fotografias"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <span className="text-2xl">📸</span>
                      <p className="text-xs font-semibold text-gray-200">
                        Arrastra tus imágenes o haz clic para seleccionarlas
                      </p>
                      <p className="text-[11px] text-gray-500">
                        PNG, JPG, WEBP hasta 10MB por archivo
                      </p>
                    </div>
                  </div>

                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {previewUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden border border-gray-800 aspect-square"
                        >
                          <img
                            src={url}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="video"
                  className="block text-xs font-semibold text-gray-300 mb-1"
                >
                  Video Recorrido (URL de YouTube / Vimeo)
                </label>
                <input
                  id="video"
                  name="video"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.video}
                  onChange={handleChange}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>
          )}

          {(errorLocal || error) && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorLocal || error}</span>
            </div>
          )}

          <footer className="pt-4 border-t border-gray-800 flex justify-between gap-3">
            {step > 0 ? (
              <Button
                title="← Atrás"
                onClick={atras}
                type="button"
                variant="secondary"
              />
            ) : (
              <Button
                title="Cancelar"
                onClick={onClose}
                type="button"
                variant="secondary"
              />
            )}

            {step < PASOS.length - 1 ? (
              <Button
                key="avanzar"
                title="Siguiente →"
                onClick={siguiente}
                type="button"
                variant="primary"
              />
            ) : (
              <Button
                key="publicar"
                title={
                  saving
                    ? "Guardando..."
                    : mode === "create"
                      ? "Publicar Inmueble"
                      : "Guardar Cambios"
                }
                type="submit"
                disabled={saving}
                variant="primary"
              />
            )}
          </footer>
        </form>
      </aside>
    </section>
  );
}
