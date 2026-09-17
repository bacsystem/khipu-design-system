"use client";

import { TriangleAlertIcon, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CabeceraDialogo, PieDialogo } from "@/components/patrones/cabecera-dialogo";
import { BOTON_SECUNDARIO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

/**
 * Confirmación modal para acciones irreversibles que NO caben en línea (afectan a varios registros o necesitan explicación).
 * `onConfirmar` puede devolver un mensaje de error para mostrarlo sin cerrar.
 */
export function DialogoConfirmacion({
  open,
  onOpenChange,
  icon = TriangleAlertIcon,
  titulo,
  descripcion,
  children,
  textoConfirmar = "Confirmar",
  destructiva = true,
  onConfirmar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  icon?: LucideIcon;
  titulo: ReactNode;
  descripcion?: ReactNode;
  children?: ReactNode;
  textoConfirmar?: string;
  destructiva?: boolean;
  onConfirmar: () => Promise<string | null | void> | string | null | void;
}) {
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmar() {
    setPendiente(true);
    setError(null);
    try {
      const r = await onConfirmar();
      if (r) {
        setError(r);
        return;
      }
      onOpenChange(false);
    } finally {
      setPendiente(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <CabeceraDialogo icon={icon} titulo={titulo} descripcion={descripcion} />
        {children || error ? (
          <div className="grid gap-3 px-5 py-4 text-[13px] leading-relaxed text-muted-foreground">
            {children}
            {error ? <p className="text-destructive">{error}</p> : null}
          </div>
        ) : null}
        <PieDialogo>
          <button type="button" disabled={pendiente} onClick={() => onOpenChange(false)} className={cn(BOTON_SECUNDARIO, "h-9 px-3.5 text-[13px]")}>
            Cancelar
          </button>
          <button
            type="button"
            disabled={pendiente}
            onClick={confirmar}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-3.5 text-[13px] font-semibold shadow-xs transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
              destructiva ? "bg-destructive text-white hover:bg-destructive/90" : "bg-primary text-primary-foreground hover:opacity-95",
            )}
          >
            {pendiente ? "Procesando…" : textoConfirmar}
          </button>
        </PieDialogo>
      </DialogContent>
    </Dialog>
  );
}
