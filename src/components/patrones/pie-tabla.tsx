"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { SelectorPorPagina } from "@/components/ui/selector-por-pagina";
import { esClickSimple } from "@/lib/navegacion";
import { paginasVisibles } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

const BOTON_PAGINA =
  "inline-flex h-9 items-center gap-1 rounded-lg border border-border bg-card px-2.5 text-[11px] font-medium text-foreground/80 shadow-2xs transition-colors hover:bg-muted";
// Anterior/Siguiente sin página a la que ir: el botón usa `disabled`; el enlace, `aria-disabled` y esta clase (un <a> no tiene :disabled).
const BOTON_PAGINA_DESHABILITADO = "disabled:pointer-events-none disabled:text-muted-foreground/60";
const BOTON_PAGINA_INACTIVO = "pointer-events-none text-muted-foreground/60";
const NUMERO_PAGINA = "flex size-9 items-center justify-center rounded-lg font-mono text-[11px] text-foreground/80 transition-colors hover:bg-secondary";

/** Un salto de página: enlace (estado en la URL) o botón (estado local), según haya `hrefPagina`. */
function Salto({
  a,
  habilitado,
  desactivable = false,
  className,
  onPagina,
  hrefPagina,
  children,
}: {
  a: number;
  habilitado: boolean;
  /** Anterior/Siguiente: el botón lleva los estilos de `disabled`. Los números de página siempre están habilitados. */
  desactivable?: boolean;
  className: string;
  onPagina: (p: number) => void;
  hrefPagina?: (p: number) => string;
  children: ReactNode;
}) {
  if (hrefPagina) {
    return (
      <Link
        href={hrefPagina(a)}
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
    <button type="button" disabled={!habilitado} onClick={() => onPagina(a)} className={cn(className, desactivable && BOTON_PAGINA_DESHABILITADO)}>
      {children}
    </button>
  );
}

/**
 * Pie de tabla estándar: "Mostrando x–y de N <unidad>", selector de filas, nota opcional y paginación numerada.
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
  pagina,
  ultimaPagina,
  onPagina,
  hrefPagina,
  nota,
}: {
  desde: number;
  hasta: number;
  total: number;
  unidad: string;
  porPagina: number;
  onPorPagina: (n: number) => void;
  pagina: number;
  ultimaPagina: number;
  onPagina: (p: number) => void;
  hrefPagina?: (p: number) => string;
  nota?: ReactNode;
}) {
  const hayAnterior = pagina > 1;
  const haySiguiente = pagina < ultimaPagina;

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 bg-muted px-4 py-2 text-[12px] text-muted-foreground sm:flex-row">
      <div className="flex flex-wrap items-center gap-2">
        <span>
          Mostrando{" "}
          <span className="font-mono font-semibold text-foreground">
            {desde}–{hasta}
          </span>{" "}
          de <span className="font-mono font-semibold text-foreground">{total}</span> {unidad}
        </span>
        <span className="text-muted-foreground/40">·</span>
        <SelectorPorPagina valor={porPagina} onCambio={onPorPagina} />
        {nota ? (
          <>
            <span className="hidden text-muted-foreground/40 xl:inline">·</span>
            <span className="hidden text-[11px] text-muted-foreground/80 xl:inline">{nota}</span>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        <Salto a={pagina - 1} habilitado={hayAnterior} desactivable className={BOTON_PAGINA} onPagina={onPagina} hrefPagina={hrefPagina}>
          <ChevronLeftIcon className="size-3.5" /> Anterior
        </Salto>
        <div className="mx-1 flex items-center gap-0.5">
          {paginasVisibles(pagina, ultimaPagina).map((p, i) =>
            p === "…" ? (
              <span key={`sep-${i}`} className="px-1 text-[11px] text-muted-foreground/60">
                …
              </span>
            ) : p === pagina ? (
              <span key={p} aria-current="page" className="flex size-9 items-center justify-center rounded-lg bg-foreground font-mono text-[11px] font-medium text-background shadow-2xs">
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
          Siguiente <ChevronRightIcon className="size-3.5" />
        </Salto>
      </div>
    </div>
  );
}

/** Estado vacío para el cuerpo de una tabla (úsalo en una fila con colSpan). */
export function TablaVacia({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground">
      {icon}
      <p className="text-sm">{children}</p>
    </div>
  );
}

/** Contenedor de la tabla estándar. */
export const CONTENEDOR_TABLA = "min-w-0 overflow-hidden rounded-xl border border-border/90 bg-card shadow-2xs transition-opacity";
// CABECERA_TABLA y CONTROL_FILTRO viven en lib/estilos.ts con el resto de las recetas; se re-exportan para no romper a quien los importa desde aquí.
export { CABECERA_TABLA, CONTROL_FILTRO } from "@/lib/estilos";
