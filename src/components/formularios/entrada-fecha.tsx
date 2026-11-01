"use client";

import { CalendarBlankIcon, CaretDownIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Calendario } from "@/components/formularios/calendario";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CAMPO } from "@/lib/estilos";
import { formatearFecha } from "@/lib/formato";
import { PESO_ICONO } from "@/lib/iconos";
import { cn } from "@/lib/utils";

/**
 * Fecha con calendario propio en un popover (el selector nativo del navegador no se puede estilizar y cambiaba con
 * cada sistema). Muestra «15 Set 2026»; valor ISO `YYYY-MM-DD`. Para rangos, usa dos `EntradaFecha` (desde/hasta).
 * `id` va en el disparador, así un `<label htmlFor>` lo enfoca.
 */
export function EntradaFecha({
  id,
  valor,
  onCambio,
  min,
  max,
  disabled,
  placeholder = "Elegir fecha",
  className,
}: {
  id: string;
  valor?: string;
  onCambio?: (iso: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Sin efecto desde 0.5.0: el disparador ya muestra la fecha formateada. Se conserva por compatibilidad. */
  conVistaPrevia?: boolean;
  /** Las dos variantes miden h-control (altura única de control); se conserva por compatibilidad. Igual que StepperNumerico. */
  variante?: "filtro" | "campo";
  className?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        render={<button type="button" />}
        className={cn(CAMPO, "group flex items-center gap-2 text-left", className)}
      >
        <CalendarBlankIcon weight={PESO_ICONO} className="size-4 shrink-0 text-muted-foreground" />
        <span className={cn("min-w-0 flex-1 truncate tabular-nums", !valor && "text-texto-terciario")}>{valor ? formatearFecha(valor) : placeholder}</span>
        <CaretDownIcon weight="bold" className="size-3.5 shrink-0 text-texto-terciario transition-transform duration-(--duracion-rapida) ease-salida group-data-popup-open:rotate-180" />
      </PopoverTrigger>
      {/* Al abrir, el foco va al día elegido (o a hoy), no al botón «Mes anterior»: así las flechas funcionan de inmediato. */}
      <PopoverContent className="w-auto p-3" initialFocus={() => caja.current?.querySelector<HTMLElement>("button[data-iso][tabindex='0']") ?? true}>
        <div ref={caja}>
          <Calendario
            valor={valor}
            min={min}
            max={max}
            onElegir={(iso) => {
              onCambio?.(iso);
              setAbierto(false);
            }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
