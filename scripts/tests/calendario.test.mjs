import assert from "node:assert/strict";
import { test } from "node:test";
import { dentroDeRango, nombreMes, semanasDelMes, sumarDias, sumarMeses } from "../../src/lib/calendario.ts";

test("semanasDelMes: 6 semanas que empiezan en lunes y cubren el mes", () => {
  const semanas = semanasDelMes(2026, 8); // setiembre 2026: el 1 es martes
  assert.equal(semanas.length, 6);
  assert.ok(semanas.every((s) => s.length === 7));
  assert.deepEqual(semanas[0][0], { iso: "2026-08-31", dia: 31, delMes: false });
  assert.deepEqual(semanas[0][1], { iso: "2026-09-01", dia: 1, delMes: true });
  const delMes = semanas.flat().filter((d) => d.delMes).map((d) => d.dia);
  assert.equal(delMes.length, 30);
  assert.equal(delMes.at(-1), 30);
});

test("sumarDias cruza meses y años sin desfase de zona horaria", () => {
  assert.equal(sumarDias("2026-09-30", 1), "2026-10-01");
  assert.equal(sumarDias("2026-01-01", -1), "2025-12-31");
  assert.equal(sumarDias("2024-02-28", 1), "2024-02-29");
});

test("sumarMeses ajusta al último día cuando el mes es más corto", () => {
  assert.equal(sumarMeses("2026-01-31", 1), "2026-02-28");
  assert.equal(sumarMeses("2026-03-15", -1), "2026-02-15");
  assert.equal(sumarMeses("2026-12-10", 1), "2027-01-10");
});

test("dentroDeRango respeta min y max (inclusive) y acepta límites vacíos", () => {
  assert.ok(dentroDeRango("2026-09-15", "2026-09-01", "2026-09-30"));
  assert.ok(dentroDeRango("2026-09-01", "2026-09-01"));
  assert.ok(!dentroDeRango("2026-08-31", "2026-09-01"));
  assert.ok(!dentroDeRango("2026-10-01", undefined, "2026-09-30"));
  assert.ok(dentroDeRango("2026-10-01"));
});

test("nombreMes en español con mayúscula inicial", () => {
  assert.equal(nombreMes(2026, 8), "Setiembre 2026");
  assert.equal(nombreMes(2027, 0), "Enero 2027");
});
