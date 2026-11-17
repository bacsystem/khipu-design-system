/**
 * Texto ↔ número de los campos decimales (`EntradaDecimal`, `EntradaMonto`). Sin dependencias, para poder probarlo solo.
 *
 * Reglas del texto que se escribe (pensadas para es-PE, donde se teclea coma o punto):
 * - Solo se conservan dígitos, `.`, `,` y un `-` inicial (este último únicamente si `negativo`). Espacios y letras se descartan.
 * - Un separador suelto, `.` o `,`, es **siempre el decimal**: «12,5» y «12.5» valen 12.5; «1,234» vale 1.234.
 * - Con los dos a la vez, el último es el decimal y el otro agrupa miles: «1.234,56» y «1,234.56» valen 1234.56.
 * - Un mismo separador repetido («1.234.567») solo puede agrupar miles: vale 1234567.
 */

const PERMITIDOS = /[^\d.,]/g;

/** Quita lo que no puede formar parte de un número; deja el separador que el usuario tecleó. */
export function limpiarTextoDecimal(crudo: string, negativo = false): string {
  const signo = negativo && crudo.trimStart().startsWith("-") ? "-" : "";
  return signo + crudo.replace(PERMITIDOS, "");
}

/** Texto limpio → número, o `null` si no hay ningún dígito («», «-», «.»). No redondea ni acota. */
export function parsearDecimal(texto: string): number | null {
  const negativo = texto.trimStart().startsWith("-");
  const cuerpo = texto.replace(PERMITIDOS, "");
  if (!/\d/.test(cuerpo)) return null;
  const punto = cuerpo.lastIndexOf(".");
  const coma = cuerpo.lastIndexOf(",");
  const ultimo = Math.max(punto, coma);
  const sep = ultimo === punto ? "." : ",";
  const repetido = cuerpo.split(sep).length > 2;
  const mezcla = punto >= 0 && coma >= 0;
  let entero: string;
  let fraccion: string;
  if (ultimo < 0 || (repetido && !mezcla)) {
    entero = cuerpo.replace(/[.,]/g, "");
    fraccion = "";
  } else {
    entero = cuerpo.slice(0, ultimo).replace(/[.,]/g, "");
    fraccion = cuerpo.slice(ultimo + 1);
  }
  const n = Number(`${entero || "0"}.${fraccion || "0"}`);
  return Number.isFinite(n) ? (negativo ? -n : n) : null;
}

/** Redondea a `decimales` (0 = entero: se trunca, como las unidades) y acota a `max` (en cada cambio). */
export function ajustarDecimal(n: number, decimales: number, max?: number): number {
  const f = 10 ** decimales;
  const r = decimales === 0 ? Math.trunc(n) : Math.round((n + Number.EPSILON * Math.sign(n)) * f) / f;
  return max !== undefined ? Math.min(max, r) : r;
}

/** Número → texto normalizado de un campo (punto decimal, sin ceros de relleno): 12.5, 3, «» si no hay valor. */
export function textoDeDecimal(valor: number | null): string {
  return valor == null || !Number.isFinite(valor) ? "" : String(valor);
}
