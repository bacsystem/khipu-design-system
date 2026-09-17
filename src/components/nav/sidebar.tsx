import type { ReactNode } from "react";
import { SidebarNav, type GrupoNav } from "./sidebar-nav";

/**
 * Contenido del sidebar (240px en desktop, cajón lateral en móvil). Se compone por slots para no acoplarlo a ninguna app:
 * `marca` (LogoMarca), `chip` (p. ej. versión/estándar), `selector` (SelectorContexto), `grupos` (SidebarNav),
 * `pie` (tarjetas de plan, avisos) y `usuario` (MenuUsuario).
 */
export function SidebarContent({
  marca,
  chip,
  selector,
  grupos,
  pie,
  usuario,
}: {
  marca: ReactNode;
  chip?: ReactNode;
  selector?: ReactNode;
  grupos: GrupoNav[];
  pie?: ReactNode;
  usuario?: ReactNode;
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col justify-between overflow-hidden select-none">
      <div className="flex w-full min-w-0 flex-col">
        <div className="flex h-14 w-full min-w-0 shrink-0 items-center justify-between gap-2 overflow-hidden border-b border-border/60 px-4">
          {marca}
          {chip}
        </div>
        {selector ? <div className="px-3 pt-3 pb-2">{selector}</div> : null}
        <SidebarNav grupos={grupos} />
      </div>

      {pie || usuario ? (
        <div className="flex w-full min-w-0 flex-col gap-2.5 border-t border-border/60 p-3">
          {pie}
          {usuario}
        </div>
      ) : null}
    </div>
  );
}

/** Chip pequeño para la cabecera del sidebar (versión, estándar, entorno). */
export function ChipSidebar({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-border/60 bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-medium whitespace-nowrap text-secondary-foreground/70">
      {children}
    </span>
  );
}

/** Tarjeta de pie deshabilitada (p. ej. "Plan y consumo" antes de tener datos). */
export function TarjetaPieDeshabilitada({ titulo, valor = "— / —", title }: { titulo: string; valor?: string; title?: string }) {
  return (
    <div
      title={title}
      aria-disabled="true"
      className="grid w-full cursor-not-allowed grid-cols-1 gap-1.5 overflow-hidden rounded-lg border border-border/60 bg-muted/90 p-2.5 opacity-60"
    >
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="truncate font-medium text-foreground/80">{titulo}</span>
        <span className="shrink-0 font-mono text-[10px] whitespace-nowrap text-muted-foreground">{valor}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full w-0 rounded-full bg-primary" />
      </div>
    </div>
  );
}
