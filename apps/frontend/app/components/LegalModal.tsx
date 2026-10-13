"use client";

import { useEffect } from "react";

export type TipoDocumentoLegal = "terminos" | "privacidad" | "habeas_data";

interface LegalModalProps {
  isOpen: boolean;
  tipo: TipoDocumentoLegal | null;
  onClose: () => void;
}

const DOCUMENTOS: Record<
  TipoDocumentoLegal,
  {
    titulo: string;
    subtitulo: string;
    secciones: { encabezado: string; contenido: string }[];
  }
> = {
  terminos: {
    titulo: "Términos y Condiciones de Uso",
    subtitulo: "Última actualización: Septiembre 2026",
    secciones: [
      {
        encabezado: "1. Aceptación de los Términos",
        contenido:
          "Al acceder y utilizar la plataforma JEMA Inmobiliaria, el usuario acepta de manera plena y sin reservas los presentes Términos y Condiciones. Si no está de acuerdo con alguna disposición, debe abstenerse de usar el servicio.",
      },
      {
        encabezado: "2. Objeto de la Plataforma",
        contenido:
          "JEMA Inmobiliaria es una plataforma digital de intermediación que facilita la publicación, consulta y contacto directo entre propietarios, agentes y potenciales compradores o arrendatarios de bienes raíces en Colombia.",
      },
      {
        encabezado: "3. Registro y Veracidad de la Información",
        contenido:
          "El usuario se compromete a suministrar información veraz, actualizada y comprobable. Las publicaciones que contengan precios falsos, fotos engañosas, documentos adulterados o sospecha de fraude serán rechazadas o dadas de baja sin previo aviso.",
      },
      {
        encabezado: "4. Planes, Pagos y Monetización",
        contenido:
          "El acceso a ciertas funciones avanzadas (como destacar propiedades o aumentar cupos de publicación) está sujeto a los planes vigentes (Gratis, Básico, Premium). Los pagos se realizan mediante los canales habilitados y están sujetos a verificación administrativa.",
      },
      {
        encabezado: "5. Limitación de Responsabilidad",
        contenido:
          "JEMA Inmobiliaria provee herramientas de auditoría y confianza, pero las transacciones finales de compraventa o arrendamiento se celebran directamente entre las partes involucradas. La plataforma no asume responsabilidad por acuerdos privados o vicios ocultos de los inmuebles.",
      },
    ],
  },
  privacidad: {
    titulo: "Política de Privacidad y Cookies",
    subtitulo: "Seguridad y resguardo de tu información digital",
    secciones: [
      {
        encabezado: "1. Datos que Recolectamos",
        contenido:
          "Recopilamos información personal básica (nombres, apellidos, correo electrónico, número celular) y, para usuarios que publican propiedades, documentos acreditativos de propiedad e imágenes del inmueble.",
      },
      {
        encabezado: "2. Finalidad del Tratamiento",
        contenido:
          "Utilizamos tus datos para: autenticar tu sesión de forma segura, verificar tu identidad mediante códigos OTP (SMS), habilitar el botón de contacto directo por WhatsApp con interesados, y alimentar el modelo de estimación inteligente con Inteligencia Artificial.",
      },
      {
        encabezado: "3. Uso de Cookies y Almacenamiento Local",
        contenido:
          "Utilizamos cookies httpOnly para mantener tu sesión activa de forma segura (token de acceso de corta duración y token de refresco), almacenamiento local para recordar tus preferencias de búsqueda y tu consentimiento de privacidad. No vendemos ni comercializamos tus datos con redes de publicidad externas.",
      },
      {
        encabezado: "4. Seguridad de la Información",
        contenido:
          "Aplicamos medidas de seguridad reforzadas: contraseñas cifradas con bcrypt, hashes SHA-256 con pepper para códigos OTP y almacenamiento en la nube con Supabase Storage, sirviendo los documentos privados con URLs firmadas de acceso temporal.",
      },
    ],
  },
  habeas_data: {
    titulo: "Tratamiento de Datos Personales (Habeas Data)",
    subtitulo: "Conforme a la Ley Estatutaria 1581 de 2012 de Colombia",
    secciones: [
      {
        encabezado: "1. Marco Normativo",
        contenido:
          "JEMA Inmobiliaria actúa como Responsable del Tratamiento de Datos Personales en estricto cumplimiento de la Ley 1581 de 2012 y el Decreto Reglamentario 1377 de 2013 de la República de Colombia.",
      },
      {
        encabezado: "2. Derechos del Titular de los Datos",
        contenido:
          "Como titular de tus datos, tienes derecho en todo momento a: conocer, actualizar y rectificar tus datos personales; solicitar prueba de la autorización otorgada; ser informado del uso dado a tus datos; revocar la autorización o solicitar la supresión de tus datos de nuestras bases de datos.",
      },
      {
        encabezado: "3. Procedimiento para Consultas y Reclamos (PQRS)",
        contenido:
          "Para ejercer tus derechos de Habeas Data, puedes enviar una solicitud formal al correo electrónico: soporte@jemainmobiliaria.com con el asunto 'Derecho de Habeas Data', indicando tu nombre, cédula y la petición concreta (actualización o eliminación). Tu solicitud será atendida en un plazo máximo de 10 a 15 días hábiles.",
      },
      {
        encabezado: "4. Autorización Expresa",
        contenido:
          "Al registrarte en JEMA Inmobiliaria o aceptar el aviso de cookies y privacidad, autorizas libre, expresa e informadamente el tratamiento de tus datos para los fines descritos en esta política.",
      },
    ],
  },
};

export default function LegalModal({ isOpen, tipo, onClose }: LegalModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !tipo) return null;

  const doc = DOCUMENTOS[tipo];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl max-h-[85vh] bg-gray-900 border border-gray-700/80 rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-800 bg-gray-950/60">
          <div>
            <h3
              id="legal-modal-title"
              className="text-lg sm:text-xl font-bold text-white tracking-wide"
            >
              {doc.titulo}
            </h3>
            <p className="text-xs text-sky-400 mt-0.5">{doc.subtitulo}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm text-gray-300 leading-relaxed">
          {doc.secciones.map((sec, idx) => (
            <article key={idx} className="space-y-1.5">
              <h4 className="font-semibold text-white text-base">
                {sec.encabezado}
              </h4>
              <p className="text-gray-400 text-xs sm:text-sm">
                {sec.contenido}
              </p>
            </article>
          ))}
        </div>

        <div className="p-4 sm:p-5 border-t border-gray-800 bg-gray-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-gray-950 font-bold text-xs tracking-wide transition shadow-sm"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
