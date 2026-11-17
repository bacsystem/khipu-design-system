"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { CONTADOR_PESTANA, PESTANA_LINEA_BASE, SEGMENTADO, SEGMENTO, DESPLAZABLE_X, colorContadorPestana, type TonoContadorTab } from "@/lib/estilos";
import { centrarActiva, indiceActivoRuta } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

export type { TonoContadorTab };

export type ItemTabsRuta = {
  /** Ruta de la app (empieza por `/`); con i18n por segmento, con el idioma incluido (`usePathname` lo trae). Query y hash no cuentan para la activa. */
  href: string;
  etiqueta: ReactNode;
  /** Contador o texto corto tras la etiqueta («12», «SUNAT 13.1»); se muestra también el 0. */
  contador?: number | string;
  /** Color del contador (`neutro` si no se pasa). */
  tonoContador?: TonoContadorTab;
  /** Activa solo con la ruta exacta. Sin esto, también con sus subrutas (`/compras/proveedores/42` mantiene «Proveedores»). */
  exacto?: boolean;
};

// El subrayado de la activa es un `::after` (aquí no hay indicador que se deslice entre pestañas, porque cada pestaña es una página). La base es la receta
// compartida con `Tabs` (`PESTANA_LINEA_BASE`, con el foco hacia dentro porque la fila recorta).
const PESTANA_LINEA = cn(
  "group relative aria-[current=page]:text-foreground",
  PESTANA_LINEA_BASE,
  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-foreground after:opacity-0 after:transition-opacity aria-[current=page]:after:opacity-100",
);
const CONTADOR_NEUTRO = "group-aria-[current=page]:bg-acento group-aria-[current=page]:text-acento-texto";

/**
 * Pestañas que son **rutas** (compras → proveedores → órdenes): una `<nav aria-label>` con una lista de enlaces `next/link`, no `role="tablist"`,
 * porque cada una es una página y no un panel. La de la ruta actual lleva `aria-current="page"` (la detecta con `usePathname`, ver `indiceActivoRuta`
 * en `lib/navegacion`, que un Server Component sí puede llamar). Para pestañas de un mismo panel (sin cambiar de URL) usa `Tabs`.
 *
 * - `etiqueta`: nombre accesible de la `<nav>` («Secciones de compras»).
 * - `estilo`: `"linea"` (por defecto, subrayada, para secciones de detalle) o `"segmentado"` (control en caja de las barras de filtro). Las dos comparten
 *   receta con `Tabs` (`PESTANA_LINEA_BASE`, `SEGMENTO`, `CONTADOR_PESTANA` de `lib/estilos`).
 * - `items[].contador`: número o texto corto tras la etiqueta, con `tonoContador` (`ok`, `aviso`, `error`, `info`, `acento`, `neutro`); `exacto` evita que la pestaña «raíz» siga activa en sus subrutas.
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
    if (navRef.current) centrarActiva(navRef.current, '[aria-current="page"]');
  }, [pathname]);

  return (
    <nav ref={navRef} aria-label={etiqueta} className={cn(DESPLAZABLE_X, estilo === "linea" ? "shadow-[inset_0_-1px_0_var(--color-border)]" : "w-fit", className)}>
      <ul className={cn("flex items-center", estilo === "linea" ? "w-max min-w-full gap-4" : cn(SEGMENTADO, "w-max max-w-none overflow-visible"))}>
        {items.map((item, i) => (
          <li key={item.href} className="flex">
            <Link href={item.href} aria-current={i === activo ? "page" : undefined} className={estilo === "linea" ? PESTANA_LINEA : cn("group", SEGMENTO)}>
              {item.etiqueta}
              {item.contador != null ? <span className={cn(CONTADOR_PESTANA, colorContadorPestana(item.tonoContador, CONTADOR_NEUTRO))}>{item.contador}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
