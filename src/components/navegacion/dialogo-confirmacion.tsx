"use client";

import { TriangleAlertIcon, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CabeceraDialogo, PieDialogo } from "@/components/patrones/cabecera-dialogo";
import { BOTON_DESTRUCTIVO_PIE, BOTON_PRIMARIO_PIE, BOTON_SECUNDARIO_PIE } from "@/lib/estilos";

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
          <button type="button" disabled={pendiente} onClick={() => onOpenChange(false)} className={BOTON_SECUNDARIO_PIE}>
            Cancelar
          </button>
          <button type="button" disabled={pendiente} onClick={confirmar} className={destructiva ? BOTON_DESTRUCTIVO_PIE : BOTON_PRIMARIO_PIE}>
            {pendiente ? "Procesando…" : textoConfirmar}
          </button>
        </PieDialogo>
      </DialogContent>
    </Dialog>
  );
}
