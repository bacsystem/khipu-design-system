import assert from "node:assert/strict";
import { test } from "node:test";
import { formatearFecha, formatearFechaHora } from "../../src/lib/formato.ts";

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
