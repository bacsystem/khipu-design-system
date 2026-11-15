import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const raiz = new URL("../../", import.meta.url);
const { items } = JSON.parse(readFileSync(new URL("registry/registry.json", raiz), "utf8"));
const IMPORT_RE = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g;

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

test("el registro está al día con los imports de los archivos (npm run registry:build)", () => {
  for (const [clave, item] of Object.entries(items)) {
    const fuente = readFileSync(new URL(item.files[0], raiz), "utf8");
    const internos = [...fuente.matchAll(IMPORT_RE)].map((m) => m[1]).filter((e) => e.startsWith("@/")).map((e) => e.slice(2));
    const esperadas = [...new Set(internos)].filter((i) => i !== clave).sort();
    assert.deepEqual(item.registryDependencies, esperadas, `${clave}: registry.json desactualizado`);
  }
});
