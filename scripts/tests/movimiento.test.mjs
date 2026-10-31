import assert from "node:assert/strict";
import { test } from "node:test";
import { CURVA_SALIDA, DURACION, RESORTE, RESORTE_SUAVE, textoContador } from "../../src/lib/movimiento.ts";

// Sin rebote: razón de amortiguamiento ζ = c / (2·√(k·m)) ≥ 1 (docs/design-system.md «Movimiento»).
const amortiguamiento = (r) => r.damping / (2 * Math.sqrt(r.stiffness * r.mass));

test("los resortes no rebotan", () => {
  assert.ok(amortiguamiento(RESORTE) >= 1, `RESORTE ζ=${amortiguamiento(RESORTE)}`);
  assert.ok(amortiguamiento(RESORTE_SUAVE) >= 1, `RESORTE_SUAVE ζ=${amortiguamiento(RESORTE_SUAVE)}`);
});

test("curva y duraciones coinciden con globals.css", () => {
  assert.deepEqual(CURVA_SALIDA, [0.16, 1, 0.3, 1]);
  assert.equal(DURACION.rapida, 0.12);
  assert.equal(DURACION.media, 0.2);
  assert.equal(DURACION.lenta, 0.32);
});

test("textoContador formatea como formato.ts (en-US)", () => {
  assert.equal(textoContador(128430, { prefijo: "S/ " }), "S/ 128,430");
  assert.equal(textoContador(1236.4), "1,236");
  assert.equal(textoContador(98.456, { decimales: 1, sufijo: "%" }), "98.5%");
});
