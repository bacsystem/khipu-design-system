"use client";

import { ListIcon } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OBJETIVO_TACTIL } from "@/lib/estilos";

/**
 * Hamburguesa de la top bar que abre el mismo `SidebarContent` en un cajón lateral; se cierra al navegar. Es una columna de la altura del cajón: solo la navegación se desplaza (`SidebarContent`), así que en una pantalla baja el usuario del pie
 * (tema, apariencia, cerrar sesión) sigue a la vista. `etiqueta` es el nombre accesible del botón.
 * `disparador` sustituye la hamburguesa por otro elemento (lo usa la entrada «Más» de `BarraInferior`): recibe las props del disparador (`aria-expanded`,
 * `aria-controls`…) y el foco vuelve a él al cerrar. `etiquetaCajon` es el nombre accesible del cajón (diálogo).
 */
export function MobileNav({
  children,
  etiqueta = "Abrir menú",
  etiquetaCajon = "Menú de navegación",
  disparador,
}: {
  children: ReactNode;
  etiqueta?: string;
  etiquetaCajon?: string;
  disparador?: ReactElement;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {disparador ? (
        <SheetTrigger render={disparador} />
      ) : (
        <SheetTrigger render={<Button variant="ghost" size="icon-sm" className={OBJETIVO_TACTIL} />}>
          <ListIcon weight="bold" className="size-5" />
          <span className="sr-only">{etiqueta}</span>
        </SheetTrigger>
      )}
      <SheetContent side="left" showCloseButton={false} aria-label={etiquetaCajon} className="w-[248px] max-w-[85vw] bg-sidebar p-0 text-sidebar-foreground">
        {children}
      </SheetContent>
    </Sheet>
  );
}
