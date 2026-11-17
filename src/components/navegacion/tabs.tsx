"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CONTADOR_PESTANA, DESPLAZABLE_X, PESTANA_LINEA_BASE, SEGMENTADO, SEGMENTO_BASE, colorContadorPestana, type TonoContadorTab } from "@/lib/estilos";
import { SELECTOR_PESTANA_ACTIVA, centrarActiva } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

export type { TonoContadorTab };

export type TabItem<T extends string> = {
  id: T;
  etiqueta: ReactNode;
  /** Número o texto corto tras la etiqueta («12», «Vencida»). Se pinta tal cual: formatea los números tú («1.482»); el 0 también se muestra. */
  contador?: number | string;
  /** Color del contador: `ok`, `aviso`, `info` o `neutro` (por defecto: gris, y con el acento en la pestaña activa). Los mismos que `TabsRuta`. */
  tonoContador?: TonoContadorTab;
  disabled?: boolean;
};

const CONTADOR_NEUTRO = "in-data-active:bg-acento in-data-active:text-acento-texto";

// La base (h-10 fijo, foco hacia dentro) es la receta compartida con `TabsRuta`; aquí solo se añade el estado activo de base-ui.
const PESTANA_LINEA = `${PESTANA_LINEA_BASE} data-active:text-foreground`;

// base-ui posiciona el indicador con --active-tab-left/top/width/height; la transición CSS lo desliza entre pestañas.
// `-z-10` dentro de una lista `isolate`: queda sobre el fondo de la lista y debajo del texto de las pestañas.
const INDICADOR_BASE =
  "absolute -z-10 left-(--active-tab-left) w-(--active-tab-width) transition-[left,width,top,height] duration-(--duracion-media) ease-salida motion-reduce:transition-none";
// La fila subrayada se desplaza a lo ancho cuando las pestañas no entran (`DESPLAZABLE_X`: en un teléfono, cinco pestañas miden más que la pantalla y empujaban la
// página entera). La línea de base es una sombra interior y no un `border-b`, y el indicador va en `bottom-0`: con `overflow-x-auto` el navegador recorta también en
// vertical, y un indicador en `-bottom-px` sobre el borde quedaba cortado. La caja segmentada ya es una fila desplazable por su receta (`SEGMENTADO`).
const PESTANAS_LINEA = `flex items-center gap-4 shadow-[inset_0_-1px_0_var(--color-border)] ${DESPLAZABLE_X}`;

const INDICADOR = {
  linea: cn(INDICADOR_BASE, "bottom-0 h-0.5 rounded-full bg-foreground"),
  segmentado: cn(INDICADOR_BASE, "top-(--active-tab-top) h-(--active-tab-height) rounded-full bg-card shadow-sm ring-1 ring-border dark:bg-input"),
};

/**
 * Pestañas de página. `estilo="segmentado"` es el control en caja de las barras de filtro; `"linea"` es la pestaña subrayada para secciones de detalle.
 * Los paneles se pasan como `render(id)` (`children`) o, desde un Server Component —que no puede pasarle una función a un componente de cliente—, ya
 * armados en `paneles`, uno por id. En los dos casos solo se monta el panel activo.
 * Sin `children` ni `paneles` es una **tira sola**: no hay paneles (ni su `pt-4`) y las pestañas no llevan `aria-controls`; el contenido lo pinta la app
 * fuera del componente según `valor`/`onCambio`; si esa región tiene `id`, pásalo en `controla` para que cada pestaña lo declare en `aria-controls`. Los iconos dentro de una pestaña miden `size-4` salvo que lleven su `size-*`.
 * - `etiqueta`: nombre accesible de la lista de pestañas (`aria-label` del `tablist`, p. ej. «Estado de las cotizaciones»); sin ella la lista no tiene nombre.
 * - `items[].contador` (número o texto) y `tonoContador`: igual que en `TabsRuta`.
 * - Las dos fijan su altura (`h-10` la línea; la segmentada, una sola fila de 34 px: segmentos `h-7` + 3 px de relleno) y, si no entran, se desplazan en horizontal sin barra a la vista; la activa se centra al montar y cada vez que cambia (con `valor` o sin él).
 */
export function Tabs<T extends string>({
  items,
  valor,
  defaultValor,
  onCambio,
  estilo = "linea",
  children,
  paneles,
  controla,
  etiqueta,
  className,
}: {
  items: TabItem<T>[];
  valor?: T;
  defaultValor?: T;
  onCambio?: (v: T) => void;
  estilo?: "linea" | "segmentado";
  children?: (id: T) => ReactNode;
  paneles?: Partial<Record<T, ReactNode>>;
  /** Solo en tira sola: `id` de la región de contenido de la app (con `role="tabpanel"`); va como `aria-controls` en cada pestaña. */
  controla?: string;
  /** Nombre accesible de la lista de pestañas (`aria-label` del `tablist`). */
  etiqueta?: string;
  className?: string;
}) {
  const conPaneles = children != null || paneles != null;
  const listaRef = useRef<HTMLDivElement>(null);
  // La activa de un `Tabs` sin `valor` la lleva base-ui por dentro: se espeja aquí (onValueChange) para poder centrarla también al hacer clic en una pestaña cortada.
  const [interno, setInterno] = useState<T | undefined>(defaultValor ?? items[0]?.id);
  const activo = valor ?? interno;
  // Centra la pestaña activa dentro de la propia lista, al montar y cada vez que cambia (clic, flechas, o `valor` desde fuera).
  useEffect(() => {
    if (listaRef.current) centrarActiva(listaRef.current, SELECTOR_PESTANA_ACTIVA);
  }, [activo]);
  // `min-w-0` en el Root: dentro de un grid o flex el mínimo automático lo ensancharía hasta el ancho de todas las pestañas y no habría desborde que desplazar.
  return (
    <TabsPrimitive.Root value={valor} defaultValue={defaultValor ?? items[0]?.id} onValueChange={(v) => {
        setInterno(v as T);
        onCambio?.(v as T);
      }} className={cn("min-w-0", className)}>
      <TabsPrimitive.List ref={listaRef} aria-label={etiqueta} className={cn("relative isolate", estilo === "linea" ? PESTANAS_LINEA : SEGMENTADO)}>
        {items.map((t) => (
          <TabsPrimitive.Tab key={t.id} value={t.id} disabled={t.disabled} {...(!conPaneles && controla ? { "aria-controls": controla } : {})} className={estilo === "linea" ? PESTANA_LINEA : SEGMENTO_BASE}>
            {t.etiqueta}
            {t.contador != null ? <span className={cn(CONTADOR_PESTANA, colorContadorPestana(t.tonoContador, CONTADOR_NEUTRO))}>{t.contador}</span> : null}
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator className={INDICADOR[estilo]} />
      </TabsPrimitive.List>
      {conPaneles
        ? items.map((t) => (
            <TabsPrimitive.Panel key={t.id} value={t.id} className="pt-4 outline-none">
              {children ? children(t.id) : paneles?.[t.id]}
            </TabsPrimitive.Panel>
          ))
        : null}
    </TabsPrimitive.Root>
  );
}
