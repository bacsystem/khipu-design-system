import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import type { IconoComponente } from "@/lib/iconos";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tono = "info" | "ok" | "aviso" | "error";

const ESTILOS: Record<Tono, { caja: string; icono: IconoComponente }> = {
  info: { caja: "border-accent-border bg-accent text-accent-foreground", icono: InfoIcon },
  ok: { caja: "border-success-border bg-success text-success-foreground", icono: CheckCircleIcon },
  aviso: { caja: "border-warning-border bg-warning text-warning-foreground", icono: WarningIcon },
  error: { caja: "border-destructive-border bg-destructive-suave text-destructive-texto", icono: WarningCircleIcon },
};

/**
 * Aviso global de ancho completo (certificado por vencer, mantenimiento programado): va sobre `TopBar`, dentro
 * del `Shell`, no dentro de `main`. A diferencia de `Alerta` (una banda con esquinas, dentro de una página),
 * este es de borde a borde. Descartable con `onCerrar`; el estado de "descartado" lo maneja quien lo usa —
 * este componente no se auto-oculta ni recuerda nada entre sesiones.
 */
export function Banner({
  tono = "info",
  children,
  accion,
  onCerrar,
  icon,
  className,
}: {
  tono?: Tono;
  children: ReactNode;
  accion?: ReactNode;
  onCerrar?: () => void;
  icon?: IconoComponente;
  className?: string;
}) {
  const Icono = icon ?? ESTILOS[tono].icono;
  return (
    <div role={tono === "error" ? "alert" : "status"} className={cn("flex items-center gap-3 border-b px-4 py-2.5 text-control", ESTILOS[tono].caja, className)}>
      <Icono className="size-4 shrink-0" />
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
      {accion ? <div className="shrink-0">{accion}</div> : null}
      {onCerrar ? (
        <button type="button" onClick={onCerrar} aria-label="Cerrar aviso" className="shrink-0 rounded p-0.5 opacity-70 transition-opacity hover:opacity-100">
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
