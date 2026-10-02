"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import Button from "./Button";
import { isAxiosError } from "axios";

type Mensaje = { role: "user" | "assistant"; content: string; hora: string };

const SUGERENCIAS = [
  "¿Qué apartamentos hay disponibles?",
  "¿Propiedades con 3 habitaciones?",
  "¿Cuáles son las opciones más económicas?",
];

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};

export default function ChatIA() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mensaje, setMensaje] = useState<string>("");
  const [chats, setChats] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, loading, open]);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const enviarPregunta = async (texto: string) => {
    const pregunta = texto.trim();
    if (!pregunta || loading) return;

    const ahora = new Date().toLocaleDateString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setLoading(true);
    setError(null);
    setLimiteAlcanzado(false);
    setChats((prev) => [
      ...prev,
      { role: "user", content: pregunta, hora: ahora },
    ]);
    setMensaje("");

    try {
      const res = await api.post<string>("/ai/chat", { mensaje: pregunta });
      const horaRespuesta = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setChats((prev) => [
        ...prev,
        { role: "assistant", content: res.data, hora: horaRespuesta },
      ]);
    } catch (error) {
      const msg = getErrorMessage(
        error,
        "No se pudo conectar al asesor. Inténtelo de nuevo.",
      );

      setError(msg);
      if (isAxiosError(error) && error.response?.status === 403) {
        setLimiteAlcanzado(true);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    enviarPregunta(mensaje);
  };

  const handleLimpiarChat = () => {
    setChats([]);
    setError(null);
    setLimiteAlcanzado(false);
  };

  return (
    <aside className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          role="dialog"
          aria-label="Asesor Inmobiliario Inteligente"
          className="absolute bottom-16 right-0 w-[90vw] max-w-sm sm:max-w-md h-130 max-h-[80vh] rounded-2xl bg-gray-900 border border-sky-500/30 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden animate-fade-in z-50"
        >
          <header className="flex items-center justify-between px-4 py-3 bg-linear-to-r from-sky-950/80 via-gray-900 to-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 text-sm font-bold">
                IA
              </div>

              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  JEMA Asesor
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h2>
                <p className="text-[11px] text-gray-400">
                  Encuentra tu propiedad ideal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {chats.length > 0 && (
                <button
                  type="button"
                  onClick={handleLimpiarChat}
                  title="Reiniciar conversación"
                  className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-800 transition"
                >
                  Limpiar
                </button>
              )}

              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar Chat"
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
          </header>

          {isLoggedIn ? (
            <>
              <section
                role="log"
                aria-live="polite"
                className="flex-1 overflow-y-auto p-4 space-y-3 text-xs sm:text-sm"
              >
                {chats.length === 0 && !loading && (
                  <div className="text-center py-6 space-y-6">
                    <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-xl">
                      🏢
                    </div>

                    <div>
                      <p className="font-semibold text-white text-sm">
                        ¡Hola! Soy tu asesor inteligente
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Puedo buscar propiedades aprobadas, comparar precios y
                        zonas en tiempo real.
                      </p>
                    </div>

                    <div className="pt-2 space-y-1.5 text-left">
                      <p className="text-[11px] font-semibold text-gray-400 px-1">
                        Preguntas sugeridas:
                      </p>

                      {SUGERENCIAS.map((sug, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => enviarPregunta(sug)}
                          className="w-full text-left text-xs bg-gray-800/80 hover:bg-sky-950/50 hover:border-sky-500/40 border border-gray-700/60 text-gray-300 hover:text-white p-2.5 rounded-xl transition"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {chats.map((chat, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${
                      chat.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-line shadow-sm ${
                        chat.role === "user"
                          ? "bg-sky-600 text-white rounded-br-none"
                          : "bg-gray-800 border border-gray-700/70 text-gray-200 rounded-bl-none"
                      }`}
                    >
                      {chat.content}
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 px-1 font-mono">
                      {chat.hora}
                    </span>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-sky-400 py-1">
                    <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
                    <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-bounce [animation-delay:0.4s]" />
                    <span>Consultando propiedades...</span>
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs space-y-2">
                    <p>{error}</p>
                    {limiteAlcanzado && (
                      <Link
                        href="/dashboard"
                        className="inline-block text-[11px] font-bold text-sky-400 hover:underline"
                      >
                        Ver planes en mi Dashboard →
                      </Link>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </section>

              <footer className="p-3 bg-gray-950/80 border-t border-gray-800">
                <form
                  onSubmit={handleSubmit}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    ref={inputRef}
                    placeholder="Escribe tu consulta inmobiliaria..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    disabled={loading}
                    className="flex-1 bg-gray-900 border border-gray-700 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading || !mensaje.trim()}
                    className="px-4 py-2 bg-sky-500  hover:bg-sky-400 disabled:opacity-40 font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Enviar
                  </button>
                </form>
              </footer>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-2xl">
                🔒
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">
                  Inicia sesión para usar el asesor IA
                </h3>
                <p className="text-gray-400">
                  Accede a consultas personalizadas sobre inmuebles verificados.
                </p>
              </div>

              <Link
                href="/login"
                className="block w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-gray-950 font-bold text-xs rounded-xl shadow-md transition text-center"
              >
                Iniciar Sesión
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        className="w-14 h-14 rounded-full bg-linear-to-tr from-sky-600 to-sky-400 hover:from-sky-500 hover:to-sky-300 text-gray-950 font-bold flex items-center justify-center shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95 transition cursor-pointer relative"
        aria-expanded={open}
        aria-label={open ? "Cerrar asesor virtual" : "Abrir asesor virtual"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <span className="text-lg">✕</span>
        ) : (
          <>
            <span className="text-xl">✨</span>
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-gray-950" />
          </>
        )}
      </button>
    </aside>
  );
}
