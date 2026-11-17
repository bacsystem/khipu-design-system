import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ajustarDecimal, limpiarTextoDecimal, parsearDecimal, textoDeDecimal } from "../../src/lib/decimal.ts";

test("la coma decimal se escribe como decimal: «12,5» vale 12.5 (no 125)", () => {
  assert.equal(parsearDecimal("12,5"), 12.5);
  assert.equal(parsearDecimal("12.5"), 12.5);
  assert.equal(parsearDecimal(",5"), 0.5);
  assert.equal(parsearDecimal("12,"), 12);
  assert.equal(parsearDecimal("12."), 12);
});

test("un separador suelto es siempre el decimal; con dos tipos el último decimal y el otro agrupa miles", () => {
  assert.equal(parsearDecimal("1,234"), 1.234);
  assert.equal(parsearDecimal("1.234,56"), 1234.56);
  assert.equal(parsearDecimal("1,234.56"), 1234.56);
  assert.equal(parsearDecimal("1.234.567"), 1234567);
  assert.equal(parsearDecimal("1,234,567"), 1234567);
});

test("vacío o sin dígitos es null; letras y espacios se descartan", () => {
  for (const t of ["", "-", ".", ",", "abc"]) assert.equal(parsearDecimal(t), null, t);
  assert.equal(parsearDecimal(" 1 2a,5 "), 12.5);
  assert.equal(limpiarTextoDecimal("1a2,5"), "12,5");
});

test("el signo solo existe si se permiten negativos", () => {
  assert.equal(limpiarTextoDecimal("-5"), "5");
  assert.equal(limpiarTextoDecimal("-5", true), "-5");
  assert.equal(parsearDecimal("-5,5"), -5.5);
});

test("ajustarDecimal redondea a los decimales, trunca los enteros y acota a max", () => {
  assert.equal(ajustarDecimal(12.345, 2), 12.35);
  assert.equal(ajustarDecimal(1.005, 2), 1.01);
  assert.equal(ajustarDecimal(12.9, 0), 12);
  assert.equal(ajustarDecimal(150, 2, 100), 100);
  assert.equal(textoDeDecimal(12.5), "12.5");
  assert.equal(textoDeDecimal(null), "");
});

const decimal = readFileSync(new URL("../../src/components/formularios/entrada-decimal.tsx", import.meta.url), "utf8");
const monto = readFileSync(new URL("../../src/components/formularios/entrada-monto.tsx", import.meta.url), "utf8");

test("EntradaDecimal: texto crudo, inputMode decimal/numeric, h-control vía CAMPO y tabular-nums", () => {
  assert.match(decimal, /inputMode=\{decimales === 0 \? "numeric" : "decimal"\}/);
  assert.match(decimal, /CAMPO/);
  assert.match(decimal, /tabular-nums/);
  assert.match(decimal, /parsearDecimal\(/);
  assert.doesNotMatch(decimal, /font-mono/);
});

test("EntradaMonto ya no quita las comas: usa el mismo parser que EntradaDecimal", () => {
  assert.doesNotMatch(monto, /replace\(\/\[\^\\d\.\]\/g/);
  assert.match(monto, /parsearDecimal\(/);
  assert.match(monto, /ajustarDecimal\(/);
});
