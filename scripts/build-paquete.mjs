#!/usr/bin/env node
// Builds the npm package into dist/ (see README §Instalarlo como paquete and docs/adopcion-en-el-portal.md).
//
// 1. `tsc -p tsconfig.paquete.json` compiles src/components and src/lib to ESM .js + .d.ts. tsc keeps the
//    `"use client"` directive at the top of each file, which is what the Next.js App Router needs to know which
//    modules are client components; a bundler (tsup/esbuild in bundle mode) would drop or hoist it.
// 2. tsc does not rewrite the `@/*` alias the sources use (the CLI copies those files verbatim into projects that
//    have the same alias, so the sources must keep it). This script rewrites every `@/x` and every relative import
//    to a relative path WITH the `.js` extension, in both the .js and the .d.ts files. The extension matters: the
//    package is `"type": "module"`, and webpack resolves imports inside such packages as fully specified.
//    `next/link` and `next/navigation` get the same treatment (`next` has no `exports` map, so a fully specified
//    resolver needs the file name).
// 3. Copies the CSS (src/styles/*.css, shadcn's Tailwind variants) and writes dist/styles.css, the single entry a
//    consumer imports, with the `@source` that makes the consumer's Tailwind scan the compiled components.
//
// Fails (exit 1) if a source has `"use client"` and its output does not, or if an import cannot be resolved.

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const require = createRequire(import.meta.url);

/** Bare specifiers without an `exports` map that need an explicit file in a fully specified ESM package. */
const SUBRUTAS_SIN_EXPORTS = new Set(["next/link", "next/navigation"]);

function listar(dir, filtro) {
  const out = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) out.push(...listar(ruta, filtro));
    else if (filtro(ruta)) out.push(ruta);
  }
  return out;
}

const aPosix = (ruta) => ruta.split(sep).join("/");

function compilar() {
  rmSync(DIST, { recursive: true, force: true });
  const tsc = require.resolve("typescript/bin/tsc");
  const r = spawnSync(process.execPath, [tsc, "-p", join(ROOT, "tsconfig.paquete.json")], { stdio: "inherit" });
  if (r.status !== 0) {
    console.error("tsc falló al compilar el paquete.");
    process.exit(r.status ?? 1);
  }
}

/** `@/components/ui/button` desde dist/components/ui/dialog.js → `./button.js`. */
function resolverEspecificador(espec, archivo, errores) {
  let destino;
  if (espec.startsWith("@/")) destino = join(DIST, espec.slice(2));
  else if (espec.startsWith("./") || espec.startsWith("../")) destino = join(dirname(archivo), espec);
  else if (SUBRUTAS_SIN_EXPORTS.has(espec)) return `${espec}.js`;
  else return espec;

  if (/\.(js|css)$/.test(destino)) return espec;
  if (!existsSync(`${destino}.js`)) {
    errores.push(`${aPosix(relative(ROOT, archivo))}: no se encontró "${espec}" (${aPosix(relative(ROOT, destino))}.js)`);
    return espec;
  }
  let rel = aPosix(relative(dirname(archivo), `${destino}.js`));
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel;
}

// `from "x"`, `import "x"`, `import("x")`, `export * from "x"` (también en .d.ts).
const ESPECIFICADOR_RE = /(\bfrom\s*|\bimport\s*\(?\s*)(["'])([^"']+)\2/g;

function reescribirImports() {
  const errores = [];
  const archivos = listar(DIST, (r) => r.endsWith(".js") || r.endsWith(".d.ts"));
  for (const archivo of archivos) {
    const original = readFileSync(archivo, "utf8");
    const nuevo = original.replace(ESPECIFICADOR_RE, (_m, prefijo, comilla, espec) => {
      return `${prefijo}${comilla}${resolverEspecificador(espec, archivo, errores)}${comilla}`;
    });
    if (nuevo !== original) writeFileSync(archivo, nuevo);
  }
  return { errores, total: archivos.length };
}

/** Un archivo con `"use client"` en el fuente tiene que seguir empezando por él en dist. */
function verificarUseClient() {
  const errores = [];
  const fuentes = listar(SRC, (r) => /\.(ts|tsx)$/.test(r) && !aPosix(r).includes("/src/app/"));
  let clientes = 0;
  for (const fuente of fuentes) {
    const esCliente = /^\s*["']use client["']/.test(readFileSync(fuente, "utf8"));
    if (!esCliente) continue;
    clientes++;
    const salida = join(DIST, relative(SRC, fuente)).replace(/\.tsx?$/, ".js");
    if (!existsSync(salida) || !/^\s*["']use client["']/.test(readFileSync(salida, "utf8"))) {
      errores.push(`${aPosix(relative(ROOT, salida))} perdió "use client"`);
    }
  }
  return { errores, clientes };
}

function copiarCss() {
  const destino = join(DIST, "styles");
  mkdirSync(destino, { recursive: true });
  for (const nombre of ["tokens.css", "theme.css"]) copyFileSync(join(SRC, "styles", nombre), join(destino, nombre));
  // Variantes data-open/data-closed/... y utilidades scroll-fade que usan los componentes (vienen de shadcn, MIT).
  // Se copian en el build para no obligar al consumidor a instalar la CLI de shadcn solo por este CSS.
  copyFileSync(require.resolve("shadcn/tailwind.css"), join(destino, "shadcn.css"));

  const entrada = [
    "/*",
    " * khipu-design-system: everything a Tailwind v4 app needs, in one import, AFTER `@import \"tailwindcss\";`:",
    " *",
    " *   @import \"tailwindcss\";",
    " *   @import \"khipu-design-system/styles.css\";",
    " *",
    " * Generated by scripts/build-paquete.mjs. To rebrand, redefine the variables of styles/tokens.css after this import.",
    " */",
    '@import "tw-animate-css";',
    '@import "./styles/shadcn.css";',
    '@import "./styles/tokens.css";',
    '@import "./styles/theme.css";',
    "",
    "/* Tailwind does not scan node_modules on its own: these make it generate the classes the components use. */",
    '@source "./components";',
    '@source "./lib";',
    "",
  ].join("\n");
  writeFileSync(join(DIST, "styles.css"), entrada);
}

compilar();
const imports = reescribirImports();
const useClient = verificarUseClient();
copiarCss();

const errores = [...imports.errores, ...useClient.errores];
if (errores.length) {
  console.error(`\nbuild-paquete: ${errores.length} error(es):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `build-paquete: dist/ listo — ${imports.total} archivos .js/.d.ts, ${useClient.clientes} módulos "use client" conservados, CSS en dist/styles.css.`,
);
