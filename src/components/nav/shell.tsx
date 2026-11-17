import type { ReactNode } from "react";
import { ProveedorRail } from "@/components/nav/rail";
import { ID_SIDEBAR, type ModoRail } from "@/lib/rail";

/**
 * Esqueleto de la app privada: sidebar flotante de 248px (md+) + columna con top bar y main.
 * `sidebar` es el `SidebarContent`; `topBar` la `TopBar` (que a su vez recibe `menuMovil` con el mismo sidebar).
 *
 * - `rail="auto"` pliega el sidebar a 64 px (solo iconos, con tooltips) entre 768 y 1279 px; el usuario lo expande o lo contrae con
 *   `BotonRail` (que `SidebarContent` pone en su cabecera) y la elección se recuerda en `localStorage`. Lo decide CSS (`rail:` en `theme.css`),
 *   sin parpadeo. Con `"nunca"` (por defecto) el sidebar mide siempre 248 px, como antes.
 * - `barraInferior` es la `BarraInferior` del móvil (≤767 px). Va al final de la columna, pegada abajo (`sticky`) y **en el flujo**: el contenido
 *   nunca queda debajo de ella ni de su acción flotante, y respeta la zona segura del dispositivo.
 */
export function Shell({
  sidebar,
  topBar,
  children,
  rail = "nunca",
  barraInferior,
}: {
  sidebar: ReactNode;
  topBar: ReactNode;
  children: ReactNode;
  rail?: ModoRail;
  barraInferior?: ReactNode;
}) {
  const conRail = rail === "auto";
  return (
    <ProveedorRail modo={rail}>
      <div data-khipu-rail={conRail ? "auto" : undefined} className="flex min-h-screen">
        {/* Sidebar flotante: tarjeta de 248px con 12px de margen sobre el lienzo (64px en el rail). */}
        <aside
          id={conRail ? ID_SIDEBAR : undefined}
          className="hidden w-[260px] shrink-0 py-3 pl-3 md:sticky md:top-0 md:block md:h-screen rail:w-[76px] motion-safe:rail:transition-[width] motion-safe:rail:duration-(--duracion-media)"
        >
          <div className="h-full overflow-hidden rounded-xl border border-borde-tarjeta bg-sidebar text-sidebar-foreground shadow-tarjeta">
            {sidebar}
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          {topBar}
          <main className="min-w-0 flex-1 overflow-x-auto p-3">{children}</main>
          {barraInferior}
        </div>
      </div>
    </ProveedorRail>
  );
}

/** Contenedor de página: bloques separados por gap-3 y ancho máximo 1520px. */
export function Pagina({ children }: { children: ReactNode }) {
  return <div className="mx-auto grid w-full max-w-[1520px] min-w-0 grid-cols-1 gap-3">{children}</div>;
}
