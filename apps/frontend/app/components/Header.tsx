import HeaderAuth from "./HeaderAuth";

export default function Header() {
  return (
    <header className="mb-1">
      <div className="max-w-7xl mx-auto flex justify-between items-center p-4 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-wider text-sky-400">
          JEMA Inmobiliaria
        </h1>
        <div>
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
