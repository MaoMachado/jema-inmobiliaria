import Hero from "./components/Hero";
import PropiedadesDestacadas from "./components/PropiedadesDestacadas";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ChatIA from "./components/ChatIA";

export default function Home() {
  return (
    <main className="p-1">
      <Header />
      <Hero />
      <PropiedadesDestacadas />
      <ChatIA />
      <Footer />
    </main>
  );
}
