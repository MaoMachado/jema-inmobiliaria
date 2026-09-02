"use client";

import { useEffect, useState } from "react";
import { DocumentoPropiedad, Usuario } from "@/app/lib/types";
import { DocumentoImgModal } from "../../Modal/DocumentoImgModal";
import Button from "@/app/components/Button";
import api from "@/app/lib/api";

export default function ManagementUsers() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [documentos, setDocumentos] = useState<DocumentoPropiedad[]>([]);

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/usuarios");
      setUsers(res.data);
    } catch (error) {
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneUser = async (id: string, current: boolean) => {
    try {
      await api.patch(`/usuarios/${id}/verificar-telefono`, {
        verificado: !current,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, celularVerificado: !current } : u,
        ),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerDocumento = async (id: string) => {
    try {
      const res = await api.get(`/usuarios/${id}/documentos-propiedad`);
      if (res.data.length > 0) {
        setDocumentos(res.data);
        setShowModal(true);
      } else {
        console.log("No se encontraron documentos para este usuario.");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerificarDocumento = async (docId: string, current: boolean) => {
    try {
      await api.patch(`/propiedades/documentos/${docId}/verificar`, {
        verificado: !current,
      });

      setDocumentos((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, verificado: !current } : d)),
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <article>
      <h1 className="text-4xl font-bold text-center">Gestión De Usuarios</h1>

      <section className="flex gap-6  mt-6">
        {loading ? (
          <p>Cargando...</p>
        ) : users.length === 0 ? (
          <p>No hay usuarios registrados</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="w-full lg:w-xs bg-gray-800/50 backdrop-blur flex flex-col gap-y-6 relative border border-blue-900/30 p-3 rounded-md shadow-sm shadow-blue-500/30 text-center"
            >
              <div className="absolute w-20 h-full bg-sky-800/10 blur-md top-0 left-0 -z-10 rounded-l-md" />
              <header className="flex items-center">
                <div>
                  <img
                    src={`https://placehold.co/600x400?text=${user.nombres}`}
                    alt="Foto"
                    width={50}
                    height={50}
                    className="rounded-full"
                  />
                </div>
                <div className="ml-auto flex flex-col">
                  <h1 className="text-2xl font-bold">
                    {user.nombres} {user.apellidos}
                  </h1>
                  <p className="text-sm text-slate-400 font-semibold text-right">
                    {user.celular}
                  </p>
                </div>
              </header>
              <span
                className={`absolute -top-3 left-3 tracking-wider font-semibold px-2 rounded-md text-xs ${user.role === "ADMIN" ? "bg-cyan-500/50" : "bg-sky-500"}`}
              >
                Rol: {user.role}
              </span>

              <p className="text-lg truncate text-start border-r-3 border-slate-600">
                Correo: {user.email}
              </p>

              <p
                className={`text-sm font-semibold ${
                  documentos.every((d) => d.verificado)
                    ? "text-green-400"
                    : "text-yellow-400"
                }`}
              >
                {documentos.every((d) => d.verificado)
                  ? "Documento verificado 📄"
                  : "Documento no verificado"}
              </p>

              <Button
                title="Ver Documento"
                onClick={() => handleVerDocumento(user.id)}
              />
            </div>
          ))
        )}
        {error && (
          <p className="text-red-500 border border-red-500 rounded-md p-2 text-center">
            {error}
          </p>
        )}
      </section>

      {showModal && (
        <DocumentoImgModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          documentos={documentos}
          onVerificar={handleVerificarDocumento}
        />
      )}
    </article>
  );
}
