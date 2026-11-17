// Guarda del contrato de peers: el paquete promete funcionar en Next 15.5 y en Next 16. La cadena de herramientas del repo
// solo ejecuta Next 16, así que sin esta prueba nadie notaría que el rango se estrecha por error. Para comprobar que el código
// compilado de verdad corre en 15.5, `npm run verify:next15` (paso previo a cada tag).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import semver from "semver";

const pkg = JSON.parse(readFileSync(new URL("../../package.json", import.meta.url), "utf8"));

test("peerDependencies.next acepta 15.5.0 y 16.0.0", () => {
  const rango = pkg.peerDependencies.next;
  assert.ok(semver.validRange(rango), `rango inválido: ${rango}`);
  for (const version of ["15.5.0", "15.5.28", "16.0.0", "16.3.5"]) {
    assert.ok(semver.satisfies(version, rango), `next@${version} debe cumplir "${rango}"`);
  }
});

test("peerDependencies.next no acepta Next 14 (sin soporte) ni 17 (sin probar)", () => {
  const rango = pkg.peerDependencies.next;
  for (const version of ["14.2.0", "15.4.9", "17.0.0"]) {
    assert.ok(!semver.satisfies(version, rango), `next@${version} no debería cumplir "${rango}"`);
  }
});
