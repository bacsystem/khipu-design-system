export const POR_PAGINA_DEFECTO = 10;
export const OPCIONES_POR_PAGINA = [10, 20, 50] as const;

/**
 * Normaliza un valor (p. ej. de la URL) a una de las opciones permitidas (por defecto 10, 20 y 50; pasa las de `PieTabla opciones` para que un 25 sobreviva).
 * Si no es válido devuelve 10, o la primera opción cuando 10 no está entre ellas.
 */
export function porPaginaValido(valor: string | number | null | undefined, opciones: readonly number[] = OPCIONES_POR_PAGINA): number {
  const n = Number(valor);
  if (opciones.includes(n)) return n;
  return opciones.includes(POR_PAGINA_DEFECTO) ? POR_PAGINA_DEFECTO : (opciones[0] ?? POR_PAGINA_DEFECTO);
}

/** Números de página a mostrar en el paginador: siempre las 2 primeras, las 2 últimas y las vecinas de la actual, con "…" entre huecos. */
export function paginasVisibles(actual: number, ultima: number): Array<number | "…"> {
  if (ultima <= 7) return Array.from({ length: ultima }, (_, i) => i + 1);
  const cerca = new Set([1, 2, actual - 1, actual, actual + 1, ultima - 1, ultima].filter((p) => p >= 1 && p <= ultima));
  const resultado: Array<number | "…"> = [];
  for (let p = 1; p <= ultima; p++) {
    if (cerca.has(p)) resultado.push(p);
    else if (resultado[resultado.length - 1] !== "…") resultado.push("…");
  }
  return resultado;
}

/**
 * Tamaños de página que ofrece el selector: los de `opciones` (solo enteros > 0, sin repetir) más `actual`, ordenados de menor a mayor.
 * El valor actual siempre está en la lista, aunque venga de fuera de ella (p. ej. de la URL), para que el selector lo marque.
 */
export function opcionesPorPagina(opciones: readonly number[], actual: number): number[] {
  const validos = [...opciones, actual].filter((n) => Number.isInteger(n) && n > 0);
  return [...new Set(validos)].sort((a, b) => a - b);
}
