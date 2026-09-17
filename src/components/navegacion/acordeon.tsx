"use client";

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ItemAcordeon = { id: string; titulo: ReactNode; detalle?: ReactNode; contenido: ReactNode };

/** Acordeón de secciones plegables (FAQ, configuración avanzada, historial). Varios abiertos a la vez con `multiple`. */
export function Acordeon({ items, defaultAbiertos = [], multiple = false, className }: { items: ItemAcordeon[]; defaultAbiertos?: string[]; multiple?: boolean; className?: string }) {
  return (
    <AccordionPrimitive.Root defaultValue={defaultAbiertos} multiple={multiple} className={cn("divide-y divide-border/60 rounded-xl border border-border bg-card shadow-2xs", className)}>
      {items.map((it) => (
        <AccordionPrimitive.Item key={it.id} value={it.id}>
          <AccordionPrimitive.Header>
            <AccordionPrimitive.Trigger className="group flex w-full items-center gap-3 px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-foreground">{it.titulo}</span>
                {it.detalle ? <span className="block font-mono text-[11px] text-muted-foreground">{it.detalle}</span> : null}
              </span>
              <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open:rotate-180" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
          <AccordionPrimitive.Panel className="h-(--accordion-panel-height) overflow-hidden text-[13px] text-muted-foreground transition-[height] duration-200 data-ending-style:h-0 data-starting-style:h-0">
            <div className="px-4 pb-4">{it.contenido}</div>
          </AccordionPrimitive.Panel>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
