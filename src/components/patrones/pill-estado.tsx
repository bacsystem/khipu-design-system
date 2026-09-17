import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tono } from "./metricas";

const ESTILOS: Record<Tono, string> = {
  ok: "border-success-border bg-success text-success-foreground",
  aviso: "border-warning-border bg-warning text-warning-foreground",
  error: "border-destructive-border bg-destructive/10 text-destructive",
  neutro: "border-border bg-secondary text-muted-foreground",
};
const PUNTOS: Record<Tono, string> = {
  ok: "bg-success-solid",
  aviso: "bg-warning-solid",
  error: "bg-destructive",
  neutro: "bg-muted-foreground/50",
};

/** Pill de estado: borde + fondo tenue + punto sólido + mono 11px. Verde = OK, ámbar = provisional, rojo = error, neutro = en proceso/inactivo. */
export function PillEstado({ tono, children, className }: { tono: Tono; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap",
        ESTILOS[tono],
        className,
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", PUNTOS[tono])} />
      {children}
    </span>
  );
}

/** Chip informativo (contadores, ids, versiones). */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] whitespace-nowrap text-muted-foreground", className)}>
      {children}
    </span>
  );
}

/** Chip de identificador (código de serie, prefijo de llave): mono, fondo secondary, texto primary; `inactivo` lo tacha. */
export function ChipCodigo({ children, inactivo, className }: { children: ReactNode; inactivo?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "rounded px-2 py-0.5 font-mono text-[13px] font-semibold tracking-tight",
        inactivo ? "bg-muted text-muted-foreground line-through" : "bg-secondary text-primary",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Etiqueta "PRONTO / PRÓXIMAMENTE". */
export function ChipPronto({ children = "Próximamente" }: { children?: ReactNode }) {
  return <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium tracking-wide whitespace-nowrap uppercase text-muted-foreground">{children}</span>;
}
