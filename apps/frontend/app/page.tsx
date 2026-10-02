import Hero from "./components/Hero";
import PropiedadesDestacadas from "./components/PropiedadesDestacadas";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ChatIA from "./components/ChatIA";
import CookieBanner from "./components/CookieBanner";

export default function Home() {
  return (
    <main className="p-1 min-h-screen flex flex-col justify-between">
      <div>
        <Header />
        <Hero />
        <PropiedadesDestacadas />
        <ChatIA />
      </div>
      <Footer />
      <CookieBanner />
    </main>
  );
}
