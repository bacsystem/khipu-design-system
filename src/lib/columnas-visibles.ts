/**
 * Columnas ocultas de un listado, recordadas en `localStorage` bajo la clave que elija la app. Nunca lanzan: sin
 * almacenamiento (SSR, modo privado, acceso bloqueado) o con un valor roto se comportan como «nada guardado».
 */

/** Los ids de columnas ocultas guardados en `clave`, o `null` si no hay nada (o no se puede leer). */
export function leerColumnasOcultas(clave: string): string[] | null {
  try {
    return interpretarColumnasOcultas(localStorage.getItem(clave));
  } catch {
    return null;
  }
}

/** Interpreta el texto guardado: un arreglo JSON de ids (se descartan los que no son texto) o `null`. */
export function interpretarColumnasOcultas(crudo: string | null): string[] | null {
  if (crudo === null) return null;
  try {
    const valor: unknown = JSON.parse(crudo);
    return Array.isArray(valor) ? valor.filter((x): x is string => typeof x === "string") : null;
  } catch {
    return null;
  }
}

/** Guarda los ids ocultos; con `null` borra lo recordado (vuelve a los valores iniciales). */
export function guardarColumnasOcultas(clave: string, ocultas: string[] | null): void {
  try {
    if (ocultas === null) localStorage.removeItem(clave);
    else localStorage.setItem(clave, JSON.stringify(ocultas));
  } catch {
    // Sin almacenamiento: la preferencia vale solo para esta sesión.
  }
}

/** Lo mínimo que `calcularOcultas` necesita de una columna. */
export type ColumnaOcultable = { id: string; ocultable?: boolean; ocultaInicial?: boolean };

/**
 * Qué columnas están ocultas: la elección hecha en esta sesión (`elegidas`) manda sobre lo recordado (`recordado`), que manda
 * sobre `ocultaInicial`. Solo cuentan las columnas que se pueden ocultar: una fija (`ocultable: false`) o un id que ya no
 * existe, aunque figuren en lo guardado, se descartan.
 */
export function calcularOcultas(columnas: ColumnaOcultable[], elegidas: string[] | null, recordado: string[] | null): string[] {
  const ocultables = columnas.filter((c) => c.ocultable !== false);
  const base = elegidas ?? recordado;
  return base ? base.filter((id) => ocultables.some((c) => c.id === id)) : ocultables.filter((c) => c.ocultaInicial).map((c) => c.id);
}

/** «Restablecer»: olvida lo recordado (borra la clave, no guarda una lista vacía) para volver a `ocultaInicial`. */
export function restablecerColumnasOcultas(clave: string): void {
  guardarColumnasOcultas(clave, null);
}
