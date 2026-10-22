import axios, {
  AxiosError,
  isAxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refrescando: Promise<void> | null = null;

const FLAG_SESION = "jema_sesion";

export const hayFlagSesion = (): boolean =>
  typeof window !== "undefined" && localStorage.getItem(FLAG_SESION) === "1";

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
  (response) => {
    const url = response.config?.url ?? "";

    if (typeof window !== "undefined") {
      if (url === "/auth/logout") {
        localStorage.removeItem(FLAG_SESION);
      } else if (/^\/auth\/(login|register|refresh|me)$/.test(url)) {
        localStorage.setItem(FLAG_SESION, "1");
      }
    }

    return response;
  },

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
        if (typeof window !== "undefined") {
          localStorage.removeItem(FLAG_SESION);
          if (!esSonda) {
            window.location.assign("/login");
          }
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;

// 403 con este prefijo = el admin debe confirmar su contraseña antes de ver documentos.
export const requiereReauth = (error: unknown): boolean =>
  isAxiosError(error) &&
  error.response?.status === 403 &&
  String(error.response.data?.message ?? "").startsWith("REAUTH_REQUIRED");
