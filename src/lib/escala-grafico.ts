/**
 * Marcas del eje Y de un gráfico: de 0 al primer múltiplo del paso que cubre `max`, con unos `pasos` tramos.
 * Con `enteros` (conteos: prácticas, comprobantes) el paso es un entero ≥ 1, así que el eje nunca muestra 0,25 ni 0,5.
 */
export function escalaEje(max: number, pasos = 4, enteros = false): number[] {
  if (max <= 0) return [0, 1];
  const bruto = enteros ? Math.max(1, max / pasos) : max / pasos;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const paso =
    [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= bruto && (!enteros || Number.isInteger(p))) ?? Math.ceil(bruto);
  const tope = Math.ceil(max / paso) * paso;
  return Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso);
}

/**
 * Orden de los colores de la paleta en composiciones (barras apiladas, dona), donde las series quedan contiguas: en oscuro
 * `--chart-destacado` (índice 1) y `--acento-3` (índice 2) casi no se distinguen, así que este orden nunca los pone juntos.
 * `npm run check:contraste` mide la distancia entre colores contiguos en las 20 combinaciones y lee esta constante.
 */
export const ORDEN_COMPOSICION = [0, 1, 3, 2, 4];

export type FilaTooltip = { nombre: string; valor: string; total?: boolean };

/**
 * Filas del tooltip de una categoría: una por serie y, con `apiladas`, el total (suma de los valores positivos).
 * Es pura para poder probarla sin renderizar; el gráfico le añade el color de cada fila.
 */
export function filasDeCategoria(
  series: Array<{ nombre: string; valores: number[] }>,
  indice: number,
  formato: (v: number) => string,
  apiladas: boolean,
  textoTotal: string,
): FilaTooltip[] {
  const filas: FilaTooltip[] = series.map((s) => ({ nombre: s.nombre, valor: formato(s.valores[indice] ?? 0) }));
  if (!apiladas) return filas;
  const total = series.reduce((suma, s) => suma + Math.max(0, s.valores[indice] ?? 0), 0);
  return [...filas, { nombre: textoTotal, valor: formato(total), total: true }];
}

/**
 * Parte de una dona. Con más de `maximo` partes, las últimas se agrupan en una sola llamada `otros` (suma de sus valores), de
 * modo que el porcentaje de cada parte sigue siendo sobre el total completo y no se descarta nada.
 */
export function agruparPartes<D>(partes: Array<{ nombre: string; valor: number; detalle?: D }>, maximo: number, otros: string): Array<{ nombre: string; valor: number; detalle?: D }> {
  const limpias = partes.map((p) => ({ ...p, valor: Math.max(0, p.valor) }));
  if (limpias.length <= maximo) return limpias;
  const resto = limpias.slice(maximo - 1).reduce((suma, p) => suma + p.valor, 0);
  return [...limpias.slice(0, maximo - 1), { nombre: otros, valor: resto }];
}
