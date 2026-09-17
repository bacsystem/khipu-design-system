"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { CheckIcon } from "lucide-react";
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
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-2.5 text-[13px]", disabled && "cursor-not-allowed opacity-60", className)}>
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border border-input bg-muted transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-primary data-checked:bg-primary"
      >
        <CheckboxPrimitive.Indicator className="text-primary-foreground">
          <CheckIcon className="size-3" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span className="grid gap-0.5">
        <span className="font-medium text-foreground">{etiqueta}</span>
        {descripcion ? <span className="text-[12px] text-muted-foreground">{descripcion}</span> : null}
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
    <label htmlFor={id} className={cn("flex cursor-pointer items-center justify-between gap-4 text-[13px]", disabled && "cursor-not-allowed opacity-60", className)}>
      <span className="grid min-w-0 gap-0.5">
        <span className="font-medium text-foreground">{etiqueta}</span>
        {descripcion ? <span className="text-[12px] text-muted-foreground">{descripcion}</span> : null}
      </span>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="relative h-5 w-9 shrink-0 rounded-full border border-border bg-secondary p-0.5 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 data-checked:border-primary data-checked:bg-primary"
      >
        <SwitchPrimitive.Thumb className="block size-3.5 rounded-full bg-card shadow-xs transition-transform data-checked:translate-x-4" />
      </SwitchPrimitive.Root>
    </label>
  );
}
