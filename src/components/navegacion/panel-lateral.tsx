"use client";

import { XIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { IconoSeccion } from "@/components/patrones/cabecera-seccion";
import { cn } from "@/lib/utils";

/**
 * Panel lateral de detalle (derecha): cabecera con icono y título, cuerpo con scroll y pie de acciones.
 * Úsalo para ver un registro sin salir de la tabla; para crear/editar prefiere un diálogo.
 */
export function PanelLateral({
  trigger,
  open,
  onOpenChange,
  icon,
  titulo,
  descripcion,
  children,
  pie,
  ancho = "sm:max-w-lg",
}: {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  icon: LucideIcon;
  titulo: ReactNode;
  descripcion?: ReactNode;
  children: ReactNode;
  pie?: ReactNode;
  ancho?: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger ? <SheetTrigger render={<span />}>{trigger}</SheetTrigger> : null}
      <SheetContent side="right" showCloseButton={false} className={cn("w-full gap-0 p-0", ancho)}>
        <div className="flex items-center gap-2.5 border-b border-border/60 px-5 py-4">
          <IconoSeccion icon={icon} />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">{titulo}</h2>
            {descripcion ? <p className="text-[13px] text-muted-foreground">{descripcion}</p> : null}
          </div>
          <SheetClose aria-label="Cerrar" className="rounded p-1 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground">
            <XIcon className="size-4" />
          </SheetClose>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {pie ? <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-3">{pie}</div> : null}
      </SheetContent>
    </Sheet>
  );
}
