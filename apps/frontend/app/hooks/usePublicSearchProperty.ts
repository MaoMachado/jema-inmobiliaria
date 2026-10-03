"use client";

import { useCallback, useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Propiedad } from "@/app/lib/types";
import api from "@/app/lib/api";

export type Ciudad = "" | "Medellin" | "Ibague" | "Fresno";
export type Tipo = "" | "Casa" | "Apartamento" | "Local" | "Oficina" | "Lote";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export const usePublicSearchProperty = () => {
  const [ciudad, setCiudad] = useState<Ciudad>("");
  const [tipo, setTipo] = useState<Tipo>("");
  const [habitaciones, setHabitaciones] = useState<number | "">("");
  const [precioMin, setPrecioMin] = useState<number | "">("");
  const [precioMax, setPrecioMax] = useState<number | "">("");
  const [orderBy, setOrderBy] = useState<"precio" | "createdAt" | "puntaje">(
    "createdAt",
  );
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const [resultados, setResultados] = useState<Propiedad[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const buscar = useCallback(
    async (targetPage = page) => {
      setLoading(true);
      setError("");

      const precioMinNum = precioMin === "" ? undefined : Number(precioMin);
      const precioMaxNum = precioMax === "" ? undefined : Number(precioMax);

      try {
        const res = await api.get("/propiedades", {
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
            page: targetPage,
            limit: 10,
            orderBy,
            order,
          },
        });

        setResultados(res.data.data ?? []);
        setPagination(res.data.pagination ?? null);
        setHasSearched(true);
      } catch (error: unknown) {
        if (isAxiosError(error)) {
          setError(
            error.response?.data?.message ?? "Error al consultar propiedades.",
          );
        } else {
          setError("Error inesperado al buscar inmuebles.");
        }
      } finally {
        setLoading(false);
      }
    },
    [ciudad, tipo, precioMin, precioMax, habitaciones, orderBy, order, page],
  );

  useEffect(() => {
    buscar(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setPage(1);
    buscar(1);
  };

  const changePage = (nuevaPagina: number) => {
    setPage(nuevaPagina);
    buscar(nuevaPagina);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClear = () => {
    setCiudad("");
    setTipo("");
    setHabitaciones("");
    setPrecioMin("");
    setPrecioMax("");
    setOrderBy("puntaje");
    setOrder("desc");
    setPage(1);
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
};
