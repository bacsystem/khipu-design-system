"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "@/lib/utils";

const PULGAR = "block size-4 rounded-full border-2 border-primary bg-card shadow-xs outline-none transition-transform focus-visible:ring-3 focus-visible:ring-ring/30 data-dragging:scale-110";

/**
 * Control deslizante para una magnitud continua (monto, cantidad, porcentaje) o un rango de dos manijas
 * (`valor` como tupla). Para un rango de fechas usa `EntradaRangoFechas`, no esto.
 */
export function Deslizador({
  valor,
  onCambio,
  min = 0,
  max = 100,
  paso = 1,
  formato,
  disabled,
  className,
}: {
  valor: number | readonly [number, number];
  onCambio: (v: number | [number, number]) => void;
  min?: number;
  max?: number;
  paso?: number;
  /** Formatea el valor mostrado a la derecha; por defecto el número tal cual. */
  formato?: (v: number) => string;
  disabled?: boolean;
  className?: string;
}) {
  const rango = Array.isArray(valor);
  const f = formato ?? ((v: number) => String(v));

  return (
    <SliderPrimitive.Root
      value={valor}
      onValueChange={(v) => onCambio(v as number | [number, number])}
      min={min}
      max={max}
      step={paso}
      disabled={disabled}
      className={cn("grid gap-1.5", className)}
    >
      <span className="font-mono text-[12px] text-muted-foreground tabular-nums">
        {rango ? `${f(valor[0])} – ${f(valor[1])}` : f(valor as number)}
      </span>
      <SliderPrimitive.Control className="flex w-full items-center py-2">
        <SliderPrimitive.Track className="relative h-1.5 w-full rounded-full bg-secondary">
          <SliderPrimitive.Indicator className="absolute h-full rounded-full bg-primary" />
          <SliderPrimitive.Thumb className={PULGAR} />
          {rango ? <SliderPrimitive.Thumb className={PULGAR} /> : null}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}
