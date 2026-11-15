import assert from "node:assert/strict";
import { test } from "node:test";
import { esLocaleFecha, formatearFecha, formatearFechaHora, LOCALES_FECHA } from "../../src/lib/formato.ts";
import { nombreMes } from "../../src/lib/calendario.ts";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cargarTsx } from "./cargar-tsx.mjs";

test("formatearFecha sin locale es la de siempre (castellano)", () => {
  assert.equal(formatearFecha("2026-09-15"), "15 Set 2026");
  assert.equal(formatearFecha("2026-11-05", "es"), "5 Nov 2026");
});

test("formatearFecha en inglés usa los meses en inglés", () => {
  assert.equal(formatearFecha("2026-09-15", "en"), "Sep 15, 2026");
  assert.equal(formatearFecha("2026-01-02", "en"), "Jan 2, 2026");
});

test("formatearFecha devuelve tal cual lo que no es una fecha", () => {
  assert.equal(formatearFecha("no-es-fecha"), "no-es-fecha");
  assert.equal(formatearFecha("2026-13-01", "en"), "2026-13-01");
});

test("formatearFechaHora usa la hora de Lima y el idioma pedido", () => {
  assert.equal(formatearFechaHora("2026-11-15T05:49:00Z"), "15 Nov 2026, 00:49");
  assert.equal(formatearFechaHora("2026-09-15T15:32:00Z", "en"), "Sep 15, 2026, 10:32");
  assert.equal(formatearFechaHora("basura", "en"), "basura");
});

test("un idioma desconocido cae en castellano en ejecución, sin devolver el ISO ni un híbrido", () => {
  for (const raro of ["fr", "EN", null, undefined, 3]) {
    assert.equal(formatearFecha("2026-09-15", raro), "15 Set 2026");
    assert.equal(formatearFechaHora("2026-11-15T05:49:00Z", raro), "15 Nov 2026, 00:49");
  }
});

test("esLocaleFecha y LOCALES_FECHA", () => {
  assert.deepEqual([...LOCALES_FECHA], ["es", "en"]);
  assert.equal(esLocaleFecha("en"), true);
  assert.equal(esLocaleFecha("fr"), false);
  assert.equal(esLocaleFecha(null), false);
});

test("un mes inválido devuelve el texto tal cual, no «undefined»", () => {
  assert.equal(formatearFecha("2026-00-10"), "2026-00-10");
  assert.equal(formatearFecha("2026-13-10", "en"), "2026-13-10");
});

test("un ISO con offset se convierte a Lima, también al cambiar de año", () => {
  assert.equal(formatearFechaHora("2026-09-15T23:32:00+09:00", "en"), "Sep 15, 2026, 09:32");
  assert.equal(formatearFechaHora("2027-01-01T03:00:00Z"), "31 Dic 2026, 22:00");
  assert.equal(formatearFechaHora("2027-01-01T03:00:00Z", "en"), "Dec 31, 2026, 22:00");
});

test("una cadena vacía se devuelve tal cual", () => {
  assert.equal(formatearFecha(""), "");
  assert.equal(formatearFecha("", "en"), "");
  assert.equal(formatearFechaHora(""), "");
});

// ── Render real de Calendario y EntradaFecha ─────────────────────────────────────────────────────────────────────────

const { Calendario } = await cargarTsx("components/formularios/calendario");
const { EntradaFecha } = await cargarTsx("components/formularios/entrada-fecha");
const html = (el) => renderToStaticMarkup(el);
const calendario = (locale) => html(createElement(Calendario, { valor: "2026-09-15", onElegir() {}, locale }));

test("Calendario en inglés: mes, días, botones y fechas sin una palabra en castellano", () => {
  const en = calendario("en");
  for (const texto of ["September 2026", 'aria-label="Previous month"', 'aria-label="Next month"', 'title="Monday"', 'title="Sunday"', "Today", 'aria-label="Sep 15, 2026"']) {
    assert.ok(en.includes(texto), texto);
  }
  for (const castellano of ["Setiembre", "Mes anterior", "Mes siguiente", "lunes", "domingo", "Hoy", "Set 2026"]) {
    assert.ok(!en.includes(castellano), castellano);
  }
});

test("Calendario en castellano (por defecto y con es) es el de siempre", () => {
  const es = calendario("es");
  for (const texto of ["Setiembre 2026", 'aria-label="Mes anterior"', 'aria-label="Mes siguiente"', 'title="lunes"', "Hoy", 'aria-label="15 Set 2026"']) {
    assert.ok(es.includes(texto), texto);
  }
  assert.equal(calendario(undefined), es);
});

test("Calendario con un idioma desconocido o null se renderiza igual que en castellano, sin errores", () => {
  const es = calendario("es");
  for (const raro of ["fr", null, "EN", "en-US", ""]) assert.equal(calendario(raro), es, String(raro));
});

test("EntradaFecha escribe la fecha, el placeholder y la ✕ en el idioma, y mandan los que se pasan", () => {
  const ent = (props) => html(createElement(EntradaFecha, { id: "f", limpiable: true, ...props }));
  const en = ent({ valor: "2026-09-15", locale: "en" });
  assert.ok(en.includes("Sep 15, 2026") && en.includes('aria-label="Clear date"'));
  assert.ok(ent({ locale: "en" }).includes("Pick a date"));
  const es = ent({ valor: "2026-09-15" });
  assert.ok(es.includes("15 Set 2026") && es.includes('aria-label="Quitar la fecha"'));
  assert.ok(ent({}).includes("Elegir fecha"));
  assert.ok(ent({ locale: "en", placeholder: "Elegir", valor: "" }).includes("Elegir"));
  assert.ok(ent({ valor: "2026-09-15", locale: "en", etiquetaLimpiar: "Quitar" }).includes('aria-label="Quitar"'));
  assert.equal(ent({ valor: "2026-09-15", locale: "fr" }), es);
});

test("nombreMes ignora claves heredadas del prototipo", () => {
  assert.equal(nombreMes(2026, 8, "__proto__"), "Setiembre 2026");
  assert.equal(nombreMes(2026, 8, "constructor"), "Setiembre 2026");
});

test("el registro rechaza un import relativo en vez de ignorarlo", () => {
  assert.match(readFileSync(new URL("../build-registry.mjs", import.meta.url), "utf8"), /throw new Error\(`Import relativo/);
});
