"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { BellIcon, BellSimpleSlashIcon, CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, type MouseEvent, type ReactNode } from "react";
import { EstadoVacio } from "@/components/feedback/estado-vacio";
import type { Tono } from "@/components/patrones/metricas";
import { GrupoBotones } from "@/components/ui/grupo-botones";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ACCION_SECUNDARIA, CONTROL_FILTRO, FOCO } from "@/lib/estilos";
import { formatearFechaHora, type LocaleFecha } from "@/lib/formato";
import { PESO_ICONO, PESO_ICONO_FUNCIONAL, type IconoComponente } from "@/lib/iconos";
import { esClickSimple, etiquetaBotonNotificaciones, hrefNotificacionSeguro, TEXTOS_NOTIFICACIONES_ES, type TextosNotificaciones } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

// Los helpers puros (`hrefNotificacionSeguro`, `TEXTOS_NOTIFICACIONES_ES`, `etiquetaBotonNotificaciones`) viven en `lib/navegacion`, sin `"use client"`,
// para que un Server Component pueda usarlos. Solo se reexportan los tipos.
export type { TextosNotificaciones };

/** Acción de una notificación (un botón bajo ella): con `href` es un enlace, sin él un botón que llama a `onClick`. Sin ninguno de los dos se ignora. */
export type AccionNotificacion = { etiqueta: string; href?: string; onClick?: () => void };

/** Categoría para filtrar el panel (solo se muestra el filtro si se pasa `categorias`). */
export type CategoriaNotificacion = { id: string; etiqueta: string };

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
  /** `id` de una de las `categorias` del centro, para el filtro. */
  categoria?: string;
  /** Acciones bajo la notificación («Ver comprobante», «Reintentar»…). Son controles aparte: no van dentro del enlace de la fila. */
  acciones?: AccionNotificacion[];
  leida: boolean;
};

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

function CuerpoFila({ n, textos, locale }: { n: Notificacion; textos: TextosNotificaciones; locale: LocaleFecha }) {
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

const TODAS = "__todas";

/** Devuelve el foco, tras confirmarse el cambio de estado, a un elemento que sigue montado (el que tenía el foco puede desaparecer al marcar como leída). */
const enfocar = (el: Element | null | undefined) => {
  if (el instanceof HTMLElement) setTimeout(() => el.focus(), 0);
};

/**
 * El contenido del panel **sin estado**: cabecera, filtro de categorías, lista o estado vacío y pie. La categoría activa llega por `categoria`/`onCategoria`.
 * Usa `PopoverPrimitive.Title`/`Description`, así que **solo funciona dentro de un `Popover`** (lo nombran como diálogo); si no lo necesitas, usa
 * `CentroNotificaciones`. Para probarlo, envuélvelo en un `Popover`.
 */
export function ContenidoNotificaciones({
  notificaciones,
  categorias,
  categoria = null,
  onCategoria,
  onLeer,
  onLeerTodas,
  verTodas,
  textos,
  locale = "es",
  alCerrar,
}: {
  notificaciones: Notificacion[];
  categorias?: CategoriaNotificacion[];
  /** `id` de la categoría activa, o `null` para todas. */
  categoria?: string | null;
  onCategoria?: (id: string | null) => void;
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
  const visibles = categoria == null ? notificaciones : notificaciones.filter((n) => n.categoria === categoria);
  const cuenta = (id: string | null) => (id == null ? notificaciones.length : notificaciones.filter((n) => n.categoria === id).length);

  const filas = visibles.map((n) => {
    const href = hrefNotificacionSeguro(n.href);
    const contenido = <CuerpoFila n={n} textos={textos} locale={locale} />;
    const hover = "hover:bg-secondary";
    let principal: ReactNode;
    if (href) {
      principal = (
        <Link
          href={href}
          className={cn(FILA, hover)}
          onClick={(e) => {
            if (!n.leida) onLeer?.(n.id);
            if (esClickSimple(e)) alCerrar?.();
          }}
        >
          {contenido}
        </Link>
      );
    } else if (!n.leida) {
      principal = (
        <button
          type="button"
          className={cn(FILA, hover, "cursor-pointer")}
          onClick={(e: MouseEvent<HTMLButtonElement>) => {
            // Al leerse deja de ser un botón y se desmonta: el foco pasa a la fila (el `<li>`, que sigue montado) para no perder el sitio en la lista.
            const fila = e.currentTarget.closest("li");
            onLeer?.(n.id);
            enfocar(fila);
          }}
        >
          {contenido}
        </button>
      );
    } else {
      principal = <div className={FILA}>{contenido}</div>;
    }
    const acciones = (n.acciones ?? []).flatMap((a, i) => {
      const destino = hrefNotificacionSeguro(a.href);
      if (!destino && !a.onClick) return [];
      return [
        destino ? (
          <Link
            key={i}
            href={destino}
            className={ACCION_SECUNDARIA}
            onClick={(e) => {
              a.onClick?.();
              if (!n.leida) onLeer?.(n.id);
              if (esClickSimple(e)) alCerrar?.();
            }}
          >
            {a.etiqueta}
          </Link>
        ) : (
          <button
            key={i}
            type="button"
            className={ACCION_SECUNDARIA}
            onClick={() => {
              a.onClick?.();
              if (!n.leida) onLeer?.(n.id);
            }}
          >
            {a.etiqueta}
          </button>
        ),
      ];
    });
    return (
      <li key={n.id} tabIndex={-1} className={cn("border-b border-border/70 outline-none last:border-b-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50", !n.leida && "bg-secondary/50")}>
        {principal}
        {acciones.length > 0 ? <div className="flex flex-wrap gap-2 pr-4 pb-3 pl-15">{acciones}</div> : null}
      </li>
    );
  });
  const lista = <ul>{filas}</ul>;

  return (
    <div data-panel-notificaciones="">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
        <div className="min-w-0">
          <PopoverPrimitive.Title data-panel-titulo="" tabIndex={-1} className="text-cuerpo font-semibold text-foreground outline-none">
            {textos.titulo}
          </PopoverPrimitive.Title>
          <PopoverPrimitive.Description className="mt-0.5 text-etiqueta text-muted-foreground" aria-live="polite">
            {textos.sinLeer(sinLeer)}
          </PopoverPrimitive.Description>
        </div>
        {onLeerTodas && sinLeer > 0 ? (
          <button
            type="button"
            onClick={(e) => {
              // El botón se oculta cuando no queda nada por leer: el foco pasa al título del panel.
              const titulo = e.currentTarget.closest("[data-panel-notificaciones]")?.querySelector("[data-panel-titulo]");
              onLeerTodas();
              enfocar(titulo);
            }}
            className={cn("shrink-0 rounded-md px-1.5 py-1 text-etiqueta font-medium text-foreground underline-offset-2 hover:bg-secondary hover:underline", FOCO)}
          >
            {textos.marcarTodas}
          </button>
        ) : null}
      </div>
      {categorias && categorias.length > 0 ? (
        <div className="overflow-x-auto border-b border-border/70 px-4 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <GrupoBotones
            tamano="sm"
            etiqueta={textos.filtrarPor}
            valor={categoria ?? TODAS}
            onCambio={(v) => onCategoria?.(v === TODAS ? null : v)}
            opciones={[
              { valor: TODAS, etiqueta: <Cuenta etiqueta={textos.todas} n={cuenta(null)} /> },
              ...categorias.map((c) => ({ valor: c.id, etiqueta: <Cuenta etiqueta={c.etiqueta} n={cuenta(c.id)} /> })),
            ]}
          />
        </div>
      ) : null}
      {visibles.length === 0 ? (
        <EstadoVacio icon={BellSimpleSlashIcon} titulo={textos.vacioTitulo} className="rounded-none border-0 bg-transparent px-6 py-8">
          {textos.vacioDescripcion}
        </EstadoVacio>
      ) : visibles.length > MAX_SIN_SCROLL ? (
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
    </div>
  );
}

function Cuenta({ etiqueta, n }: { etiqueta: string; n: number }) {
  return (
    <>
      {etiqueta} <span className="tabular-nums text-muted-foreground">{n}</span>
    </>
  );
}

/** `ContenidoNotificaciones` con el filtro de categoría como estado propio. Va dentro de un `Popover`. */
export function PanelNotificaciones(props: Omit<Parameters<typeof ContenidoNotificaciones>[0], "categoria" | "onCategoria">) {
  const [categoria, setCategoria] = useState<string | null>(null);
  return <ContenidoNotificaciones {...props} categoria={categoria} onCategoria={setCategoria} />;
}

/**
 * Campana de la barra superior con un panel de notificaciones (`Popover`). **Todo son datos de la app**: `notificaciones` (con su `leida`), y los
 * callbacks `onLeer(id)` (al abrir una sin leer o usar una de sus acciones) y `onLeerTodas()` para que la app actualice su estado o llame a su API; el kit no recuerda nada.
 *
 * - **Disparador:** botón de `size-control` con `aria-label` «Notificaciones, 3 sin leer» (traducible en `textos.etiquetaBoton`) y un punto si hay sin leer.
 * - **Panel:** diálogo nombrado por su título, 360 px (ancho completo bajo `md`). Cada notificación es un enlace (con `href`), un botón (sin `href` y sin leer)
 *   o texto; las sin leer llevan punto y «Sin leer» para el lector de pantalla. Vacío → `EstadoVacio`. Con más de 4 la lista se acota y se desplaza.
 * - `Notificacion.acciones`: botones o enlaces bajo la notificación («Ver comprobante», «Descargar CDR»); sin `href` llaman a `onClick`.
 * - `categorias` (+ `Notificacion.categoria`): muestra bajo la cabecera un filtro con contadores («Todas 5 · SUNAT 2 · Stock 1»). Sin `categorias` no hay filtro.
 * - **Teclado:** Enter/Espacio abre, Tab recorre filas y acciones, Esc cierra y devuelve el foco a la campana; abrir una notificación (clic simple) cierra el panel.
 *   Al marcar una como leída el foco queda en su fila, y tras «Marcar todas» en el título del panel.
 * - `verTodas`: enlace de pie (p. ej. «Ver historial»). `locale` fija el idioma de las fechas.
 * - El `href` de cada notificación y acción solo se acepta si es una ruta de la app o `http(s)` (`hrefNotificacionSeguro` en `lib/navegacion`).
 *
 * Usa `next/link` (no `usePathname`), así que no necesita `<Suspense>`.
 */
export function CentroNotificaciones({
  notificaciones,
  categorias,
  onLeer,
  onLeerTodas,
  verTodas,
  textos: textosParciales,
  locale,
  className,
}: {
  notificaciones: Notificacion[];
  categorias?: CategoriaNotificacion[];
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
          categorias={categorias}
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
