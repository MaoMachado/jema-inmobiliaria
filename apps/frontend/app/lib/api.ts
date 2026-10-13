import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refrescando: Promise<void> | null = null;

const refrescar = () => {
  if (!refrescando) {
    refrescando = api
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refrescando = null;
      });
  }
  return refrescando;
};

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const config = error.config as
      | (InternalAxiosRequestConfig & { _reintentos?: boolean })
      | undefined;

    const esRefresh = config?.url?.includes("/auth/refresh");
    const esLogin = config?.url?.includes("/auth/login");
    const esSonda = config?.url?.includes("/auth/me");

    if (
      error.response?.status === 401 &&
      config &&
      !config._reintentos &&
      !esRefresh &&
      !esLogin
    ) {
      config._reintentos = true;

      try {
        await refrescar();
        return api.request(config);
      } catch {
        // /auth/me es la sonda de sesión: 401 aquí = "sin sesión", no "sesión caída".
        // No forzamos navegación; los endpoints protegidos sí mandan a /login.
        if (typeof window !== "undefined" && !esSonda) {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
