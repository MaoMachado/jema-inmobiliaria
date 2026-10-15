"use client";

import { useEffect, useRef, useState } from "react";
import { Propiedad } from "@/app/lib/types";
import { PropertyFormState } from "@/app/dashboard/views/hooks/usePropiedades";
import Button from "@/app/components/Button";
import Icon from "@/app/components/Icons";

interface PropsModalNewProperty {
  handleSubmit: (data: PropertyFormState, files: File[]) => void;
  onClose: () => void;
  saving: boolean;
  error: string;
  mode?: "create" | "edit";
  propiedad?: Propiedad;
  fotosPermitidas?: number;
  propiedadesRestantes?: number;
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
  { id: 0, titulo: "Información", icon: "document" as const },
  { id: 1, titulo: "Ubicación", icon: "pin" as const },
  { id: 2, titulo: "Características", icon: "area" as const },
  { id: 3, titulo: "Multimedia", icon: "upload" as const },
];

const FORM_VACIO: PropertyFormState = {
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
};

const MAX_MB = 10;
const FOTOS_POR_DEFECTO = 20;

const INPUT_CLASS =
  "w-full bg-gray-950 border border-gray-700 rounded-xl px-3.5 py-3 text-sm text-white placeholder-gray-500 focus:border-sky-500 outline-none transition";
const LABEL_CLASS = "block text-xs font-semibold text-gray-300 mb-1.5";

export function NewPropertyModal({
  onClose,
  handleSubmit,
  saving,
  error,
  mode = "create",
  propiedad,
  fotosPermitidas = FOTOS_POR_DEFECTO,
  propiedadesRestantes,
}: PropsModalNewProperty) {
  const [step, setStep] = useState<number>(0);
  const [errorLocal, setErrorLocal] = useState<string>("");
  const [errorArchivo, setErrorArchivo] = useState<string>("");
  const [confirmandoSalida, setConfirmandoSalida] = useState<boolean>(false);

  const [formData, setFormData] = useState(FORM_VACIO);
  const [inicial, setInicial] = useState<PropertyFormState>(FORM_VACIO);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const tituloRef = useRef<HTMLInputElement>(null);
  const focusPrevioRef = useRef<Element | null>(null);
  const previewsRef = useRef<string[]>([]);
  const salirRef = useRef<() => void>(() => {});
  const confirmandoRef = useRef<boolean>(false);

  const [ultimaPropiedad, setUltimaPropiedad] = useState(propiedad);

  if (propiedad !== ultimaPropiedad) {
    setUltimaPropiedad(propiedad);

    const valores: PropertyFormState =
      mode === "edit" && propiedad
        ? {
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
          }
        : FORM_VACIO;

    setInicial(valores);
    setFormData(valores);
  }

  useEffect(() => {
    focusPrevioRef.current = document.activeElement;
    tituloRef.current?.focus();

    const cerrarConEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (confirmandoRef.current) {
          setConfirmandoSalida(false);
        } else {
          salirRef.current();
        }
      }
    };

    document.addEventListener("keydown", cerrarConEscape);

    const scrollPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
      document.body.style.overflow = scrollPrevio;
      (focusPrevioRef.current as HTMLElement | null)?.focus?.();
    };
  }, []);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const hayCambios =
    JSON.stringify(formData) !== JSON.stringify(inicial) ||
    selectedFiles.length > 0;

  const salir = () => {
    if (hayCambios) {
      setConfirmandoSalida(true);
      return;
    }

    onClose();
  };

  useEffect(() => {
    salirRef.current = salir;
    confirmandoRef.current = confirmandoSalida;
  });

  const descartarYCerrar = () => {
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewsRef.current = [];
    onClose();
  };

  const agregarArchivos = (list: FileList | null) => {
    if (!list || list.length === 0) return;

    setErrorArchivo("");

    const nuevas: File[] = [];
    let problema = "";

    for (const file of Array.from(list)) {
      if (selectedFiles.length + nuevas.length >= fotosPermitidas) {
        problema = `Tu plan permite hasta ${fotosPermitidas} fotos por publicación.`;
        break;
      }

      if (!file.type.startsWith("image/")) {
        problema = `"${file.name}" no es una imagen (usa PNG, JPG o WEBP).`;
        continue;
      }

      if (file.size > MAX_MB * 1024 * 1024) {
        problema = `"${file.name}" supera los ${MAX_MB} MB.`;
        continue;
      }

      const repetida =
        selectedFiles.some(
          (f) => f.name === file.name && f.size === file.size,
        ) || nuevas.some((f) => f.name === file.name && f.size === file.size);

      if (repetida) continue;

      nuevas.push(file);
    }

    if (nuevas.length > 0) {
      const urls = nuevas.map((file) => URL.createObjectURL(file));
      previewsRef.current = [...previewsRef.current, ...urls];

      setSelectedFiles((prev) => [...prev, ...nuevas]);
      setPreviewUrls([...previewsRef.current]);
    }

    setErrorArchivo(problema);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewsRef.current[index]);
    previewsRef.current = previewsRef.current.filter((_, i) => i !== index);

    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls([...previewsRef.current]);
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
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-propiedad-titulo"
      className="h-full fixed inset-0 z-100 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300"
    >
      <div onClick={salir} className="fixed inset-0" aria-hidden="true" />

      <aside className="relative z-60 w-full md:max-w-lg h-full bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col justify-between overflow-hidden">
        <header className="px-6 py-5 border-b border-gray-800 flex items-center justify-between gap-4 bg-gray-950/60 backdrop-blur-md">
          <div>
            <h2
              id="new-propiedad-titulo"
              className="text-xl font-bold text-white tracking-tight"
            >
              {mode === "create"
                ? "Publicar Nueva Propiedad"
                : "Editar Propiedad"}
            </h2>

            <p className="text-xs text-gray-400 mt-0.5">
              Completa los datos para publicar tu inmueble
            </p>
          </div>

          <button
            type="button"
            onClick={salir}
            aria-label="Cerrar"
            className="min-h-11 min-w-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            ✕
          </button>
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
                aria-current={isActive ? "step" : undefined}
                onClick={() => {
                  if (p.id < step || validarPasoActual()) setStep(p.id);
                }}
                className={`min-h-14 py-2.5 px-2 flex flex-col items-center justify-center gap-1 border-b-2 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset ${
                  isActive
                    ? "border-sky-500 text-sky-400 font-bold bg-sky-500/10"
                    : isDone
                      ? "border-emerald-500 text-emerald-400 font-semibold"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon name={p.icon} className="w-4 h-4" />
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
                <label htmlFor="titulo" className={LABEL_CLASS}>
                  Título de la Publicación *
                </label>
                <input
                  ref={tituloRef}
                  id="titulo"
                  name="titulo"
                  type="text"
                  required
                  placeholder="Ej: Espectacular Apartamento en El Poblado"
                  value={formData.titulo}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="tipo" className={LABEL_CLASS}>
                  Tipo de Propiedad *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  className={`${INPUT_CLASS} cursor-pointer`}
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
                  <label htmlFor="precio" className={LABEL_CLASS}>
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
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="descripcion" className={LABEL_CLASS}>
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
                  className={`${INPUT_CLASS} resize-none`}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="ciudad" className={LABEL_CLASS}>
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
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="barrio" className={LABEL_CLASS}>
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
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className={LABEL_CLASS}>
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
                  className={INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="estrato" className={LABEL_CLASS}>
                  Estrato Socioeconómico *
                </label>
                <select
                  id="estrato"
                  name="estrato"
                  value={formData.estrato}
                  onChange={handleChange}
                  className={`${INPUT_CLASS} cursor-pointer`}
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
                  <label htmlFor="area" className={LABEL_CLASS}>
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
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="antiguedad" className={LABEL_CLASS}>
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
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="habitaciones" className={LABEL_CLASS}>
                    Habitaciones *
                  </label>
                  <input
                    id="habitaciones"
                    name="habitaciones"
                    type="number"
                    min="1"
                    value={formData.habitaciones}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="banos" className={LABEL_CLASS}>
                    Baños *
                  </label>
                  <input
                    id="banos"
                    name="banos"
                    type="number"
                    min="1"
                    value={formData.banos}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="parqueaderos" className={LABEL_CLASS}>
                    Parqueaderos
                  </label>
                  <input
                    id="parqueaderos"
                    name="parqueaderos"
                    type="number"
                    min="0"
                    value={formData.parqueaderos}
                    onChange={handleChange}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {mode === "create" && (
                <div>
                  <label className={LABEL_CLASS}>
                    Fotografías del Inmueble ({previewUrls.length}/
                    {fotosPermitidas})
                  </label>

                  <div className="relative border-2 border-dashed border-gray-700 hover:border-sky-500/60 rounded-2xl p-6 text-center transition bg-gray-950/60 focus-within:border-sky-500">
                    <input
                      type="file"
                      id="fotografias"
                      name="fotografias"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => agregarArchivos(e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1">
                      <Icon
                        name="upload"
                        className="w-7 h-7 mx-auto text-gray-500"
                      />
                      <p className="text-xs font-semibold text-gray-200">
                        Arrastra tus imágenes o haz clic para seleccionarlas
                      </p>
                      <p className="text-[11px] text-gray-500">
                        PNG, JPG o WEBP · hasta {MAX_MB} MB por archivo · tu
                        plan permite {fotosPermitidas}
                      </p>
                    </div>
                  </div>

                  {errorArchivo && (
                    <p
                      role="alert"
                      className="mt-2 text-xs text-red-400 font-medium"
                    >
                      {errorArchivo}
                    </p>
                  )}

                  {previewUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {previewUrls.map((url, idx) => (
                        <div
                          key={idx}
                          className="relative group rounded-lg overflow-hidden border border-gray-800 aspect-square"
                        >
                          <img
                            src={url}
                            alt={`Vista Previa ${idx + 1} de ${
                              selectedFiles[idx]?.name ?? "la imagen"
                            }`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            aria-label={`Quitar imagen ${idx + 1}`}
                            className="absolute top-1 right-1 min-h-11 min-w-11 -m-2 flex items-center justify-center rounded-full bg-red-600/80 hover:bg-red-600 text-white text-xs"
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
                <label htmlFor="video" className={LABEL_CLASS}>
                  Video Recorrido (URL de YouTube / Vimeo)
                </label>
                <input
                  id="video"
                  name="video"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.video}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          )}

          {propiedadesRestantes === 0 && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2"
            >
              <Icon name="alert" className="w-4 h-4 shrink-0" />
              <span>
                Alcanzaste el límite de propiedades de tu plan. Mejora tu plan
                para publicar más.
              </span>
            </div>
          )}

          {(errorLocal || error) && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2"
            >
              <Icon name="alert" className="w-4 h-4 shrink-0" />
              <span>{errorLocal || error}</span>
            </div>
          )}

          {confirmandoSalida ? (
            <div
              role="alertdialog"
              aria-label="Descartar cambios"
              className="pt-4 border-t border-gray-800 space-y-3"
            >
              <p className="text-xs text-amber-200">
                ¿Salir del formulario? Se perderán los cambios que no hayas
                guardado.
              </p>

              <div className="flex justify-between gap-3">
                <Button
                  title="Seguir editando"
                  onClick={() => setConfirmandoSalida(false)}
                  type="button"
                  variant="secondary"
                  className="text-xs min-h-11 px-4"
                />

                <Button
                  title="Descartar y salir"
                  onClick={descartarYCerrar}
                  type="button"
                  variant="danger"
                  className="text-xs min-h-11 px-4"
                />
              </div>
            </div>
          ) : (
            <footer className="pt-4 border-t border-gray-800 flex justify-between gap-3">
              {step > 0 ? (
                <Button
                  title="← Atrás"
                  onClick={atras}
                  type="button"
                  variant="secondary"
                  className="text-xs min-h-11 px-4"
                />
              ) : (
                <Button
                  title="Cancelar"
                  onClick={salir}
                  type="button"
                  variant="secondary"
                  className="text-xs min-h-11 px-4"
                />
              )}

              {step < PASOS.length - 1 ? (
                <Button
                  key="avanzar"
                  title="Siguiente →"
                  onClick={siguiente}
                  type="button"
                  variant="primary"
                  className="text-xs min-h-11 px-4"
                />
              ) : (
                <Button
                  key="publicar"
                  title={
                    saving
                      ? "Guardando..."
                      : propiedadesRestantes === 0
                        ? "Límite del plan alcanzado"
                        : mode === "create"
                          ? "Publicar Inmueble"
                          : "Guardar Cambios"
                  }
                  type="submit"
                  disabled={saving || propiedadesRestantes === 0}
                  loading={saving}
                  variant="primary"
                  className="text-xs min-h-11 px-4"
                />
              )}
            </footer>
          )}
        </form>
      </aside>
    </section>
  );
}
