import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RUTA = "src/components/navegacion/menu-acciones.tsx";
const fuente = readFileSync(join(RAIZ, RUTA), "utf8");

// Compila menu-acciones.tsx para renderizar `AyudaAccion`. Las importaciones del módulo (@/…, base-ui, phosphor) se
// sustituyen por stubs: aquí solo se prueba el texto de ayuda, no el menú, que necesita un portal y el navegador.
async function cargarAyuda() {
  const js = ts
    .transpileModule(fuente, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false } })
    .outputText.replace(/^import .*$/gm, "")
    .replace(/export function MenuAcciones/, "function MenuAcciones");
  const dir = join(RAIZ, "node_modules/.cache/khipu-tests");
  mkdirSync(dir, { recursive: true });
  const archivo = join(dir, `menu-acciones-${process.pid}.mjs`);
  writeFileSync(archivo, `import { jsx, jsxs, Fragment } from "react/jsx-runtime";\nconst _jsx = jsx, _jsxs = jsxs, _Fragment = Fragment;\nconst useId = () => "x";\n${js}`);
  return import(pathToFileURL(archivo).href);
}

const { AyudaAccion } = await cargarAyuda();

test("AyudaAccion pinta el texto visible con el id que enlaza el ítem, sin la opacidad del ítem deshabilitado", () => {
  const html = renderToStaticMarkup(createElement(AyudaAccion, { id: "ayuda-1" }, "Recházala primero"));
  assert.match(html, /^<p id="ayuda-1" aria-hidden="true" class="[^"]*text-muted-foreground[^"]*">Recházala primero<\/p>$/);
  assert.doesNotMatch(html, /opacity/, "el contraste del texto de ayuda no se reduce");
});

test("la ayuda va aria-hidden: dentro de role=menu no debe leerse como contenido; se anuncia por aria-describedby", () => {
  const html = renderToStaticMarkup(createElement(AyudaAccion, { id: "a" }, "x"));
  assert.match(html, /aria-hidden="true"/);
});

test("el ítem solo enlaza la ayuda cuando la hay, y la ayuda va fuera del ítem", () => {
  assert.match(fuente, /aria-describedby=\{a\.ayuda \? idAyuda : undefined\}/);
  assert.match(fuente, /\{a\.ayuda \? <AyudaAccion id=\{idAyuda\}>\{a\.ayuda\}<\/AyudaAccion> : null\}/);
  // La ayuda es hermana de MenuItem (después de su cierre), no hija: no hereda `data-disabled:opacity-50`.
  assert.ok(fuente.indexOf("</MenuItem>") < fuente.indexOf("<AyudaAccion id={idAyuda}"));
});
