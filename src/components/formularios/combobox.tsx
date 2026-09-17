"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { CAMPO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

export type ItemCombobox = { value: string; label: string; detalle?: string };

/**
 * Selector con búsqueda (clientes, productos, catálogos largos). Filtra por etiqueta y detalle mientras se escribe.
 */
export function Combobox({
  id,
  items,
  valor,
  onCambio,
  placeholder = "Buscar…",
  vacio = "Sin resultados",
  disabled,
  className,
}: {
  id: string;
  items: ItemCombobox[];
  valor?: string | null;
  onCambio?: (v: string | null) => void;
  placeholder?: string;
  vacio?: string;
  disabled?: boolean;
  className?: string;
}) {
  const seleccionado = items.find((i) => i.value === valor) ?? null;
  return (
    <ComboboxPrimitive.Root
      items={items}
      value={seleccionado}
      onValueChange={(v: ItemCombobox | null) => onCambio?.(v?.value ?? null)}
      itemToStringLabel={(i: ItemCombobox) => i.label}
      disabled={disabled}
    >
      <div className="relative">
        <ComboboxPrimitive.Input id={id} placeholder={placeholder} className={cn(CAMPO, "pr-9", className)} />
        <ComboboxPrimitive.Trigger aria-label="Abrir opciones" className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground/70 hover:text-foreground">
          <ChevronDownIcon className="size-4" />
        </ComboboxPrimitive.Trigger>
      </div>
      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner sideOffset={6} className="isolate z-50">
          <ComboboxPrimitive.Popup className="max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none">
            <ComboboxPrimitive.Empty className="px-2 py-2 text-[12px] text-muted-foreground empty:hidden">{vacio}</ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List>
              {(item: ItemCombobox) => (
                <ComboboxPrimitive.Item
                  key={item.value}
                  value={item}
                  className="relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-[12px] font-medium outline-none select-none data-highlighted:bg-accent/70 data-highlighted:text-accent-foreground"
                >
                  <span className="grid min-w-0 flex-1">
                    <span className="truncate">{item.label}</span>
                    {item.detalle ? <span className="truncate font-mono text-[10px] font-normal text-muted-foreground">{item.detalle}</span> : null}
                  </span>
                  <ComboboxPrimitive.ItemIndicator className="absolute right-2 text-primary">
                    <CheckIcon className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
