"use client";

import { useEffect, useState } from "react";
import api, { hayFlagSesion } from "../lib/api";

export interface Sesion {
  id: string;
  email: string;
  role: string;
}

// Hero y HeaderAuth montan useSession a la vez: comparten una sola sonda.
let sondaSesion: Promise<Sesion | null> | null = null;

export function useSession(): Sesion | null | undefined {
  const [sesion, setSesion] = useState<Sesion | null | undefined>(undefined);

  useEffect(() => {
    // Sin flag de login probable no hay sesión: ni un request al backend.
    if (!hayFlagSesion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSesion(null);
      return;
    }

    if (!sondaSesion) {
      sondaSesion = api
        .get<Sesion>("/auth/me")
        .then((res) => res.data)
        .catch(() => null);
      sondaSesion.finally(() => {
        sondaSesion = null;
      });
    }

    sondaSesion.then(setSesion);
  }, []);

  return sesion;
}
