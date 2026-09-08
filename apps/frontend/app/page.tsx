import Hero from "./components/Hero";
import PropiedadesDestacadas from "./components/PropiedadesDestacadas";
import Footer from "./components/Footer";
import Header from "./components/Header";

export default function Home() {
  return (
    <main className="p-1">
      <Header />
      <Hero />
      <PropiedadesDestacadas />
      <Footer />
    </main>
  );
}
