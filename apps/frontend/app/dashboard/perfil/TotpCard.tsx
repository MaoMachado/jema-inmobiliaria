"use client";

import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import Image from "next/image";
import api from "@/app/lib/api";
import Button from "@/app/components/Button";

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
  }

  return fallback;
};

export default function TotpCard() {
  const [activo, setActivo] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [codigos, setCodigos] = useState<string[]>([]);
  const [restantes, setRestantes] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api
      .get<{ activado: boolean; recuperacionRestantes: number }>("/auth/totp")
      .then(({ data }) => {
        setActivo(data.activado);
        setRestantes(data.recuperacionRestantes);
      })
      .catch(() => setError("No se pudo consultar el estado de TOTP"));
  }, []);

  const ejecutar = async (accion: () => Promise<void>, mensaje: string) => {
    setError("");
    setSuccess("");

    try {
      await accion();
      setSuccess(mensaje);
    } catch (err) {
      setError(getErrorMessage(err, "No se pudo completar la operación"));
    }
  };

  const iniciar = () =>
    ejecutar(async () => {
      const { data } = await api.post<{ qr: string }>("/auth/totp/iniciar");
      setQr(data.qr);
    }, "");

  const confirmar = () =>
    ejecutar(async () => {
      const { data } = await api.post<{ codigosRecuperacion: string[] }>(
        "/auth/totp/confirmar",
        { codigo },
      );
      setActivo(true);
      setQr(null);
      setCodigo("");
      setCodigos(data.codigosRecuperacion);
      setRestantes(data.codigosRecuperacion.length);
    }, "Verificación en dos pasos activada.");

  const regenerar = () =>
    ejecutar(async () => {
      const { data } = await api.post<{ codigosRecuperacion: string[] }>(
        "/auth/totp/recuperacion",
        { password, codigo },
      );
      setCodigos(data.codigosRecuperacion);
      setRestantes(data.codigosRecuperacion.length);
      setPassword("");
      setCodigo("");
    }, "Códigos de recuperación regenerados.");

  const desactivar = () =>
    ejecutar(async () => {
      await api.post("/auth/totp/desactivar", { password });
      setActivo(false);
      setPassword("");
      setCodigos([]);
      setRestantes(0);
    }, "Verificación en dos pasos desactivada.");

  return (
    <section className="flex flex-col gap-3 border-t border-gray-700/50 pt-6">
      <h2 className="text-center text-xl font-semibold tracking-wider">
        Verificación en dos pasos
      </h2>
      <p className="text-sm text-gray-400 text-center max-w-xl mx-auto">
        Además de tu contraseña, te pediremos un código de tu app autenticadora
        para abrir documentos.
      </p>

      {error && <p className="text-sm text-red-400 text-center">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-400 text-center">{success}</p>
      )}

      {codigos.length > 0 && (
        <div className="max-w-md mx-auto w-full space-y-2 rounded-lg border border-amber-700/50 bg-amber-950/20 p-3">
          <p className="text-sm text-amber-200">
            Guarda estos códigos en un lugar seguro. No se volverán a mostrar y
            cada uno sirve una sola vez.
          </p>
          <pre className="grid grid-cols-2 gap-1 text-xs text-gray-200">
            {codigos.join("\n")}
          </pre>
          <Button
            title="Copiar códigos"
            onClick={() => navigator.clipboard.writeText(codigos.join("\n"))}
          />
        </div>
      )}

      {activo ? (
        <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
          <p className="text-xs text-gray-400 text-center">
            {restantes} códigos de recuperación sin usar
          </p>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white text-sm"
          />
          <input
            inputMode="numeric"
            maxLength={6}
            placeholder="Código de la app"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white text-sm tracking-widest"
          />
          <Button
            title="Generar códigos de recuperación"
            onClick={regenerar}
            disabled={!password || codigo.length !== 6}
          />
          <Button
            title="Desactivar"
            onClick={desactivar}
            disabled={!password}
            variant="danger"
          />
        </div>
      ) : qr ? (
        <div className="flex flex-col items-center gap-3">
          <Image
            src={qr}
            alt="Código QR para tu app autenticadora"
            width={200}
            height={200}
            unoptimized
            className="rounded-lg bg-white p-2"
          />
          <input
            inputMode="numeric"
            maxLength={6}
            placeholder="Código de 6 dígitos"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            className="px-3 py-2 border border-gray-700 bg-gray-950 rounded-lg text-white text-sm tracking-widest"
          />
          <Button
            title="Confirmar y activar"
            onClick={confirmar}
            disabled={codigo.length !== 6}
          />
        </div>
      ) : (
        <Button title="Activar TOTP" onClick={iniciar} className="mx-auto" />
      )}
    </section>
  );
}
