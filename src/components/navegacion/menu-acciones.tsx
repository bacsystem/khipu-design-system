"use client";

import { useId } from "react";
import { DotsThreeIcon } from "@phosphor-icons/react";
import type { IconoComponente } from "@/lib/iconos";
import { Menu, MenuContent, MenuItem, MenuLinkItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { OBJETIVO_TACTIL } from "@/lib/estilos";
import { cn } from "@/lib/utils";

export type AccionFila = {
  label: string;
  icon?: IconoComponente;
  href?: string;
  onClick?: () => void;
  destructiva?: boolean;
  disabled?: boolean;
  title?: string;
  /** Por qué la acción está deshabilitada: texto visible bajo el ítem, enlazado con `aria-describedby`. Un `title` no sirve en un ítem deshabilitado (no recibe puntero, ni foco, y no existe en el móvil). */
  ayuda?: string;
  /** Pinta un separador antes de esta acción. */
  separador?: boolean;
};

/** Texto de ayuda de una acción deshabilitada, fuera del ítem para que no herede su opacidad y se lea con contraste normal. */
export function AyudaAccion({ id, children }: { id: string; children: string }) {
  return (
    <p id={id} className="-mt-0.5 px-2.5 pb-1.5 text-etiqueta text-muted-foreground">
      {children}
    </p>
  );
}

function ItemAccion({ accion: a }: { accion: AccionFila }) {
  const idAyuda = useId();
  const Icono = a.icon;
  return (
    <>
      {a.separador ? <MenuSeparator /> : null}
      {a.href ? (
        <MenuLinkItem href={a.href} title={a.title}>
          {Icono ? <Icono /> : null}
          {a.label}
        </MenuLinkItem>
      ) : (
        <MenuItem
          variant={a.destructiva ? "destructive" : "default"}
          disabled={a.disabled}
          title={a.title}
          aria-describedby={a.ayuda ? idAyuda : undefined}
          onClick={a.onClick}
        >
          {Icono ? <Icono /> : null}
          {a.label}
        </MenuItem>
      )}
      {a.ayuda ? <AyudaAccion id={idAyuda}>{a.ayuda}</AyudaAccion> : null}
    </>
  );
}

/** Botón "⋯" de fila que abre un menú con las acciones secundarias (ver, duplicar, descargar, eliminar…). */
export function MenuAcciones({ acciones, etiqueta = "Más acciones", className }: { acciones: AccionFila[]; etiqueta?: string; className?: string }) {
  return (
    <Menu>
      <MenuTrigger
        aria-label={etiqueta}
        title={etiqueta}
        className={cn(
          OBJETIVO_TACTIL,
          "flex size-control items-center justify-center rounded-lg text-muted-foreground/70 transition-colors outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 data-popup-open:bg-secondary data-popup-open:text-foreground",
          className,
        )}
      >
        <DotsThreeIcon weight="bold" className="size-4" />
      </MenuTrigger>
      <MenuContent side="bottom" align="end" className="min-w-44">
        {acciones.map((a) => (
          <span key={a.label} className="contents">
            <ItemAccion accion={a} />
          </span>
        ))}
      </MenuContent>
    </Menu>
  );
}
