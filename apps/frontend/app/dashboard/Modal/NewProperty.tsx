"use client";

import Button from "@/app/components/Button";
import { useRef, useState } from "react";

interface PropsModalNewProperty {
  onClose: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  error: string;
}

interface FormFieldProps {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

const pasos: { titulo: string; campos: FormFieldProps[] }[] = [
  {
    titulo: "Información General",
    campos: [
      { name: "titulo", label: "Título", type: "text", required: true },
      {
        name: "descripcion",
        label: "Descripción",
        type: "text",
        required: true,
      },
      { name: "precio", label: "Precio", type: "number", required: true },
      { name: "tipo", label: "Tipo", type: "text", required: true },
    ],
  },
  {
    titulo: "Ubicación",
    campos: [
      { name: "ciudad", label: "Ciudad", type: "text", required: true },
      { name: "barrio", label: "Barrio", type: "text", required: true },
      { name: "direccion", label: "Dirección", type: "text", required: true },
      { name: "estrato", label: "Estrato", type: "number", required: true },
    ],
  },
  {
    titulo: "Características",
    campos: [
      {
        name: "habitaciones",
        label: "Habitaciones",
        type: "number",
        required: true,
      },
      { name: "banos", label: "Baños", type: "number", required: true },
      { name: "area", label: "Área", type: "number", required: true },
      {
        name: "antiguedad",
        label: "Antigüedad",
        type: "number",
        required: true,
      },
      {
        name: "parqueaderos",
        label: "Parqueaderos",
        type: "number",
        required: false,
      },
    ],
  },
  {
    titulo: "Multimedia",
    campos: [
      {
        name: "fotografias",
        label: "Fotografías (URLs separadas por coma)",
        type: "text",
        required: false,
      },
      { name: "video", label: "Video (URL)", type: "text", required: false },
    ],
  },
];

const FormField = ({ name, label, type, required }: FormFieldProps) => (
  <div className="flex flex-col">
    <label htmlFor={name}>{required ? `${label} *` : label}</label>
    <input
      type={type}
      id={name}
      name={name}
      required={required}
      className="bg-white/20 border border-gray-300 rounded-md px-2 py-1"
    />
  </div>
);

export function NewPropertyModal({
  onClose,
  handleSubmit,
  saving,
  error,
}: PropsModalNewProperty) {
  const [step, setStep] = useState<number>(0);
  const formRef = useRef<HTMLFormElement>(null);

  const [errorLocal, setErrorLocal] = useState<string>("");

  const validarPaso = (paso: number): boolean => {
    const form = formRef.current;
    const faltantes = pasos[paso].campos
      .filter((c) => c.required)
      .map((c) => c.name)
      .filter((name) => {
        const el = form?.elements.namedItem(name) as HTMLInputElement | null;
        return !el || !el.value.trim();
      });

    if (faltantes.length > 0) {
      setErrorLocal(
        `Paso ${paso + 1}: campos obligatorios: ${faltantes.join(", ")}`,
      );
      return false;
    }

    setErrorLocal("");
    return true;
  };

  const siguiente = () => validarPaso(step) && setStep((s) => s + 1);
  const atras = () => {
    setErrorLocal("");
    setStep((s) => s - 1);
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-xs"
      />
      <article className="slide-in-right bg-blue-800/40 backdrop-blur-xs fixed z-10 top-0 right-0 w-full md:w-md h-full">
        <header className="flex items-center justify-between p-6">
          <h2 className="text-2xl font-semibold tracking-wider">
            Nueva Propiedad
          </h2>
          <Button
            title="X"
            onClick={onClose}
            type="button"
            variant="secondary"
          />
        </header>

        <section className="p-4">
          <form ref={formRef} onSubmit={handleSubmit}>
            <h2 className="text-center mb-6 font-semibold tracking-wider capitalize text-xl">
              {pasos[step].titulo}{" "}
              <span className="text-blue-500 ml-2">
                Paso {step + 1} de {pasos.length}
              </span>
            </h2>

            {pasos.map((paso, index) => (
              <div
                key={paso.titulo}
                className={
                  step === index ? "flex flex-col gap-3 mb-6" : "hidden"
                }
              >
                {paso.campos.map((campo) => (
                  <FormField key={campo.name} {...campo} />
                ))}
              </div>
            ))}

            {(errorLocal || error) && (
              <p className="text-red-500">{errorLocal || error}</p>
            )}

            <div>
              {step > 0 && (
                <Button
                  title="Atrás"
                  onClick={atras}
                  type="button"
                  variant="secondary"
                />
              )}

              {step < pasos.length - 1 && (
                <Button
                  title="Siguiente"
                  onClick={siguiente}
                  type="button"
                  variant="primary"
                />
              )}

              {step === pasos.length - 1 && (
                <Button
                  title={saving ? "Guardando..." : "Agregar Propiedad"}
                  type="submit"
                  disabled={saving}
                  variant="primary"
                />
              )}
            </div>
          </form>
        </section>
      </article>
    </>
  );
}
