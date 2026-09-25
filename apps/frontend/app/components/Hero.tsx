import Link from "next/link";

export default function Hero() {
  return (
    <section className="">
      <div className="max-w-7xl mx-auto text-center bg-linear-to-br from-blue-900/50 to-blue-700/20 text-white rounded-xl py-20 px-6">
        <h1 className="text-4xl mx-auto text-center">
          Encuentra tu próximo hogar
        </h1>

        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Propiedades verificadas, precios transparentes y la mejor experiencia
          para comprar, arrendar o invertir en bienes raíces.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Publicar Propiedad
          </Link>

          <Link
            href="/buscar"
            className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Buscar Propiedades
          </Link>
        </div>
      </div>
    </section>
  );
}
