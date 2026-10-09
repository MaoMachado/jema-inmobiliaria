"use client";

import { useEffect, useState } from "react";
import api from "../lib/api";

export interface Sesion {
  id: string;
  email: string;
  role: string;
}

export function useSession(): Sesion | null | undefined {
  const [sesion, setSesion] = useState<Sesion | null | undefined>(undefined);

  useEffect(() => {
    api
      .get<Sesion>("/auth/me")
      .then((res) => setSesion(res.data))
      .catch(() => setSesion(null));
  }, []);

  return sesion;
}
