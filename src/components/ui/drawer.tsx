"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { cn } from "@/lib/utils";

/**
 * Hoja inferior para móvil con arrastre para cerrar (a diferencia de `Sheet`, que solo anima entrada/salida,
 * aquí el usuario puede arrastrar el panel hacia abajo con el dedo o el mouse para descartarlo).
 */
function Drawer({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-overlay/60 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs",
        className,
      )}
      {...props}
    />
  );
}

function DrawerContent({ className, children, ...props }: DrawerPrimitive.Popup.Props) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerPrimitive.Viewport className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            "flex max-h-[85vh] w-full flex-col gap-4 overflow-y-auto rounded-t-xl border-t border-border bg-popover bg-clip-padding pb-[env(safe-area-inset-bottom)] text-sm text-popover-foreground shadow-lg transition-transform duration-200 ease-in-out data-ending-style:translate-y-full data-starting-style:translate-y-full sm:max-w-sm",
            className,
          )}
          {...props}
        >
          <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-border" />
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-header" className={cn("flex shrink-0 flex-col gap-0.5 px-4", className)} {...props} />;
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="drawer-footer" className={cn("mt-auto flex shrink-0 flex-col gap-2 px-4 pb-4", className)} {...props} />;
}

function DrawerTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return <DrawerPrimitive.Title data-slot="drawer-title" className={cn("font-heading text-base font-medium text-foreground", className)} {...props} />;
}

function DrawerDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return <DrawerPrimitive.Description data-slot="drawer-description" className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription };
