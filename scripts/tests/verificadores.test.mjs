import assert from "node:assert/strict";
import { test } from "node:test";
import { contraste, leerBloque } from "../verificar-contraste.mjs";
import { revisarTexto } from "../verificar-tipografia.mjs";

test("marca tamaños sueltos, mayúsculas y tracking ancho", () => {
  const hallazgos = revisarTexto('a "text-[11px] uppercase tracking-wider"\nb "text-control"');
  assert.equal(hallazgos.length, 3);
  assert.ok(hallazgos.every((h) => h.linea === 1));
});

test("respeta la exención tipografia-ok", () => {
  assert.deepEqual(revisarTexto('"uppercase" // tipografia-ok'), []);
});

test("no confunde tracking-tight, text-control ni toUpperCase", () => {
  assert.deepEqual(revisarTexto('"tracking-tight text-control" x.toUpperCase()'), []);
});

test("contraste WCAG conocido", () => {
  assert.equal(contraste("#ffffff", "#000000").toFixed(2), "21.00");
  assert.equal(contraste("#18181b", "#fbfbfc").toFixed(2), "17.13");
});

test("lee las variables de un bloque", () => {
  const css = ":root {\n  --a: #fff;\n  --b: 1px;\n}\n\n.dark {\n  --a: #000;\n}\n";
  assert.equal(leerBloque(css, ":root").get("--a"), "#fff");
  assert.equal(leerBloque(css, ".dark").get("--a"), "#000");
  assert.equal(leerBloque(css, ".dark").has("--b"), false);
});
