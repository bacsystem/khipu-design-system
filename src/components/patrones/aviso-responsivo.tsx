"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import type { ReactNode } from "react"
import { CIRCULO, type TonoDialogo } from "@/components/patrones/cabecera-dialogo"
import { Dialog, DialogDescription, DialogHeader, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog"
import { PESO_ICONO, type IconoComponente } from "@/lib/iconos"
import { cn } from "@/lib/utils"

/**
 * Por debajo de `sm` (640 px) el popup es una hoja anclada abajo, a todo el ancho, con las esquinas superiores redondeadas y
 * respetando el área segura del dispositivo; desde `sm` es el diálogo centrado de siempre. Es una sola primitiva con clases
 * responsivas (sin hook de `matchMedia`): el HTML del servidor y el del cliente son iguales, así que no hay desajuste de
 * hidratación ni doble montaje. Con «reducir movimiento» la hoja no se desliza: solo aparece y desaparece con opacidad.
 */
const VISOR = "pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
const POPUP = cn(
  "pointer-events-auto relative flex w-full flex-col overflow-y-auto bg-popover pb-[max(1.25rem,env(safe-area-inset-bottom))] text-cuerpo text-popover-foreground shadow-lg ring-1 ring-border/70",
  "transition duration-(--duracion-media) ease-salida data-ending-style:opacity-0 data-starting-style:opacity-0",
  "max-sm:max-h-[85dvh] max-sm:rounded-t-[22px] max-sm:motion-safe:data-ending-style:translate-y-full max-sm:motion-safe:data-starting-style:translate-y-full",
  "sm:max-h-[calc(100dvh-2rem)] sm:max-w-lg sm:rounded-[22px] sm:motion-safe:data-ending-style:scale-[0.98] sm:motion-safe:data-starting-style:scale-[0.98]",
)

export type AvisoResponsivoProps = DialogPrimitive.Popup.Props & {
  open: boolean
  onOpenChange?: DialogPrimitive.Root.Props["onOpenChange"]
  /**
   * `true` (por defecto): Escape cierra y lo informa por `onOpenChange(false)`, como un `Dialog`. `false`: ni Escape, ni clic
   * afuera, ni arrastre cierran el aviso, y como no lleva botón de cerrar, solo se cierra cuando quien lo usa cambia `open`.
   */
  descartable?: boolean
}

/**
 * Aviso que es una hoja inferior en pantallas angostas y un diálogo centrado desde `sm`. La misma API en ambos modos:
 * `open`, `onOpenChange`, hijos (`CabeceraAviso`, el cuerpo, `PieAviso`) y las props del popup (`initialFocus`, `finalFocus`,
 * `data-testid`…). No lleva botón de cerrar —la acción es siempre un botón del pie— ni arrastre. El clic afuera nunca
 * cierra (como el `Dialog` del kit). El foco queda atrapado mientras está abierto y vuelve a donde estaba al cerrar; el
 * foco inicial se elige con `initialFocus`.
 */
export function AvisoResponsivo({ open, onOpenChange, descartable = true, className, children, ...rest }: AvisoResponsivoProps) {
  return (
    // Controlado: sin `onOpenChange` el aviso no tiene cómo cerrarse por su cuenta ante Escape.
    <Dialog open={open} onOpenChange={descartable ? onOpenChange : undefined} disablePointerDismissal>
      <DialogPortal>
        <DialogOverlay />
        <div data-slot="aviso-responsivo-visor" className={VISOR}>
          <DialogPrimitive.Popup data-slot="aviso-responsivo" className={cn(POPUP, className)} {...rest}>
            {children}
          </DialogPrimitive.Popup>
        </div>
      </DialogPortal>
    </Dialog>
  )
}

/**
 * Cabecera centrada del aviso: icono en un círculo del tono, título y descripción. El título y la descripción son el nombre
 * y la descripción accesibles del aviso (`aria-labelledby`/`aria-describedby`). Úsala dentro de `AvisoResponsivo`.
 */
export function CabeceraAviso({
  icon: Icon,
  titulo,
  descripcion,
  tono = "neutro",
}: {
  icon: IconoComponente
  titulo: ReactNode
  descripcion?: ReactNode
  tono?: TonoDialogo
}) {
  return (
    <DialogHeader data-slot="cabecera-aviso" className="items-center gap-3 px-5 pt-6 pb-3 text-center">
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-full", CIRCULO[tono])}>
        <Icon aria-hidden weight={PESO_ICONO} className="size-6" />
      </span>
      <div className="grid gap-1">
        <DialogTitle>{titulo}</DialogTitle>
        {descripcion ? <DialogDescription>{descripcion}</DialogDescription> : null}
      </div>
    </DialogHeader>
  )
}

/**
 * Pie del aviso. Los hijos van en orden DOM «secundario, primario»: por debajo de `sm` se apilan al revés (`flex-col-reverse`,
 * a todo el ancho) y el primario queda arriba; desde `sm` van en fila y alineados a la derecha, como `PieDialogo`.
 */
export function PieAviso({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-slot="pie-aviso" className={cn("flex flex-col-reverse gap-2 px-5 pt-3 sm:flex-row sm:justify-end [&>*]:w-full sm:[&>*]:w-auto", className)}>
      {children}
    </div>
  )
}
