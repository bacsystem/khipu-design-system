"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, CheckIcon, InboxIcon, MinusIcon } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SkeletonTabla } from "@/components/feedback/skeleton";
import { CABECERA_TABLA, CONTENEDOR_TABLA, PieTabla, TablaVacia } from "@/components/patrones/pie-tabla";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { POR_PAGINA_DEFECTO } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

const CASILLA_CELDA =
  "flex size-4 shrink-0 items-center justify-center rounded border border-input bg-muted transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary";

/** Checkbox sin etiqueta visible, para la columna de selección de `TablaDatos` (`Casilla` siempre pinta un texto al lado). */
function CasillaCelda({
  etiqueta,
  checked,
  indeterminate,
  onCheckedChange,
}: {
  etiqueta: string;
  checked: boolean;
  indeterminate?: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <CheckboxPrimitive.Root
      aria-label={etiqueta}
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={onCheckedChange}
      onClick={(e) => e.stopPropagation()}
      className={CASILLA_CELDA}
    >
      <CheckboxPrimitive.Indicator className="text-primary-foreground">
        {indeterminate ? <MinusIcon className="size-3" strokeWidth={3} /> : <CheckIcon className="size-3" strokeWidth={3} />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

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
  seleccion,
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
  /** Activa la columna de checkboxes y la barra de acciones masivas. "Seleccionar todo" opera solo sobre la página visible. */
  seleccion?: {
    seleccionados: string[];
    onCambio: (ids: string[]) => void;
    /** Botones de la barra que aparece con `seleccionados.length > 0`; construidos por quien llama, que ya tiene los ids. */
    acciones?: ReactNode;
  };
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

  const idsVisibles = visibles.map(clave);
  const seleccionados = seleccion?.seleccionados ?? [];
  const todosSeleccionados = idsVisibles.length > 0 && idsVisibles.every((id) => seleccionados.includes(id));
  const algunoSeleccionado = !todosSeleccionados && idsVisibles.some((id) => seleccionados.includes(id));

  function alternarTodos() {
    if (!seleccion) return;
    seleccion.onCambio(todosSeleccionados ? seleccionados.filter((id) => !idsVisibles.includes(id)) : [...new Set([...seleccionados, ...idsVisibles])]);
  }

  function alternarFila(id: string) {
    if (!seleccion) return;
    seleccion.onCambio(seleccionados.includes(id) ? seleccionados.filter((x) => x !== id) : [...seleccionados, id]);
  }

  if (cargando) return <SkeletonTabla columnas={columnas.length} />;

  return (
    <div className={cn(CONTENEDOR_TABLA, className)}>
      {seleccion && seleccionados.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-accent/60 px-4 py-2 text-[12px] text-accent-foreground">
          <span className="font-medium">
            <span className="font-mono font-semibold">{seleccionados.length}</span> seleccionado{seleccionados.length === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            {seleccion.acciones}
            <button type="button" onClick={() => seleccion.onCambio([])} className="text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground">
              Cancelar
            </button>
          </div>
        </div>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border/80 bg-muted hover:bg-muted">
            {seleccion ? (
              <TableHead className="w-10 pl-4">
                <CasillaCelda etiqueta="Seleccionar todo en esta página" checked={todosSeleccionados} indeterminate={algunoSeleccionado} onCheckedChange={alternarTodos} />
              </TableHead>
            ) : null}
            {columnas.map((c, i) => (
              <TableHead key={c.id} style={{ width: c.ancho }} className={cn(CABECERA_TABLA, i === 0 && !seleccion && "pl-4", i === columnas.length - 1 && "pr-4", c.alinear === "derecha" && "text-right")}>
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
          {visibles.map((f) => {
            const id = clave(f);
            return (
              <TableRow
                key={id}
                onClick={onFila ? () => onFila(f) : undefined}
                data-selected={seleccion?.seleccionados.includes(id) || undefined}
                className={cn("group border-b border-border/60 hover:bg-muted/80 data-selected:bg-accent/40", onFila && "cursor-pointer")}
              >
                {seleccion ? (
                  <TableCell className="w-10 pl-4">
                    <CasillaCelda etiqueta={`Seleccionar fila ${id}`} checked={seleccionados.includes(id)} onCheckedChange={() => alternarFila(id)} />
                  </TableCell>
                ) : null}
                {columnas.map((c, i) => (
                  <TableCell
                    key={c.id}
                    className={cn("px-3 py-2", i === 0 && !seleccion && "pl-4", i === columnas.length - 1 && "pr-4", c.alinear === "derecha" && "text-right tabular-nums", c.className)}
                  >
                    {c.render ? c.render(f) : String((f as Record<string, unknown>)[c.id] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          {visibles.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={seleccion ? columnas.length + 1 : columnas.length}>
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
