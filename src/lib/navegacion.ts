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
