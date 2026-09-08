export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 px-6 rounded-xl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold mb-3">JEMA Inmobiliaria</h3>
          <p className="text-sm">
            Tu socio de confianza en bienes raíces. Propiedades verificadas y
            atención personalizada.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-3">Contacto</h4>
          <p className="text-sm">contacto@jemainmobiliaria.com</p>
          <p className="text-sm">+57 300 000 00 00</p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Enlaces</h4>
          <ul className="text-sm space-y-1">
            <li>
              <a href="/login" className="hover:text-white transition">
                Iniciar Sesión
              </a>
            </li>
            <li>
              <a href="/register" className="hover:text-white transition">
                Registrarse
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-800 text-center text-sm">
        © {new Date().getFullYear()} JEMA Inmobiliaria. Todos los derechos
        reservados.
      </div>
    </footer>
  );
}
