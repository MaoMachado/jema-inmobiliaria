"use client";

import { useState } from "react";
import { Propiedad } from "@/app/lib/types";
import api from "@/app/lib/api";

export type Ciudad = "" | "Medellin" | "Ibague" | "Bogota";
export type Tipo = "" | "Casa" | "Apartamento" | "Local" | "Oficina" | "Lote";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type ErrorBody = { message?: string | string[] };

const formatError = (body: ErrorBody | undefined): string => {
  const msg = body?.message;
  if (!msg) return "Error al buscar propiedades";
  return Array.isArray(msg) ? msg.join(", ") : msg;
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
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const buscar = async (overrides?: { page?: number }) => {
    setLoading(true);
    setError("");

    const precioMinNum = precioMin === "" ? undefined : Number(precioMin);
    const precioMaxNum = precioMax === "" ? undefined : Number(precioMax);

    try {
      const res = await api.get<Propiedad[]>("/propiedades/mis-propiedades", {
        params: {
          ciudad: ciudad || undefined,
          tipo: tipo || undefined,
          precioMin:
            precioMinNum !== undefined && precioMinNum > 0
              ? precioMinNum
              : undefined,
          precioMax:
            precioMaxNum !== undefined && precioMaxNum > 0
              ? precioMaxNum
              : undefined,
          habitaciones:
            habitaciones === "" || habitaciones === 0
              ? undefined
              : Number(habitaciones),
          page: overrides?.page ?? page,
          limit: 10,
          orderBy,
          order,
        },
      });

      setResultados(res.data);
      setPagination(null);
      setHasSearched(true);
      onResult?.(res.data);
    } catch (error: any) {
      console.error("Error al buscar propiedades", error);
      setError(formatError(error.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    buscar({ page: 1 });
  };

  const changePage = (nueva: number) => {
    setPage(nueva);
    buscar({ page: nueva });
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
    setPagination(null);
    setPage(1);
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
    pagination,
    page,
    loading,
    error,
    hasSearched,
    hasActiveFiltros,
    handleSearch,
    changePage,
    handleClear,
  };
}
