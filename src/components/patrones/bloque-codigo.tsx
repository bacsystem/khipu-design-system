"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

function BotonCopiarBloque({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      title="Copiar"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1500);
        } catch {
          // el navegador puede denegar el portapapeles; el bloque sigue seleccionable
        }
      }}
      className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      {copiado ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </button>
  );
}

/**
 * Bloque de código con barra superior (método + URL + slot para pestañas) y cuerpo siempre oscuro.
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
    <div className={cn("min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-2xs", className)}>
      {metodo || url || barra ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted px-4 py-2">
          {metodo ? <span className="rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground uppercase">{metodo}</span> : null}
          {url ? <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground">{url}</code> : null}
          {barra}
          <BotonCopiarBloque texto={codigo} />
        </div>
      ) : null}
      <pre
        style={{ maxHeight: alturaMax }}
        className={cn(
          "overflow-auto p-4 font-mono leading-relaxed",
          tono === "oscuro" ? "bg-[oklch(0.18_0.02_265)] text-[12px] text-[oklch(0.9_0.01_265)]" : "bg-muted/40 text-[11.5px] text-foreground",
        )}
      >
        <code>{codigo}</code>
      </pre>
      {pie ? <div className="border-t border-border/60 px-4 py-2 text-[11px] text-muted-foreground">{pie}</div> : null}
    </div>
  );
}

/** Control segmentado pequeño (pestañas de lenguaje, filtros por tipo). */
export function Segmentado<T extends string>({ opciones, valor, onCambio, className }: { opciones: Array<{ id: T; etiqueta: string }>; valor: T; onCambio: (v: T) => void; className?: string }) {
  return (
    <div className={cn("inline-flex h-8 shrink-0 items-center gap-0.5 rounded-lg border border-border/60 bg-secondary/80 p-0.5", className)}>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onCambio(o.id)}
          className={cn(
            "h-7 rounded-md px-2.5 text-[12px] font-medium transition-colors",
            valor === o.id ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
