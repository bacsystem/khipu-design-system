"use client";

import { BanIcon, RefreshCwIcon, type LucideIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

const ACCION =
  "inline-flex h-7 items-center gap-1 rounded-md px-2 text-[12px] font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Acción irreversible confirmada en línea (sin diálogo): "Revocar" → "¿Revocar de forma permanente? [Sí, revocar] [Cancelar]".
 * `onConfirmar` puede devolver un mensaje de error para mostrarlo debajo.
 */
export function ConfirmacionEnLinea({
  etiqueta,
  pregunta,
  confirmar,
  icon: Icon = BanIcon,
  onConfirmar,
}: {
  etiqueta: string;
  pregunta: string;
  confirmar: string;
  icon?: LucideIcon;
  onConfirmar: () => Promise<string | null | void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function ejecutar() {
    setError(null);
    startTransition(async () => {
      const resultado = await onConfirmar();
      if (resultado) {
        setError(resultado);
        return;
      }
      setAbierto(false);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center justify-end gap-1">
        {abierto ? (
          <>
            <span className="mr-1 text-[11px] text-muted-foreground">{pregunta}</span>
            <button type="button" disabled={pendiente} onClick={ejecutar} className={cn(ACCION, "bg-destructive text-white shadow-xs hover:bg-destructive/90")}>
              {pendiente ? <RefreshCwIcon className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}
              {confirmar}
            </button>
            <button type="button" disabled={pendiente} onClick={() => setAbierto(false)} className={cn(ACCION, "border border-border bg-card text-foreground/80 hover:bg-muted")}>
              Cancelar
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setAbierto(true)} className={cn(ACCION, "text-destructive hover:bg-destructive/10")}>
            <Icon className="size-3.5" />
            {etiqueta}
          </button>
        )}
      </div>
      {error ? <span className="text-[11px] text-destructive">{error}</span> : null}
    </div>
  );
}
