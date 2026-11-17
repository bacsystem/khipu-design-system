import type { ReactNode } from "react";
import { BotonRail, type TextosRail } from "@/components/nav/rail";
import { SidebarNav, type GrupoNav, type TextosSidebarNav } from "@/components/nav/sidebar-nav";

/**
 * Contenido del sidebar (248px en desktop, cajón lateral en móvil). Se compone por slots para no acoplarlo a ninguna app:
 * `marca` (LogoMarca), `chip` (p. ej. versión/estándar), `selector` (SelectorContexto), `grupos` (SidebarNav),
 * `pie` (tarjetas de plan, avisos) y `usuario` (MenuUsuario).
 * Dentro de un `Shell rail="auto"` la cabecera lleva `BotonRail` y, plegado a 64 px, la marca queda en su icono, el chip y el pie se ocultan y
 * el selector y el usuario se reducen a su avatar (cada uno se adapta solo; no hay que pasar nada).
 * Solo la navegación se desplaza (`min-h-0 flex-1 overflow-y-auto`): la marca, el selector, el pie y el usuario quedan siempre a la vista, aunque haya decenas de ítems.
 */
export function SidebarContent({
  marca,
  chip,
  selector,
  grupos,
  etiquetaMenu,
  textosNav,
  textosRail,
  pie,
  usuario,
}: {
  marca: ReactNode;
  chip?: ReactNode;
  selector?: ReactNode;
  grupos: GrupoNav[];
  /** Nombre accesible del menú (`aria-label` de su `nav`). */
  etiquetaMenu?: string;
  /** Textos del botón de los grupos colapsables (`SidebarNav textos`). */
  textosNav?: Partial<TextosSidebarNav>;
  /** Textos de `BotonRail` («Contraer menú» / «Expandir menú»). */
  textosRail?: Partial<TextosRail>;
  pie?: ReactNode;
  usuario?: ReactNode;
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden select-none">
      <div className="flex h-14 w-full min-w-0 shrink-0 items-center justify-between gap-2 overflow-hidden px-4 rail:h-auto rail:flex-col rail:justify-center rail:px-0 rail:py-3">
        {marca}
        {chip ? <div className="flex min-w-0 shrink-0 rail:hidden">{chip}</div> : null}
        <BotonRail textos={textosRail} className="max-md:hidden" />
      </div>
      {selector ? <div className="shrink-0 px-3 pt-3 pb-2 rail:px-2">{selector}</div> : null}
      <div className="min-h-0 w-full min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
        <SidebarNav grupos={grupos} etiqueta={etiquetaMenu} textos={textosNav} />
      </div>

      {pie || usuario ? (
        <div className="flex w-full min-w-0 shrink-0 flex-col gap-2.5 border-t border-border/60 p-3 rail:items-center rail:p-2">
          {pie ? <div className="flex w-full min-w-0 flex-col gap-2.5 rail:hidden">{pie}</div> : null}
          {usuario}
        </div>
      ) : null}
    </div>
  );
}

/** Chip pequeño para la cabecera del sidebar (versión, estándar, entorno). */
export function ChipSidebar({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded border border-border/60 bg-secondary px-1.5 py-0.5 font-mono text-etiqueta font-medium whitespace-nowrap text-secondary-foreground/70">
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
      <div className="flex items-center justify-between gap-2 text-etiqueta">
        <span className="truncate font-medium text-foreground/80">{titulo}</span>
        <span className="shrink-0 font-mono text-etiqueta whitespace-nowrap text-muted-foreground">{valor}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full w-0 rounded-full bg-primary" />
      </div>
    </div>
  );
}
