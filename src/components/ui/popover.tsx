"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverClose = PopoverPrimitive.Close;

/**
 * Popup flotante para filtros avanzados, ayuda contextual con acciones o cualquier contenido rico que no
 * quepa en un `Tooltip` (ese es solo texto). Misma familia visual que `SelectContent`/`ComboboxPopup`.
 * `<Popover><PopoverTrigger render={<button/>}>Filtros</PopoverTrigger><PopoverContent>…</PopoverContent></Popover>`
 */
function PopoverContent({
  children,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  className,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<PopoverPrimitive.Positioner.Props, "side" | "sideOffset" | "align" | "alignOffset">) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset} className="isolate z-50">
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "w-72 rounded-lg bg-popover p-3.5 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            "origin-(--transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {children}
        </PopoverPrimitive.Popup>
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

/** Cabecera opcional del popover: título + descripción a la izquierda, cerrar a la derecha. */
function PopoverHeader({
  titulo,
  descripcion,
  conCierre = true,
  className,
}: {
  titulo: ReactNode;
  descripcion?: ReactNode;
  conCierre?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-2.5 flex items-start justify-between gap-2", className)}>
      <div className="min-w-0">
        <PopoverPrimitive.Title className="text-[13px] font-semibold text-foreground">{titulo}</PopoverPrimitive.Title>
        {descripcion ? <PopoverPrimitive.Description className="mt-0.5 text-[12px] text-muted-foreground">{descripcion}</PopoverPrimitive.Description> : null}
      </div>
      {conCierre ? (
        <PopoverClose aria-label="Cerrar" className="shrink-0 rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground">
          <XIcon className="size-3.5" />
        </PopoverClose>
      ) : null}
    </div>
  );
}

export { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverClose };
