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

// ── Revisión de la PR: pruebas que discriminan ──────────────────────────────
const { filasDeCategoria, agruparPartes, ORDEN_COMPOSICION } = await cargarTsx("lib/escala-grafico");
const contraste = await import("../verificar-contraste.mjs");

test("filasDeCategoria: con apiladas añade la fila del total (suma de positivos); sin ellas, no", () => {
  const f = (apiladas) => filasDeCategoria([{ nombre: "A", valores: [3] }, { nombre: "B", valores: [4] }, { nombre: "C", valores: [-5] }], 0, (v) => `#${v}`, apiladas, "Suma");
  assert.deepEqual(f(false).map((x) => x.nombre), ["A", "B", "C"]);
  assert.deepEqual(f(true).at(-1), { nombre: "Suma", valor: "#7", total: true });
  assert.equal(f(true).length, 4);
});

test("las apiladas usan filasDeCategoria en su tooltip (fuente)", () => {
  assert.match(fuente, /filasDeCategoria\(series, hover, formato, apiladas, textoTotal\)/);
});

test("la escala sale del máximo real: líneas y barras, agrupadas y apiladas", () => {
  const eje = (out) => [...out.matchAll(/text-anchor="end"[^>]*>([\d,.]+)</g)].map((m) => Number(m[1].replace(",", "")));
  const alta = [{ nombre: "A", valores: [10, 20, 30, 40] }];
  const sube = (props) => Math.max(...eje(renderToStaticMarkup(h(props.c, { categorias: ["a", "b", "c", "d"], series: props.series, ...props.extra }))));
  assert.equal(sube({ c: GraficoLineas, series: alta }), 40);
  assert.equal(sube({ c: GraficoBarras, series: alta }), 40);
  assert.equal(sube({ c: GraficoLineas, series: [{ nombre: "A", valores: [900] }] }), 1000);
  assert.equal(sube({ c: GraficoBarras, series: [{ nombre: "A", valores: [10, 0, 0, 0] }, { nombre: "B", valores: [10, 0, 0, 0] }], extra: { apiladas: true } }) >= 20, true);
});

test("área: no rellena las series discontinua", () => {
  const out = lineas({ area: true, series: [dos[0], { nombre: "Meta", valores: [25, 25, 25], discontinua: true }] });
  assert.equal([...out.matchAll(/data-area="/g)].length, 1);
});

test("apiladas: solo el segmento de arriba redondea y entre segmentos hay un hueco de 2 px", () => {
  const out = barras({ apiladas: true, categorias: ["A"], series: [{ nombre: "S1", valores: [50] }, { nombre: "S2", valores: [50] }, { nombre: "S3", valores: [50] }] });
  const ds = [...out.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ds.length, 3);
  assert.equal(ds.filter((d) => /a0,0 0 0 1 0,0/.test(d)).length, 2, "los de abajo son rectos");
  assert.doesNotMatch(ds[2], /a0,0/);
  const base = (d) => Number(d.match(/^M[\d.]+,([\d.]+)/)[1]);
  const cima = (d) => base(d) - Number(d.match(/ v-([\d.]+)/)[1]);
  assert.ok(cima(ds[0]) - base(ds[1]) >= 1.99, "hueco entre el 1.º y el 2.º");
});

test("apiladas: los colores siguen ORDEN_COMPOSICION y la leyenda coincide", () => {
  const out = barras({ apiladas: true, categorias: ["A"], series: [1, 2, 3].map((n) => ({ nombre: `S${n}`, valores: [n] })) });
  // 3.ª serie → índice 3 de la paleta (chart-4), no `acento-3`
  assert.match(out, /fill="var\(--chart-4\)"/);
  assert.doesNotMatch(out, /fill="var\(--acento-3\)"/);
  assert.match(out, /background:var\(--chart-4\)/);
});

test("ORDEN_COMPOSICION no junta destacado (1) con acento-3 (2) y check:contraste lo exige", () => {
  const contiguos = contraste.paresContiguos(ORDEN_COMPOSICION);
  assert.ok(!contiguos.some(([a, b]) => [a, b].sort().join() === "1,2"));
  const css = readFileSync(new URL("../../src/styles/tokens.css", import.meta.url), "utf8");
  const peor = (orden) =>
    Math.min(
      ...contraste.combinaciones(css).flatMap((c) =>
        contraste.paresContiguos(orden).map(([i, j]) => contraste.deltaE(rgb(contraste.resolverColor(contraste.TRAZO_POR_INDICE[i], c.vars)), rgb(contraste.resolverColor(contraste.TRAZO_POR_INDICE[j], c.vars)))),
      ),
    );
  assert.ok(peor([0, 1, 2, 3, 4]) < contraste.DELTA_E_MINIMO, "el orden natural sí falla");
  assert.ok(peor(ORDEN_COMPOSICION) >= contraste.DELTA_E_MINIMO);
});
function rgb(c) {
  return { r: c.r, g: c.g, b: c.b, a: 1 };
}

test("dona: entre sectores hay hueco y no se pinta la pista de fondo", () => {
  const out = dona();
  assert.doesNotMatch(out, /stroke="var\(--secondary\)"/);
  assert.match(dona({ partes: [{ nombre: "A", valor: 0 }] }), /stroke="var\(--secondary\)"/);
});

test("dona con más de 5 partes: agrupa el resto en «Otros» y el % es sobre el total completo", () => {
  const siete = [40, 20, 15, 10, 8, 5, 2].map((valor, i) => ({ nombre: i === 0 ? "Efectivo" : `P${i}`, valor }));
  const out = dona({ partes: siete });
  assert.match(out, /Efectivo: 50 \(40\.0%\)|Efectivo: 40 \(40\.0%\)/);
  assert.match(out, /Otros: 15 \(15\.0%\)/);
  assert.equal([...out.matchAll(/data-parte="/g)].length, 5);
  assert.doesNotMatch(out, /P5|P6/);
  assert.match(dona({ partes: siete, textos: { otros: "Resto" } }), /Resto: 15 \(15\.0%\)/);
  assert.deepEqual(agruparPartes(siete, 5, "x").at(-1), { nombre: "x", valor: 15 });
});

test("líneas y apiladas tienen un <desc> por defecto", () => {
  assert.match(lineas(), /<desc[^>]*>Facturas: de 10 a 30, máximo 30; Boletas: de 5 a 10, máximo 10<\/desc>/);
  assert.match(barras({ apiladas: true }), /<desc[^>]*>Abr: Facturas 10, Boletas 5; Total 15\. May:/);
});

test("la dona y el área aparecen con opacidad 0 inicial salvo con «reducir movimiento»", () => {
  assert.match(dona(), /opacity:0[;"]/);
  assert.match(lineas({ area: true }), /opacity:0[;"]/);
});
