// lucide-react no es peer del paquete: el código publicado no lo importa (IconoComponente acepta cualquier componente de icono).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RAIZ = new URL("../../", import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8"));

function listar(dir) {
  return readdirSync(dir).flatMap((n) => {
    const ruta = join(dir, n);
    return statSync(ruta).isDirectory() ? listar(ruta) : /\.tsx?$/.test(ruta) ? [ruta] : [];
  });
}

test("lucide-react no está en peerDependencies ni en peerDependenciesMeta", () => {
  assert.equal(pkg.peerDependencies["lucide-react"], undefined);
  assert.equal(pkg.peerDependenciesMeta?.["lucide-react"], undefined);
});

test("ningún archivo publicado (src/components, src/lib) importa lucide-react", () => {
  for (const f of [...listar(join(RAIZ, "src/components")), ...listar(join(RAIZ, "src/lib"))]) {
    assert.ok(!/from\s+["']lucide-react["']/.test(readFileSync(f, "utf8")), `${f} importa lucide-react`);
  }
});
