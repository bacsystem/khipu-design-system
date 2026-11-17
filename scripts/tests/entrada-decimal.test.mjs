import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { ajustarDecimal, esNormalizacionDelTexto, interpretarEntrada, limpiarTextoDecimal, parsearDecimal, textoDeDecimal } from "../../src/lib/decimal.ts";

test("la coma decimal se escribe como decimal: «12,5» vale 12.5 (no 125)", () => {
  assert.equal(parsearDecimal("12,5"), 12.5);
  assert.equal(parsearDecimal("12.5"), 12.5);
  assert.equal(parsearDecimal(",5"), 0.5);
  assert.equal(parsearDecimal("12,"), 12);
  assert.equal(parsearDecimal("12."), 12);
});

test("un separador suelto es siempre el decimal; con dos tipos el último decimal y el otro agrupa miles", () => {
  assert.equal(parsearDecimal("1.234,56"), 1234.56);
  assert.equal(parsearDecimal("1.234.567,89"), 1234567.89);
  assert.equal(parsearDecimal("1,234.56"), 1234.56);
  assert.equal(parsearDecimal("1.234.567"), 1234567);
  assert.equal(parsearDecimal("1,234,567"), 1234567);
});

test("un separador suelto con exactamente 3 dígitos detrás es de miles si el campo tiene menos de 3 decimales (H1: dinero)", () => {
  assert.equal(parsearDecimal("1,234", 2), 1234);
  assert.equal(parsearDecimal("2,500", 2), 2500);
  assert.equal(parsearDecimal("1.500", 2), 1.5, "un punto suelto es siempre decimal");
  assert.equal(parsearDecimal("1.250", 2), 1.25);
  assert.equal(parsearDecimal("15,000", 2), 15000);
  assert.equal(parsearDecimal("999,999", 0), 999999);
  assert.equal(parsearDecimal("1,234"), 1234, "el valor por defecto son 2 decimales");
  assert.equal(parsearDecimal("1,234", 3), 1.234);
  assert.equal(parsearDecimal("1,234", 4), 1.234);
});

test("en campos enteros (decimales 0) un punto suelto con 3 dígitos detrás también es de miles", () => {
  assert.equal(parsearDecimal("1.500", 0), 1500);
  assert.equal(parsearDecimal("12.000", 0), 12000);
  assert.equal(parsearDecimal("999.999", 0), 999999);
  assert.equal(parsearDecimal("1.500.000", 0), 1500000);
  assert.equal(parsearDecimal("1,500", 0), 1500);
  // Sin cambios: con decimales >= 1 la excepción es solo de la coma.
  assert.equal(parsearDecimal("1.250", 1), 1.25);
  assert.equal(parsearDecimal("1.250", 2), 1.25);
  assert.equal(parsearDecimal("1,250", 2), 1250);
  // Un punto que no cumple la regla sigue siendo decimal y el entero lo trunca después (ajustarDecimal).
  assert.equal(parsearDecimal("1.5", 0), 1.5);
  assert.equal(ajustarDecimal(parsearDecimal("1.5", 0), 0), 1);
  assert.equal(parsearDecimal("0.500", 0), 0.5);
  assert.equal(ajustarDecimal(parsearDecimal("0.500", 0), 0), 0);
  assert.equal(parsearDecimal("1.50", 0), 1.5);
  assert.equal(parsearDecimal("1.5000", 0), 1.5);
  assert.equal(parsearDecimal("1234.500", 0), 1234.5);
});

test("lo demás sigue siendo decimal: 0,125; 12,5; 12,50; 1234,567; 1,23; 012,345", () => {
  assert.equal(parsearDecimal("0,125", 2), 0.125);
  assert.equal(parsearDecimal("012,345", 2), 12.345);
  assert.equal(parsearDecimal("12,5", 2), 12.5);
  assert.equal(parsearDecimal("12,50", 2), 12.5);
  assert.equal(parsearDecimal("1,23", 2), 1.23);
  assert.equal(parsearDecimal("1234,567", 2), 1234.567);
  assert.equal(parsearDecimal("1,2345", 2), 1.2345);
  assert.equal(parsearDecimal(",500", 2), 0.5);
});

test("EntradaMonto: «1,234» se lee 1234 (no 1.23) y «12,5» 12.5", () => {
  const leer = (t) => { const n = parsearDecimal(limpiarTextoDecimal(t), 2); return n === null ? null : ajustarDecimal(n, 2); };
  assert.equal(leer("1,234"), 1234);
  assert.equal(leer("12,5"), 12.5);
  assert.equal(leer("1,234.50"), 1234.5);
  assert.equal(leer("1.234,56"), 1234.56);
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

test("H3: teclear más que max reescribe el texto con el tope; el redondeo no reescribe", () => {
  const o = { decimales: 2, max: 100 };
  assert.deepEqual(interpretarEntrada("150", o), { texto: "100", valor: 100 });
  assert.deepEqual(interpretarEntrada("99,5", o), { texto: "99,5", valor: 99.5 });
  assert.deepEqual(interpretarEntrada("12,3456", o), { texto: "12,3456", valor: 12.35 });
  assert.deepEqual(interpretarEntrada("", o), { texto: "", valor: null });
  assert.deepEqual(interpretarEntrada("-5", o), { texto: "5", valor: 5 });
  assert.deepEqual(interpretarEntrada("-5", { ...o, negativo: true }), { texto: "-5", valor: -5 });
});

test("H7: con max negativo el texto no se reescribe al teclear («-25» con max -10 queda -25)", () => {
  const o = { decimales: 2, max: -10, negativo: true };
  let texto = "";
  let valor = null;
  for (const c of "-25") ({ texto, valor } = interpretarEntrada(texto + c, o));
  assert.deepEqual({ texto, valor }, { texto: "-25", valor: -25 });
  assert.deepEqual(interpretarEntrada("-2", o), { texto: "-2", valor: -10 });
});

test("H2: con el foco puesto, la normalización del padre no pisa el texto; un cambio externo real sí", () => {
  const o = { decimales: 2, max: 100 };
  // `onCambio={(v) => set(v ?? 0)}`: borrar comunica null y el padre devuelve 0.
  assert.equal(esNormalizacionDelTexto("", 0, o), true);
  assert.equal(esNormalizacionDelTexto("", null, o), true);
  assert.equal(esNormalizacionDelTexto("7", 7, o), true);
  assert.equal(esNormalizacionDelTexto("12,3456", 12.35, o), true);
  assert.equal(esNormalizacionDelTexto("150", 100, o), true);
  // Un reinicio o recálculo desde fuera.
  assert.equal(esNormalizacionDelTexto("7", 42, o), false);
  assert.equal(esNormalizacionDelTexto("", 5, o), false);
  assert.equal(esNormalizacionDelTexto("7", null, o), false);
});

const decimal = readFileSync(new URL("../../src/components/formularios/entrada-decimal.tsx", import.meta.url), "utf8");
const monto = readFileSync(new URL("../../src/components/formularios/entrada-monto.tsx", import.meta.url), "utf8");

test("EntradaDecimal: texto crudo, inputMode decimal/numeric, h-control vía CAMPO y tabular-nums", () => {
  assert.match(decimal, /inputMode=\{decimales === 0 \? "numeric" : "decimal"\}/);
  assert.match(decimal, /CAMPO/);
  assert.match(decimal, /tabular-nums/);
  assert.doesNotMatch(decimal, /font-mono/);
  // H5: el sufijo tiene id y se suma al aria-describedby del consumidor.
  assert.match(decimal, /id=\{idSufijo\}/);
  assert.match(decimal, /aria-describedby=\{\[ariaDescribedby, sufijo != null \? idSufijo : undefined\]/);
  assert.match(decimal, /esNormalizacionDelTexto\(texto, valor/);
  assert.match(decimal, /interpretarEntrada\(/);
});

test("EntradaMonto ya no quita las comas: usa el mismo parser que EntradaDecimal", () => {
  assert.doesNotMatch(monto, /replace\(\/\[\^\\d\.\]\/g/);
  assert.match(monto, /parsearDecimal\(limpio, 2\)/);
  assert.match(monto, /ajustarDecimal\(/);
});
