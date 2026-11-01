"use client";

import { useRef, type CSSProperties } from "react";
import { useApariencia } from "@/components/apariencia";
import { useDiseno } from "@/components/diseno";
import { FOCO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

type Opcion = { valor: string; etiqueta: string; fondo: string };

/**
 * Grupo de muestras redondas que se elige como un radio: Tab entra a la elegida, las flechas cambian y aplican.
 * Cada muestra lleva su nombre en `aria-label` y en el tooltip nativo.
 */
function GrupoMuestras({ etiqueta, opciones, valor, onCambio }: { etiqueta: string; opciones: Opcion[]; valor: string; onCambio: (valor: string) => void }) {
  const botones = useRef<Array<HTMLButtonElement | null>>([]);

  function mover(desde: number, paso: number) {
    const i = (desde + paso + opciones.length) % opciones.length;
    onCambio(opciones[i].valor);
    botones.current[i]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap items-center gap-1.5">
      {opciones.map((o, i) => {
        const activa = o.valor === valor;
        return (
          <button
            key={o.valor}
            ref={(el) => {
              botones.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activa}
            aria-label={o.etiqueta}
            title={o.etiqueta}
            tabIndex={activa ? 0 : -1}
            onClick={() => onCambio(o.valor)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                mover(i, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                mover(i, -1);
              }
            }}
            style={{ background: o.fondo } as CSSProperties}
            className={cn(
              "size-6 shrink-0 cursor-pointer rounded-full border-2 border-popover ring-1 ring-border transition-shadow duration-(--duracion-rapida) ease-salida",
              activa && "ring-2 ring-foreground",
              FOCO,
            )}
          />
        );
      })}
    </div>
  );
}

/** Muestras de las paletas (acento, acento 2 y acento 3 en un círculo). No pinta nada sin `AparienciaProvider` ni con «papel». */
export function SelectorPaleta({ className }: { className?: string }) {
  const { paleta, setPaleta, paletas } = useApariencia();
  const { diseno } = useDiseno();
  if (paletas.length < 2 || diseno === "papel") return null;
  const opciones = paletas.map((p) => ({
    valor: p.valor,
    etiqueta: p.etiqueta,
    fondo: `conic-gradient(${p.muestra[0]} 0 50%, ${p.muestra[1]} 0 75%, ${p.muestra[2]} 0)`,
  }));
  return (
    <div className={className}>
      <GrupoMuestras etiqueta="Paleta de color" opciones={opciones} valor={paleta} onCambio={setPaleta} />
    </div>
  );
}

/** Muestras de los tonos del modo oscuro. Se puede elegir estando en claro: se aplica al pasar a oscuro. */
export function SelectorTonoOscuro({ className }: { className?: string }) {
  const { tonoOscuro, setTonoOscuro, tonosOscuro } = useApariencia();
  const { diseno } = useDiseno();
  if (tonosOscuro.length < 2 || diseno === "papel") return null;
  const opciones = tonosOscuro.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta, fondo: t.muestra }));
  return (
    <div className={className}>
      <GrupoMuestras etiqueta="Tono del modo oscuro" opciones={opciones} valor={tonoOscuro} onCambio={setTonoOscuro} />
    </div>
  );
}

/** Paleta y tono oscuro, uno debajo del otro con su rótulo. Va en el menú de usuario bajo el tema. */
export function SelectorApariencia({ className }: { className?: string }) {
  const { paletas } = useApariencia();
  const { diseno } = useDiseno();
  if (paletas.length < 2 || diseno === "papel") return null;
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="grid gap-1">
        <span className="text-etiqueta font-medium text-muted-foreground">Paleta</span>
        <SelectorPaleta />
      </div>
      <div className="grid gap-1">
        <span className="text-etiqueta font-medium text-muted-foreground">Oscuro</span>
        <SelectorTonoOscuro />
      </div>
    </div>
  );
}
