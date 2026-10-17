"use client";

import { useEffect, useState } from "react";
import api, { hayFlagSesion } from "../lib/api";

export interface Sesion {
  id: string;
  email: string;
  role: string;
}

let sondaSesion: Promise<Sesion | null> | null = null;

// Marca por pestaña (sessionStorage): si la sonda ya falló aquí, no insistas
// en cada navegación — sin flag se sondea una sola vez (migra sesiones válidas).
const SONDA_FALLIDA = "jema_sonda_no";

export function useSession(): Sesion | null | undefined {
  const [sesion, setSesion] = useState<Sesion | null | undefined>(undefined);

  useEffect(() => {
    if (!hayFlagSesion() && sessionStorage.getItem(SONDA_FALLIDA) === "1") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSesion(null);
      return;
    }

    if (!sondaSesion) {
      sondaSesion = api
        .get<Sesion>("/auth/me")
        .then((res) => res.data)
        .catch(() => {
          sessionStorage.setItem(SONDA_FALLIDA, "1");
          return null;
        });

      sondaSesion.finally(() => {
        sondaSesion = null;
      });
    }

    sondaSesion.then(setSesion);
  }, []);

  return sesion;
}
