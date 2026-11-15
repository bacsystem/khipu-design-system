import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { construirRegistro } from "../build-registry.mjs";

const raiz = new URL("../../", import.meta.url);
const { items } = JSON.parse(readFileSync(new URL("registry/registry.json", raiz), "utf8"));

test("cada archivo del registro existe", () => {
  for (const [clave, item] of Object.entries(items)) {
    for (const archivo of item.files) assert.ok(existsSync(new URL(archivo, raiz)), `${clave}: falta ${archivo}`);
  }
});

test("toda registryDependencies resuelve a un item del registro (la CLI no deja imports rotos)", () => {
  for (const [clave, item] of Object.entries(items)) {
    for (const dep of item.registryDependencies) assert.ok(items[dep], `${clave} depende de ${dep}, que no está en el registro`);
  }
});

test("el registro está al día con el código: mismos items, archivos, paquetes e imports (npm run registry:build)", () => {
  assert.deepEqual(construirRegistro(), items);
});
