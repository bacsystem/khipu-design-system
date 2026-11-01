import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tono } from "./metricas";

const ESTILOS: Record<Tono, string> = {
  ok: "bg-success text-success-foreground",
  aviso: "bg-warning text-warning-foreground",
  error: "bg-destructive-suave text-destructive-texto",
  neutro: "bg-secondary text-muted-foreground",
};
const PUNTOS: Record<Tono, string> = {
  ok: "bg-success-solid",
  aviso: "bg-warning-solid",
  error: "bg-destructive",
  neutro: "bg-muted-foreground/50",
};

/** Pill de estado: relleno tenue + punto sólido, sin borde. Verde = OK, ámbar = provisional, rojo = error, neutro = en proceso/inactivo. */
export function PillEstado({ tono, children, className }: { tono: Tono; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap", ESTILOS[tono], className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", PUNTOS[tono])} />
      {children}
    </span>
  );
}

/** Chip informativo (contadores, versiones). Los ids van en `ChipCodigo` (mono). */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap text-muted-foreground tabular-nums", className)}>
      {children}
    </span>
  );
}

/** Chip de identificador (código de serie, prefijo de llave): mono sobre acento; `inactivo` lo tacha. */
export function ChipCodigo({ children, inactivo, className }: { children: ReactNode; inactivo?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 font-mono text-etiqueta font-medium",
        inactivo ? "bg-secondary text-muted-foreground line-through" : "bg-accent text-accent-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Etiqueta "Próximamente". */
export function ChipPronto({ children = "Próximamente" }: { children?: ReactNode }) {
  return <span className="rounded-full bg-secondary px-2 py-0.5 text-etiqueta font-medium whitespace-nowrap text-muted-foreground">{children}</span>;
}
