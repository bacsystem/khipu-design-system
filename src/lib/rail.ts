/**
 * Rail del sidebar (`Shell rail="auto"`): el sidebar de 248 px se pliega a 64 px (solo iconos) entre 768 y 1279 px.
 * Aquí vive la lógica pura (clave, lectura/escritura tolerante y regla de qué ancho toca); el estado en pantalla lo gestiona
 * `nav/rail`. La preferencia del usuario se guarda en `localStorage` y `ScriptDiseno` la aplica a `<html data-rail>` antes del primer pintado.
 */

/** `auto`: el sidebar se pliega a 64 px entre 768 y 1279 px (`Shell rail="auto"`). `nunca`: siempre 248 px, como siempre. */
export type ModoRail = "auto" | "nunca";

/** Id del `<aside>` del sidebar: es lo que controla `BotonRail` (`aria-controls`). */
export const ID_SIDEBAR = "khipu-sidebar";

/** Lo que eligió el usuario: `rail` (64 px) o `expandido` (248 px), en cualquier ancho de md en adelante. Sin elección, manda el ancho de la pantalla. */
export type PreferenciaRail = "rail" | "expandido";

/** Clave de `localStorage` donde se recuerda la preferencia. */
export const CLAVE_RAIL = "khipu-sidebar-rail";

/** Desde `md` (768 px) existe el sidebar; por debajo lo sustituye la barra inferior. */
export const MEDIA_RAIL_MD = "(min-width: 48rem)";
/** Desde `xl` (1280 px) el sidebar va expandido salvo que el usuario elija el rail. */
export const MEDIA_RAIL_XL = "(min-width: 80rem)";

export const esPreferenciaRail = (valor: unknown): valor is PreferenciaRail => valor === "rail" || valor === "expandido";

/** Lee la preferencia guardada. Nunca lanza: sin almacenamiento (SSR, modo privado, acceso bloqueado) o con un valor desconocido devuelve `null`. */
export function leerPreferenciaRail(clave: string = CLAVE_RAIL): PreferenciaRail | null {
  try {
    const valor = localStorage.getItem(clave);
    return esPreferenciaRail(valor) ? valor : null;
  } catch {
    return null;
  }
}

/** Guarda la preferencia; si el almacenamiento no está disponible, no hace nada (vale para esta visita). */
export function guardarPreferenciaRail(preferencia: PreferenciaRail, clave: string = CLAVE_RAIL): void {
  try {
    localStorage.setItem(clave, preferencia);
  } catch {
    // Sin almacenamiento la preferencia vale solo para esta visita.
  }
}

/**
 * Si el sidebar se ve como rail. Debe dar lo mismo que la variante CSS `rail:` de `styles/theme.css`:
 * por debajo de md no hay sidebar (false); con preferencia manda ella; sin preferencia, rail entre md y xl.
 */
export function railEfectivo({ preferencia, desdeMd, desdeXl }: { preferencia: PreferenciaRail | null; desdeMd: boolean; desdeXl: boolean }): boolean {
  if (!desdeMd) return false;
  if (preferencia) return preferencia === "rail";
  return !desdeXl;
}

/** Código en línea (para el `<head>`) que copia la preferencia guardada a `<html data-rail>` antes del primer pintado. */
export function codigoScriptRail(clave: string = CLAVE_RAIL): string {
  const k = JSON.stringify(clave).replace(/</g, "\\u003c");
  return `try{var r=localStorage.getItem(${k});if(r==="rail"||r==="expandido")document.documentElement.dataset.rail=r}catch(e){}`;
}
