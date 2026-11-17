import type { MouseEvent } from "react";

/**
 * Clic izquierdo sin modificadores: el enlace navega en cliente (router). Con ⌘/Ctrl/Shift/botón central
 * se deja al navegador abrir el href en otra pestaña o ventana, como con cualquier <a>.
 */
export function esClickSimple(e: MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/** Qué grupos del sidebar están abiertos, por id de grupo. */
export type GruposAbiertos = Record<string, boolean>;

/** `elegidos`: lo que decidió el usuario (es lo único que se guarda); `porRuta`: lo que abrió la ruta activa (no se guarda). */
export type EstadoGrupos = { elegidos: GruposAbiertos; porRuta: GruposAbiertos };

export type AccionGrupos =
  | { tipo: "recordado"; guardado: GruposAbiertos }
  | { tipo: "ruta"; id: string }
  | { tipo: "alternar"; id: string; abierto: boolean };

export const ESTADO_GRUPOS_INICIAL: EstadoGrupos = { elegidos: {}, porRuta: {} };

export function reducirGrupos(estado: EstadoGrupos, accion: AccionGrupos): EstadoGrupos {
  switch (accion.tipo) {
    case "recordado":
      return { ...estado, elegidos: { ...accion.guardado, ...estado.elegidos } };
    case "ruta":
      return { ...estado, porRuta: { ...estado.porRuta, [accion.id]: true } };
    case "alternar": {
      // Una decisión del usuario manda sobre lo que abrió la ruta.
      const porRuta = { ...estado.porRuta };
      delete porRuta[accion.id];
      return { elegidos: { ...estado.elegidos, [accion.id]: !accion.abierto }, porRuta };
    }
  }
}

/** Si un grupo está abierto: lo abierto por la ruta gana al estado recordado; si nadie lo fijó, `porOmision`. */
export const grupoAbierto = (estado: EstadoGrupos, id: string, porOmision: boolean): boolean => estado.porRuta[id] ?? estado.elegidos[id] ?? porOmision;

/**
 * Lee de `localStorage` el estado recordado de los grupos del sidebar. Nunca lanza: sin almacenamiento (SSR, modo privado,
 * acceso bloqueado), con JSON roto o con valores que no son booleanos devuelve lo que sea válido (o `{}`).
 */
export function leerGruposAbiertos(clave: string): GruposAbiertos {
  try {
    const crudo = localStorage.getItem(clave);
    const dato: unknown = crudo ? JSON.parse(crudo) : null;
    if (typeof dato !== "object" || dato === null || Array.isArray(dato)) return {};
    return Object.fromEntries(Object.entries(dato).filter((par): par is [string, boolean] => typeof par[1] === "boolean"));
  } catch {
    return {};
  }
}

/** Guarda el estado de los grupos del sidebar; si el almacenamiento no está disponible, no hace nada. */
export function guardarGruposAbiertos(clave: string, estado: GruposAbiertos): void {
  try {
    localStorage.setItem(clave, JSON.stringify(estado));
  } catch {
    // Sin almacenamiento el estado vale solo para esta visita.
  }
}

/**
 * Si un ítem de navegación (sidebar o barra inferior) es el de la ruta actual: por prefijo, o por igualdad exacta con `exacto`.
 * Un ítem sin `href` (el «próximamente») nunca está activo.
 */
export function itemActivo(item: { href?: string; exacto?: boolean }, pathname: string): boolean {
  if (!item.href) return false;
  return item.exacto ? pathname === item.href : pathname.startsWith(item.href);
}

// ── Pestañas de ruta (`navegacion/tabs-ruta`) ─────────────────────────────────────────────────────────────────────
// Helpers puros y sin `"use client"`: un Server Component puede llamarlos (desde un módulo cliente no se puede llamar una función exportada).

const rutaDe = (href: string) => {
  const ruta = (href.split(/[?#]/)[0] ?? "").trim();
  return ruta.length > 1 ? ruta.replace(/\/+$/, "") : ruta;
};

/**
 * Qué pestaña de ruta corresponde a `pathname`, o -1. Sin `exacto` coincide por **segmento** (`/compras` activa `/compras/ordenes`, no `/comprasx`) y,
 * si coinciden varias (`/compras` y `/compras/ordenes`), gana la de href más largo: nunca hay dos activas. Ignora query y hash del `href` y la barra final.
 * Un `href` que no empieza por `/` (vacío, `?vista=1`, `https://…`) no puede ser la ruta actual y nunca coincide.
 */
export function indiceActivoRuta(items: { href: string; exacto?: boolean }[], pathname: string): number {
  const actual = rutaDe(pathname);
  let mejor = -1;
  let largo = -1;
  items.forEach((item, i) => {
    const base = rutaDe(item.href);
    if (!base.startsWith("/")) return;
    const coincide = actual === base || (!item.exacto && base !== "/" && actual.startsWith(`${base}/`));
    if (coincide && base.length > largo) {
      mejor = i;
      largo = base.length;
    }
  });
  return mejor;
}

/**
 * `scrollLeft` que deja `enlace` centrado en un contenedor desplazable, calculado con rectángulos de pantalla (`getBoundingClientRect`) y el
 * `scrollLeft` actual: no depende del `offsetParent`, que casi nunca es el contenedor. Nunca negativo (el navegador además lo limita al máximo).
 */
export function desplazamientoCentrado(contenedor: { izquierda: number; ancho: number; scrollLeft: number }, enlace: { izquierda: number; ancho: number }): number {
  const posicionEnContenido = contenedor.scrollLeft + (enlace.izquierda - contenedor.izquierda);
  return Math.max(0, posicionEnContenido - (contenedor.ancho - enlace.ancho) / 2);
}

// ── Notificaciones (`nav/centro-notificaciones`) ──────────────────────────────────────────────────────────────────

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
  /** Filtro «todas» (solo con `categorias`) y nombre accesible del grupo de filtros. */
  todas: string;
  filtrarPor: string;
};

export const TEXTOS_NOTIFICACIONES_ES: TextosNotificaciones = {
  titulo: "Notificaciones",
  etiquetaBoton: (n) => (n > 0 ? `Notificaciones, ${n} sin leer` : "Notificaciones"),
  sinLeer: (n) => (n > 0 ? `${n} sin leer` : "Todo al día"),
  marcarTodas: "Marcar todas como leídas",
  vacioTitulo: "No hay notificaciones",
  vacioDescripcion: "Cuando haya novedades, aparecerán aquí.",
  marcaSinLeer: "Sin leer",
  todas: "Todas",
  filtrarPor: "Filtrar por categoría",
};

export const etiquetaBotonNotificaciones = (sinLeer: number, textos: TextosNotificaciones = TEXTOS_NOTIFICACIONES_ES) => textos.etiquetaBoton(sinLeer);

/**
 * El `href` solo si es una ruta de la app (`/x`, no `//host`) o `http(s)://host…`; cualquier otra cosa da `undefined`. Rechaza `javascript:`, `data:`,
 * `//host`, `/\host` y todo carácter de control (`[\u0000-\u001F\u007F]`) en cualquier posición: el navegador borra tab, salto de línea y retorno al
 * resolver una URL, así que `/\t/evil.com` llegaría a `https://evil.com` aunque parezca una ruta.
 */
export function hrefNotificacionSeguro(href: string | undefined): string | undefined {
  if (href == null || /[\u0000-\u001F\u007F]/.test(href)) return undefined;
  const limpio = href.trim();
  if (limpio.startsWith("/")) return limpio.startsWith("//") || limpio.startsWith("/\\") ? undefined : limpio;
  return /^https?:\/\/[^\s/?#\\]+/i.test(limpio) ? limpio : undefined;
}
