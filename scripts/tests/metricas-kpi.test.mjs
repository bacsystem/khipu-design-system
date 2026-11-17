import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cargarTsx } from "./cargar-tsx.mjs";

const { Metrica, FilaMetricas } = await cargarTsx("components/patrones/metricas");
const { Kpi } = await cargarTsx("components/datos/kpi");

const metrica = (props = {}) => renderToStaticMarkup(h(Metrica, { etiqueta: "Saldo", ...props }, "S/ 10"));
const kpi = (props = {}) => renderToStaticMarkup(h(Kpi, { etiqueta: "Ventas", valor: "128", ...props }));

// ── Metrica.ayuda opcional ──────────────────────────────────────────────────
test("Metrica sin ayuda no deja una fila vacía", () => {
  const sin = metrica();
  const con = metrica({ ayuda: "Al día" });
  assert.doesNotMatch(sin, /truncate text-etiqueta/);
  assert.match(con, /Al día/);
});

// ── pie ─────────────────────────────────────────────────────────────────────
test("sin pie no hay banda inferior (compatibilidad)", () => {
  assert.doesNotMatch(metrica({ ayuda: "x" }), /border-t/);
  assert.doesNotMatch(kpi(), /border-t/);
});

test("pie libre: banda con borde suave y texto de etiqueta", () => {
  const out = metrica({ ayuda: "x", pie: h("span", { id: "p" }, "Vence el 12") });
  assert.match(out, /<div[^>]*border-t border-border\/60[^>]*text-etiqueta[^>]*>.*<span id="p">Vence el 12<\/span>/s);
});

test("pie como par etiqueta/valor: etiqueta a la izquierda y valor a la derecha", () => {
  const out = kpi({ pie: { etiqueta: "Meta", valor: "S/ 200" } });
  assert.match(out, /justify-between/);
  assert.match(out, /Meta<\/span><span[^>]*tabular-nums[^>]*>S\/ 200/);
});

// ── valorConTono ────────────────────────────────────────────────────────────
test("valorConTono pinta el valor y la ayuda con el color del tono", () => {
  const out = metrica({ tono: "ok", valorConTono: true, ayuda: "Al día" });
  assert.match(out, /text-metrica[^"]*text-success-foreground/);
  const err = kpi({ tono: "error", valorConTono: true, ayuda: "Vencido" });
  assert.match(err, /text-metrica[^"]*text-destructive-texto/);
  assert.match(err, /text-destructive-texto[^>]*>Vencido/);
});

test("valorConTono sin tono (neutro) deja el valor en el color normal; sin la prop no cambia nada", () => {
  assert.doesNotMatch(metrica({ valorConTono: true }), /text-muted-foreground[^"]*"[^>]*>S\/ 10/);
  assert.doesNotMatch(metrica({ tono: "ok" }), /text-metrica[^"]*text-success-foreground/);
});

test("valorConTono en una tarjeta destacada conserva text-current", () => {
  const out = metrica({ tono: "ok", valorConTono: true, destacada: true });
  assert.doesNotMatch(out, /text-metrica[^"]*text-success-foreground/);
});

// ── Kpi sufijo / ayuda ──────────────────────────────────────────────────────
test("Kpi: sufijo junto al valor y ayuda debajo", () => {
  const out = kpi({ sufijo: "/ 136", ayuda: "3 pendientes", variacion: 5 });
  assert.match(out, /128.*<span[^>]*text-texto-terciario[^>]*>\/ 136/s);
  assert.match(out, /3 pendientes/);
});

test("Kpi sin las props nuevas renderiza como antes", () => {
  const out = kpi({ variacion: 5 });
  assert.doesNotMatch(out, /\/ 136|border-t/);
});

// ── FilaMetricas desplazable ────────────────────────────────────────────────
test("FilaMetricas por defecto es una grilla (sin región ni scroll)", () => {
  const out = renderToStaticMarkup(h(FilaMetricas, null, h("i")));
  assert.doesNotMatch(out, /role="region"|tabindex|overflow-x-auto/);
});

test("FilaMetricas desplazable: región con nombre, foco, snap y ancho mínimo de 11 rem bajo md", () => {
  const out = renderToStaticMarkup(h(FilaMetricas, { desplazable: true, etiqueta: "Indicadores" }, h("i")));
  assert.match(out, /role="region"/);
  assert.match(out, /aria-label="Indicadores"/);
  assert.match(out, /tabindex="0"/);
  assert.match(out, /overflow-x-auto/);
  assert.match(out, /snap-x/);
  assert.match(out, /max-md:\*:min-w-44/);
  assert.match(out, /md:grid/);
});

test("FilaMetricas desplazable sin etiqueta usa un nombre por defecto", () => {
  assert.match(renderToStaticMarkup(h(FilaMetricas, { desplazable: true }, h("i"))), /aria-label="Métricas"/);
});
