import assert from "node:assert/strict";
import { test } from "node:test";
import { revisarTexto } from "../verificar-tipografia.mjs";

test("uppercase y tracking se permiten solo en src/lib/estilos.ts", () => {
  const linea = '"text-etiqueta uppercase tracking-wider"';
  assert.equal(revisarTexto(linea, "src/components/ui/x.tsx").length, 2);
  assert.deepEqual(revisarTexto(linea, "src/lib/estilos.ts"), []);
});

test("los tamaños nuevos de la escala no se marcan", () => {
  assert.deepEqual(revisarTexto('"text-titulo text-titulo-pagina text-metrica"', "src/x.tsx"), []);
});

test("text-base y text-sm sueltos se marcan fuera de ui/", () => {
  assert.equal(revisarTexto('"text-base"', "src/components/patrones/x.tsx").length, 1);
  assert.equal(revisarTexto('"text-sm"', "src/components/patrones/x.tsx").length, 1);
});
