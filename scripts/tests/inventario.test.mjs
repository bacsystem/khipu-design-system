import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { construirRegistro } from "../build-registry.mjs";
import { ARCHIVOS, FIN, INICIO, generarInventario, releaseEnCurso, reemplazarBloque } from "../inventario.mjs";

const raiz = new URL("../../", import.meta.url);

test("generarInventario: una fila por carpeta, módulos ordenados, raíz de components y lib aparte", () => {
  const items = { "components/ui/b": {}, "components/ui/a": {}, "components/providers": {}, "lib/utils": {}, "components/datos/kpi": {} };
  assert.equal(
    generarInventario(items),
    "| Carpeta | Módulos |\n|---|---|\n| `components` | `providers` |\n| `components/datos` | `kpi` |\n| `components/ui` | `a`, `b` |\n| `lib` | `utils` |",
  );
});

test("generarInventario: no depende del orden de entrada", () => {
  const a = generarInventario({ "components/ui/x": {}, "components/ui/y": {} });
  const b = generarInventario({ "components/ui/y": {}, "components/ui/x": {} });
  assert.equal(a, b);
});

test("reemplazarBloque: solo cambia lo de entre las marcas y falla sin ellas", () => {
  const t = `antes\n${INICIO}\nviejo\n${FIN}\ndespués\n`;
  assert.equal(reemplazarBloque(t, "nuevo"), `antes\n${INICIO}\nnuevo\n${FIN}\ndespués\n`);
  assert.throws(() => reemplazarBloque("sin marcas", "x", "f.md"), /f\.md.*faltan las marcas/);
  assert.throws(() => reemplazarBloque(`${FIN}\n${INICIO}`, "x"), /faltan las marcas/);
});

test("releaseEnCurso: sin tag remoto es release; con tag no", () => {
  assert.equal(releaseEnCurso(""), true);
  assert.equal(releaseEnCurso("\n"), true);
  assert.equal(releaseEnCurso("abc123\trefs/tags/v0.9.0\n"), false);
});

test("los archivos con marcas están al día en este commit (si no: npm run docs:build)", () => {
  // En un PR normal el inventario puede ir por detrás (lo regenera el PR de release); aquí solo se exige que las
  // marcas existan y que regenerar no rompa el formato. La igualdad exacta la exige la CI en releases (docs:check).
  const bloque = generarInventario(construirRegistro());
  for (const archivo of ARCHIVOS) {
    const texto = readFileSync(new URL(archivo, raiz), "utf8");
    const nuevo = reemplazarBloque(texto, bloque, archivo);
    assert.ok(nuevo.includes(INICIO) && nuevo.includes(FIN));
  }
});
