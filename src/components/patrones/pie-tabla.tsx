"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { ReactNode } from "react";
import { SelectorPorPagina } from "@/components/ui/selector-por-pagina";
import { paginasVisibles } from "@/lib/paginacion";

const BOTON =
  "inline-flex h-7 items-center gap-1 rounded-md border border-border bg-card px-2.5 text-[11px] font-medium text-foreground/80 shadow-2xs transition-colors hover:bg-muted disabled:pointer-events-none disabled:text-muted-foreground/60";

/**
 * Pie de tabla estándar: "Mostrando x–y de N <unidad>", selector de filas, nota opcional y paginación numerada.
 * Paginación en cliente: pasa `pagina`, `ultimaPagina`, `onPagina`.
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
  nota?: ReactNode;
}) {
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
        <button type="button" disabled={pagina <= 1} onClick={() => onPagina(pagina - 1)} className={BOTON}>
          <ChevronLeftIcon className="size-3.5" /> Anterior
        </button>
        <div className="mx-1 flex items-center gap-0.5">
          {paginasVisibles(pagina, ultimaPagina).map((p, i) =>
            p === "…" ? (
              <span key={`sep-${i}`} className="px-1 text-[11px] text-muted-foreground/60">
                …
              </span>
            ) : p === pagina ? (
              <span key={p} aria-current="page" className="flex size-7 items-center justify-center rounded-md bg-foreground font-mono text-[11px] font-medium text-background shadow-2xs">
                {p}
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPagina(p)}
                className="flex size-7 items-center justify-center rounded-md font-mono text-[11px] text-foreground/80 transition-colors hover:bg-secondary"
              >
                {p}
              </button>
            ),
          )}
        </div>
        <button type="button" disabled={pagina >= ultimaPagina} onClick={() => onPagina(pagina + 1)} className={BOTON}>
          Siguiente <ChevronRightIcon className="size-3.5" />
        </button>
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

/** Estilos compartidos de la tabla estándar. */
export const CABECERA_TABLA = "h-auto px-3 py-2 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase";
export const CONTENEDOR_TABLA = "min-w-0 overflow-hidden rounded-xl border border-border/90 bg-card shadow-2xs transition-opacity";
export const CONTROL_FILTRO = "h-9 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground shadow-2xs";
