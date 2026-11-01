"use client";

import type { ReactNode } from "react";
import { BotonCopiar } from "@/components/patrones/boton-copiar";
import { cn } from "@/lib/utils";

/**
 * Bloque de código con barra superior (método + URL + slot para pestañas) y cuerpo en `codigo` (casi negro en los dos modos).
 * `tono="claro"` para respuestas/JSON sobre muted.
 */
export function BloqueCodigo({
  codigo,
  metodo,
  url,
  barra,
  pie,
  tono = "oscuro",
  alturaMax = "52vh",
  className,
}: {
  codigo: string;
  metodo?: string;
  url?: string;
  barra?: ReactNode;
  pie?: ReactNode;
  tono?: "oscuro" | "claro";
  alturaMax?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      {metodo || url || barra ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/60 px-4 py-2">
          {/* El verbo HTTP es un literal: se escribe en mayúsculas con toUpperCase, no con una clase CSS de transformación. */}
          {metodo ? <span className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-etiqueta font-semibold text-accent-foreground">{metodo.toUpperCase()}</span> : null}
          {url ? <code className="min-w-0 flex-1 truncate font-mono text-control text-foreground">{url}</code> : null}
          {barra}
          <BotonCopiar texto={codigo} className="size-9 rounded-lg" />
        </div>
      ) : null}
      <pre
        style={{ maxHeight: alturaMax }}
        className={cn(
          "overflow-auto p-4 font-mono text-control leading-relaxed",
          tono === "oscuro" ? "bg-codigo text-codigo-foreground" : "bg-muted/50 text-foreground",
        )}
      >
        <code>{codigo}</code>
      </pre>
      {pie ? <div className="border-t border-border px-4 py-2 text-etiqueta text-muted-foreground">{pie}</div> : null}
    </div>
  );
}

/** Control segmentado pequeño (pestañas de lenguaje, filtros por tipo). */
export function Segmentado<T extends string>({ opciones, valor, onCambio, className }: { opciones: Array<{ id: T; etiqueta: string }>; valor: T; onCambio: (v: T) => void; className?: string }) {
  return (
    <div className={cn("inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg bg-secondary p-0.5", className)}>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onCambio(o.id)}
          className={cn(
            "h-7 rounded-md px-2.5 text-control font-medium transition-colors duration-(--duracion-rapida) ease-salida",
            valor === o.id ? "bg-card text-foreground shadow-sm dark:bg-input" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
