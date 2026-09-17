import { CheckCircle2Icon, CircleAlertIcon, InfoIcon, TriangleAlertIcon, XIcon, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tono = "info" | "ok" | "aviso" | "error";

const ESTILOS: Record<Tono, { caja: string; icono: LucideIcon }> = {
  info: { caja: "border-accent-border bg-accent text-accent-foreground", icono: InfoIcon },
  ok: { caja: "border-success-border bg-success text-success-foreground", icono: CheckCircle2Icon },
  aviso: { caja: "border-warning-border bg-warning text-warning-foreground", icono: TriangleAlertIcon },
  error: { caja: "border-destructive-border bg-destructive/10 text-destructive", icono: CircleAlertIcon },
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
  icon?: LucideIcon;
  className?: string;
}) {
  const Icono = icon ?? ESTILOS[tono].icono;
  return (
    <div role={tono === "error" ? "alert" : "status"} className={cn("flex items-center gap-3 border-b px-4 py-2.5 text-[13px]", ESTILOS[tono].caja, className)}>
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
