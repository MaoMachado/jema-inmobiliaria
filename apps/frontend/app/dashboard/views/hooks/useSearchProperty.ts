"use client";

import { useState } from "react";
import { Propiedad } from "@/app/lib/types";
import api from "@/app/lib/api";
import { isAxiosError } from "axios";

export type Ciudad = "" | "Medellin" | "Ibague" | "Bogota";
export type Tipo = "" | "Casa" | "Apartamento" | "Local" | "Oficina" | "Lote";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

interface useSearchPropertyProps {
  onResult: (data: Propiedad[]) => void;
  onClear: () => void;
}

export function useSearchProperty({
  onResult,
  onClear,
}: useSearchPropertyProps) {
  const [ciudad, setCiudad] = useState<Ciudad>("");
  const [tipo, setTipo] = useState<Tipo>("");
  const [habitaciones, setHabitaciones] = useState<number | "">("");
  const [precioMin, setPrecioMin] = useState<number | "">("");
  const [precioMax, setPrecioMax] = useState<number | "">("");
  const [orderBy, setOrderBy] = useState<"precio" | "createdAt" | "puntaje">(
    "puntaje",
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [resultados, setResultados] = useState<Propiedad[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const buscar = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get<Propiedad[]>("/propiedades/mis-propiedades");
      let data = res.data;

      if (ciudad) {
        data = data.filter(
          (p) => p.ciudad.toLowerCase() === ciudad.toLowerCase(),
        );
      }

      if (tipo) {
        data = data.filter((p) => p.tipo.toLowerCase() === tipo.toLowerCase());
      }

      if (habitaciones !== "") {
        data = data.filter((p) => p.habitaciones >= Number(habitaciones));
      }

      if (precioMin !== "") {
        data = data.filter((p) => p.precio >= Number(precioMin));
      }

      if (precioMax !== "") {
        data = data.filter((p) => p.precio <= Number(precioMax));
      }

      data.sort((a, b) => {
        let valA = a[orderBy] ?? 0;
        let valB = b[orderBy] ?? 0;

        if (orderBy === "createdAt") {
          valA = new Date(a.createdAt).getTime();
          valB = new Date(b.createdAt).getTime();
        }

        return order === "asc"
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });

      setResultados(data);
      setHasSearched(true);
      onResult?.(data);
    } catch (error) {
      console.error("Error al buscar propiedades", error);

      if (isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Error al buscar propiedades",
        );
      } else {
        setError("Error al buscar propiedades");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    buscar();
  };

  const handleClear = () => {
    setCiudad("");
    setTipo("");
    setHabitaciones("");
    setPrecioMin("");
    setPrecioMax("");
    setOrderBy("puntaje");
    setOrder("desc");
    setResultados([]);
    setError("");
    setHasSearched(false);
    onClear?.();
  };

  const hasActiveFiltros =
    ciudad !== "" ||
    tipo !== "" ||
    habitaciones !== "" ||
    precioMin !== "" ||
    precioMax !== "";

  return {
    ciudad,
    setCiudad,
    tipo,
    setTipo,
    habitaciones,
    setHabitaciones,
    precioMin,
    setPrecioMin,
    precioMax,
    setPrecioMax,
    orderBy,
    setOrderBy,
    order,
    setOrder,
    resultados,
    loading,
    error,
    hasSearched,
    hasActiveFiltros,
    handleSearch,
    handleClear,
  };
}
