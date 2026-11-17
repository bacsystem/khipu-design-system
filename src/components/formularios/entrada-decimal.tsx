"use client";

import { useState, type ReactNode } from "react";
import { CAMPO } from "@/lib/estilos";
import { esNormalizacionDelTexto, interpretarEntrada, textoDeDecimal } from "@/lib/decimal";
import { cn } from "@/lib/utils";

/**
 * Número que se teclea (cantidades, precios, descuentos, pesos, porcentajes). Guarda el **texto** mientras el campo
 * tiene el foco, así «12,», «1.» o un campo vacío sobreviven al re-render; acepta `,` o `.` como separador decimal
 * (ver `lib/decimal` para las reglas con miles), llama a `onCambio` con el número en cada cambio (`null` si está vacío),
 * lo acota a `max` (si lo teclado lo supera, reescribe el texto con el tope) y lo redondea a `decimales`. Al salir normaliza el texto y acota a `min`. Si `valor` cambia desde
 * fuera (reinicio, recálculo) el campo lo refleja, también con el foco puesto. Mide h-control; cifras en `tabular-nums`.
 * Va dentro de `Campo` (el `id` enlaza la etiqueta). No admite negativos salvo con `min` menor que 0.
 */
export function EntradaDecimal({
  id,
  valor,
  onCambio,
  min,
  max,
  decimales = 2,
  sufijo,
  alinear = "derecha",
  disabled,
  invalido,
  placeholder,
  name,
  className,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedby,
}: {
  id: string;
  valor: number | null;
  onCambio: (v: number | null) => void;
  /** Cota inferior; se aplica al salir del campo (no mientras se teclea). Con `min` < 0 se admiten negativos. */
  min?: number;
  /** Cota superior; se aplica en cada cambio. */
  max?: number;
  /** Decimales que se conservan (por defecto 2). `0` = solo enteros: el teclado es numérico y los decimales se truncan. */
  decimales?: number;
  /** Unidad o símbolo a la derecha: «%», «kg», «S/». */
  sufijo?: ReactNode;
  alinear?: "izquierda" | "derecha";
  disabled?: boolean;
  invalido?: boolean;
  placeholder?: string;
  name?: string;
  className?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
}) {
  const idSufijo = `${id}-sufijo`;
  const negativo = min !== undefined && min < 0;
  const [texto, setTexto] = useState(textoDeDecimal(valor));
  const [editando, setEditando] = useState(false);
  // Último valor que este campo comunicó: si `valor` es otro, vino de fuera y el texto se rehace.
  const [comunicado, setComunicado] = useState(valor);
  if (editando && valor !== comunicado) {
    setComunicado(valor);
    // Si es solo la normalización de lo escrito (el padre guarda `v ?? 0`, redondea o acota) el texto no se pisa.
    if (!esNormalizacionDelTexto(texto, valor, { decimales, max })) setTexto(textoDeDecimal(valor));
  }
  const mostrado = editando ? texto : textoDeDecimal(valor);

  const confirmar = (v: number | null) => {
    setComunicado(v);
    onCambio(v);
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      <input
        id={id}
        name={name}
        type="text"
        inputMode={decimales === 0 ? "numeric" : "decimal"}
        autoComplete="off"
        value={mostrado}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-describedby={[ariaDescribedby, sufijo != null ? idSufijo : undefined].filter(Boolean).join(" ") || undefined}
        aria-invalid={invalido || undefined}
        onFocus={() => {
          setTexto(textoDeDecimal(valor));
          setComunicado(valor);
          setEditando(true);
        }}
        onChange={(e) => {
          const { texto: nuevo, valor: n } = interpretarEntrada(e.target.value, { decimales, max, negativo });
          setTexto(nuevo);
          confirmar(n);
        }}
        onBlur={() => {
          setEditando(false);
          if (valor !== null && min !== undefined && valor < min) confirmar(min);
        }}
        className={cn(CAMPO, "tabular-nums", alinear === "derecha" ? "text-right" : "text-left", sufijo != null && "pr-10")}
      />
      {sufijo != null ? <span id={idSufijo} className="pointer-events-none absolute right-3 text-etiqueta text-muted-foreground">{sufijo}</span> : null}
    </div>
  );
}
