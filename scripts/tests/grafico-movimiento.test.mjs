// «Reducir movimiento» activo: motion lee `window.matchMedia` al montar el primer componente, así que se simula antes de cargar.
import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

globalThis.window = { matchMedia: () => ({ matches: true, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }) };

const { cargarTsx } = await import("./cargar-tsx.mjs");
const { GraficoDona, GraficoLineas } = await cargarTsx("components/datos/grafico");

test("con «reducir movimiento» la dona y el área salen ya completas (sin opacidad inicial 0)", () => {
  const dona = renderToStaticMarkup(h(GraficoDona, { partes: [{ nombre: "A", valor: 1 }, { nombre: "B", valor: 2 }] }));
  const area = renderToStaticMarkup(h(GraficoLineas, { categorias: ["a", "b"], series: [{ nombre: "S", valores: [1, 2] }], area: true }));
  assert.match(dona, /data-parte/);
  assert.doesNotMatch(dona, /opacity:0[;"]/);
  assert.match(area, /data-area/);
  assert.doesNotMatch(area, /opacity:0[;"]/);
});
