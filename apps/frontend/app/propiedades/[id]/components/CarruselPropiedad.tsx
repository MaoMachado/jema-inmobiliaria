"use client";

import { useState } from "react";

interface CarruselPropiedadProps {
  fotografias?: string[];
  titulo: string;
}

export default function CarruselPropiedad({
  fotografias = [],
  titulo,
}: CarruselPropiedadProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = fotografias.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  // Si no hay fotografías cargadas, mostramos un placeholder elegante
  if (!fotografias || total === 0) {
    return (
      <div className="w-full h-80 md:h-112.5 bg-gray-800/60 border border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400">
        <span className="text-6xl mb-3">🏠</span>
        <p className="text-lg font-medium">Sin fotografías disponibles</p>
        <p className="text-sm text-gray-500">
          Esta propiedad aún no tiene imágenes subidas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full h-80 md:h-120 bg-gray-900 rounded-2xl overflow-hidden border border-gray-700/60 shadow-xl group">
        <img
          src={fotografias[currentIndex]}
          alt={`${titulo} - Foto ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300 select-none"
        />

        <div className="absolute top-4 right-4 bg-gray-950/75 backdrop-blur-md text-white text-xs md:text-sm font-semibold px-3 py-1.5 rounded-full border border-gray-700/60 z-10">
          📷 {currentIndex + 1} / {total}
        </div>

        {total > 1 && (
          <>
            <button
              onClick={handlePrev}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-gray-950/70 hover:bg-gray-950/90 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110 opacity-90 group-hover:opacity-100"
            >
              ❮
            </button>
            <button
              onClick={handleNext}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-950/70 hover:bg-gray-950/90 text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl font-bold backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110 opacity-90 group-hover:opacity-100"
            >
              ❯
            </button>
          </>
        )}
      </div>

      {total > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700">
          {fotografias.map((foto, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative shrink-0 w-20 h-16 md:w-24 md:h-20 rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                index === currentIndex
                  ? "border-sky-400 scale-105 shadow-md shadow-sky-500/20"
                  : "border-transparent opacity-60 hover:opacity-100 hover:border-gray-500"
              }`}
            >
              <img
                src={foto}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
