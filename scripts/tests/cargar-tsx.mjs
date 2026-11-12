// Ayuda de las pruebas: compila un .tsx/.ts de src/ con sus imports `@/…` (recursivo) y lo importa, para renderizar un
// componente de verdad con react-dom/server sin un bundler. Los módulos se escriben bajo node_modules/.cache para que los
// paquetes (react, base-ui, phosphor) se resuelvan desde el node_modules del repo. No es una prueba: no termina en .test.mjs.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SALIDA = join(RAIZ, "node_modules/.cache/khipu-tests", String(process.pid));
const OPCIONES = { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, verbatimModuleSyntax: false };

const compilados = new Set();

function resolverFuente(ruta) {
  const base = join(RAIZ, "src", ruta);
  const candidata = [".tsx", ".ts"].map((ext) => base + ext).find(existsSync);
  if (!candidata) throw new Error(`No existe src/${ruta}(.tsx|.ts)`);
  return candidata;
}

function compilar(ruta) {
  const destino = join(SALIDA, `${ruta}.mjs`);
  if (compilados.has(ruta)) return destino;
  compilados.add(ruta);
  const js = ts
    .transpileModule(readFileSync(resolverFuente(ruta), "utf8"), { compilerOptions: OPCIONES })
    .outputText.replace(/from "@\/([^"]+)"/g, (_, interna) => `from ${JSON.stringify(pathToFileURL(compilar(interna)).href)}`);
  mkdirSync(dirname(destino), { recursive: true });
  writeFileSync(destino, js);
  return destino;
}

/** Importa `src/<ruta>` (sin extensión, p. ej. `components/patrones/aviso-responsivo`) ya compilado. */
export function cargarTsx(ruta) {
  return import(pathToFileURL(compilar(ruta)).href);
}
