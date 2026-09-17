"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { SearchIcon, XIcon } from "lucide-react";
import { CAMPO, POPUP_LISTA } from "@/lib/estilos";
import { cn } from "@/lib/utils";

/**
 * Búsqueda de texto libre con sugerencias (a diferencia de `Combobox`, no obliga a elegir un valor de la
 * lista: el usuario puede quedarse con lo que escribió). Útil para nombres de producto, glosas o cualquier
 * campo donde las sugerencias ayudan pero no son las únicas respuestas válidas.
 */
export function Autocomplete({
  id,
  items,
  valor,
  onCambio,
  placeholder = "Buscar…",
  vacio = "Sin sugerencias",
  disabled,
  className,
}: {
  id: string;
  items: string[];
  valor?: string;
  onCambio?: (v: string) => void;
  placeholder?: string;
  vacio?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <AutocompletePrimitive.Root items={items} value={valor} onValueChange={(v) => onCambio?.(v)} disabled={disabled}>
      <div className="relative flex items-center">
        <AutocompletePrimitive.Input id={id} placeholder={placeholder} className={cn(CAMPO, "pr-9", className)} />
        <AutocompletePrimitive.Clear aria-label="Limpiar" className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-0.5 text-muted-foreground/70 hover:text-foreground">
          <XIcon className="size-4" />
        </AutocompletePrimitive.Clear>
        <SearchIcon className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 size-4 text-muted-foreground/70" />
      </div>
      <AutocompletePrimitive.Portal>
        <AutocompletePrimitive.Positioner sideOffset={6} className="isolate z-50">
          <AutocompletePrimitive.Popup className={POPUP_LISTA}>
            <AutocompletePrimitive.Empty className="px-2 py-2 text-[12px] text-muted-foreground empty:hidden">{vacio}</AutocompletePrimitive.Empty>
            <AutocompletePrimitive.List>
              {(item: string) => (
                <AutocompletePrimitive.Item
                  key={item}
                  value={item}
                  className="relative flex w-full cursor-default items-center rounded-md px-2 py-1.5 text-[12px] font-medium outline-none select-none data-highlighted:bg-accent/70 data-highlighted:text-accent-foreground"
                >
                  {item}
                </AutocompletePrimitive.Item>
              )}
            </AutocompletePrimitive.List>
          </AutocompletePrimitive.Popup>
        </AutocompletePrimitive.Positioner>
      </AutocompletePrimitive.Portal>
    </AutocompletePrimitive.Root>
  );
}
