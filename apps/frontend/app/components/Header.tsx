import Link from "next/link";

export default function Header() {
  return (
    <header className="mb-1">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-wider text-sky-400">
          JEMA Inmobiliaria
        </h1>
        <div className="flex gap-6">
          <Link
            href="/login"
            className="bg-sky-500/30 px-3 py-1 rounded-sm font-semibold tracking-wider hover:bg-sky-500/50 transition"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="bg-sky-500/30 px-3 py-1 rounded-sm font-semibold tracking-wider hover:bg-sky-500/50 transition"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </header>
  );
}
