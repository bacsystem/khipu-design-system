#!/usr/bin/env node
// Escanea src/components/** y src/lib/*.ts, extrae sus imports y genera registry/registry.json:
// un mapa {clave -> {name, type, category, files, dependencies, registryDependencies}} que la CLI
// (cli/khipu.mjs) usa para copiar un componente y sus dependencias a un proyecto consumidor.
// Se regenera con `node scripts/build-registry.mjs` — nunca se edita registry.json a mano, porque
// la fuente de verdad son los imports reales del código, no una lista mantenida aparte que se desincroniza.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

// Paquetes que cualquier proyecto Next.js/React consumidor ya trae por definición: no tiene sentido
// pedirle al usuario que los instale de nuevo.
const PAQUETES_IMPLICITOS = new Set(["react", "react-dom", "next"]);

const IMPORT_RE = /import\s+(?:[^'";]*?\s+from\s+)?["']([^"']+)["']/g;

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

function analizarImports(contenido) {
  const internos = new Set();
  const externos = new Set();
  for (const match of contenido.matchAll(IMPORT_RE)) {
    const especificador = match[1];
    if (especificador.startsWith("@/")) {
      internos.add(especificador.slice(2));
    } else if (especificador.startsWith(".")) {
      // No hay imports relativos entre archivos en este repo (todo usa el alias @/), pero si
      // aparecieran no son resolubles como item de registry independiente: se ignoran.
    } else {
      const paquete = nombrePaquete(especificador);
      if (!PAQUETES_IMPLICITOS.has(paquete)) externos.add(paquete);
    }
  }
  return { internos: [...internos].sort(), externos: [...externos].sort() };
}

function construirRegistro() {
  const items = {};
  const archivos = listarArchivos(join(SRC, "components")).concat([join(SRC, "lib", "estilos.ts"), join(SRC, "lib", "utils.ts"), join(SRC, "lib", "formato.ts"), join(SRC, "lib", "paginacion.ts")]);

  for (const rutaAbs of archivos) {
    const rutaRel = relative(SRC, rutaAbs).replace(/\\/g, "/").replace(/\.tsx?$/, "");
    const contenido = readFileSync(rutaAbs, "utf8");
    const { internos, externos } = analizarImports(contenido);
    const categoria = rutaRel.split("/")[0] === "components" ? rutaRel.split("/")[1] : "lib";
    items[rutaRel] = {
      name: basename(rutaRel),
      type: rutaRel.startsWith("lib/") ? "lib" : "component",
      category: categoria,
      files: [relative(ROOT, rutaAbs).replace(/\\/g, "/")],
      dependencies: externos,
      registryDependencies: internos.filter((i) => i !== rutaRel),
    };
  }
  return items;
}

const registro = {
  $schema: "./schema.json",
  generatedAt: new Date().toISOString().slice(0, 10),
  items: construirRegistro(),
};

writeFileSync(join(ROOT, "registry", "registry.json"), JSON.stringify(registro, null, 2) + "\n");
console.log(`registry/registry.json actualizado con ${Object.keys(registro.items).length} items.`);
