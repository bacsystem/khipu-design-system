"use client";

import { CaretDoubleLeftIcon, CaretDoubleRightIcon } from "@phosphor-icons/react";
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { Tooltip } from "@/components/feedback/tooltip";
import { FOCO, OBJETIVO_TACTIL } from "@/lib/estilos";
import { PESO_ICONO_FUNCIONAL } from "@/lib/iconos";
import {
  CLAVE_RAIL,
  ID_SIDEBAR,
  MEDIA_RAIL_MD,
  MEDIA_RAIL_XL,
  esPreferenciaRail,
  guardarPreferenciaRail,
  leerPreferenciaRail,
  railEfectivo,
  type ModoRail,
} from "@/lib/rail";
import { cn } from "@/lib/utils";

/** `modo` lo fija el `Shell`; `rail` es si el sidebar se ve ahora plegado (siempre `false` en el servidor y con `modo="nunca"`). */
export type EstadoRail = { modo: ModoRail; rail: boolean };

const ESTADO_INICIAL: EstadoRail = { modo: "nunca", rail: false };
/** Expuesto para pruebas y para quien necesite simular el estado; las apps usan `Shell rail`. */
export const ContextoRail = createContext<EstadoRail>(ESTADO_INICIAL);

/** Estado del rail para los componentes del sidebar. Fuera de un `Shell rail="auto"` (cajón móvil, otra app) es `{ modo: "nunca", rail: false }`. */
export const useRail = (): EstadoRail => useContext(ContextoRail);

function preferenciaDelDocumento() {
  const valor = document.documentElement.dataset.rail;
  return esPreferenciaRail(valor) ? valor : null;
}

const sinMatchMedia = () => typeof window === "undefined" || typeof window.matchMedia !== "function";

function suscribir(avisar: () => void) {
  if (sinMatchMedia()) return () => {};
  const medios = [window.matchMedia(MEDIA_RAIL_MD), window.matchMedia(MEDIA_RAIL_XL)];
  for (const medio of medios) medio.addEventListener("change", avisar);
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["data-rail"] });
  return () => {
    for (const medio of medios) medio.removeEventListener("change", avisar);
    observador.disconnect();
  };
}

const nadie = () => () => {};
const siempreFalso = () => false;

const instantanea = () =>
  sinMatchMedia()
    ? false
    : railEfectivo({
    preferencia: preferenciaDelDocumento(),
    desdeMd: window.matchMedia(MEDIA_RAIL_MD).matches,
    desdeXl: window.matchMedia(MEDIA_RAIL_XL).matches,
  });

/** De dónde sale el estado: la pantalla con `rail="auto"`; con `"nunca"` de ningún sitio (no toca `matchMedia`). Exportada para probarla sin DOM. */
export function fuenteDePantalla(modo: ModoRail) {
  return modo === "auto" ? { suscribir, instantanea } : { suscribir: nadie, instantanea: siempreFalso };
}

/**
 * Lo pone `Shell`. El aspecto (64 px, iconos sin texto) lo resuelve CSS (`rail:` en `styles/theme.css`), sin esperar a React, así que no
 * hay parpadeo; este proveedor solo informa a los componentes que cambian de **comportamiento** en el rail (tooltips, grupos
 * colapsables, ancho de los menús). En el servidor y en la hidratación vale `rail: false`.
 */
export function ProveedorRail({ modo, children }: { modo: ModoRail; children: ReactNode }) {
  // Solo con rail="auto" se mira la pantalla: un Shell por defecto no toca matchMedia (tampoco existe en jsdom).
  const { suscribir: suscribirPantalla, instantanea: leerPantalla } = fuenteDePantalla(modo);
  const plegado = useSyncExternalStore(suscribirPantalla, leerPantalla, siempreFalso);

  // Sin `ScriptDiseno` en el `<head>` nadie copió la preferencia guardada a <html data-rail>: se hace tras montar.
  useEffect(() => {
    if (modo !== "auto" || preferenciaDelDocumento()) return;
    const guardada = leerPreferenciaRail();
    if (guardada) document.documentElement.dataset.rail = guardada;
  }, [modo]);

  const valor = useMemo<EstadoRail>(() => ({ modo, rail: modo === "auto" && plegado }), [modo, plegado]);
  return <ContextoRail.Provider value={valor}>{children}</ContextoRail.Provider>;
}

/** Textos de `BotonRail`. */
export type TextosRail = { contraer: string; expandir: string };
export const TEXTOS_RAIL_ES: TextosRail = { contraer: "Contraer menú", expandir: "Expandir menú" };

/**
 * Botón de la cabecera del sidebar que alterna entre rail (64 px) y expandido (248 px) y recuerda la elección en `localStorage`.
 * No pinta nada si el `Shell` no es `rail="auto"`. `aria-expanded` dice si el sidebar está expandido y `aria-controls` apunta al `<aside>`.
 */
export function BotonRail({ textos: textosParciales, className }: { textos?: Partial<TextosRail>; className?: string }) {
  const { modo, rail } = useRail();
  const textos = { ...TEXTOS_RAIL_ES, ...textosParciales };
  if (modo !== "auto") return null;

  function alternar() {
    const siguiente = rail ? "expandido" : "rail";
    guardarPreferenciaRail(siguiente, CLAVE_RAIL);
    document.documentElement.dataset.rail = siguiente;
  }

  const etiqueta = rail ? textos.expandir : textos.contraer;
  return (
    <Tooltip texto={etiqueta} lado="right">
      <button
        type="button"
        aria-label={etiqueta}
        aria-expanded={!rail}
        aria-controls={ID_SIDEBAR}
        onClick={alternar}
        className={cn(
          OBJETIVO_TACTIL,
          "flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          FOCO,
          className,
        )}
      >
        {/* Los dos iconos conviven y CSS muestra el que toca: así el primer pintado ya es el correcto, antes de hidratar. */}
        <CaretDoubleLeftIcon aria-hidden weight={PESO_ICONO_FUNCIONAL} className="size-4 rail:hidden" />
        <CaretDoubleRightIcon aria-hidden weight={PESO_ICONO_FUNCIONAL} className="hidden size-4 rail:block" />
      </button>
    </Tooltip>
  );
}
