import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { celdaCsv } from "../../src/lib/exportar.ts";

test("celdaCsv: comillas, comas, punto y coma y saltos de línea van entre comillas dobles", () => {
  assert.equal(celdaCsv('di "hola"'), '"di ""hola"""');
  assert.equal(celdaCsv("a,b"), '"a,b"');
  assert.equal(celdaCsv("a;b"), '"a;b"');
  assert.equal(celdaCsv("línea 1\nlínea 2"), '"línea 1\nlínea 2"');
  assert.equal(celdaCsv(null), "");
  assert.equal(celdaCsv(undefined), "");
  assert.equal(celdaCsv(0), "0");
});

test("celdaCsv: una celda que una hoja de cálculo ejecutaría como fórmula queda como texto", () => {
  for (const c of ["=1+1", "+SUM(A1)", "-2+3", "@cmd", "\t=1"]) assert.equal(celdaCsv(c).replace(/^"|"$/g, "").startsWith("'"), true, c);
});

test("celdaCsv: los números negativos, con o sin separador de miles, no se tocan", () => {
  assert.equal(celdaCsv("-3"), "-3");
  assert.equal(celdaCsv(-12.5), "-12.5");
  assert.equal(celdaCsv("-1,234.56"), '"-1,234.56"');
  assert.equal(celdaCsv("-1.234,56"), '"-1.234,56"');
});

const fuente = readFileSync(new URL("../../src/components/datos/tabla-listado.tsx", import.meta.url), "utf8");

test("TablaListado exporta en el orden de pantalla y solo con las columnas visibles", () => {
  assert.match(fuente, /ordenarFilas\(filtradas, visibles, orden\)/);
  assert.match(fuente, /descargarCsv\(titulo, exportables, paraExportar\)/);
  assert.match(fuente, /imprimirTabla\(titulo, exportables, paraExportar\)/);
});

test("TablaListado busca sin tildes ni mayúsculas y vuelve a la página 1 al buscar", () => {
  assert.match(fuente, /normalize\("NFD"\)\s*\.replace\(\/\\p\{Diacritic\}\/gu, ""\)/);
  assert.match(fuente, /reinicioPagina=\{busqueda\}/);
});

test("TablaListado: el selector de columnas anuncia su estado y una columna con título no textual usa tituloTexto", () => {
  assert.match(fuente, /<MenuCheckboxItem[\s\S]*?checked=\{!ocultas\.includes\(c\.id\)\}/);
  assert.match(fuente, /if \(c\.tituloTexto\) return c\.tituloTexto;/);
  assert.match(fuente, /ocultables\.filter\(\(c\) => c\.ocultaInicial\)/);
});
