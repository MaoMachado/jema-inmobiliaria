"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "../lib/api";
import Button from "./Button";

type Mensaje = { role: "user" | "assistant"; content: string };

const getErrorMessage = (error: any, fallback: string) => {
  return error?.response?.data?.message ?? fallback;
};

export default function ChatIA() {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mensaje, setMensaje] = useState<string>("");
  const [chats, setChats] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pregunta = mensaje.trim();
    if (!pregunta || loading) return;

    setLoading(true);
    setError(null);
    setChats((prev) => [...prev, { role: "user", content: pregunta }]);
    setMensaje("");

    try {
      const res = await api.post("/ia/chat", { mensaje: pregunta });
      setChats((prev) => [
        ...prev,
        { role: "assistant", content: res.data ?? "Sin Respuesta." },
      ]);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "No se pudo contactar al asesor. Inténtalo de nuevo.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("access_token"));
  }, []);

  return (
    <section className="fixed bottom-10 right-10 z-50">
      {open && (
        <div className="absolute bottom-0 right-0 sm:right-25 w-80 sm:w-md rounded-2xl bg-gray-800/95 backdrop-blur-xs shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between bg-sky-600/20 px-3 py-2 mb-1">
            <div>
              <h1 className="font-semibold">JEMA Asesor</h1>
              <p className="text-xs">¿En qué puedo ayudarte hoy?</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Cerrar Chat"
              className="text-lg leading-none cursor-pointer hover:text-red-400"
            >
              ❌
            </button>
          </header>

          {isLoggedIn ? (
            <>
              <section className="bg-gray-500/20 h-96 overflow-y-auto p-2 space-y-2 rounded-lg mb-1">
                {chats.length === 0 && !loading && (
                  <p className="text-center text-sm">
                    Haz tu primera consulta.
                  </p>
                )}

                {chats.map((chat, i) => (
                  <div
                    key={i}
                    className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <p
                      className={`max-w-[80%] rounded-lg px-3 py-1 ${chat.role === "user" ? "bg-sky-600/40" : "bg-slate-600/40"}`}
                    >
                      {chat.content}
                    </p>
                  </div>
                ))}

                {loading && (
                  <p className="text-sm text-gray-400">Escribiendo...</p>
                )}
                {error && <p className="text-sm text-red-400">{error}</p>}
              </section>
              <section className="bg-sky-600/20 p-2 rounded-lg">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Pregunta aquí..."
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    className="flex-1 border border-gray-600/50 rounded-lg px-3 focus:border-sky-600/50 outline-none disabled:opacity-50"
                    disabled={loading}
                  />
                  <Button
                    title={loading ? "" : "Enviar"}
                    type="submit"
                    disabled={loading || !mensaje.trim()}
                  />
                </form>
              </section>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="mb-6">
                Inicia sesión para usar el asesor inmobiliario.
              </p>
              <Link href="/login">
                <Button title="Iniciar sesión" />
              </Link>
            </div>
          )}
        </div>
      )}

      <button
        className="h-20 w-20 rounded-full bg-sky-600/40 hover:bg-sky-600/60 flex items-center justify-center shadow-lg cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        🤖
      </button>
    </section>
  );
}
