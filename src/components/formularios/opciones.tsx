"use client";

import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Opcion<T extends string> = { valor: T; etiqueta: ReactNode; descripcion?: ReactNode; disabled?: boolean };

/**
 * Grupo de opciones excluyentes. `estilo="tarjetas"` las muestra como tarjetas seleccionables (para elegir tipo de documento, plan, etc.).
 */
export function GrupoOpciones<T extends string>({
  nombre,
  opciones,
  valor,
  defaultValor,
  onCambio,
  estilo = "lista",
  className,
}: {
  nombre: string;
  opciones: Opcion<T>[];
  valor?: T;
  defaultValor?: T;
  onCambio?: (v: T) => void;
  estilo?: "lista" | "tarjetas";
  className?: string;
}) {
  return (
    <RadioGroup
      name={nombre}
      value={valor}
      defaultValue={defaultValor}
      onValueChange={(v) => onCambio?.(v as T)}
      className={cn(estilo === "tarjetas" ? "grid grid-cols-1 gap-2 sm:grid-cols-2" : "grid gap-2", className)}
    >
      {opciones.map((o) => (
        <label
          key={o.valor}
          className={cn(
            "flex cursor-pointer items-start gap-2.5 text-control",
            estilo === "tarjetas" && "rounded-[14px] border-[1.5px] border-transparent bg-secondary p-3 transition-colors duration-(--duracion-rapida) ease-salida has-data-checked:border-acento-texto has-data-checked:bg-acento-suave dark:has-data-checked:border-acento",
            o.disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <Radio.Root
            value={o.valor}
            disabled={o.disabled}
            className="mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-input bg-card transition-colors duration-(--duracion-rapida) ease-salida outline-none focus-visible:ring-3 focus-visible:ring-acento/55 data-checked:border-primary data-checked:bg-primary"
          >
            <Radio.Indicator className="size-[7px] rounded-full bg-primary-foreground" />
          </Radio.Root>
          <span className="grid gap-0.5">
            <span className="font-medium text-foreground">{o.etiqueta}</span>
            {o.descripcion ? <span className="text-control text-texto-terciario">{o.descripcion}</span> : null}
          </span>
        </label>
      ))}
    </RadioGroup>
  );
}
