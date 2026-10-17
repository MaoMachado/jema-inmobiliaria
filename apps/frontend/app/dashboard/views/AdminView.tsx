"use client";

import { useState, useEffect, useRef } from "react";
import { usePublicationReq } from "./hooks/usePublicationRequests";
import ManagementUsers from "./viewAdmin/ManagementUsers";
import ManagementPayment from "./viewAdmin/ManagementPayment";
import ManagementFrauds from "./viewAdmin/ManagementFrauds";
import ManagementReports from "./viewAdmin/ManagementReports";
import PublicationRequest from "./viewAdmin/PublicationRequest";
import ChatIA from "@/app/components/ChatIA";
import Icon, { IconName } from "@/app/components/Icons";

type View = "users" | "payments" | "frauds" | "reports";

const NAV_ITEMS: { id: View; label: string; icon: IconName }[] = [
  { id: "users", label: "Usuarios", icon: "building" },
  { id: "payments", label: "Pagos y Planes", icon: "star" },
  { id: "frauds", label: "Reportes de Fraude", icon: "alert" },
  { id: "reports", label: "Métricas y Análisis", icon: "chart" },
];

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

  return (
    <article className="space-y-6">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-900/60 border border-gray-800/80 p-4 rounded-2xl backdrop-blur-sm">
        <nav className="flex flex-wrap gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer focus-visible:ring-2 focus-visible:ring-sky-500 ${
                view === item.id
                  ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30"
                  : "bg-gray-800/60 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/50"
              }`}
            >
              <Icon name={item.icon} className="w-4 h-4" />
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
          <Icon name="clock" className="w-4 h-4 shrink-0" />
          <span>
            {pendientes.length === 0
              ? "Sin solicitudes pendientes"
              : `${pendientes.length} solicitud(es) de publicación`}
          </span>
        </button>
      </header>

      <section className="min-h-125">
        {view === "users" && <ManagementUsers />}
        {view === "payments" && <ManagementPayment />}
        {view === "frauds" && <ManagementFrauds />}
        {view === "reports" && <ManagementReports />}
      </section>

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

      <ChatIA />
    </article>
  );
}
