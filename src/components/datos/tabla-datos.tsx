"use client";

import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, InboxIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SkeletonTabla } from "@/components/feedback/skeleton";
import { CABECERA_TABLA, CONTENEDOR_TABLA, PieTabla, TablaVacia } from "@/components/patrones/pie-tabla";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { POR_PAGINA_DEFECTO } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

export type Columna<T> = {
  id: string;
  titulo: ReactNode;
  /** Celda; por defecto `String(fila[id])`. */
  render?: (fila: T) => ReactNode;
  /** Valor para ordenar; por defecto `fila[id]`. */
  valor?: (fila: T) => string | number | null | undefined;
  ordenable?: boolean;
  alinear?: "izquierda" | "derecha";
  /** Clases extra de la celda (p. ej. `font-mono whitespace-nowrap`). */
  className?: string;
  ancho?: string;
};

/**
 * Tabla genérica tipada: columnas declarativas, orden por columna, paginación en cliente, estados vacío y cargando.
 * Para listas grandes paginadas en servidor usa `Table` + `PieTabla` directamente.
 */
export function TablaDatos<T>({
  columnas,
  filas,
  clave,
  unidad = "registros",
  cargando,
  vacio = "No hay registros.",
  ordenInicial,
  porPaginaInicial = POR_PAGINA_DEFECTO,
  nota,
  onFila,
  className,
}: {
  columnas: Columna<T>[];
  filas: T[];
  clave: (fila: T) => string;
  unidad?: string;
  cargando?: boolean;
  vacio?: ReactNode;
  ordenInicial?: { id: string; dir: "asc" | "desc" };
  porPaginaInicial?: number;
  nota?: ReactNode;
  onFila?: (fila: T) => void;
  className?: string;
}) {
  const [orden, setOrden] = useState(ordenInicial ?? null);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(porPaginaInicial);

  const ordenadas = useMemo(() => {
    if (!orden) return filas;
    const col = columnas.find((c) => c.id === orden.id);
    if (!col) return filas;
    const v = col.valor ?? ((f: T) => (f as Record<string, unknown>)[col.id] as string | number | null | undefined);
    return [...filas].sort((a, b) => {
      const x = v(a) ?? "";
      const y = v(b) ?? "";
      const r = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "es");
      return orden.dir === "asc" ? r : -r;
    });
  }, [filas, columnas, orden]);

  const ultimaPagina = Math.max(1, Math.ceil(ordenadas.length / porPagina));
  const paginaActual = Math.min(pagina, ultimaPagina);
  const visibles = ordenadas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  function alternar(id: string) {
    setOrden((o) => (o?.id === id ? (o.dir === "asc" ? { id, dir: "desc" } : null) : { id, dir: "asc" }));
    setPagina(1);
  }

  if (cargando) return <SkeletonTabla columnas={columnas.length} />;

  return (
    <div className={cn(CONTENEDOR_TABLA, className)}>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/80 bg-muted hover:bg-muted">
            {columnas.map((c, i) => (
              <TableHead key={c.id} style={{ width: c.ancho }} className={cn(CABECERA_TABLA, i === 0 && "pl-4", i === columnas.length - 1 && "pr-4", c.alinear === "derecha" && "text-right")}>
                {c.ordenable ? (
                  <button type="button" onClick={() => alternar(c.id)} className={cn("inline-flex items-center gap-1 uppercase hover:text-foreground", orden?.id === c.id && "text-foreground")}>
                    {c.titulo}
                    {orden?.id === c.id ? orden.dir === "asc" ? <ArrowUpIcon className="size-3" /> : <ArrowDownIcon className="size-3" /> : <ArrowUpDownIcon className="size-3 opacity-50" />}
                  </button>
                ) : (
                  c.titulo
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="text-[13px]">
          {visibles.map((f) => (
            <TableRow
              key={clave(f)}
              onClick={onFila ? () => onFila(f) : undefined}
              className={cn("group border-b border-border/60 hover:bg-muted/80", onFila && "cursor-pointer")}
            >
              {columnas.map((c, i) => (
                <TableCell key={c.id} className={cn("px-3 py-2", i === 0 && "pl-4", i === columnas.length - 1 && "pr-4", c.alinear === "derecha" && "text-right tabular-nums", c.className)}>
                  {c.render ? c.render(f) : String((f as Record<string, unknown>)[c.id] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
          {visibles.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnas.length}>
                <TablaVacia icon={<InboxIcon className="size-6" />}>{vacio}</TablaVacia>
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
      <PieTabla
        desde={visibles.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1}
        hasta={(paginaActual - 1) * porPagina + visibles.length}
        total={ordenadas.length}
        unidad={unidad}
        porPagina={porPagina}
        onPorPagina={(n) => {
          setPorPagina(n);
          setPagina(1);
        }}
        pagina={paginaActual}
        ultimaPagina={ultimaPagina}
        onPagina={setPagina}
        nota={nota}
      />
    </div>
  );
}
