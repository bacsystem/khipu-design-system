"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useApariencia } from "@/components/apariencia";
import { useDiseno } from "@/components/diseno";
import { FOCO, ROTULO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

type Opcion = { valor: string; etiqueta: string; estilo: CSSProperties; contenido?: ReactNode };

/**
 * Grupo de muestras que se elige como un radio: Tab entra a la elegida, las flechas cambian y aplican. Cada muestra lleva
 * su nombre en `aria-label` y en el tooltip nativo. `forma`: círculo (paletas), tarjeta (tonos oscuros: lienzo + tarjeta +
 * acento) o «Aa» (tipografías, cada una en su fuente). Las dos últimas muestran además el nombre de la elegida debajo.
 */
function GrupoMuestras({
  etiqueta,
  opciones,
  valor,
  onCambio,
  forma,
}: {
  etiqueta: string;
  opciones: Opcion[];
  valor: string;
  onCambio: (valor: string) => void;
  forma: "circulo" | "tarjeta" | "texto";
}) {
  const botones = useRef<Array<HTMLButtonElement | null>>([]);

  function mover(desde: number, paso: number) {
    const i = (desde + paso + opciones.length) % opciones.length;
    onCambio(opciones[i].valor);
    botones.current[i]?.focus();
  }

  return (
    <div className="grid gap-1.5">
      <div role="radiogroup" aria-label={etiqueta} className={cn("flex items-center gap-1.5", forma === "circulo" && "flex-wrap")}>
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
              style={o.estilo}
              className={cn(
                "shrink-0 cursor-pointer transition-shadow duration-(--duracion-rapida) ease-salida",
                forma === "circulo" && "size-5 rounded-full",
                forma === "tarjeta" && "h-7 min-w-0 flex-1 rounded-lg",
                forma === "texto" && "grid h-8 min-w-0 flex-1 place-items-center rounded-lg bg-secondary text-cuerpo font-semibold text-foreground",
                activa
                  ? cn("ring-2 ring-foreground ring-offset-2 ring-offset-popover", forma === "texto" && "bg-popover")
                  : forma !== "texto" && "ring-1 ring-border",
                FOCO,
              )}
            >
              {o.contenido}
            </button>
          );
        })}
      </div>
      {forma !== "circulo" ? (
        <span className="text-center text-etiqueta text-texto-terciario">{opciones.find((o) => o.valor === valor)?.etiqueta}</span>
      ) : null}
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
    estilo: { background: `conic-gradient(${p.muestra[0]} 0 50%, ${p.muestra[1]} 0 75%, ${p.muestra[2]} 0)` },
  }));
  return (
    <div className={className}>
      <GrupoMuestras forma="circulo" etiqueta="Paleta de color" opciones={opciones} valor={paleta} onCambio={setPaleta} />
    </div>
  );
}

/**
 * Muestras de los tonos del modo oscuro: lienzo, tarjeta y acento de la paleta en diagonal, para que se distingan (tres
 * círculos casi negros no se diferenciaban). Se puede elegir estando en claro: se aplica al pasar a oscuro.
 */
export function SelectorTonoOscuro({ className }: { className?: string }) {
  const { tonoOscuro, setTonoOscuro, tonosOscuro } = useApariencia();
  const { diseno } = useDiseno();
  if (tonosOscuro.length < 2 || diseno === "papel") return null;
  const opciones = tonosOscuro.map((t) => ({
    valor: t.valor,
    etiqueta: t.etiqueta,
    estilo: { background: `linear-gradient(135deg, ${t.lienzo ?? t.muestra} 0 45%, ${t.muestra} 45% 75%, var(--acento) 75%)` },
  }));
  return (
    <div className={className}>
      <GrupoMuestras forma="tarjeta" etiqueta="Tono del modo oscuro" opciones={opciones} valor={tonoOscuro} onCambio={setTonoOscuro} />
    </div>
  );
}

/** Tipografías de interfaz: un «Aa» dibujado en cada fuente. Los datos siguen en JetBrains Mono. */
export function SelectorTipografia({ className }: { className?: string }) {
  const { fuente, setFuente, fuentes } = useApariencia();
  const { diseno } = useDiseno();
  if (fuentes.length < 2 || diseno === "papel") return null;
  const opciones = fuentes.map((f) => ({ valor: f.valor, etiqueta: f.etiqueta, estilo: { fontFamily: f.familia }, contenido: "Aa" }));
  return (
    <div className={className}>
      <GrupoMuestras forma="texto" etiqueta="Tipografía" opciones={opciones} valor={fuente} onCambio={setFuente} />
    </div>
  );
}

/** Paleta, tono oscuro y tipografía con su rótulo. Va en el menú de usuario bajo el tema. */
export function SelectorApariencia({ className }: { className?: string }) {
  const { paletas } = useApariencia();
  const { diseno } = useDiseno();
  if (paletas.length < 2 || diseno === "papel") return null;
  return (
    <div className={cn("grid gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className={ROTULO}>Paleta</span>
        <SelectorPaleta />
      </div>
      <div className="grid gap-1.5">
        <span className={ROTULO}>Tono oscuro</span>
        <SelectorTonoOscuro />
      </div>
      <div className="grid gap-1.5">
        <span className={ROTULO}>Tipografía</span>
        <SelectorTipografia />
      </div>
    </div>
  );
}
