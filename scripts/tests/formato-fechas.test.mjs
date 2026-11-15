import assert from "node:assert/strict";
import { test } from "node:test";
import { esLocaleFecha, formatearFecha, formatearFechaHora, LOCALES_FECHA } from "../../src/lib/formato.ts";
import { nombreMes } from "../../src/lib/calendario.ts";
import { readFileSync } from "node:fs";

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

test("el calendario y EntradaFecha siguen el idioma", () => {
  assert.equal(nombreMes(2026, 8), "Setiembre 2026");
  assert.equal(nombreMes(2026, 8, "en"), "September 2026");
  const calendario = readFileSync(new URL("../../src/components/formularios/calendario.tsx", import.meta.url), "utf8");
  const entrada = readFileSync(new URL("../../src/components/formularios/entrada-fecha.tsx", import.meta.url), "utf8");
  assert.match(calendario, /formatearFecha\(d\.iso, idioma\)/);
  assert.match(calendario, /locale = "es"/);
  assert.match(entrada, /formatearFecha\(valor, locale\)/);
  assert.match(entrada, /<Calendario\s+locale=\{locale\}/);
});
