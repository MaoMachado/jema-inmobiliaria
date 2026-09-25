"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapaPropiedadProps {
  lat: number;
  lng: number;
  titulo?: string;
  direccion?: string;
}

export default function MapaPropiedad({
  lat,
  lng,
  titulo,
  direccion,
}: MapaPropiedadProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
      }).setView([lat, lng], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const customPin = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div style="
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); font-size: 18px;">📍</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([lat, lng], { icon: customPin }).addTo(map);

      if (titulo || direccion) {
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 13px; color: #1e293b;">
            <strong style="font-size: 14px; color: #0284c7;">${titulo ?? "Propiedad"}</strong>
            ${direccion ? `<p style="margin: 4px 0 0; color: #64748b;">${direccion}</p>` : ""}
          </div>
        `);
      }
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, titulo, direccion]);

  return (
    <div className="w-full h-80 rounded-2xl overflow-hidden border border-gray-700/60 shadow-lg relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
