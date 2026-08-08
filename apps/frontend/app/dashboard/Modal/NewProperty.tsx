"use client";

interface PropsModa {
  onClose: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  error: string;
  saving: boolean;
}

const formData = [
  {
    name: "titulo",
    label: "Título",
    type: "text",
  },
  {
    name: "descripcion",
    label: "Descripción",
    type: "text",
  },
  {
    name: "precio",
    label: "Precio",
    type: "number",
  },
  {
    name: "ciudad",
    label: "Ciudad",
    type: "text",
  },
  {
    name: "barrio",
    label: "Barrio",
    type: "text",
  },
  {
    name: "tipo",
    label: "Tipo",
    type: "text",
  },
  {
    name: "habitaciones",
    label: "Habitaciones",
    type: "number",
  },
  {
    name: "banos",
    label: "Baños",
    type: "number",
  },
  {
    name: "area",
    label: "Área",
    type: "number",
  },
];

const FormField = ({ name, label, type, value, onChange }: any) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="bg-white/20 border border-gray-300 rounded-md px-2 py-1"
      />
    </div>
  );
};

export function NewPropertyModal({
  onClose,
  handleSubmit,
  error,
  saving,
}: PropsModa) {
  return (
    <section className="fixed inset-0 bg-black/50 backdrop-blur-xs">
      <div className="max-w-3xl mx-auto mt-10 rounded-md">
        <header className="flex justify-between items-center">
          <h2 className="text-center mb-6 text-3xl">Nueva Propiedad</h2>
          <button
            onClick={onClose}
            className="bg-orange-500/20 hover:bg-orange-500/50 border-orange-500 rounded-md cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="bg-blue-900/20 rounded-md p-6 grid grid-cols-2 gap-4"
        >
          {formData.map((field) => (
            <FormField
              key={field.name}
              name={field.name}
              label={field.label}
              type={field.type}
            />
          ))}

          <button
            type="submit"
            className="bg-blue-700 col-span-2 py-2 rounded-md font-semibold cursor-pointer tracking-wider"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Agregar propiedad"}
          </button>
        </form>
        {error && (
          <p className="text-red-500 text-center mt-6 bg-red-900/30 py-2">
            {error}
          </p>
        )}
      </div>
    </section>
  );
}
