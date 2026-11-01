"use client";

import type { LucideIcon } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { RESORTE } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

export type ItemNav = {
  /** Sin `href` el ítem se muestra deshabilitado con la etiqueta `pendiente` (patrón "próximamente"). */
  href?: string;
  label: string;
  icon: LucideIcon;
  /** Texto del chip cuando no hay href (por defecto "Pronto"). */
  pendiente?: string;
  /** Tooltip explicando por qué todavía no está disponible. */
  title?: string;
};

export type GrupoNav = { titulo: string; items: ItemNav[] };

// Sin overflow-hidden: recortaría el fondo activo mientras se desliza desde otro ítem. La etiqueta trunca por su cuenta (min-w-0).
// `isolate` deja el fondo activo (-z-10) detrás del icono y del texto.
const ITEM_BASE = "relative isolate flex w-full min-w-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-control";

/** Navegación del sidebar por grupos; el ítem activo se detecta por prefijo de la ruta actual y su fondo se desliza al cambiar. */
export function SidebarNav({ grupos }: { grupos: GrupoNav[] }) {
  const pathname = usePathname();
  // Un layoutId por instancia: el sidebar de escritorio y el del menú móvil no comparten indicador.
  const idIndicador = useId();

  return (
    <nav className="grid w-full grid-cols-1 gap-3 px-2 pt-2">
      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="grid w-full grid-cols-1 gap-0.5">
          <span className="truncate px-2.5 pt-1 pb-1 text-etiqueta font-medium text-muted-foreground">{grupo.titulo}</span>
          {grupo.items.map((item) => {
            const Icono = item.icon;
            if (!item.href) {
              return (
                <span key={item.label} aria-disabled="true" title={item.title ?? `${item.label}: próximamente`} className={cn(ITEM_BASE, "cursor-not-allowed text-muted-foreground/60")}>
                  <Icono className="size-4 shrink-0 text-muted-foreground/50" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-etiqueta font-medium whitespace-nowrap">{item.pendiente ?? "Pronto"}</span>
                </span>
              );
            }
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  ITEM_BASE,
                  "transition-colors duration-(--duracion-rapida) ease-salida",
                  active ? "font-medium text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {active ? <m.span layoutId={`${idIndicador}-activo`} aria-hidden transition={RESORTE} className="absolute inset-0 -z-10 rounded-md bg-sidebar-primary" /> : null}
                <Icono className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
