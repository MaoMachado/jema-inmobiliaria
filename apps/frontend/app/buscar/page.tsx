import PublicSearchProperty from "../components/PublicSearchProperty";
import Header from "../components/Header";
import ChatIA from "../components/ChatIA";
import Footer from "../components/Footer";
import CookieBanner from "../components/CookieBanner";

export default function BuscarPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explora Inmuebles Verificados
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Encuentra casas, apartamentos y locales con trato directo y sin
            intermediarios ocultos.
          </p>
        </div>
        <PublicSearchProperty />
      </div>
      <ChatIA />
      <Footer />
      <CookieBanner />
    </main>
  );
}
