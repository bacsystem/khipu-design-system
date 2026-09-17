"use client";

import { ChevronsUpDownIcon, LogOutIcon, ShieldCheckIcon, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
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
  icon: LucideIcon;
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
 * la cuenta, el tema en línea, acciones propias y "Cerrar sesión".
 */
export function MenuUsuario({
  usuario,
  acciones = [],
  onCerrarSesion,
  textoCerrarSesion = "Cerrar sesión",
  mostrarTema = true,
}: {
  usuario: UsuarioMenu;
  acciones?: AccionMenu[];
  onCerrarSesion: () => void | Promise<void>;
  textoCerrarSesion?: string;
  mostrarTema?: boolean;
}) {
  const [saliendo, setSaliendo] = useState(false);
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
          "flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 overflow-hidden rounded-lg border border-border/60 bg-muted/80 p-2 text-left transition-colors outline-none select-none",
          "hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-secondary",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground shadow-xs">
            {iniciales(usuario.nombre ?? usuario.email)}
          </div>
          <div className="min-w-0 overflow-hidden">
            <p className="truncate text-[12px] leading-tight font-medium text-foreground">{nombre}</p>
            <p className="truncate font-mono text-[10px] leading-tight text-muted-foreground">{usuario.email}</p>
          </div>
        </div>
        <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground/70" />
      </MenuTrigger>

      {/* Mismo ancho y alineación que el disparador: no invade el contenido principal. */}
      <MenuContent side="top" align="start" className="w-(--anchor-width) min-w-0">
        <div className="px-2 pt-1.5 pb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Tu cuenta</div>
        <div className="flex items-start gap-2.5 rounded-md bg-accent/70 py-1.5 pr-2 pl-2 text-accent-foreground">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground shadow-xs">
            {iniciales(usuario.nombre ?? usuario.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] leading-tight font-medium">{nombre}</p>
            <p className="mt-0.5 font-mono text-[10px] leading-snug break-all text-muted-foreground">{usuario.email}</p>
            {usuario.rol ? <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{usuario.rol}</p> : null}
          </div>
          <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
        </div>

        {mostrarTema ? (
          <>
            <MenuSeparator />
            <div className="px-2 pt-1.5 pb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Tema</div>
            <div className="px-0.5 pb-1.5">
              <ThemeToggle conTexto className="h-8" />
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
          <LogOutIcon />
          {textoCerrarSesion}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
