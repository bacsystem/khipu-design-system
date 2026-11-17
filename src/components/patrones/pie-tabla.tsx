"use client";

import { CaretDoubleLeftIcon, CaretDoubleRightIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { SelectorPorPagina } from "@/components/ui/selector-por-pagina";
import { PESO_ICONO_FUNCIONAL } from "@/lib/iconos";
import { esClickSimple } from "@/lib/navegacion";
import { paginasVisibles } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

const BOTON_PAGINA =
  "inline-flex h-control items-center gap-1 rounded-full border border-border bg-card px-2.5 text-etiqueta font-medium text-foreground/80 shadow-xs transition-colors hover:bg-muted";
// Anterior/Siguiente/extremos sin página a la que ir: el botón usa `aria-disabled` (sigue en el orden de tabulación, así el foco no cae al <body> al llegar al límite) y no hace nada; el enlace, `aria-disabled` y esta clase (un <a> no tiene :disabled).
const BOTON_PAGINA_DESHABILITADO = "aria-disabled:pointer-events-none aria-disabled:text-muted-foreground/60";
const BOTON_PAGINA_INACTIVO = "pointer-events-none text-muted-foreground/60";
const NUMERO_PAGINA = "flex size-control items-center justify-center rounded-full font-mono text-etiqueta text-foreground/80 transition-colors hover:bg-secondary";

/** Un salto de página: enlace (estado en la URL) o botón (estado local), según haya `hrefPagina`. */
function Salto({
  a,
  habilitado,
  desactivable = false,
  "aria-label": etiqueta,
  className,
  onPagina,
  hrefPagina,
  children,
}: {
  a: number;
  habilitado: boolean;
  /** Anterior/Siguiente: el botón lleva los estilos de `disabled`. Los números de página siempre están habilitados. */
  desactivable?: boolean;
  /** Nombre accesible cuando el salto es solo un icono. */
  "aria-label"?: string;
  className: string;
  onPagina: (p: number) => void;
  hrefPagina?: (p: number) => string;
  children: ReactNode;
}) {
  if (hrefPagina) {
    return (
      <Link
        href={hrefPagina(a)}
        aria-label={etiqueta}
        aria-disabled={!habilitado}
        tabIndex={habilitado ? undefined : -1}
        onClick={(e) => {
          if (!habilitado || !esClickSimple(e)) return;
          e.preventDefault();
          onPagina(a);
        }}
        className={cn(className, !habilitado && BOTON_PAGINA_INACTIVO)}
      >
        {children}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={etiqueta} aria-disabled={habilitado ? undefined : true} onClick={() => habilitado && onPagina(a)} className={cn(className, desactivable && BOTON_PAGINA_DESHABILITADO)}>
      {children}
    </button>
  );
}

/**
 * Textos del pie, para traducirlos (por defecto en castellano). La frase es «{mostrando} x–y {de} N {unidad}»: el orden es fijo
 * y los números llevan su estilo. `filas` y `filasPorPagina` son el rótulo y el nombre accesible del selector de filas;
 * `paginacion` es el nombre de la `<nav>` de páginas y `primera`/`ultima` los de los botones de los extremos (`extremos`).
 */
export type TextosPieTabla = {
  mostrando: string;
  de: string;
  anterior: string;
  siguiente: string;
  filas: string;
  filasPorPagina: string;
  paginacion: string;
  primera: string;
  ultima: string;
  /** Lo que lee el lector de pantalla en lugar de «3 / 24» (solo bajo `sm`); por defecto «Página 3 de 24». Opcional. */
  paginaDeTotal?: (pagina: number, total: number) => string;
};

const PAGINA_DE_TOTAL_ES = (pagina: number, total: number) => `Página ${pagina} de ${total}`;

const TEXTOS_PIE_ES: TextosPieTabla = {
  mostrando: "Mostrando",
  de: "de",
  anterior: "Anterior",
  siguiente: "Siguiente",
  filas: "Filas",
  filasPorPagina: "Filas por página",
  paginacion: "Paginación",
  primera: "Primera página",
  ultima: "Última página",
};

/**
 * Pie de tabla estándar: "Mostrando x–y de N <unidad>", selector de filas, nota opcional y paginación numerada.
 * El selector de filas solo aparece con `onPorPagina` (sin él, el tamaño de página lo fija quien usa el pie); `opciones` son sus tamaños
 * (por defecto 10, 20 y 50) y `porPagina` se añade si no está. `extremos` suma los botones «Primera página» y «Última página».
 * Las páginas van en una `<nav>` con nombre (`textos.paginacion`); bajo `sm` los números se sustituyen por «pág. / total». Los saltos sin destino usan `aria-disabled`.
 * Sin `hrefPagina` las páginas son botones y el estado vive en el componente (`pagina`, `ultimaPagina`, `onPagina`).
 * Con `hrefPagina` son enlaces reales (estado en la URL, navegables con ⌘-clic o en otra pestaña); un clic simple
 * llama igual a `onPagina` para que el consumidor navegue en cliente.
 */
export function PieTabla({
  desde,
  hasta,
  total,
  unidad,
  porPagina,
  onPorPagina,
  opciones,
  extremos = false,
  pagina,
  ultimaPagina,
  onPagina,
  hrefPagina,
  nota,
  textos: textosParciales,
}: {
  desde: number;
  hasta: number;
  total: number;
  unidad: string;
  porPagina: number;
  onPorPagina?: (n: number) => void;
  opciones?: readonly number[];
  extremos?: boolean;
  pagina: number;
  ultimaPagina: number;
  onPagina: (p: number) => void;
  hrefPagina?: (p: number) => string;
  nota?: ReactNode;
  textos?: Partial<TextosPieTabla>;
}) {
  const textos = { ...TEXTOS_PIE_ES, ...textosParciales };
  const hayAnterior = pagina > 1;
  const haySiguiente = pagina < ultimaPagina;

  return (
    <div className="flex flex-col items-center justify-between gap-3 bg-transparent px-4 py-2 text-control text-muted-foreground sm:flex-row">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span>
          {textos.mostrando}{" "}
          <span className="font-mono font-semibold text-foreground">
            {desde}–{hasta}
          </span>{" "}
          {textos.de} <span className="font-mono font-semibold text-foreground">{total}</span> {unidad}
        </span>
        {onPorPagina ? (
          <>
            <span className="text-muted-foreground/40">·</span>
            <SelectorPorPagina valor={porPagina} onCambio={onPorPagina} opciones={opciones} etiqueta={textos.filasPorPagina} textoFilas={textos.filas} />
          </>
        ) : null}
        {nota ? (
          <>
            <span className="hidden text-muted-foreground/40 xl:inline">·</span>
            <span className="hidden text-etiqueta text-muted-foreground/80 xl:inline">{nota}</span>
          </>
        ) : null}
      </div>
      <nav aria-label={textos.paginacion} className="flex flex-wrap items-center justify-center gap-1">
        {extremos ? (
          <Salto a={1} habilitado={hayAnterior} desactivable aria-label={textos.primera} className={BOTON_PAGINA} onPagina={onPagina} hrefPagina={hrefPagina}>
            <CaretDoubleLeftIcon aria-hidden weight={PESO_ICONO_FUNCIONAL} className="size-3.5" />
          </Salto>
        ) : null}
        <Salto a={pagina - 1} habilitado={hayAnterior} desactivable className={BOTON_PAGINA} onPagina={onPagina} hrefPagina={hrefPagina}>
          <CaretLeftIcon weight="bold" className="size-3.5" /> {textos.anterior}
        </Salto>
        {/* Bajo sm no caben los números (ni con 24 páginas dentro de una tarjeta de 360 px): «3 / 24» y los saltos. */}
        <span aria-live="polite" aria-current="page" className="mx-1 sm:hidden">
          <span aria-hidden className="font-mono text-etiqueta font-medium text-foreground">
            {pagina} / {ultimaPagina}
          </span>
          <span className="sr-only">{(textos.paginaDeTotal ?? PAGINA_DE_TOTAL_ES)(pagina, ultimaPagina)}</span>
        </span>
        <div className="mx-1 hidden items-center gap-0.5 sm:flex">
          {paginasVisibles(pagina, ultimaPagina).map((p, i) =>
            p === "…" ? (
              <span key={`sep-${i}`} className="px-1 text-etiqueta text-muted-foreground/60">
                …
              </span>
            ) : p === pagina ? (
              <span key={p} aria-current="page" className="flex size-control items-center justify-center rounded-full bg-foreground font-mono text-etiqueta font-medium text-background shadow-xs">
                {p}
              </span>
            ) : (
              <Salto key={p} a={p} habilitado className={NUMERO_PAGINA} onPagina={onPagina} hrefPagina={hrefPagina}>
                {p}
              </Salto>
            ),
          )}
        </div>
        <Salto a={pagina + 1} habilitado={haySiguiente} desactivable className={BOTON_PAGINA} onPagina={onPagina} hrefPagina={hrefPagina}>
          {textos.siguiente} <CaretRightIcon weight="bold" className="size-3.5" />
        </Salto>
        {extremos ? (
          <Salto a={ultimaPagina} habilitado={haySiguiente} desactivable aria-label={textos.ultima} className={BOTON_PAGINA} onPagina={onPagina} hrefPagina={hrefPagina}>
            <CaretDoubleRightIcon aria-hidden weight={PESO_ICONO_FUNCIONAL} className="size-3.5" />
          </Salto>
        ) : null}
      </nav>
    </div>
  );
}

/** Estado vacío para el cuerpo de una tabla (úsalo en una fila con colSpan). */
export function TablaVacia({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
      {icon}
      <p className="text-cuerpo">{children}</p>
    </div>
  );
}

/**
 * El cuerpo de una tabla sin filas (vacía, cargando o sin coincidencias): una fila que ocupa todas las columnas, **sin** la píldora gris de
 * las celdas (`bg-secondary`), que en un mensaje de 14 líneas de alto se ve como un bloque gris suelto dentro de la tarjeta. Sin `icon`,
 * solo el texto (p. ej. «Cargando…»).
 */
export function FilaVacia({ columnas, icon, children }: { columnas: number; icon?: ReactNode; children: ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={columnas} className="bg-transparent group-hover/fila:bg-transparent">
        <TablaVacia icon={icon}>{children}</TablaVacia>
      </TableCell>
    </TableRow>
  );
}

/** Contenedor de la tabla estándar. */
export const CONTENEDOR_TABLA = "min-w-0 overflow-hidden rounded-xl border border-borde-tarjeta bg-card px-2 pb-1 shadow-tarjeta transition-opacity";
// CABECERA_TABLA y CONTROL_FILTRO viven en lib/estilos.ts con el resto de las recetas; se re-exportan para no romper a quien los importa desde aquí.
export { CABECERA_TABLA, CONTROL_FILTRO } from "@/lib/estilos";
