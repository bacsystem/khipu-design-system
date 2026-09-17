"use client";

import { Meter } from "@base-ui/react/meter";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { CAMPO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

type TonoFuerza = "destructive" | "warning" | "success";
const COLOR_TONO: Record<TonoFuerza, string> = {
  destructive: "bg-destructive",
  warning: "bg-warning-solid",
  success: "bg-success-solid",
};

/** Heurística simple (longitud + variedad de caracteres) solo para dar una pista visual; valida de verdad en el backend. */
function calcularFuerza(valor: string): { puntaje: number; etiqueta: string; tono: TonoFuerza } {
  let p = 0;
  if (valor.length >= 8) p++;
  if (valor.length >= 12) p++;
  if (/[a-z]/.test(valor) && /[A-Z]/.test(valor)) p++;
  if (/\d/.test(valor)) p++;
  if (/[^A-Za-z0-9]/.test(valor)) p++;
  const puntaje = Math.round((p / 5) * 100);
  if (p <= 1) return { puntaje, etiqueta: "Débil", tono: "destructive" };
  if (p <= 3) return { puntaje, etiqueta: "Media", tono: "warning" };
  return { puntaje, etiqueta: "Fuerte", tono: "success" };
}

/**
 * Input de contraseña: botón de mostrar/ocultar y, con `conFuerza`, un medidor debajo (útil en registro; en
 * login sobra). Receta `CAMPO`, igual que `Entrada`.
 */
export function Contrasena({
  id,
  valor,
  onCambio,
  conFuerza = false,
  placeholder,
  invalido,
  disabled,
  autoComplete,
  className,
}: {
  id: string;
  valor: string;
  onCambio: (v: string) => void;
  conFuerza?: boolean;
  placeholder?: string;
  invalido?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const fuerza = useMemo(() => calcularFuerza(valor), [valor]);

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="relative flex items-center">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          aria-invalid={invalido || undefined}
          className={cn(CAMPO, "pr-9", invalido && "border-destructive focus:border-destructive focus:ring-destructive/20")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-2.5 rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
      {conFuerza && valor ? (
        <Meter.Root value={fuerza.puntaje} getAriaValueText={() => fuerza.etiqueta} className="flex items-center gap-2">
          <Meter.Track className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
            <Meter.Indicator className={cn("block h-full rounded-full transition-[width] duration-300", COLOR_TONO[fuerza.tono])} />
          </Meter.Track>
          <span className="text-[11px] font-medium text-muted-foreground">{fuerza.etiqueta}</span>
        </Meter.Root>
      ) : null}
    </div>
  );
}
