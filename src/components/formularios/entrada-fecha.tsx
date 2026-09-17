"use client";

import { CalendarIcon } from "lucide-react";
import { CAMPO } from "@/lib/estilos";
import { formatearFecha } from "@/lib/formato";
import { cn } from "@/lib/utils";

/**
 * Fecha con el selector nativo del navegador (fiable en móvil y accesible) y vista "15 Set 2026" al lado.
 * Valor ISO `YYYY-MM-DD`. Para rangos, usa dos `EntradaFecha` (desde/hasta).
 */
export function EntradaFecha({
  id,
  valor,
  onCambio,
  min,
  max,
  disabled,
  className,
}: {
  id: string;
  valor?: string;
  onCambio?: (iso: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <CalendarIcon className="pointer-events-none absolute left-3 size-4 text-muted-foreground/70" />
      <input
        id={id}
        type="date"
        value={valor ?? ""}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(e) => onCambio?.(e.target.value)}
        className={cn(CAMPO, "pl-9 font-mono text-[13px] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60")}
      />
      {valor ? <span className="pointer-events-none absolute right-10 hidden text-[11px] text-muted-foreground sm:block">{formatearFecha(valor)}</span> : null}
    </div>
  );
}
