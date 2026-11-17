#!/usr/bin/env node
// Escanea src/components/** y src/lib/*.ts, extrae sus imports y genera registry/registry.json:
// un mapa {clave -> {name, type, category, files, dependencies, registryDependencies}} que la CLI
// (cli/khipu.mjs) usa para copiar un componente y sus dependencias a un proyecto consumidor.
// registry/registry.json NO está en git: se genera (en `prepare`, `build:paquete` y `verify:paquete`, o a mano con
// `npm run registry:build`) a partir del árbol de src/. Los items salen de recorrer src/components/** y src/lib/*.ts,
// así que añadir un componente no obliga a editar ninguna lista; la fuente de verdad son los archivos y sus imports.

import { readFileSync, writeFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { join, relative, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

// Paquetes que cualquier proyecto Next.js/React consumidor ya trae por definición: no tiene sentido
// pedirle al usuario que los instale de nuevo.
const PAQUETES_IMPLICITOS = new Set(["react", "react-dom", "next"]);

// También hay que capturar `export { x } from "paquete"` (re-exports), no solo `import`: p. ej.
// lib/utils.ts es `export { cn } from "cn"` — si solo miráramos `import`, el registro diría que
// lib/utils no depende de nada, y la CLI nunca pediría instalar "cn" aunque cualquier componente
// que copie lib/utils lo necesite en runtime.
const IMPORT_RE = /(?:import|export)\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g;

function listarArchivos(dir) {
  const resultado = [];
  for (const entrada of readdirSync(dir)) {
    const ruta = join(dir, entrada);
    const info = statSync(ruta);
    if (info.isDirectory()) resultado.push(...listarArchivos(ruta));
    else if ([".ts", ".tsx"].includes(extname(ruta))) resultado.push(ruta);
  }
  return resultado;
}

function nombrePaquete(especificador) {
  const partes = especificador.split("/");
  return especificador.startsWith("@") ? `${partes[0]}/${partes[1]}` : partes[0];
}

/** `archivo` (ruta del item) solo sirve para el mensaje de error. */
export function analizarImports(contenido, archivo = "(archivo)") {
  const internos = new Set();
  const externos = new Set();
  for (const match of contenido.matchAll(IMPORT_RE)) {
    const especificador = match[1];
    if (especificador.startsWith("@/")) {
      internos.add(especificador.slice(2));
    } else if (especificador.startsWith(".")) {
      // Todo usa el alias @/. Un import relativo no es resoluble como item del registro y `khipu add` dejaría un
      // import roto en el proyecto consumidor: se rechaza en vez de ignorarlo.
      throw new Error(`${archivo}: import relativo "${especificador}"; usa el alias "@/..." para que el registro lo resuelva.`);
    } else {
      const paquete = nombrePaquete(especificador);
      if (!PAQUETES_IMPLICITOS.has(paquete)) externos.add(paquete);
    }
  }
  return { internos: [...internos].sort(), externos: [...externos].sort() };
}

/** `raiz` = carpeta que contiene `src/` (por defecto este repo; las pruebas pasan un árbol temporal). */
export function construirRegistro(raiz = ROOT) {
  const SRC = join(raiz, "src");
  const items = {};
  // Todo src/components/** y todo src/lib/*.ts (salvo .d.ts): orden fijo para que la salida sea idéntica en cualquier máquina.
  const libs = readdirSync(join(SRC, "lib")).filter((n) => n.endsWith(".ts") && !n.endsWith(".d.ts")).sort().map((n) => join(SRC, "lib", n));
  const archivos = listarArchivos(join(SRC, "components")).sort().concat(libs);

  for (const rutaAbs of archivos) {
    const rutaRel = relative(SRC, rutaAbs).replace(/\\/g, "/").replace(/\.tsx?$/, "");
    const contenido = readFileSync(rutaAbs, "utf8");
    const { internos, externos } = analizarImports(contenido, rutaRel);
    const categoria = rutaRel.split("/")[0] === "components" ? rutaRel.split("/")[1] : "lib";
    items[rutaRel] = {
      name: basename(rutaRel),
      type: rutaRel.startsWith("lib/") ? "lib" : "component",
      category: categoria,
      files: [relative(raiz, rutaAbs).replace(/\\/g, "/")],
      dependencies: externos,
      registryDependencies: internos.filter((i) => i !== rutaRel),
    };
  }
  return items;
}

// Importarlo (para probarlo) no escribe nada: solo se escribe al ejecutarlo como script.
// `realpathSync`: ejecutado por un symlink (`node enlace.mjs`), argv[1] es el enlace y la URL del módulo, el archivo real.
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  // Sin fecha de generación: la salida depende solo del código, no del día.
  const registro = { items: construirRegistro() };

  writeFileSync(join(ROOT, "registry", "registry.json"), JSON.stringify(registro, null, 2) + "\n");
  console.log(`registry/registry.json actualizado con ${Object.keys(registro.items).length} items.`);
}
