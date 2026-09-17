"use client";

import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";

const HoverCard = PreviewCardPrimitive.Root;

/**
 * Disparador del hover card. Igual que `Tooltip`: pásale el elemento real (un nombre de cliente en una tabla,
 * un chip…) como `children` — el disparador de base-ui renderiza un `<a>` por defecto (pensado para
 * previsualizar un enlace), pero con `render` se convierte en exactamente lo que le pases, sin envoltorio extra.
 */
function HoverCardTrigger({
  children,
  delay,
  closeDelay,
}: {
  children: ReactElement;
  /** @default 600 */
  delay?: number;
  /** @default 300 */
  closeDelay?: number;
}) {
  return <PreviewCardPrimitive.Trigger render={children} delay={delay} closeDelay={closeDelay} />;
}

/**
 * Contenido del hover card: para una ficha de vista previa (cliente, documento) que no necesita la acción
 * inmediata de un `Popover` — solo aparece con hover/foco, sin clic. Misma familia visual que `SelectContent`.
 * `<HoverCard><HoverCardTrigger><span>{cliente}</span></HoverCardTrigger><HoverCardContent>…</HoverCardContent></HoverCard>`
 */
function HoverCardContent({
  children,
  side = "top",
  sideOffset = 8,
  align = "center",
  className,
}: {
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner side={side} sideOffset={sideOffset} align={align} className="isolate z-50">
        <PreviewCardPrimitive.Popup
          className={cn(
            "w-64 rounded-lg bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            "origin-(--transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
        >
          {children}
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
