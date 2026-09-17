import type { ReactNode } from "react";
import { MobileNav } from "@/components/nav/mobile-nav";
import { Shell } from "@/components/nav/shell";
import { ACCION_PRINCIPAL, ACCION_SECUNDARIA, TopBar } from "@/components/nav/top-bar";
import { AccionesEjemplo } from "./acciones";
import { SidebarApp } from "./sidebar-app";

// Migas y pills son datos planos: pueden vivir en el layout de servidor.
const MIGAS = [
  { prefijo: "/ejemplo/api-keys", seccion: "Configuración", pagina: "API keys" },
  { prefijo: "/ejemplo/empresa", seccion: "Configuración", pagina: "Empresa" },
  { prefijo: "/ejemplo/series", seccion: "Operación", pagina: "Series" },
  { prefijo: "/ejemplo", seccion: "Operación", pagina: "Documentos" },
];

export default function EjemploLayout({ children }: { children: ReactNode }) {
  return (
    <Shell
      sidebar={<SidebarApp />}
      topBar={
        <TopBar
          migas={MIGAS}
          pills={[
            { texto: "Sin monitoreo", tono: "neutro", deshabilitado: true, title: "Monitoreo: próximamente" },
            { texto: "Entorno de pruebas", tono: "aviso" },
          ]}
          menuMovil={
            <MobileNav>
              <SidebarApp />
            </MobileNav>
          }
          buscador={{ placeholder: "Buscar…", atajo: "⌘K", title: "Búsqueda global: próximamente" }}
          acciones={<AccionesEjemplo principal={ACCION_PRINCIPAL} secundaria={ACCION_SECUNDARIA} />}
        />
      }
    >
      {children}
    </Shell>
  );
}
