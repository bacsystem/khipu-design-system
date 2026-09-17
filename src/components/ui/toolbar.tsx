"use client";

import { Toolbar as ToolbarPrimitive } from "@base-ui/react/toolbar";
import { cn } from "@/lib/utils";

/**
 * Barra de acciones agrupadas (edición de tabla, cabecera de editor) con navegación por flechas entre
 * los controles — a diferencia de un `<div className="flex">` de botones sueltos, aquí el foco se mueve
 * con el teclado como en una sola fila de widgets.
 */
function Toolbar({ className, orientation = "horizontal", ...props }: ToolbarPrimitive.Root.Props) {
  return (
    <ToolbarPrimitive.Root
      data-slot="toolbar"
      orientation={orientation}
      className={cn(
        "flex h-8 items-center gap-1 rounded-lg border border-border/60 bg-secondary/80 p-1",
        orientation === "vertical" && "h-fit w-8 flex-col",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarGroup({ className, ...props }: ToolbarPrimitive.Group.Props) {
  return <ToolbarPrimitive.Group data-slot="toolbar-group" className={cn("flex items-center gap-1", className)} {...props} />;
}

function ToolbarButton({ className, ...props }: ToolbarPrimitive.Button.Props) {
  return (
    <ToolbarPrimitive.Button
      data-slot="toolbar-button"
      className={cn(
        "inline-flex size-6 items-center justify-center gap-1.5 rounded-md text-muted-foreground outline-none transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-card aria-pressed:text-foreground aria-pressed:shadow-2xs [&_svg]:size-3.5 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function ToolbarLink({ className, ...props }: ToolbarPrimitive.Link.Props) {
  return (
    <ToolbarPrimitive.Link
      data-slot="toolbar-link"
      className={cn("inline-flex h-6 items-center rounded-md px-2 text-[12px] font-medium text-muted-foreground outline-none hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40", className)}
      {...props}
    />
  );
}

function ToolbarSeparator({ className, ...props }: ToolbarPrimitive.Separator.Props) {
  return <ToolbarPrimitive.Separator data-slot="toolbar-separator" className={cn("mx-0.5 h-5 w-px bg-border", className)} {...props} />;
}

function ToolbarInput({ className, ...props }: ToolbarPrimitive.Input.Props) {
  return (
    <ToolbarPrimitive.Input
      data-slot="toolbar-input"
      className={cn("h-6 w-24 rounded-md border-0 bg-card px-2 text-[12px] text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring/40", className)}
      {...props}
    />
  );
}

export { Toolbar, ToolbarGroup, ToolbarButton, ToolbarLink, ToolbarSeparator, ToolbarInput };
