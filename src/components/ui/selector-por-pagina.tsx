"use client";

import { OPCIONES_POR_PAGINA, opcionesPorPagina } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

/**
 * `etiqueta` es el nombre del grupo para el lector de pantalla y `textoFilas` el rótulo visible; por defecto en castellano.
 * `opciones` son los tamaños de página (por defecto 10, 20 y 50); `valor` aparece siempre, ordenado, aunque no esté en la lista.
 */
export function SelectorPorPagina({
  valor,
  onCambio,
  opciones = OPCIONES_POR_PAGINA,
  etiqueta = "Filas por página",
  textoFilas = "Filas",
}: {
  valor: number;
  onCambio: (n: number) => void;
  opciones?: readonly number[];
  etiqueta?: string;
  textoFilas?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 text-etiqueta text-muted-foreground" role="group" aria-label={etiqueta}>
      <span>{textoFilas}</span>
      <div className="inline-flex h-control items-center rounded-lg border border-border bg-card p-0.5 shadow-xs">
        {opcionesPorPagina(opciones, valor).map((n) => (
          <button
            key={n}
            type="button"
            aria-pressed={valor === n}
            onClick={() => onCambio(n)}
            className={cn(
              "flex h-7 min-w-8 items-center justify-center rounded-md px-1.5 font-mono text-etiqueta font-medium transition-colors",
              valor === n ? "bg-foreground text-background shadow-xs" : "text-foreground/70 hover:bg-secondary hover:text-foreground",
            )}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
