import { ClockIcon } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { formatearMmSs } from "@/lib/formato";
import { PESO_ICONO } from "@/lib/iconos";
import { cn } from "@/lib/utils";

/** Tono de la franja: `peligro` (por defecto, queda poco) o `aviso`. Mismos tokens que `Aviso`. */
export type TonoFranja = "peligro" | "aviso";

const TONO: Record<TonoFranja, string> = {
  peligro: "bg-destructive-suave text-destructive-texto",
  aviso: "bg-warning text-warning-foreground",
};

/**
 * Franja de cuenta regresiva: la `etiqueta` (ya traducida) a la izquierda y, a la derecha, un reloj y el tiempo en `mm:ss`
 * con dígitos de ancho fijo para que no «baile».
 *
 * No es una región viva (sin `role`, `aria-live` ni `aria-atomic`): el lector de pantalla no repite el tiempo en cada
 * tic. Quien necesite avisar del plazo lo hace una vez, en el texto del aviso. La etiqueta y el número bastan: el color
 * no es el único portador de la información.
 */
export function FranjaCuentaRegresiva({
  segundos,
  etiqueta,
  tono = "peligro",
  className,
}: {
  /** Segundos que faltan (entero). Valores negativos o no finitos se muestran como `00:00`. */
  segundos: number;
  etiqueta: ReactNode;
  tono?: TonoFranja;
  className?: string;
}) {
  return (
    <div data-slot="franja-cuenta-regresiva" className={cn("flex items-center justify-between gap-3 rounded-[14px] px-4 py-2.5 text-control", TONO[tono], className)}>
      <span className="min-w-0">{etiqueta}</span>
      <span className="flex shrink-0 items-center gap-1.5 font-mono font-medium tabular-nums">
        <ClockIcon aria-hidden weight={PESO_ICONO} className="size-4" />
        {formatearMmSs(segundos)}
      </span>
    </div>
  );
}
