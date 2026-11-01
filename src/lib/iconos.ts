import type { IconWeight } from "@phosphor-icons/react";
import type { ComponentType } from "react";

/**
 * Cualquier componente de icono: Phosphor (usa `weight`) o Lucide (lo ignora). Es el tipo de las props `icon`/`icono`
 * del kit, así que una app que ya pasa iconos de lucide-react sigue funcionando.
 */
export type IconoComponente = ComponentType<{ className?: string; weight?: IconWeight; "aria-hidden"?: boolean | "true" | "false" }>;

/** Peso por defecto del kit (docs/design-system.md «Iconos»): duotono. */
export const PESO_ICONO: IconWeight = "duotone";
/** Peso del estado activo o destacado (ítem del sidebar, métrica destacada, tab activa): relleno. */
export const PESO_ICONO_ACTIVO: IconWeight = "fill";
