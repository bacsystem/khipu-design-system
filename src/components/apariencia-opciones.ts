/**
 * Preferencias de apariencia que elige cada usuario: la paleta (los tres acentos) y el tono del modo oscuro.
 * Cada opción es un bloque de tokens en `src/styles/tokens.css`: `html[data-paleta="…"]` y `.dark[data-oscuro="…"]`.
 * La paleta y el tono por defecto no tienen bloque: son los tokens de `:root` y `.dark`. Claro/oscuro/sistema sigue
 * siendo de next-themes. Este archivo no importa nada: lo usan `ScriptDiseno` (servidor), `AparienciaProvider` (cliente) y los tests.
 */

export type Paleta = { valor: string; etiqueta: string; muestra: [string, string, string] };
export type TonoOscuro = { valor: string; etiqueta: string; muestra: string };
export type PreferenciasApariencia = { paleta: string; tonoOscuro: string };

/** Claves de localStorage. */
export const CLAVE_PALETA = "khipu-paleta";
export const CLAVE_TONO_OSCURO = "khipu-oscuro";

export const PALETA_POR_DEFECTO = "lima";
export const TONO_OSCURO_POR_DEFECTO = "medianoche";

/** `muestra`: acento, acento 2 y acento 3, en ese orden (los mismos hex que su bloque en tokens.css). */
export const PALETAS: Paleta[] = [
  { valor: "lima", etiqueta: "Lima", muestra: ["#d4f06b", "#cfe2fb", "#f8ec84"] },
  { valor: "indigo", etiqueta: "Índigo", muestra: ["#c9c8ff", "#cdeee9", "#ffdcc2"] },
  { valor: "oceano", etiqueta: "Océano", muestra: ["#9fe3dc", "#d3e4fd", "#ffe7a0"] },
  { valor: "coral", etiqueta: "Coral", muestra: ["#ffc6b3", "#e3dafb", "#fbe39b"] },
  { valor: "violeta", etiqueta: "Violeta", muestra: ["#dacbff", "#c6efdf", "#ffd3e6"] },
];

/** `muestra`: el color de tarjeta del tono (Tintado varía con la paleta; la muestra es la de Lima). */
export const TONOS_OSCURO: TonoOscuro[] = [
  { valor: "medianoche", etiqueta: "Medianoche", muestra: "#111a2c" },
  { valor: "grafito", etiqueta: "Grafito", muestra: "#1a1b1f" },
  { valor: "tintado", etiqueta: "Tintado", muestra: "#202420" },
];

/** El valor pedido si está entre las opciones; si no, el por defecto. */
export function valorValido(valor: string | null | undefined, opciones: ReadonlyArray<{ valor: string }>, porDefecto: string): string {
  return valor != null && opciones.some((o) => o.valor === valor) ? valor : porDefecto;
}

/**
 * Código en línea para el `<head>`: pone `data-paleta` y `data-oscuro` en `<html>` antes del primer pintado.
 * `inicial` (p. ej. leído del perfil del usuario en el servidor) gana sobre localStorage; un valor desconocido cae al por defecto.
 */
export function codigoScriptApariencia({
  paletas = PALETAS,
  tonosOscuro = TONOS_OSCURO,
  inicial,
}: { paletas?: Paleta[]; tonosOscuro?: TonoOscuro[]; inicial?: Partial<PreferenciasApariencia> } = {}): string {
  const lista = (opciones: ReadonlyArray<{ valor: string }>) => JSON.stringify(opciones.map((o) => o.valor));
  const paletaPorDefecto = valorValido(PALETA_POR_DEFECTO, paletas, paletas[0]?.valor ?? PALETA_POR_DEFECTO);
  const tonoPorDefecto = valorValido(TONO_OSCURO_POR_DEFECTO, tonosOscuro, tonosOscuro[0]?.valor ?? TONO_OSCURO_POR_DEFECTO);
  return (
    `(function(){var d=document.documentElement.dataset;` +
    `function v(c,l,p,i){var x=i;if(!x){try{x=localStorage.getItem(c)}catch(e){}}return l.indexOf(x)>-1?x:p}` +
    `d.paleta=v(${JSON.stringify(CLAVE_PALETA)},${lista(paletas)},${JSON.stringify(paletaPorDefecto)},${JSON.stringify(inicial?.paleta ?? null)});` +
    `d.oscuro=v(${JSON.stringify(CLAVE_TONO_OSCURO)},${lista(tonosOscuro)},${JSON.stringify(tonoPorDefecto)},${JSON.stringify(inicial?.tonoOscuro ?? null)})})()`
  );
}
