"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeaderAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  if (isLoggedIn === null) {
    return <div className="w-10" aria-hidden />;
  }

  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className="bg-sky-500/30 px-3 py-1 rounded-sm font-semibold tracking-wider hover:bg-sky-500/50 transition"
      >
        Mi Perfil
      </Link>
    );
  }

  return (
    <div className="flex gap-4">
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
  );
}
