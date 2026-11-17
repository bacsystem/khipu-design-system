"use client";

import { useState } from "react";
import { ajustarDecimal, limpiarTextoDecimal, parsearDecimal, textoDeDecimal } from "@/lib/decimal";
import { CAMPO } from "@/lib/estilos";
import { formatearNumero } from "@/lib/formato";
import { cn } from "@/lib/utils";

const SIMBOLOS: Record<string, string> = { PEN: "S/", USD: "$", EUR: "€" };

/**
 * Importe con moneda: prefijo con el símbolo, selector de moneda a la derecha y formato `1,234.50` al salir del campo.
 * `valor` es número (o null si está vacío); no admite negativos. Al teclear acepta `,` o `.` como decimal («12,5» = 12.5;
 * «1.234,56» = 1234.56, reglas en `lib/decimal`) y redondea a 2 decimales. Para otras cantidades usa `EntradaDecimal`.
 */
export function EntradaMonto({
  id,
  valor,
  onCambio,
  moneda = "PEN",
  monedas = ["PEN", "USD"],
  onMoneda,
  disabled,
  className,
}: {
  id: string;
  valor: number | null;
  onCambio: (v: number | null) => void;
  moneda?: string;
  monedas?: string[];
  onMoneda?: (m: string) => void;
  /** Las dos variantes miden h-control (altura única de control); se conserva por compatibilidad. Igual que StepperNumerico. */
  variante?: "filtro" | "campo";
  disabled?: boolean;
  className?: string;
}) {
  const [texto, setTexto] = useState(valor == null ? "" : formatearNumero(valor));
  const [editando, setEditando] = useState(false);
  const mostrado = editando ? texto : valor == null ? "" : formatearNumero(valor);

  return (
    <div className={cn("relative flex items-center", className)}>
      <span className="pointer-events-none absolute left-3 font-mono text-control text-muted-foreground">{SIMBOLOS[moneda] ?? moneda}</span>
      <input
        id={id}
        inputMode="decimal"
        value={mostrado}
        disabled={disabled}
        onFocus={() => {
          setTexto(textoDeDecimal(valor));
          setEditando(true);
        }}
        onChange={(e) => {
          const limpio = limpiarTextoDecimal(e.target.value);
          setTexto(limpio);
          const n = parsearDecimal(limpio);
          onCambio(n === null ? null : ajustarDecimal(n, 2));
        }}
        onBlur={() => setEditando(false)}
        className={cn(CAMPO, "pl-9 pr-20 text-right font-mono tabular-nums")}
      />
      {monedas.length > 1 && onMoneda ? (
        <select
          aria-label="Moneda"
          value={moneda}
          disabled={disabled}
          onChange={(e) => onMoneda(e.target.value)}
          className="absolute right-1.5 h-7 rounded-md border border-border bg-card px-1.5 font-mono text-etiqueta font-medium text-foreground shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          {monedas.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      ) : (
        <span className="absolute right-3 font-mono text-etiqueta text-muted-foreground">{moneda}</span>
      )}
    </div>
  );
}
