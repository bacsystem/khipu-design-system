import type { ReactNode } from "react";
import { PESO_ICONO, type IconoComponente } from "@/lib/iconos";
import { cn } from "@/lib/utils";
import type { Tono } from "@/components/patrones/metricas";

/** Los tonos de `Tono` más `info` (azul informativo: enviado, en revisión, nota). */
export type TonoPill = Tono | "info";
/** Tonos de `Chip`: los de la pill más `acento` (la paleta del usuario). */
export type TonoChip = TonoPill | "acento";

const ESTILOS: Record<TonoPill, string> = {
  info: "bg-info text-info-foreground",
  ok: "bg-success text-success-foreground",
  aviso: "bg-warning text-warning-foreground",
  error: "bg-destructive-suave text-destructive-texto",
  neutro: "bg-secondary text-muted-foreground",
};
const PUNTOS: Record<TonoPill, string> = {
  info: "bg-info-foreground",
  ok: "bg-success-solid",
  aviso: "bg-warning-solid",
  error: "bg-destructive",
  neutro: "bg-muted-foreground/50",
};

/**
 * Pill de estado: relleno tenue + punto sólido, sin borde. Verde = OK, ámbar = provisional, rojo = error, azul = informativo, neutro = en proceso/inactivo.
 * `icon` cambia el punto por un icono (p. ej. el estado de un servicio): toma el color del texto del tono y es decorativo
 * (`aria-hidden`), así que el estado lo sigue diciendo el texto.
 */
export function PillEstado({ tono, icon: Icono, children, className }: { tono: TonoPill; icon?: IconoComponente; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap", ESTILOS[tono], className)}>
      {Icono ? <Icono aria-hidden weight={PESO_ICONO} className="size-3.5 shrink-0" /> : <span className={cn("size-1.5 shrink-0 rounded-full", PUNTOS[tono])} />}
      {children}
    </span>
  );
}

// Chip tenue: neutro (el de siempre), los tonos de la pill y el acento de la paleta. Todos son pares que verifica check:contraste.
const CHIP_TENUE: Record<TonoChip, string> = {
  ...ESTILOS,
  neutro: "bg-secondary text-muted-foreground",
  acento: "bg-accent text-accent-foreground",
};
// Chip sólido: el color del texto del tono hace de fondo y el tinte, de texto (misma razón de contraste que la pill); error, acento y neutro usan sus pares sólidos.
const CHIP_SOLIDO: Record<TonoChip, string> = {
  ok: "bg-success-foreground text-success",
  aviso: "bg-warning-foreground text-warning",
  info: "bg-info-foreground text-info",
  error: "bg-destructive text-destructive-foreground",
  acento: "bg-acento-superficie text-acento-superficie-texto",
  neutro: "bg-foreground text-background",
};

/**
 * Chip informativo (contadores, versiones, etiquetas). Los ids van en `ChipCodigo` (mono).
 * `tono` lo colorea (por defecto `neutro`, el gris de siempre); `solido` cambia el relleno tenue por uno pleno, para una etiqueta que debe destacar.
 */
export function Chip({ children, tono = "neutro", solido = false, className }: { children: ReactNode; tono?: TonoChip; solido?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap tabular-nums", (solido ? CHIP_SOLIDO : CHIP_TENUE)[tono], className)}>
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
