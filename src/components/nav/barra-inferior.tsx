"use client";

import { ListIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MobileNav } from "@/components/nav/mobile-nav";
import type { ItemNav } from "@/components/nav/sidebar-nav";
import { ACCION_FLOTANTE, FOCO } from "@/lib/estilos";
import { PESO_ICONO, PESO_ICONO_ACTIVO, type IconoComponente } from "@/lib/iconos";
import { itemActivo } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

/** Máximo de entradas propias (sin «Más»): con 5 columnas cada una mide ≥ 64 px en un teléfono de 320 px. */
export const MAX_ITEMS_BARRA_INFERIOR = 4;

/** Acción principal de la pantalla (p. ej. «Nueva venta»): un botón redondo flotante sobre la barra. */
export type AccionBarraInferior = { href: string; etiqueta: string; icono: IconoComponente };

/** Entrada «Más»: abre `contenido` (normalmente el `SidebarContent` completo) en un cajón lateral. */
export type MasBarraInferior = { etiqueta: string; contenido: ReactNode };

// Todas las entradas son un objetivo táctil de ≥ 44 px (min-h-12 = 48 px) y ocupan el mismo ancho.
const ENTRADA = "flex min-h-12 w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-etiqueta";

function Entrada({ item, pathname }: { item: ItemNav; pathname: string }) {
  const Icono = item.icon;
  if (!item.href) {
    return (
      <span aria-disabled="true" title={item.title ?? `${item.label}: próximamente`} className={cn(ENTRADA, "cursor-not-allowed text-muted-foreground/60")}>
        <Icono weight={PESO_ICONO} aria-hidden className="size-5 shrink-0" />
        <span className="max-w-full truncate">{item.label}</span>
      </span>
    );
  }
  const activo = itemActivo(item, pathname);
  return (
    <Link
      href={item.href}
      aria-current={activo ? "page" : undefined}
      className={cn(
        ENTRADA,
        "transition-colors duration-(--duracion-rapida) ease-salida",
        FOCO,
        activo ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icono weight={activo ? PESO_ICONO_ACTIVO : PESO_ICONO} aria-hidden className="size-5 shrink-0" />
      <span className="max-w-full truncate">{item.label}</span>
    </Link>
  );
}

/**
 * Navegación inferior del móvil (≤ 767 px; desde `md` no se ve): reemplaza a la hamburguesa. Va en `Shell barraInferior`.
 *
 * - `items`: las entradas (hasta 4) **las pone la app**, como datos: el kit no trae ninguna lista fija. La activa se detecta por prefijo de la ruta
 *   (o exacta con `exacto`) y lleva `aria-current="page"`. Cada una mide ≥ 44 px.
 * - `mas`: una última entrada que abre `contenido` en un cajón (foco atrapado, Escape y el fondo cierran, el foco vuelve al botón; se cierra al navegar).
 * - `accion`: botón redondo flotante de 56 px (`ACCION_FLOTANTE`) sobre la barra (p. ej. «Nueva venta»), con `aria-label`. Su hueco está **en el flujo**: la barra queda pegada abajo
 *   (`sticky`) al final de la columna, así que ni ella ni la acción tapan el final del contenido. Respeta la zona segura (`env(safe-area-inset-bottom)`; la
 *   página necesita `viewport-fit=cover` para que valga algo).
 * - `etiqueta`: nombre accesible de la `<nav>` (por defecto «Navegación principal»).
 *
 * Usa `usePathname`: con `cacheComponents` (Next 16) va dentro de `<Suspense>`, como `SidebarNav` y `TopBar`.
 */
export function BarraInferior({
  items,
  mas,
  accion,
  etiqueta = "Navegación principal",
  etiquetaCajon,
}: {
  items: ItemNav[];
  mas?: MasBarraInferior;
  accion?: AccionBarraInferior;
  etiqueta?: string;
  /** Nombre accesible del cajón de «Más» (por defecto, el texto de la entrada). */
  etiquetaCajon?: string;
}) {
  const pathname = usePathname();
  const Accion = accion?.icono;

  return (
    <div data-barra-inferior data-con-accion={accion ? "" : undefined} className="pointer-events-none sticky bottom-0 z-30 md:hidden">
      {/* Hueco de la acción flotante: ocupa sitio en el flujo para que, al final de la página, la acción quede por encima del contenido y no encima. */}
      {accion ? <div aria-hidden className="h-20" /> : null}
      <div className="relative">
        {accion && Accion ? (
          <Link
            href={accion.href}
            aria-label={accion.etiqueta}
            className={cn(ACCION_FLOTANTE, "pointer-events-auto absolute right-4 bottom-full mb-3")}
          >
            <Accion weight="bold" aria-hidden className="size-6" />
          </Link>
        ) : null}
        <nav aria-label={etiqueta} className="pointer-events-auto border-t border-border/80 bg-sidebar pb-[env(safe-area-inset-bottom)] text-sidebar-foreground">
          <ul className="flex items-stretch gap-1 px-2 py-1">
            {items.slice(0, MAX_ITEMS_BARRA_INFERIOR).map((item) => (
              <li key={item.href ?? item.label} className="flex min-w-0 flex-1">
                <Entrada item={item} pathname={pathname} />
              </li>
            ))}
            {mas ? (
              <li className="flex min-w-0 flex-1">
                <MobileNav
                  etiquetaCajon={etiquetaCajon ?? mas.etiqueta}
                  disparador={
                    <button type="button" className={cn(ENTRADA, "cursor-pointer text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-popup-open:bg-sidebar-accent", FOCO)}>
                      <ListIcon weight={PESO_ICONO} aria-hidden className="size-5 shrink-0" />
                      <span className="max-w-full truncate">{mas.etiqueta}</span>
                    </button>
                  }
                >
                  {mas.contenido}
                </MobileNav>
              </li>
            ) : null}
          </ul>
        </nav>
      </div>
    </div>
  );
}
