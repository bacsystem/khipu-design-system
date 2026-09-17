"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem<T extends string> = { id: T; etiqueta: ReactNode; contador?: number; disabled?: boolean };

/**
 * Pestañas de página. `estilo="segmentado"` es el control en caja de las barras de filtro; `"linea"` es la pestaña subrayada para secciones de detalle.
 * Los paneles se pasan como `render(id)` para no montar todos a la vez.
 */
export function Tabs<T extends string>({
  items,
  valor,
  defaultValor,
  onCambio,
  estilo = "linea",
  children,
  className,
}: {
  items: TabItem<T>[];
  valor?: T;
  defaultValor?: T;
  onCambio?: (v: T) => void;
  estilo?: "linea" | "segmentado";
  children: (id: T) => ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Root value={valor} defaultValue={defaultValor ?? items[0]?.id} onValueChange={(v) => onCambio?.(v as T)} className={className}>
      <TabsPrimitive.List
        className={cn(
          "relative flex items-center",
          estilo === "linea" ? "gap-4 border-b border-border/80" : "h-8 w-fit gap-1 rounded-lg border border-border/60 bg-secondary/80 p-1",
        )}
      >
        {items.map((t) => (
          <TabsPrimitive.Tab
            key={t.id}
            value={t.id}
            disabled={t.disabled}
            className={cn(
              // h-10/h-6 fijos (no padding vertical) para que el contador no altere la altura de la fila.
              "inline-flex items-center gap-1.5 text-[12px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
              estilo === "linea"
                ? "-mb-px h-10 border-b-2 border-transparent px-1 text-muted-foreground hover:text-foreground data-active:border-primary data-active:text-foreground"
                : "h-6 rounded-md px-3 text-muted-foreground hover:text-foreground data-active:bg-card data-active:text-foreground data-active:shadow-2xs",
            )}
          >
            {t.etiqueta}
            {t.contador != null ? <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{t.contador}</span> : null}
          </TabsPrimitive.Tab>
        ))}
      </TabsPrimitive.List>
      {items.map((t) => (
        <TabsPrimitive.Panel key={t.id} value={t.id} className="pt-4 outline-none">
          {children(t.id)}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  );
}
