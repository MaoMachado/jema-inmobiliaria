"use client";

import { useState, useEffect, useRef } from "react";
import { usePublicationReq } from "./hooks/usePublicationRequests";
import Button from "@/app/components/Button";
import ManagementUsers from "./viewAdmin/ManagementUsers";
import ManagementPayment from "./viewAdmin/ManagementPayment";
import ManagementFrauds from "./viewAdmin/ManagementFrauds";
import ManagementReports from "./viewAdmin/ManagementReports";
import PublicationRequest from "./viewAdmin/PublicationRequest";

export default function AdminView() {
  const [view, setView] = useState<"users" | "payments" | "frauds" | "reports">(
    "users",
  );
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

  const tituloBtn =
    pendientes.length === 0
      ? "Sin solicitudes"
      : `Tiene ${pendientes.length} solicitud(es) de publicación`;

  return (
    <article>
      <header className="flex items-center justify-between md:justify-start gap-16 mb-10">
        <img
          src="https://placehold.co/600x400?text=Foto"
          alt="Foto"
          width={100}
          height={100}
          className="rounded-full"
        />

        <nav className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button title="Gestionar Usuarios" onClick={() => setView("users")} />

          <Button title="Gestionar Pagos" onClick={() => setView("payments")} />

          <Button
            title="Reportes de Fraude"
            onClick={() => setView("frauds")}
          />

          <Button title="Generar Reportes" onClick={() => setView("reports")} />
        </nav>

        <Button
          title={tituloBtn}
          variant="secondary"
          onClick={() => setViewPublicationRequest(true)}
          className="ml-auto"
        />

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

      <section>
        <div className={view === "users" ? "" : "hidden"}>
          <ManagementUsers />
        </div>

        <div className={view === "payments" ? "" : "hidden"}>
          <ManagementPayment />
        </div>

        <div className={view === "frauds" ? "" : "hidden"}>
          <ManagementFrauds />
        </div>

        <div className={view === "reports" ? "" : "hidden"}>
          <ManagementReports />
        </div>
      </section>
    </article>
  );
}
