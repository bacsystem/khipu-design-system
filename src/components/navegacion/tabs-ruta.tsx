"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { FOCO, SEGMENTADO, SEGMENTO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

export type ItemTabsRuta = {
  href: string;
  etiqueta: ReactNode;
  /** Contador junto a la etiqueta (se muestra también el 0). */
  contador?: number;
  /** Activa solo con la ruta exacta. Sin esto, también con sus subrutas (`/compras/proveedores/42` mantiene «Proveedores»). */
  exacto?: boolean;
};

// Receta de la pestaña subrayada (la misma de `Tabs estilo="linea"`) pero sobre un enlace: el activo se marca con `aria-current="page"` y el
// subrayado es un `::after` (aquí no hay indicador que se deslice entre pestañas, porque cada pestaña es una página).
const PESTANA_LINEA = cn(
  "group relative inline-flex h-10 items-center gap-1.5 px-1 text-control font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida hover:text-foreground aria-[current=page]:text-foreground",
  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity aria-[current=page]:after:opacity-100",
  FOCO,
);
// Mismo contador que `Tabs`; el activo lo marca `aria-current` del enlace (`group-aria-[current=page]`).
const CONTADOR =
  "rounded-full bg-secondary px-1.5 py-px text-etiqueta font-semibold text-muted-foreground tabular-nums group-aria-[current=page]:bg-acento group-aria-[current=page]:text-acento-texto";
// En móvil las pestañas que no entran se desplazan en horizontal, sin barra a la vista (si no, empujaban la página entera).
const DESPLAZABLE = "max-w-full overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const rutaDe = (href: string) => {
  const ruta = href.split(/[?#]/)[0] ?? "";
  return ruta.length > 1 ? ruta.replace(/\/+$/, "") : ruta;
};

/**
 * Qué pestaña corresponde a `pathname`, o -1. Sin `exacto` coincide por **segmento** (`/compras` activa `/compras/ordenes`, no `/comprasx`) y,
 * si coinciden varias (`/compras` y `/compras/ordenes`), gana la de href más largo: nunca hay dos con `aria-current`.
 */
export function indiceActivoRuta(items: Pick<ItemTabsRuta, "href" | "exacto">[], pathname: string): number {
  const actual = rutaDe(pathname);
  let mejor = -1;
  let largo = -1;
  items.forEach((item, i) => {
    const base = rutaDe(item.href);
    const coincide = actual === base || (!item.exacto && base !== "/" && actual.startsWith(`${base}/`));
    if (coincide && base.length > largo) {
      mejor = i;
      largo = base.length;
    }
  });
  return mejor;
}

/**
 * Pestañas que son **rutas** (compras → proveedores → órdenes): una `<nav aria-label>` con una lista de enlaces `next/link`, no `role="tablist"`,
 * porque cada una es una página y no un panel. La de la ruta actual lleva `aria-current="page"` (la detecta con `usePathname`, ver `indiceActivoRuta`).
 * Para pestañas de un mismo panel (sin cambiar de URL) usa `Tabs`.
 *
 * - `etiqueta`: nombre accesible de la `<nav>` («Secciones de compras»).
 * - `estilo`: `"linea"` (por defecto, subrayada, para secciones de detalle) o `"segmentado"` (control en caja de las barras de filtro).
 * - `items[].contador`: número opcional tras la etiqueta; `exacto` evita que la pestaña «raíz» siga activa en sus subrutas.
 * - En móvil las pestañas se desplazan en horizontal y la activa se centra a la vista al montar y al cambiar de ruta.
 *
 * Usa `usePathname`: con `cacheComponents` (Next 16) va dentro de `<Suspense>`, como `SidebarNav`, `TopBar` y `BarraInferior`.
 */
export function TabsRuta({
  items,
  etiqueta,
  estilo = "linea",
  className,
}: {
  items: ItemTabsRuta[];
  etiqueta: string;
  estilo?: "linea" | "segmentado";
  className?: string;
}) {
  const pathname = usePathname();
  const activo = indiceActivoRuta(items, pathname);
  const navRef = useRef<HTMLElement>(null);

  // Centra la pestaña activa dentro de la propia nav (sin `scrollIntoView`, que también movería la página en vertical).
  useEffect(() => {
    const nav = navRef.current;
    const enlace = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!nav || !enlace || nav.scrollWidth <= nav.clientWidth) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nav.scrollTo({ left: enlace.offsetLeft - (nav.clientWidth - enlace.offsetWidth) / 2, behavior: reducido ? "auto" : "smooth" });
  }, [pathname]);

  return (
    <nav ref={navRef} aria-label={etiqueta} className={cn(DESPLAZABLE, estilo === "linea" ? "shadow-[inset_0_-1px_0_var(--color-border)]" : "w-fit", className)}>
      <ul className={cn("flex items-center", estilo === "linea" ? "w-max min-w-full gap-4" : cn(SEGMENTADO, "w-max flex-nowrap"))}>
        {items.map((item, i) => (
          <li key={item.href} className="flex">
            <Link href={item.href} aria-current={i === activo ? "page" : undefined} className={estilo === "linea" ? PESTANA_LINEA : cn("group", SEGMENTO)}>
              {item.etiqueta}
              {item.contador != null ? <span className={CONTADOR}>{item.contador}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
