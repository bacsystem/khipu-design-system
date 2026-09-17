import type { ReactNode } from "react";
import { Punto, type Tono } from "@/components/patrones/metricas";
import { cn } from "@/lib/utils";

export type EventoTimeline = { id: string; titulo: ReactNode; detalle?: ReactNode; fecha: string; tono?: Tono; actual?: boolean };

/** Línea de tiempo vertical (historial de intentos, auditoría). Fecha en mono a la derecha; el evento `actual` se resalta. */
export function Timeline({ eventos, className }: { eventos: EventoTimeline[]; className?: string }) {
  return (
    <ol className={cn("relative grid gap-0 border-l border-border/80 pl-5", className)}>
      {eventos.map((e, i) => (
        <li key={e.id} className={cn("relative pb-4", i === eventos.length - 1 && "pb-0")}>
          <span className={cn("absolute top-1.5 -left-[25px] flex size-[9px] items-center justify-center rounded-full bg-card ring-2 ring-card", e.actual && "ring-4 ring-accent")}>
            <Punto tono={e.tono ?? "neutro"} />
          </span>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <p className={cn("text-[13px] font-medium", e.actual ? "text-foreground" : "text-foreground/90")}>{e.titulo}</p>
            <time className="font-mono text-[11px] text-muted-foreground">{e.fecha}</time>
          </div>
          {e.detalle ? <p className="mt-0.5 text-[12px] leading-relaxed text-muted-foreground">{e.detalle}</p> : null}
        </li>
      ))}
    </ol>
  );
}
