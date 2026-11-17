import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { construirRegistro } from "../build-registry.mjs";

const raiz = new URL("../../", import.meta.url);
// registry/registry.json no está en git: se calcula del árbol (lo mismo que escribe `npm run registry:build`).
const items = construirRegistro();

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

test("registry/registry.json no se versiona (los PR no lo editan) y está en .gitignore", () => {
  const ignorado = readFileSync(new URL(".gitignore", raiz), "utf8").split("\n");
  assert.ok(ignorado.includes("/registry/registry.json"));
  const rastreados = execFileSync("git", ["ls-files", "registry"], { cwd: raiz, encoding: "utf8" });
  assert.equal(rastreados.trim(), "");
});

test("los items salen del árbol: un componente o un lib nuevo entra sin tocar ninguna lista", () => {
  const dir = mkdtempSync(join(tmpdir(), "khipu-reg-"));
  try {
    mkdirSync(join(dir, "src/components/ui"), { recursive: true });
    mkdirSync(join(dir, "src/components/carpeta-nueva"), { recursive: true });
    mkdirSync(join(dir, "src/lib"), { recursive: true });
    writeFileSync(join(dir, "src/components/ui/boton.tsx"), 'import { cn } from "@/lib/utils";\nimport { x } from "paquete-externo";\nexport const B = () => null;\n');
    writeFileSync(join(dir, "src/components/carpeta-nueva/pieza.tsx"), 'import { algo } from "@/lib/lib-nuevo";\nexport const P = () => null;\n');
    writeFileSync(join(dir, "src/lib/utils.ts"), 'export { cn } from "cn";\n');
    writeFileSync(join(dir, "src/lib/lib-nuevo.ts"), "export const algo = 1;\n");
    writeFileSync(join(dir, "src/lib/tipos.d.ts"), "export type T = 1;\n");
    const r = construirRegistro(dir);
    assert.deepEqual(Object.keys(r).sort(), ["components/carpeta-nueva/pieza", "components/ui/boton", "lib/lib-nuevo", "lib/utils"]);
    assert.deepEqual(r["components/carpeta-nueva/pieza"].registryDependencies, ["lib/lib-nuevo"]);
    assert.deepEqual(r["components/ui/boton"].dependencies, ["paquete-externo"]);
    assert.equal(r["lib/lib-nuevo"].type, "lib");
    assert.equal(r["components/carpeta-nueva/pieza"].category, "carpeta-nueva");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("la salida es determinista: no lleva fecha de generación", () => {
  assert.deepEqual(construirRegistro(), construirRegistro());
  assert.doesNotMatch(readFileSync(new URL("scripts/build-registry.mjs", raiz), "utf8"), /generatedAt|new Date\(/);
});
