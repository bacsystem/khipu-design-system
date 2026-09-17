import type { ReactNode } from "react";

/**
 * Esqueleto de la app privada: sidebar fijo de 240px (md+) + columna con top bar y main.
 * `sidebar` es el `SidebarContent`; `topBar` la `TopBar` (que a su vez recibe `menuMovil` con el mismo sidebar).
 */
export function Shell({ sidebar, topBar, children }: { sidebar: ReactNode; topBar: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 overflow-x-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:block md:h-screen md:overflow-y-auto">
        {sidebar}
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <main className="min-w-0 flex-1 overflow-x-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

/** Contenedor de página: bloques separados por gap-4 y ancho máximo 1520px. */
export function Pagina({ children }: { children: ReactNode }) {
  return <div className="mx-auto grid w-full max-w-[1520px] min-w-0 grid-cols-1 gap-4">{children}</div>;
}
