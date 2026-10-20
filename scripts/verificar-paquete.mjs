#!/usr/bin/env node
// Checks the built package (run after scripts/build-paquete.mjs; `npm run verify:paquete` does both):
//
// 1. Every component and lib in src/ (except src/app, the demo) has a public subpath in package.json `exports`.
//    A new folder under src/components without its `./<folder>/*` entry fails here instead of shipping unreachable.
// 2. Each subpath resolves, through the package's own `exports` (self-reference by name, the same resolution a
//    consumer gets), to an existing .js AND an existing .d.ts.
// 3. Each module actually loads in Node (dynamic import): catches a broken rewritten import or a missing dependency.
// 4. Every `exports` entry points at something that exists (no dead patterns), and the CSS entries exist.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const errores = [];

const aPosix = (ruta) => ruta.split(sep).join("/");

function listar(dir) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) out.push(...listar(ruta));
    else if (/\.(ts|tsx)$/.test(ruta)) out.push(ruta);
  }
  return out;
}

/** src/components/ui/button.tsx → "ui/button"; src/lib/estilos.ts → "lib/estilos"; src/components/providers.tsx → "providers". */
function subrutaDe(fuente) {
  const rel = aPosix(relative(SRC, fuente)).replace(/\.tsx?$/, "");
  return rel.startsWith("components/") ? rel.slice("components/".length) : rel;
}

/** Devuelve el destino del mapa `exports` para una subruta, o null (patrones `*` como los resuelve Node). */
function destinoEnExports(subruta) {
  const clave = `./${subruta}`;
  if (pkg.exports[clave]) return pkg.exports[clave];
  for (const [patron, destino] of Object.entries(pkg.exports)) {
    if (!patron.endsWith("/*")) continue;
    const prefijo = patron.slice(0, -1);
    if (clave.startsWith(prefijo) && !clave.slice(prefijo.length).includes("/")) {
      const resto = clave.slice(prefijo.length);
      return JSON.parse(JSON.stringify(destino).replaceAll("*", resto));
    }
  }
  return null;
}

const fuentes = [...listar(join(SRC, "components")), ...listar(join(SRC, "lib"))];
let cargados = 0;

for (const fuente of fuentes) {
  const subruta = subrutaDe(fuente);
  const destino = destinoEnExports(subruta);
  if (!destino) {
    errores.push(`${aPosix(relative(ROOT, fuente))}: no tiene subruta en "exports" (se esperaba "./${subruta}")`);
    continue;
  }
  for (const campo of ["types", "default"]) {
    if (!destino[campo] || !existsSync(join(ROOT, destino[campo]))) {
      errores.push(`"./${subruta}": falta ${campo} (${destino[campo] ?? "sin campo"}) — ¿corriste build:paquete?`);
    }
  }

  const especificador = `${pkg.name}/${subruta}`;
  let url;
  try {
    url = import.meta.resolve(especificador);
  } catch (e) {
    errores.push(`${especificador}: no resuelve (${e.message})`);
    continue;
  }
  if (url !== pathToFileURL(join(ROOT, destino.default)).href) {
    errores.push(`${especificador}: resuelve a ${url}, se esperaba ${destino.default}`);
    continue;
  }
  try {
    const modulo = await import(especificador);
    if (Object.keys(modulo).length === 0) errores.push(`${especificador}: no exporta nada`);
    cargados++;
  } catch (e) {
    errores.push(`${especificador}: falla al importarlo (${e.message.split("\n")[0]})`);
  }
}

// Ninguna entrada de exports apunta a la nada.
for (const [clave, destino] of Object.entries(pkg.exports)) {
  const rutas = typeof destino === "string" ? [destino] : Object.values(destino);
  for (const ruta of rutas) {
    if (ruta.includes("*")) {
      const [antes] = ruta.split("*");
      if (!existsSync(join(ROOT, antes))) errores.push(`exports "${clave}": no existe ${antes}`);
    } else if (!existsSync(join(ROOT, ruta))) {
      errores.push(`exports "${clave}": no existe ${ruta}`);
    }
  }
}

// La entrada CSS tiene que escanear lo compilado, si no el consumidor se queda sin las clases de los componentes.
const estilos = readFileSync(join(ROOT, "dist", "styles.css"), "utf8");
for (const fuente of [...estilos.matchAll(/@source\s+"([^"]+)"/g)].map((m) => m[1])) {
  if (!existsSync(join(ROOT, "dist", fuente))) errores.push(`dist/styles.css: @source "${fuente}" no existe`);
}
for (const imp of [...estilos.matchAll(/@import\s+"(\.[^"]+)"/g)].map((m) => m[1])) {
  if (!existsSync(join(ROOT, "dist", imp))) errores.push(`dist/styles.css: @import "${imp}" no existe`);
}

if (errores.length) {
  console.error(`verificar-paquete: ${errores.length} error(es):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`verificar-paquete: ${fuentes.length} módulos con subruta pública, ${cargados} importados sin error, exports y CSS en orden.`);
