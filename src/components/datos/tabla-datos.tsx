"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { ArrowDownIcon, ArrowUpIcon, ArrowsDownUpIcon, CheckIcon, MinusIcon, TrayIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import { SkeletonTabla } from "@/components/feedback/skeleton";
import { MovimientoLocal } from "@/components/movimiento";
import { CABECERA_TABLA, CONTENEDOR_TABLA, PieTabla, TablaVacia } from "@/components/patrones/pie-tabla";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";
import { POR_PAGINA_DEFECTO } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

const CASILLA_CELDA =
  "flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-input bg-card transition-colors duration-(--duracion-rapida) ease-salida outline-none focus-visible:ring-3 focus-visible:ring-acento/55 data-checked:border-primary data-checked:bg-primary data-indeterminate:border-primary data-indeterminate:bg-primary";

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
        {indeterminate ? <MinusIcon className="size-3" weight="bold" /> : <CheckIcon className="size-3" weight="bold" />}
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

export type OrdenTabla = { id: string; dir: "asc" | "desc" } | null;

/** Ordena las filas como lo hace la tabla; quien exporta lo reutiliza para respetar el orden que se ve en pantalla. */
export function ordenarFilas<T>(filas: T[], columnas: Columna<T>[], orden: OrdenTabla): T[] {
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
}

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
  onOrdenCambio,
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
  /** Avisa el orden elegido por el usuario (p. ej. para exportar en el mismo orden). */
  onOrdenCambio?: (orden: OrdenTabla) => void;
  /** Activa la columna de checkboxes y la barra de acciones masivas. "Seleccionar todo" opera solo sobre la página visible. */
  seleccion?: {
    seleccionados: string[];
    onCambio: (ids: string[]) => void;
    /** Botones de la barra que aparece con `seleccionados.length > 0`; construidos por quien llama, que ya tiene los ids. */
    acciones?: ReactNode;
  };
  className?: string;
}) {
  const [orden, setOrdenInterno] = useState<OrdenTabla>(ordenInicial ?? null);
  const setOrden = (fn: (o: OrdenTabla) => OrdenTabla) => {
    const nuevo = fn(orden);
    setOrdenInterno(nuevo);
    onOrdenCambio?.(nuevo);
  };
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(porPaginaInicial);

  const ordenadas = useMemo(() => ordenarFilas(filas, columnas, orden), [filas, columnas, orden]);

  const ultimaPagina = Math.max(1, Math.ceil(ordenadas.length / porPagina));
  const paginaActual = Math.min(pagina, ultimaPagina);
  const visibles = ordenadas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  function alternar(id: string) {
    setOrden((o) => (o?.id === id ? (o.dir === "asc" ? { id, dir: "desc" } : null) : { id, dir: "asc" }));
    setPagina(1);
  }

  const idsVisibles = visibles.map(clave);
  // La altura no es una transformación: MotionConfig no la anula con «reducir movimiento», así que se corta aquí.
  const reducir = useReducedMotion();
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
      <MovimientoLocal><AnimatePresence initial={false}>
      {seleccion && seleccionados.length > 0 ? (
        <m.div
          key="barra-masiva"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reducir ? { duration: 0 } : { duration: DURACION.media, ease: CURVA_SALIDA }}
          className="overflow-hidden"
        >
        {/* Barra de acciones masivas: píldora oscura sobre la tabla, contador en el acento, acciones en píldora
            (recetas ACCION_MASIVA / ACCION_MASIVA_PELIGRO) y «Quitar selección» al final. */}
        <div className="px-1 pt-2 pb-1">
          <div
            role="toolbar"
            aria-label="Acciones sobre la selección"
            className="flex flex-wrap items-center gap-1 rounded-full bg-foreground py-1 pr-1 pl-1.5 text-control text-background shadow-elevada"
          >
            <span className="flex items-center gap-2 pr-2">
              <span className="grid h-7 min-w-7 place-items-center rounded-full bg-acento px-2 text-control font-semibold text-acento-texto tabular-nums">
                {seleccionados.length}
              </span>
              <span className="font-medium">seleccionado{seleccionados.length === 1 ? "" : "s"}</span>
            </span>
            <span aria-hidden className="mx-1 h-5 w-px bg-background/20" />
            <div className="flex flex-1 flex-wrap items-center gap-0.5">{seleccion.acciones}</div>
            <button
              type="button"
              aria-label="Quitar selección"
              title="Quitar selección"
              onClick={() => seleccion.onCambio([])}
              className="grid size-8 shrink-0 place-items-center rounded-full text-background/70 transition-colors hover:bg-background/12 hover:text-background focus-visible:ring-2 focus-visible:ring-acento focus-visible:outline-none"
            >
              <XIcon weight="bold" className="size-4" />
            </button>
          </div>
        </div>
        </m.div>
      ) : null}
      </AnimatePresence></MovimientoLocal>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {seleccion ? (
              <TableHead className="w-10 pl-4">
                <CasillaCelda etiqueta="Seleccionar todo en esta página" checked={todosSeleccionados} indeterminate={algunoSeleccionado} onCheckedChange={alternarTodos} />
              </TableHead>
            ) : null}
            {columnas.map((c, i) => (
              <TableHead key={c.id} style={{ width: c.ancho }} className={cn(CABECERA_TABLA, i === 0 && !seleccion && "pl-4", i === columnas.length - 1 && "pr-4", c.alinear === "derecha" && "text-right")}>
                {c.ordenable ? (
                  <button type="button" onClick={() => alternar(c.id)} className={cn("inline-flex items-center gap-1 hover:text-foreground", orden?.id === c.id && "text-foreground")}>
                    {c.titulo}
                    {orden?.id === c.id ? orden.dir === "asc" ? <ArrowUpIcon weight="bold" className="size-3" /> : <ArrowDownIcon weight="bold" className="size-3" /> : <ArrowsDownUpIcon weight="bold" className="size-3 opacity-50" />}
                  </button>
                ) : (
                  c.titulo
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="text-control">
          {visibles.map((f) => {
            const id = clave(f);
            return (
              <TableRow
                key={id}
                onClick={onFila ? () => onFila(f) : undefined}
                data-state={seleccion?.seleccionados.includes(id) ? "selected" : undefined}
                className={cn("group", onFila && "cursor-pointer")}
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
                <TablaVacia icon={<TrayIcon className="size-6" />}>{vacio}</TablaVacia>
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
