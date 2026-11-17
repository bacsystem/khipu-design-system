import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cargarTsx } from "./cargar-tsx.mjs";

const { GraficoBarras, GraficoLineas, GraficoDona } = await cargarTsx("components/datos/grafico");
const fuente = readFileSync(new URL("../../src/components/datos/grafico.tsx", import.meta.url), "utf8");

const cats = ["Abr", "May", "Jun"];
const dos = [
  { nombre: "Facturas", valores: [10, 20, 30] },
  { nombre: "Boletas", valores: [5, 0, 10] },
];
const barras = (props = {}) => renderToStaticMarkup(h(GraficoBarras, { categorias: cats, series: dos, ...props }));
const lineas = (props = {}) => renderToStaticMarkup(h(GraficoLineas, { categorias: cats, series: dos, ...props }));

// ── GraficoBarras apiladas ──────────────────────────────────────────────────
test("barras apiladas: la escala cubre la suma, cada categoría resume series y total en su <title>", () => {
  const out = barras({ apiladas: true });
  // 30 + 10 = 40 es el máximo apilado; agrupadas el máximo sería 30 (eje hasta 30 o 35).
  assert.match(out, />40</);
  assert.match(out, /<title>Jun: Facturas 30, Boletas 10; Total 40<\/title>/);
  assert.match(out, /<title>May: Facturas 20, Boletas 0; Total 20<\/title>/);
});

test("barras apiladas: la etiqueta del total se traduce con textoTotal", () => {
  assert.match(barras({ apiladas: true, textoTotal: "Suma" }), /Jun: Facturas 30, Boletas 10; Suma 40/);
});

test("barras apiladas: un segmento por serie con valor, con los colores y bordes de la paleta, sin hex", () => {
  const out = barras({ apiladas: true });
  // 3 categorías × 2 series, menos el 0 de May/Boletas
  assert.equal([...out.matchAll(/<path /g)].length, 5);
  assert.match(out, /fill="var\(--chart-base\)"/);
  assert.match(out, /fill="var\(--chart-destacado\)"/);
  assert.doesNotMatch(out, /#[0-9a-fA-F]{3,6}\b/);
});

test("barras sin apiladas siguen agrupadas (sin resumen por categoría)", () => {
  const out = barras();
  assert.doesNotMatch(out, /Total/);
  assert.match(out, /<title>Abr: 10<\/title>/);
});

test("barras apiladas: el tooltip suma el total (fuente)", () => {
  assert.match(fuente, /apiladas\?: boolean/);
  assert.match(fuente, /textoTotal/);
});

// ── GraficoLineas area / discontinua ────────────────────────────────────────
test("líneas: sin area ni discontinua el SVG no cambia (sin relleno ni guiones)", () => {
  const out = lineas();
  assert.doesNotMatch(out, /stroke-dasharray="5 4"/);
  assert.doesNotMatch(out, /border-dashed/);
  assert.doesNotMatch(out, /data-area/);
});

test("líneas area: cada serie lleva un relleno tenue con el color de su trazo", () => {
  const out = lineas({ area: true });
  assert.equal([...out.matchAll(/data-area="/g)].length, 2);
  assert.match(out, /data-area="[^"]*"[^>]*fill="var\(--chart-1\)"/);
});

test("líneas discontinua: la serie va a guiones y su leyenda también", () => {
  const out = lineas({ series: [dos[0], { nombre: "Meta", valores: [25, 25, 25], discontinua: true }] });
  assert.equal([...out.matchAll(/stroke-dasharray="5 4"/g)].length, 1);
  assert.match(out, /border-dashed/);
});

test("líneas: nombre y descripción accesibles, y resumen por categoría en <title>", () => {
  const out = lineas({ titulo: "Ventas", descripcion: "Sube cada mes." });
  assert.match(out, /<title[^>]*>Ventas<\/title>/);
  assert.match(out, /<desc[^>]*>Sube cada mes\.<\/desc>/);
  assert.match(out, /aria-describedby=/);
  assert.match(out, /<title>Jun: Facturas 30, Boletas 10<\/title>/);
});

test("líneas plano + etiquetadoPor: sin tarjeta ni título propios", () => {
  const out = lineas({ plano: true, etiquetadoPor: "sec-t" });
  assert.match(out, /aria-labelledby="sec-t"/);
  assert.doesNotMatch(out, /Gráfico de líneas/);
});

// ── GraficoDona ─────────────────────────────────────────────────────────────
const partes = [
  { nombre: "Efectivo", valor: 50 },
  { nombre: "Yape", valor: 30, detalle: "Billetera" },
  { nombre: "Tarjeta", valor: 20 },
];
const dona = (props = {}) => renderToStaticMarkup(h(GraficoDona, { partes, titulo: "Medios de pago", ...props }));

test("dona: un sector por parte con relleno y borde de la paleta, sin hex", () => {
  const out = dona();
  assert.equal([...out.matchAll(/data-parte="/g)].length, 3);
  assert.match(out, /fill="var\(--chart-base\)"[^>]*stroke="var\(--chart-trazo-base\)"/);
  assert.doesNotMatch(out, /#[0-9a-fA-F]{3,6}\b/);
});

test("dona: valor y porcentaje van en la leyenda y en el <title> de cada sector", () => {
  const out = dona({ formato: (v) => `S/ ${v}` });
  assert.match(out, /<title>Efectivo: S\/ 50 \(50\.0%\)<\/title>/);
  assert.match(out, /<li[^>]*>.*Efectivo.*S\/ 50.*50\.0%/s);
  assert.match(out, /Billetera/);
});

test("dona: se nombra con el título y se describe con un resumen o con `descripcion`", () => {
  const out = dona();
  assert.match(out, /role="img"/);
  assert.match(out, /<title[^>]*>Medios de pago<\/title>/);
  assert.match(out, /<desc[^>]*>Efectivo: 50 \(50\.0%\); Yape: 30 \(30\.0%\); Tarjeta: 20 \(20\.0%\)<\/desc>/);
  assert.match(dona({ descripcion: "La mitad en efectivo." }), /<desc[^>]*>La mitad en efectivo\.<\/desc>/);
  assert.match(dona({ etiquetadoPor: "sec-t" }), /aria-labelledby="sec-t"/);
});

test("dona: máximo 5 partes, centro opcional, total 0 y una sola parte no rompen", () => {
  const siete = Array.from({ length: 7 }, (_, i) => ({ nombre: `P${i}`, valor: 1 }));
  assert.equal([...dona({ partes: siete }).matchAll(/data-parte="/g)].length, 5);
  assert.match(dona({ centro: h("b", null, "100") }), /<b>100<\/b>/);
  const vacia = dona({ partes: [{ nombre: "A", valor: 0 }] });
  assert.doesNotMatch(vacia, /NaN/);
  const una = dona({ partes: [{ nombre: "A", valor: 7 }] });
  assert.doesNotMatch(una, /NaN/);
  assert.match(una, /100\.0%/);
});

test("dona: el movimiento respeta «reducir movimiento» (fuente)", () => {
  assert.match(fuente, /useReducedMotion/);
});
