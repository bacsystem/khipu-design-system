"use client";

import { BookOpenIcon, KeyRoundIcon, ListOrderedIcon, PackageIcon, ReceiptTextIcon, ShieldCheckIcon } from "lucide-react";
import { LogoMarca } from "@/components/nav/logo";
import { MenuUsuario } from "@/components/nav/menu-usuario";
import { SelectorContexto } from "@/components/nav/selector-contexto";
import { ChipSidebar, SidebarContent, TarjetaPieDeshabilitada } from "@/components/nav/sidebar";
import type { GrupoNav } from "@/components/nav/sidebar-nav";

// Todo lo específico de la app (rutas, textos, iconos, handlers) vive en este componente CLIENTE:
// los iconos de lucide y los callbacks son funciones y no pueden cruzar desde un layout de servidor.
const GRUPOS: GrupoNav[] = [
  {
    titulo: "Operación",
    items: [
      { href: "/ejemplo", label: "Documentos", icon: ReceiptTextIcon },
      { label: "Emitir", icon: PackageIcon },
      { href: "/ejemplo/series", label: "Series", icon: ListOrderedIcon },
    ],
  },
  {
    titulo: "Configuración",
    items: [
      { href: "/ejemplo/empresa", label: "Empresa", icon: ShieldCheckIcon },
      { href: "/ejemplo/api-keys", label: "API keys", icon: KeyRoundIcon },
    ],
  },
];

export function SidebarApp() {
  return (
    <SidebarContent
      marca={<LogoMarca nombre="miapp" sufijo=".pe" href="/ejemplo" />}
      chip={<ChipSidebar>v1.0</ChipSidebar>}
      selector={
        <SelectorContexto
          items={[
            { id: "a", nombre: "ACME PERÚ S.A.C.", detalle: "RUC 20123456789" },
            { id: "b", nombre: "Comercial Wari E.I.R.L.", detalle: "RUC 20456789123" },
          ]}
          activoId="a"
          etiqueta="Cambiar de empresa"
          onCambio={async (id) => console.log("empresa activa:", id)}
        />
      }
      grupos={GRUPOS}
      pie={<TarjetaPieDeshabilitada titulo="Plan y consumo" title="Plan y consumo: próximamente" />}
      usuario={
        <MenuUsuario
          usuario={{ email: "ana@acme.pe", rol: "Administradora" }}
          acciones={[{ label: "Documentación", icon: BookOpenIcon, href: "/docs", externo: true }]}
          onCerrarSesion={async () => console.log("cerrar sesión")}
        />
      }
    />
  );
}
