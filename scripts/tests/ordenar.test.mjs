import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ordenarFilas } from "../../src/lib/ordenar.ts";

const filas = [
  { id: "a", n: 2, nombre: "Ñandú" },
  { id: "b", n: 10, nombre: "abeja" },
  { id: "c", n: 1, nombre: "Zorro" },
];
const columnas = [{ id: "n" }, { id: "nombre" }, { id: "doble", valor: (f) => f.n * 2 }];
const ids = (fs) => fs.map((f) => f.id).join("");

test("ordenarFilas: números como números, en los dos sentidos", () => {
  assert.equal(ids(ordenarFilas(filas, columnas, { id: "n", dir: "asc" })), "cab");
  assert.equal(ids(ordenarFilas(filas, columnas, { id: "n", dir: "desc" })), "bac");
});

test("ordenarFilas: texto en castellano (la ñ va entre n y o) y `valor` de la columna", () => {
  assert.equal(ids(ordenarFilas(filas, columnas, { id: "nombre", dir: "asc" })), "bac");
  assert.equal(ids(ordenarFilas(filas, columnas, { id: "doble", dir: "desc" })), "bac");
});

test("ordenarFilas: sin orden o con una columna que no está, devuelve las filas tal cual y no las muta", () => {
  assert.equal(ordenarFilas(filas, columnas, null), filas);
  assert.equal(ordenarFilas(filas, [{ id: "nombre" }], { id: "n", dir: "asc" }), filas);
  ordenarFilas(filas, columnas, { id: "n", dir: "asc" });
  assert.equal(ids(filas), "abc");
});

const tabla = readFileSync(new URL("../../src/components/datos/tabla-datos.tsx", import.meta.url), "utf8");

test("TablaDatos avisa el orden elegido desde el clic y vuelve a la página 1 cuando cambia `reinicioPagina`", () => {
  assert.match(tabla, /function alternar\(id: string\) \{[\s\S]*?setOrden\(nuevo\);\s*onOrdenCambio\?\.\(nuevo\);/);
  assert.match(tabla, /if \(!Object\.is\(reinicioPagina, reinicioPrevio\)\) \{\s*setReinicioPrevio\(reinicioPagina\);\s*setPagina\(1\);/);
  assert.match(tabla, /useMemo\(\(\) => ordenarFilas\(filas, columnas, orden\)/);
});

const contrasena = readFileSync(new URL("../../src/components/formularios/contrasena.tsx", import.meta.url), "utf8");

test("Contrasena: el clic en el ojo no le quita el foco al campo, y el campo expone onBlur", () => {
  assert.match(contrasena, /onMouseDown=\{\(e\) => e\.preventDefault\(\)\}\s*onClick=\{\(\) => setVisible/);
  assert.match(contrasena, /onBlur=\{onBlur\}/);
});
