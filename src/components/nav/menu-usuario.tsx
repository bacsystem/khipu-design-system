"use client";

import { CaretUpDownIcon, ShieldCheckIcon, SignOutIcon } from "@phosphor-icons/react";
import type { IconoComponente } from "@/lib/iconos";
import { useState } from "react";
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { useApariencia } from "@/components/apariencia";
import { useDiseno } from "@/components/diseno";
import { SelectorApariencia } from "@/components/nav/selector-apariencia";
import { SelectorDiseno } from "@/components/nav/selector-diseno";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { cn } from "@/lib/utils";

export type UsuarioMenu = {
  /** Nombre visible; si falta se usa la parte local del correo. */
  nombre?: string;
  email: string;
  /** Etiqueta legible del rol ("Administrador"). */
  rol?: string;
};

export type AccionMenu = {
  label: string;
  icon: IconoComponente;
  /** Con `href` se renderiza como enlace (abre en pestaña nueva si `externo`). */
  href?: string;
  externo?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
};

function iniciales(texto: string): string {
  const local = texto.split("@")[0] ?? texto;
  return local.slice(0, 2).toUpperCase();
}

/**
 * Bloque de usuario del sidebar: disparador tipo tarjeta (igual que SelectorContexto) y menú del mismo ancho con
 * la cuenta, el tema en línea, el diseño y la apariencia (paleta y tono oscuro), acciones propias y "Cerrar sesión".
 */
export function MenuUsuario({
  usuario,
  acciones = [],
  onCerrarSesion,
  textoCerrarSesion = "Cerrar sesión",
  mostrarTema = true,
  mostrarDiseno = true,
  mostrarApariencia = true,
}: {
  usuario: UsuarioMenu;
  acciones?: AccionMenu[];
  onCerrarSesion: () => void | Promise<void>;
  textoCerrarSesion?: string;
  mostrarTema?: boolean;
  /** Muestra el selector de diseño bajo el tema. Solo aparece con `DisenoProvider` y dos diseños o más. */
  mostrarDiseno?: boolean;
  /** Muestra la paleta y el tono oscuro bajo el diseño. Solo aparece con `AparienciaProvider` y fuera de «papel». */
  mostrarApariencia?: boolean;
}) {
  const [saliendo, setSaliendo] = useState(false);
  const { diseno, disenos } = useDiseno();
  const conDiseno = mostrarDiseno && disenos.length > 1;
  const { paletas } = useApariencia();
  const conApariencia = mostrarApariencia && paletas.length > 1 && diseno !== "papel";
  const nombre = usuario.nombre ?? usuario.email.split("@")[0] ?? usuario.email;

  async function salir() {
    setSaliendo(true);
    try {
      await onCerrarSesion();
    } finally {
      setSaliendo(false);
    }
  }

  return (
    <Menu>
      <MenuTrigger
        aria-label="Menú de usuario"
        className={cn(
          "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-xl bg-secondary p-2 text-left transition-colors outline-none select-none",
          "hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-secondary",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-acento text-etiqueta font-bold text-acento-texto shadow-xs">
            {iniciales(usuario.nombre ?? usuario.email)}
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-control leading-tight font-medium text-foreground">{nombre}</p>
            <p className="truncate text-etiqueta leading-tight text-muted-foreground">{usuario.email}</p>
          </div>
        </div>
        <CaretUpDownIcon className="size-4 shrink-0 text-muted-foreground/70" />
      </MenuTrigger>

      {/* Mismo ancho y alineación que el disparador: no invade el contenido principal. */}
      <MenuContent side="top" align="start" className="w-(--anchor-width) min-w-0">
        <div className="px-2 pt-1.5 pb-1 text-etiqueta font-medium text-muted-foreground">Tu cuenta</div>
        <div className="flex items-start gap-2.5 rounded-lg bg-accent py-1.5 pr-2 pl-2 text-accent-foreground">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-acento text-etiqueta font-bold text-acento-texto shadow-xs">
            {iniciales(usuario.nombre ?? usuario.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-control leading-tight font-medium">{nombre}</p>
            <p className="mt-0.5 text-etiqueta leading-snug break-all text-muted-foreground">{usuario.email}</p>
            {usuario.rol ? <p className="mt-0.5 text-etiqueta leading-tight text-muted-foreground">{usuario.rol}</p> : null}
          </div>
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
        </div>

        {mostrarTema ? (
          <>
            <MenuSeparator />
            <div className="px-2 pt-1.5 pb-1 text-etiqueta font-medium text-muted-foreground">Tema</div>
            <div className="px-0.5 pb-1.5">
              <ThemeToggle conTexto />
            </div>
          </>
        ) : null}

        {conDiseno ? (
          <>
            {mostrarTema ? null : <MenuSeparator />}
            <div className="px-2 pt-1.5 pb-1 text-etiqueta font-medium text-muted-foreground">Diseño</div>
            <div className="px-0.5 pb-1.5">
              <SelectorDiseno />
            </div>
          </>
        ) : null}

        {conApariencia ? (
          <>
            <MenuSeparator />
            <div className="px-2 pt-1.5 pb-1 text-etiqueta font-medium text-muted-foreground">Apariencia</div>
            <div className="px-2 pb-2">
              <SelectorApariencia />
            </div>
          </>
        ) : null}

        {acciones.length > 0 ? (
          <>
            <MenuSeparator />
            {acciones.map((a) => {
              const Icono = a.icon;
              return a.href ? (
                <MenuLinkItem key={a.label} href={a.href} target={a.externo ? "_blank" : undefined} title={a.title}>
                  <Icono />
                  {a.label}
                </MenuLinkItem>
              ) : (
                <MenuItem key={a.label} onClick={a.onClick} disabled={a.disabled} title={a.title}>
                  <Icono />
                  {a.label}
                </MenuItem>
              );
            })}
          </>
        ) : null}

        <MenuSeparator />
        <MenuItem variant="destructive" disabled={saliendo} onClick={salir}>
          <SignOutIcon />
          {textoCerrarSesion}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
