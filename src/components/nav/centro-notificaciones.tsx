"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { BellIcon, BellSimpleSlashIcon, CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { EstadoVacio } from "@/components/feedback/estado-vacio";
import type { Tono } from "@/components/patrones/metricas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONTROL_FILTRO, FOCO } from "@/lib/estilos";
import { formatearFechaHora, type LocaleFecha } from "@/lib/formato";
import { PESO_ICONO, PESO_ICONO_FUNCIONAL, type IconoComponente } from "@/lib/iconos";
import { esClickSimple } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

/** Una notificación. Los datos y su estado de lectura son de la app: el kit no guarda nada. */
export type Notificacion = {
  id: string;
  titulo: string;
  descripcion?: string;
  /** Instante ISO (UTC); se muestra en hora de Lima con `formatearFechaHora`. */
  fecha: string;
  /** Color y icono por defecto (`neutro` si no se pasa). El estado nunca depende solo del color: el icono cambia con el tono. */
  tono?: Tono;
  /** Icono propio en lugar del del tono. */
  icono?: IconoComponente;
  /** Destino al abrirla: una ruta de la app (`/…`) o `http(s)://…`; cualquier otro esquema se ignora. */
  href?: string;
  leida: boolean;
};

/** Textos de `CentroNotificaciones`: pasa los que quieras traducir (`Partial`), el resto queda en castellano. */
export type TextosNotificaciones = {
  titulo: string;
  /** `aria-label` del botón de la campana. */
  etiquetaBoton: (sinLeer: number) => string;
  /** Subtítulo del panel («3 sin leer»). */
  sinLeer: (sinLeer: number) => string;
  marcarTodas: string;
  vacioTitulo: string;
  vacioDescripcion: string;
  /** Texto solo para lectores de pantalla en cada notificación no leída. */
  marcaSinLeer: string;
};

export const TEXTOS_NOTIFICACIONES_ES: TextosNotificaciones = {
  titulo: "Notificaciones",
  etiquetaBoton: (n) => (n > 0 ? `Notificaciones, ${n} sin leer` : "Notificaciones"),
  sinLeer: (n) => (n > 0 ? `${n} sin leer` : "Todo al día"),
  marcarTodas: "Marcar todas como leídas",
  vacioTitulo: "No hay notificaciones",
  vacioDescripcion: "Cuando haya novedades, aparecerán aquí.",
  marcaSinLeer: "Sin leer",
};

export const etiquetaBotonNotificaciones = (sinLeer: number, textos: TextosNotificaciones = TEXTOS_NOTIFICACIONES_ES) => textos.etiquetaBoton(sinLeer);

/** El `href` solo si es una ruta de la app (`/x`, no `//host`) o http(s): `javascript:`, `data:` y demás ejecutan código o salen de la app. */
export function hrefNotificacionSeguro(href: string | undefined): string | undefined {
  const limpio = href?.trim();
  if (!limpio) return undefined;
  if (limpio.startsWith("/") && !limpio.startsWith("//") && !limpio.startsWith("/\\")) return limpio;
  return /^https?:\/\//i.test(limpio) ? limpio : undefined;
}

const TONOS: Record<Tono, { caja: string; icono: IconoComponente }> = {
  ok: { caja: "bg-success text-success-foreground", icono: CheckCircleIcon },
  aviso: { caja: "bg-warning text-warning-foreground", icono: WarningIcon },
  error: { caja: "bg-destructive-suave text-destructive-texto", icono: WarningCircleIcon },
  neutro: { caja: "bg-secondary text-muted-foreground", icono: InfoIcon },
};

/** Desde cuántas notificaciones la lista se acota y se desplaza con `ScrollArea` (con menos, el panel mide lo que mide su contenido). */
const MAX_SIN_SCROLL = 4;
// Foco hacia dentro: el panel recorta (`overflow-hidden`), un anillo con separación se cortaría.
const FILA = "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-(--duracion-rapida) ease-salida outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset";

function Contenido({ n, textos, locale }: { n: Notificacion; textos: TextosNotificaciones; locale: LocaleFecha }) {
  const tono = TONOS[n.tono ?? "neutro"];
  const Icono = n.icono ?? tono.icono;
  return (
    <>
      <span aria-hidden className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", tono.caja)}>
        <Icono weight={PESO_ICONO} className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span className={cn("min-w-0 flex-1 text-control text-foreground", n.leida ? "font-medium" : "font-semibold")}>{n.titulo}</span>
          {n.leida ? null : (
            <>
              <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              <span className="sr-only">{textos.marcaSinLeer}</span>
            </>
          )}
        </span>
        {n.descripcion ? <span className="mt-0.5 line-clamp-2 block text-etiqueta text-muted-foreground">{n.descripcion}</span> : null}
        <time dateTime={n.fecha} className="mt-1 block text-etiqueta text-texto-terciario tabular-nums">
          {formatearFechaHora(n.fecha, locale)}
        </time>
      </span>
    </>
  );
}

/**
 * El contenido del panel (cabecera, lista o estado vacío, pie). Es público para poder componerlo en otro contenedor (p. ej. una página «Notificaciones»)
 * y para probarlo sin abrir el popover. No guarda estado.
 */
export function PanelNotificaciones({
  notificaciones,
  onLeer,
  onLeerTodas,
  verTodas,
  textos,
  locale = "es",
  alCerrar,
}: {
  notificaciones: Notificacion[];
  onLeer?: (id: string) => void;
  onLeerTodas?: () => void;
  verTodas?: { href: string; etiqueta: string };
  textos: TextosNotificaciones;
  locale?: LocaleFecha;
  /** Se llama tras abrir una notificación (clic simple), para que el contenedor cierre el panel. */
  alCerrar?: () => void;
}) {
  const sinLeer = notificaciones.filter((n) => !n.leida).length;
  const hrefVerTodas = hrefNotificacionSeguro(verTodas?.href);

  const filas = notificaciones.map((n) => {
    const href = hrefNotificacionSeguro(n.href);
    const contenido = <Contenido n={n} textos={textos} locale={locale} />;
    const fondo = n.leida ? "hover:bg-secondary" : "bg-secondary/50 hover:bg-secondary";
    let fila: ReactNode;
    if (href) {
      fila = (
        <Link
          href={href}
          className={cn(FILA, fondo)}
          onClick={(e) => {
            if (!n.leida) onLeer?.(n.id);
            if (esClickSimple(e)) alCerrar?.();
          }}
        >
          {contenido}
        </Link>
      );
    } else if (!n.leida) {
      fila = (
        <button type="button" className={cn(FILA, fondo, "cursor-pointer")} onClick={() => onLeer?.(n.id)}>
          {contenido}
        </button>
      );
    } else {
      fila = <div className={FILA}>{contenido}</div>;
    }
    return (
      <li key={n.id} className="border-b border-border/70 last:border-b-0">
        {fila}
      </li>
    );
  });
  const lista = <ul>{filas}</ul>;

  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div className="min-w-0">
          <PopoverPrimitive.Title className="text-cuerpo font-semibold text-foreground">{textos.titulo}</PopoverPrimitive.Title>
          <PopoverPrimitive.Description className="mt-0.5 text-etiqueta text-muted-foreground" aria-live="polite">
            {textos.sinLeer(sinLeer)}
          </PopoverPrimitive.Description>
        </div>
        {onLeerTodas && sinLeer > 0 ? (
          <button type="button" onClick={onLeerTodas} className={cn("shrink-0 rounded-md px-1.5 py-1 text-etiqueta font-medium text-foreground underline-offset-2 hover:bg-secondary hover:underline", FOCO)}>
            {textos.marcarTodas}
          </button>
        ) : null}
      </div>
      {notificaciones.length === 0 ? (
        <EstadoVacio icon={BellSimpleSlashIcon} titulo={textos.vacioTitulo} className="rounded-none border-0 bg-transparent px-6 py-8">
          {textos.vacioDescripcion}
        </EstadoVacio>
      ) : notificaciones.length > MAX_SIN_SCROLL ? (
        <ScrollArea alto="min(24rem, 60svh)">{lista}</ScrollArea>
      ) : (
        lista
      )}
      {verTodas && hrefVerTodas ? (
        <div className="border-t border-border/70 px-4 py-2.5">
          <Link href={hrefVerTodas} onClick={(e) => esClickSimple(e) && alCerrar?.()} className={cn("rounded-md text-control font-medium text-foreground underline-offset-2 hover:underline", FOCO)}>
            {verTodas.etiqueta}
          </Link>
        </div>
      ) : null}
    </>
  );
}

/**
 * Campana de la barra superior con un panel de notificaciones (`Popover`). **Todo son datos de la app**: `notificaciones` (con su `leida`), y los
 * callbacks `onLeer(id)` (al abrir una sin leer) y `onLeerTodas()` para que la app actualice su estado o llame a su API; el kit no recuerda nada.
 *
 * - **Disparador:** botón de `size-control` con `aria-label` «Notificaciones, 3 sin leer» (traducible en `textos.etiquetaBoton`) y un punto si hay sin leer.
 * - **Panel:** diálogo nombrado por su título, 360 px (ancho completo bajo `md`). Cada notificación es un enlace (con `href`), un botón (sin `href` y sin leer)
 *   o texto; las sin leer llevan punto y «Sin leer» para el lector de pantalla. Vacío → `EstadoVacio`. Con más de 4 la lista se acota y se desplaza.
 *   Teclado: Enter/Espacio abre, Tab recorre filas y acciones, Esc cierra y devuelve el foco a la campana; abrir una notificación (clic simple) cierra el panel.
 * - `verTodas`: enlace de pie (p. ej. «Ver historial»). `locale` fija el idioma de las fechas.
 * - El `href` de cada notificación solo se acepta si es una ruta de la app o `http(s)`.
 *
 * Usa `next/link` (no `usePathname`), así que no necesita `<Suspense>`.
 */
export function CentroNotificaciones({
  notificaciones,
  onLeer,
  onLeerTodas,
  verTodas,
  textos: textosParciales,
  locale,
  className,
}: {
  notificaciones: Notificacion[];
  onLeer?: (id: string) => void;
  onLeerTodas?: () => void;
  verTodas?: { href: string; etiqueta: string };
  textos?: Partial<TextosNotificaciones>;
  locale?: LocaleFecha;
  className?: string;
}) {
  const textos = { ...TEXTOS_NOTIFICACIONES_ES, ...textosParciales };
  const [abierto, setAbierto] = useState(false);
  const sinLeer = notificaciones.filter((n) => !n.leida).length;

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger
        aria-label={etiquetaBotonNotificaciones(sinLeer, textos)}
        className={cn(CONTROL_FILTRO, "relative inline-flex size-control cursor-pointer items-center justify-center text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida hover:bg-secondary hover:text-foreground data-popup-open:bg-secondary data-popup-open:text-foreground", FOCO, className)}
      >
        <BellIcon weight={PESO_ICONO_FUNCIONAL} aria-hidden className="size-4" />
        {sinLeer > 0 ? <span aria-hidden data-sin-leer="" className="absolute top-1 right-1 size-2 rounded-full bg-destructive ring-2 ring-card" /> : null}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[calc(100vw-1rem)] overflow-hidden p-0 md:w-90">
        <PanelNotificaciones
          notificaciones={notificaciones}
          onLeer={onLeer}
          onLeerTodas={onLeerTodas}
          verTodas={verTodas}
          textos={textos}
          locale={locale}
          alCerrar={() => setAbierto(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
