import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tono = "ok" | "aviso" | "error" | "neutro";

/** Punto de estado de 6px para ayudas y pills. */
export function Punto({ tono }: { tono: Tono }) {
  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        tono === "ok" && "bg-success-solid",
        tono === "aviso" && "bg-warning-solid",
        tono === "error" && "bg-destructive",
        tono === "neutro" && "bg-muted-foreground/50",
      )}
    />
  );
}

/** Ayuda de una métrica con punto y color según tono. */
export function AyudaMetrica({ tono, children }: { tono: Tono; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1",
        tono === "ok" && "text-success-foreground",
        tono === "aviso" && "text-warning-foreground",
        tono === "error" && "text-destructive",
      )}
    >
      <Punto tono={tono} />
      <span className="truncate">{children}</span>
    </span>
  );
}

/** Una métrica: etiqueta uppercase, valor mono grande (con sufijo opcional) y ayuda de 11px. */
export function Metrica({ etiqueta, children, sufijo, ayuda }: { etiqueta: string; children: ReactNode; sufijo?: ReactNode; ayuda: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{etiqueta}</span>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 font-mono text-lg font-semibold tracking-tight text-foreground">
        {children}
        {sufijo ? <span className="text-[12px] font-normal text-muted-foreground">{sufijo}</span> : null}
      </div>
      <div className="flex min-w-0 items-center gap-1 truncate text-[11px] text-muted-foreground">{ayuda}</div>
    </div>
  );
}

/** Franja de métricas: una sola tarjeta dividida en 4 columnas (2 en tablet, 1 en móvil). */
export function FilaMetricas({ children, columnas = 4 }: { children: ReactNode; columnas?: 2 | 3 | 4 }) {
  return (
    <section
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-4 rounded-xl border border-border bg-card px-5 py-3 shadow-xs lg:divide-x lg:divide-border lg:[&>*:not(:first-child)]:pl-5",
        columnas === 4 && "lg:grid-cols-4",
        columnas === 3 && "lg:grid-cols-3",
        columnas === 2 && "lg:grid-cols-2",
      )}
    >
      {children}
    </section>
  );
}
