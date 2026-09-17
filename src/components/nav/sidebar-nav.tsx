"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

const ITEM_BASE =
  "flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-md border border-transparent px-2.5 py-1.5 text-[13px]";

/** Navegación del sidebar por grupos; el ítem activo se detecta por prefijo de la ruta actual. */
export function SidebarNav({ grupos }: { grupos: GrupoNav[] }) {
  const pathname = usePathname();

  return (
    <nav className="grid w-full grid-cols-1 gap-3 px-2 pt-2">
      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="grid w-full grid-cols-1 gap-0.5">
          <span className="truncate px-2.5 py-1 text-[10px] font-medium tracking-wider text-muted-foreground/80 uppercase">{grupo.titulo}</span>
          {grupo.items.map((item) => {
            const Icono = item.icon;
            if (!item.href) {
              return (
                <span
                  key={item.label}
                  aria-disabled="true"
                  title={item.title ?? `${item.label}: próximamente`}
                  className={cn(ITEM_BASE, "cursor-not-allowed text-muted-foreground/50")}
                >
                  <Icono className="size-[18px] shrink-0 text-muted-foreground/40" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 rounded bg-secondary px-1 py-0.5 text-[9px] font-medium tracking-wide whitespace-nowrap uppercase">
                    {item.pendiente ?? "Pronto"}
                  </span>
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
                  "transition-colors",
                  active
                    ? "bg-sidebar-primary font-medium text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icono className={cn("size-[18px] shrink-0", active ? "text-primary" : "text-muted-foreground/70")} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {active ? <span className="size-1.5 shrink-0 rounded-full bg-primary" /> : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
