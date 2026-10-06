"use client";

import { useState, useEffect, useRef } from "react";
import { usePublicationReq } from "./hooks/usePublicationRequests";
import ManagementUsers from "./viewAdmin/ManagementUsers";
import ManagementPayment from "./viewAdmin/ManagementPayment";
import ManagementFrauds from "./viewAdmin/ManagementFrauds";
import ManagementReports from "./viewAdmin/ManagementReports";
import PublicationRequest from "./viewAdmin/PublicationRequest";
import ChatIA from "@/app/components/ChatIA";

type View = "users" | "payments" | "frauds" | "reports";

export default function AdminView() {
  const [view, setView] = useState<View>("users");
  const [viewPublicationRequest, setViewPublicationRequest] = useState(false);

  const {
    pendientes,
    loading,
    message,
    refresh,
    handleAprobar,
    confirmarRechazo,
    motivoError,
    pendingId,
    motivoModal,
    setMotivoModal,
    setMotivo,
    setMotivoError,
    motivo,
  } = usePublicationReq();

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      refresh();
    }
  }, [refresh]);

  const navItems = [
    { id: "users" as const, label: "Usuarios", icon: "👥" },
    { id: "payments" as const, label: "Pagos y Planes", icon: "💳" },
    { id: "frauds" as const, label: "Reportes de Fraude", icon: "🛡️" },
    { id: "reports" as const, label: "Métricas y Análisis", icon: "📊" },
  ];

  const tituloBtn =
    pendientes.length === 0
      ? "Sin solicitudes"
      : `Tiene ${pendientes.length} solicitud(es) de publicación`;

  return (
    <article className="space-y-6">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl backdrop-blur-sm">
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                view === item.id
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                  : "bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/50"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button
          onClick={() => setViewPublicationRequest(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
            pendientes.length > 0
              ? "bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 animate-pulse"
              : "bg-gray-800/60 text-gray-400 border-gray-700/50 hover:bg-gray-800"
          }`}
        >
          <span>📬</span>
          <span>
            {pendientes.length === 0
              ? "Sin solicitudes pendientes"
              : `${pendientes.length} solicitud(es) de publicación`}
          </span>
        </button>

        {viewPublicationRequest && (
          <PublicationRequest
            onClick={() => setViewPublicationRequest(false)}
            initialData={pendientes}
            onRefresh={refresh}
            handleAprobar={handleAprobar}
            confirmarRechazo={confirmarRechazo}
            loading={loading}
            pendingId={pendingId}
            motivoModal={motivoModal}
            setMotivoModal={setMotivoModal}
            motivo={motivo}
            setMotivo={setMotivo}
            motivoError={motivoError}
            setMotivoError={setMotivoError}
            message={message}
          />
        )}
      </header>

      <section className="min-h-125">
        {view === "users" && <ManagementUsers />}
        {view === "payments" && <ManagementPayment />}
        {view === "frauds" && <ManagementFrauds />}
        {view === "reports" && <ManagementReports />}
      </section>

      <ChatIA />
    </article>
  );
}
