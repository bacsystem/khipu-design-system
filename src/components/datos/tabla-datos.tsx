"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { ArrowDownIcon, ArrowUpIcon, ArrowsDownUpIcon, CheckIcon, MinusIcon, TrayIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
import { SkeletonTabla } from "@/components/feedback/skeleton";
import { MovimientoLocal } from "@/components/movimiento";
import { CABECERA_TABLA, CONTENEDOR_TABLA, PieTabla, TablaVacia, type TextosPieTabla } from "@/components/patrones/pie-tabla";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ordenarFilas, type OrdenTabla } from "@/lib/ordenar";
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";
import { POR_PAGINA_DEFECTO } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

// Fila activa (`filaActiva`): la banda toma `accent` y la primera celda lleva el filo de acento (§12).
const BANDA_ACTIVA = "group-aria-selected/fila:bg-accent";
const BANDA_ACTIVA_INICIO = "group-aria-selected/fila:shadow-[inset_3px_0_0_var(--color-acento)]";
// Tarjeta móvil: la misma banda `secondary` de 12 px de las filas, con la casilla (si hay) a la izquierda.
const TARJETA_MOVIL = "flex items-start gap-3 rounded-xl bg-secondary p-3 text-control";

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

export { ordenarFilas, type OrdenTabla } from "@/lib/ordenar";

/** Textos de la tabla, para traducirlos (por defecto en castellano): los del pie y los de la selección. */
export type TextosTablaDatos = TextosPieTabla & {
  /** Nombre de la barra de acciones masivas. */
  accionesSeleccion: string;
  quitarSeleccion: string;
  seleccionarTodo: string;
  seleccionarFila: (id: string) => string;
  /** Rótulo junto al contador de la barra («3 seleccionados»). */
  seleccionados: (n: number) => string;
};

const TEXTOS_SELECCION_ES: Omit<TextosTablaDatos, keyof TextosPieTabla> = {
  accionesSeleccion: "Acciones sobre la selección",
  quitarSeleccion: "Quitar selección",
  seleccionarTodo: "Seleccionar todo en esta página",
  seleccionarFila: (id) => `Seleccionar fila ${id}`,
  seleccionados: (n) => (n === 1 ? "seleccionado" : "seleccionados"),
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
  titulo,
  tarjetaMovil,
  tarjetaMovilInteractiva = false,
  anchoMinimo,
  pie,
  filaActiva,
  onOrdenCambio,
  reinicioPagina,
  seleccion,
  textos: textosParciales,
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
  /** Nombre accesible de la lista de tarjetas móviles (`aria-label` del `<ul>`). */
  titulo?: string;
  /**
   * Bajo `md` (≤ 767 px) cada fila se dibuja como una tarjeta con lo que devuelve esta función, en una `<ul role="list">`,
   * en vez de la tabla (desde `md` se ve la tabla). Búsqueda, orden, paginación y `seleccion` siguen valiendo. Con
   * `onFila` la tarjeta es un `<button>`: si lo que dibujas tiene botones o enlaces, pon `tarjetaMovilInteractiva` para que
   * sea un `<div>` y ponle tú el enlace principal.
   */
  tarjetaMovil?: (fila: T) => ReactNode;
  /** La tarjeta lleva controles propios: se dibuja como `<div>` aunque haya `onFila` (que entonces no se llama desde ella). */
  tarjetaMovilInteractiva?: boolean;
  /** Ancho mínimo de la tabla (`"48rem"`): por debajo, la tabla hace scroll horizontal dentro de su tarjeta. */
  anchoMinimo?: string;
  /** Fila de totales: el nodo de cada columna por su `id`. Solo se pintan las columnas que se muestran; en móvil, una tarjeta resumen al final. */
  pie?: Partial<Record<string, ReactNode>>;
  /** `clave` de la fila resaltada (la que se ve en un panel o detalle): `aria-selected` y la banda de acento. */
  filaActiva?: string;
  /** Avisa cada orden que elige el usuario (p. ej. para exportar en el mismo orden). No se llama con `ordenInicial`. */
  onOrdenCambio?: (orden: OrdenTabla) => void;
  /**
   * Cuando cambia este valor (p. ej. el texto de búsqueda o un filtro), la tabla vuelve a la página 1. Se compara por
   * identidad (`Object.is`): pasa un primitivo o un valor memoizado, no un objeto escrito en línea (que cambia en cada
   * render del padre y devolvería a la página 1 siempre).
   */
  reinicioPagina?: unknown;
  /** Activa la columna de checkboxes y la barra de acciones masivas. "Seleccionar todo" opera solo sobre la página visible. */
  seleccion?: {
    seleccionados: string[];
    onCambio: (ids: string[]) => void;
    /** Botones de la barra que aparece con `seleccionados.length > 0`; construidos por quien llama, que ya tiene los ids. */
    acciones?: ReactNode;
  };
  /** Textos del pie y de la selección; se pasan tal cual a `PieTabla`. */
  textos?: Partial<TextosTablaDatos>;
  className?: string;
}) {
  const textos = { ...TEXTOS_SELECCION_ES, ...textosParciales };
  const [orden, setOrden] = useState<OrdenTabla>(ordenInicial ?? null);
  const [pagina, setPagina] = useState(1);
  // Volver a la página 1 cuando cambia `reinicioPagina` (la búsqueda, un filtro): si no, el usuario se queda en la
  // página 3 de un resultado nuevo y no ve sus primeras filas. Se ajusta durante el render, sin efecto.
  const [reinicioPrevio, setReinicioPrevio] = useState(reinicioPagina);
  if (!Object.is(reinicioPagina, reinicioPrevio)) {
    setReinicioPrevio(reinicioPagina);
    setPagina(1);
  }
  const [porPagina, setPorPagina] = useState(porPaginaInicial);

  const ordenadas = useMemo(() => ordenarFilas(filas, columnas, orden), [filas, columnas, orden]);

  const ultimaPagina = Math.max(1, Math.ceil(ordenadas.length / porPagina));
  const paginaActual = Math.min(pagina, ultimaPagina);
  const visibles = ordenadas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  function alternar(id: string) {
    const nuevo: OrdenTabla = orden?.id === id ? (orden.dir === "asc" ? { id, dir: "desc" } : null) : { id, dir: "asc" };
    setOrden(nuevo);
    onOrdenCambio?.(nuevo);
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

  const conPie = pie !== undefined && columnas.some((c) => pie[c.id] != null);
  const conTarjetas = tarjetaMovil !== undefined;
  const claseCelda = (c: Columna<T>, i: number) =>
    cn("px-3 py-2", i === 0 && !seleccion && "pl-4", i === columnas.length - 1 && "pr-4", c.alinear === "derecha" && "text-right tabular-nums", c.className);

  const tabla = (
    <Table style={anchoMinimo ? { minWidth: anchoMinimo } : undefined}>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {seleccion ? (
              <TableHead className="w-10 pl-4">
                <CasillaCelda etiqueta={textos.seleccionarTodo} checked={todosSeleccionados} indeterminate={algunoSeleccionado} onCheckedChange={alternarTodos} />
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
                aria-selected={filaActiva === id ? true : undefined}
                className={cn("group", onFila && "cursor-pointer")}
              >
                {seleccion ? (
                  <TableCell className={cn("w-10 pl-4", BANDA_ACTIVA, BANDA_ACTIVA_INICIO)}>
                    <CasillaCelda etiqueta={textos.seleccionarFila(id)} checked={seleccionados.includes(id)} onCheckedChange={() => alternarFila(id)} />
                  </TableCell>
                ) : null}
                {columnas.map((c, i) => (
                  <TableCell key={c.id} className={cn(claseCelda(c, i), BANDA_ACTIVA, i === 0 && !seleccion && BANDA_ACTIVA_INICIO)}>
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
        {conPie ? (
          <TableFooter className="text-control">
            <TableRow className="hover:bg-transparent">
              {seleccion ? <TableCell className="w-10 pl-4" /> : null}
              {columnas.map((c, i) => (
                <TableCell key={c.id} className={claseCelda(c, i)}>
                  {pie?.[c.id]}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        ) : null}
    </Table>
  );

  const tarjetas = tarjetaMovil ? (
    <ul role="list" aria-label={titulo} className="flex flex-col gap-2 px-1 py-2 md:hidden">
      {visibles.map((f) => {
        const id = clave(f);
        const contenido = tarjetaMovil(f);
        const marcada = seleccionados.includes(id);
        const activa = filaActiva === id;
        const comoBoton = onFila !== undefined && !tarjetaMovilInteractiva;
        return (
          <li
            key={id}
            data-state={marcada ? "selected" : undefined}
            aria-current={activa ? "true" : undefined}
            className={cn(TARJETA_MOVIL, marcada && "bg-accent", activa && "bg-accent shadow-[inset_3px_0_0_var(--color-acento)]")}
          >
            {seleccion ? <CasillaCelda etiqueta={textos.seleccionarFila(id)} checked={marcada} onCheckedChange={() => alternarFila(id)} /> : null}
            {comoBoton ? (
              <button type="button" onClick={() => onFila(f)} className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-acento/55">
                {contenido}
              </button>
            ) : (
              <div className="min-w-0 flex-1">{contenido}</div>
            )}
          </li>
        );
      })}
      {visibles.length === 0 ? (
        <li>
          <TablaVacia icon={<TrayIcon className="size-6" />}>{vacio}</TablaVacia>
        </li>
      ) : null}
      {conPie ? (
        <li data-resumen className={cn(TARJETA_MOVIL, "font-medium")}>
          <dl className="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-1">
            {columnas
              .filter((c) => pie?.[c.id] != null)
              .map((c) => (
                <div key={c.id} className="col-span-2 grid grid-cols-subgrid">
                  <dt className="text-texto-terciario">{c.titulo}</dt>
                  <dd className="text-right tabular-nums">{pie?.[c.id]}</dd>
                </div>
              ))}
          </dl>
        </li>
      ) : null}
    </ul>
  ) : null;

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
            aria-label={textos.accionesSeleccion}
            className="flex flex-wrap items-center gap-1 rounded-full bg-foreground py-1 pr-1 pl-1.5 text-control text-background shadow-elevada"
          >
            <span className="flex items-center gap-2 pr-2">
              <span className="grid h-7 min-w-7 place-items-center rounded-full bg-acento px-2 text-control font-semibold text-acento-texto tabular-nums">
                {seleccionados.length}
              </span>
              <span className="font-medium">{textos.seleccionados(seleccionados.length)}</span>
            </span>
            <span aria-hidden className="mx-1 h-5 w-px bg-background/20" />
            <div className="flex flex-1 flex-wrap items-center gap-0.5">{seleccion.acciones}</div>
            <button
              type="button"
              aria-label={textos.quitarSeleccion}
              title={textos.quitarSeleccion}
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
      {conTarjetas ? (
        <>
          {tarjetas}
          <div className="hidden md:block">{tabla}</div>
        </>
      ) : (
        tabla
      )}
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
        textos={textosParciales}
      />
    </div>
  );
}
