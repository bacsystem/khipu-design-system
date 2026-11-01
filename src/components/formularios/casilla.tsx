"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { CheckIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Checkbox con etiqueta y descripción opcional. */
export function Casilla({
  id,
  etiqueta,
  descripcion,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
}: {
  id: string;
  etiqueta: ReactNode;
  descripcion?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-2.5 text-control", disabled && "cursor-not-allowed opacity-60", className)}>
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-px flex size-[18px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] border-input bg-card transition-colors duration-(--duracion-rapida) ease-salida outline-none focus-visible:ring-3 focus-visible:ring-acento/55 data-checked:border-primary data-checked:bg-primary"
      >
        <CheckboxPrimitive.Indicator className="text-primary-foreground">
          <CheckIcon className="size-3" weight="bold" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="grid gap-0.5">
        <span className="font-medium text-foreground">{etiqueta}</span>
        {descripcion ? <span className="text-control text-texto-terciario">{descripcion}</span> : null}
      </span>
    </label>
  );
}

/** Interruptor (switch) con etiqueta a la izquierda; ideal para filas de configuración. */
export function Interruptor({
  id,
  etiqueta,
  descripcion,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
}: {
  id: string;
  etiqueta: ReactNode;
  descripcion?: ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-center justify-between gap-4 text-control", disabled && "cursor-not-allowed opacity-60", className)}>
      <span className="grid min-w-0 gap-0.5">
        <span className="font-medium text-foreground">{etiqueta}</span>
        {descripcion ? <span className="text-control text-muted-foreground">{descripcion}</span> : null}
      </span>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="relative h-[22px] w-9 shrink-0 rounded-full bg-input p-[3px] transition-colors duration-(--duracion-media) ease-salida outline-none focus-visible:ring-3 focus-visible:ring-acento/55 data-checked:bg-primary"
      >
        <SwitchPrimitive.Thumb className="block size-4 rounded-full bg-white shadow-sm transition-transform duration-(--duracion-media) ease-salida data-checked:translate-x-3.5 dark:data-checked:bg-primary-foreground" />
      </SwitchPrimitive.Root>
    </label>
  );
}
