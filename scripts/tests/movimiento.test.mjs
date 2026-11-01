import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { CURVA_SALIDA, DURACION, RESORTE, RESORTE_SUAVE, textoContador } from "../../src/lib/movimiento.ts";

// Sin rebote: razón de amortiguamiento ζ = c / (2·√(k·m)) ≥ 1 (docs/design-system.md «Movimiento»).
const amortiguamiento = (r) => r.damping / (2 * Math.sqrt(r.stiffness * r.mass));

test("los resortes no rebotan", () => {
  assert.ok(amortiguamiento(RESORTE) >= 1, `RESORTE ζ=${amortiguamiento(RESORTE)}`);
  assert.ok(amortiguamiento(RESORTE_SUAVE) >= 1, `RESORTE_SUAVE ζ=${amortiguamiento(RESORTE_SUAVE)}`);
});

// Lee los valores del CSS: si alguien cambia uno de los dos lados, la prueba lo detecta.
const css = ["tokens.css", "theme.css"].map((f) => readFileSync(new URL(`../../src/styles/${f}`, import.meta.url), "utf8")).join("\n");
// La primera aparición: el diseño base (:root / @theme). «papel» redefine las duraciones más abajo.
const valor = (nombre) => css.match(new RegExp(`${nombre}:\\s*([^;]+);`))?.[1].trim();

test("curva y duraciones coinciden con src/styles", () => {
  assert.equal(valor("--ease-salida"), `cubic-bezier(${CURVA_SALIDA.join(", ")})`);
  assert.equal(valor("--duracion-rapida"), `${DURACION.rapida * 1000}ms`);
  assert.equal(valor("--duracion-media"), `${DURACION.media * 1000}ms`);
  assert.equal(valor("--duracion-lenta"), `${DURACION.lenta * 1000}ms`);
});

test("textoContador formatea como formato.ts (en-US)", () => {
  assert.equal(textoContador(128430, { prefijo: "S/ " }), "S/ 128,430");
  assert.equal(textoContador(1236.4), "1,236");
  assert.equal(textoContador(98.456, { decimales: 1, sufijo: "%" }), "98.5%");
});
