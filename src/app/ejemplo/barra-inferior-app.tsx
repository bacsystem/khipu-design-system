"use client";

import { HouseIcon, KeyIcon, ListNumbersIcon, PlusIcon, ReceiptIcon } from "@phosphor-icons/react";
import { BarraInferior } from "@/components/nav/barra-inferior";
import { SidebarApp } from "./sidebar-app";

// Las entradas de la barra las decide la app (aquí, cuatro rutas de la demo); «Más» abre el mismo SidebarContent completo en un cajón.
// Los iconos son funciones: por eso esto es un componente CLIENTE y el layout de servidor solo lo coloca.
export function BarraInferiorApp() {
  return (
    <BarraInferior
      items={[
        { href: "/ejemplo", label: "Inicio", icon: ReceiptIcon, exacto: true },
        { href: "/ejemplo/series", label: "Series", icon: ListNumbersIcon },
        { href: "/ejemplo/empresa", label: "Empresa", icon: HouseIcon },
        { href: "/ejemplo/api-keys", label: "API keys", icon: KeyIcon },
      ]}
      mas={{ etiqueta: "Más", contenido: <SidebarApp /> }}
      accion={{ href: "/ejemplo/series", etiqueta: "Nueva serie", icono: PlusIcon }}
    />
  );
}
