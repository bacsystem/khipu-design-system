/**
 * Texto ↔ número de los campos decimales (`EntradaDecimal`, `EntradaMonto`). Sin dependencias, para poder probarlo solo.
 *
 * Reglas del texto que se escribe (pensadas para es-PE, donde se teclea coma o punto):
 * - Solo se conservan dígitos, `.`, `,` y un `-` inicial (este último únicamente si `negativo`). Espacios y letras se descartan.
 * - Un separador suelto, `.` o `,`, es el decimal: «12,5» y «12.5» valen 12.5; «0,125» vale 0.125.
 *   **Excepción (miles):** si va seguido de exactamente 3 dígitos, la parte entera tiene 1–3 dígitos y no empieza por 0, y el campo
 *   tiene menos de 3 decimales, es separador de miles: «1,234» vale 1234 y «2,500» vale 2500; solo con la coma: un punto suelto sigue siendo decimal («1.250» vale 1.25). Es lo que se ve en
 *   pantalla (`1,234.50`), y con 2 decimales «1.234» como decimal no cabría: se leería 1.23, mil veces menos. Con `decimales >= 3`
 *   «1,234» vale 1.234.
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
export function parsearDecimal(texto: string, decimales = 2): number | null {
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
  const miles = !mezcla && !repetido && ultimo >= 0 && sep === "," && decimales < 3 && /^[1-9]\d{0,2}$/.test(cuerpo.slice(0, ultimo)) && /^\d{3}$/.test(cuerpo.slice(ultimo + 1));
  if (ultimo < 0 || (repetido && !mezcla) || miles) {
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

/**
 * Lo que un campo hace con el texto recién escrito: lo limpia, calcula el número que comunica y, si supera un `max` no negativo, reescribe
 * el texto con el tope (así lo que se ve es lo que se envía, también con Enter sin salir del campo). El redondeo a
 * `decimales` no reescribe el texto mientras se teclea: se normaliza al salir.
 */
export function interpretarEntrada(crudo: string, { decimales, max, negativo = false }: { decimales: number; max?: number; negativo?: boolean }): { texto: string; valor: number | null } {
  const limpio = limpiarTextoDecimal(crudo, negativo);
  const n = parsearDecimal(limpio, decimales);
  if (n === null) return { texto: limpio, valor: null };
  const valor = ajustarDecimal(n, decimales, max);
  return { texto: max !== undefined && max >= 0 && n > max ? textoDeDecimal(valor) : limpio, valor };
}

/**
 * Con el foco puesto, ¿es `valor` solo la normalización de lo que el campo comunicó (el padre guarda `v ?? 0`, redondea o
 * acota igual)? Entonces el texto no se toca: borrar no deja «0» ni teclear «7» deja «07». Si no lo es, vino de fuera y se aplica.
 */
export function esNormalizacionDelTexto(texto: string, valor: number | null, { decimales, max }: { decimales: number; max?: number }): boolean {
  const n = parsearDecimal(texto, decimales);
  if (n === null) return valor === null || valor === 0;
  return valor === ajustarDecimal(n, decimales, max);
}
