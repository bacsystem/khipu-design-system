"use client";

import { EntradaFecha } from "@/components/formularios/entrada-fecha";
import { isoHoy, sumarDias } from "@/lib/formato";
import { cn } from "@/lib/utils";

export type RangoFechas = { desde?: string; hasta?: string };

const PRESETS: { etiqueta: string; rango: () => RangoFechas }[] = [
  { etiqueta: "Hoy", rango: () => ({ desde: isoHoy(), hasta: isoHoy() }) },
  { etiqueta: "7 días", rango: () => ({ desde: sumarDias(isoHoy(), -6), hasta: isoHoy() }) },
  { etiqueta: "30 días", rango: () => ({ desde: sumarDias(isoHoy(), -29), hasta: isoHoy() }) },
  { etiqueta: "Este mes", rango: () => ({ desde: `${isoHoy().slice(0, 8)}01`, hasta: isoHoy() }) },
];

/**
 * Rango de fechas para filtros de listados: dos `EntradaFecha` (desde/hasta, cada una acota a la otra con
 * `min`/`max`) más atajos comunes (Hoy, 7/30 días, este mes). `onCambio` recibe el rango completo en cada cambio.
 */
export function EntradaRangoFechas({
  valor,
  onCambio,
  disabled,
  className,
}: {
  valor: RangoFechas;
  onCambio: (v: RangoFechas) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <EntradaFecha id="rango-desde" valor={valor.desde} max={valor.hasta} disabled={disabled} onCambio={(iso) => onCambio({ ...valor, desde: iso })} className="w-40" />
        <span className="text-[12px] text-muted-foreground">–</span>
        <EntradaFecha id="rango-hasta" valor={valor.hasta} min={valor.desde} disabled={disabled} onCambio={(iso) => onCambio({ ...valor, hasta: iso })} className="w-40" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button
            key={p.etiqueta}
            type="button"
            disabled={disabled}
            onClick={() => onCambio(p.rango())}
            className="rounded-md border border-border/60 bg-secondary/80 px-2 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
          >
            {p.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
