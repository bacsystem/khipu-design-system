import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Compila pill-estado.tsx para renderizarlo de verdad: las rutas `@/lib/*` apuntan a los .ts (node los carga sin tipos) y el
// módulo se escribe bajo node_modules/.cache para que resuelva react desde el node_modules del repo.
async function cargarPillEstado() {
  const fuente = readFileSync(join(RAIZ, "src/components/patrones/pill-estado.tsx"), "utf8");
  const js = ts
    .transpileModule(fuente, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false } })
    .outputText.replace(/from "@\/lib\/(\w+)"/g, (_, m) => `from ${JSON.stringify(pathToFileURL(join(RAIZ, "src/lib", `${m}.ts`)).href)}`);
  const dir = join(RAIZ, "node_modules/.cache/khipu-tests");
  mkdirSync(dir, { recursive: true });
  const archivo = join(dir, `pill-estado-${process.pid}.mjs`);
  writeFileSync(archivo, js);
  return import(pathToFileURL(archivo).href);
}

const { PillEstado } = await cargarPillEstado();
const pintar = (props) => renderToStaticMarkup(createElement(PillEstado, props, "Operativo"));

// HTML de la pill sin icono antes de 0.5.15: sin `icon` no debe cambiar ni una clase.
const SIN_ICONO_OK =
  '<span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap bg-success text-success-foreground"><span class="size-1.5 shrink-0 rounded-full bg-success-solid"></span>Operativo</span>';

test("PillEstado sin icon pinta el punto, igual que antes", () => {
  assert.equal(pintar({ tono: "ok" }), SIN_ICONO_OK);
  assert.match(pintar({ tono: "error" }), /<span class="size-1\.5 shrink-0 rounded-full bg-destructive"><\/span>Operativo/);
});

test("PillEstado con icon cambia el punto por el icono, decorativo y con el peso del kit", () => {
  const recibidas = [];
  const Icono = (props) => {
    recibidas.push(props);
    return createElement("svg", { "aria-hidden": props["aria-hidden"], "data-peso": props.weight, className: props.className });
  };
  const html = pintar({ tono: "aviso", icon: Icono });
  assert.doesNotMatch(html, /size-1\.5/, "con icono no hay punto");
  assert.match(html, /<svg aria-hidden="true" data-peso="duotone" class="size-3\.5 shrink-0"><\/svg>Operativo/);
  // El color es el del texto del tono (currentColor), cuyo contraste ya verifica check:contraste.
  assert.match(html, /^<span class="[^"]*bg-warning text-warning-foreground">/);
  assert.equal(recibidas.length, 1);
  // El estado lo dice el texto, no el icono.
  assert.match(html, />Operativo<\/span>$/);
});
