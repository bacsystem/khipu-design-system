#!/usr/bin/env node
// Barrido mecánico del rediseño 0.3.0 (docs/cys/specs/2026-10-31-rediseno-visual-moderno-design.md §4.5).
// Idempotente: correrlo dos veces no cambia nada. No toca src/lib (las recetas se reescriben a mano).
// Uso: node scripts/codemod-estilo.mjs [dir…]   (por defecto src/components y src/app/ejemplo)

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POR_DEFECTO = ["src/components", "src/app/ejemplo"];
const B = "(?<![\\w-])"; // inicio de clase
const F = "(?![\\w-])"; // fin de clase

export const REEMPLAZOS = [
  [new RegExp(`${B}text-\\[(?:9|10|11|11\\.5)px\\]`, "g"), "text-etiqueta"],
  [new RegExp(`${B}text-\\[13px\\](\\s+font-semibold)`, "g"), "text-cuerpo$1"],
  [new RegExp(`${B}text-\\[(?:12|13)px\\]`, "g"), "text-control"],
  [new RegExp(`${B}text-\\[0\\.8rem\\]`, "g"), "text-control"],
  [new RegExp(`${B}text-\\[14px\\]`, "g"), "text-cuerpo"],
  [new RegExp(`${B}text-\\[15px\\]`, "g"), "text-base"],
  [new RegExp(` ?${B}tracking-wider?${F}`, "g"), ""],
  [new RegExp(`${B}shadow-2xs${F}`, "g"), "shadow-xs"],
  [new RegExp(`${B}shadow-xl${F}`, "g"), "shadow-lg"],
  [new RegExp(`${B}ring-foreground/(?:10|5)${F}`, "g"), "ring-border"],
  [new RegExp(`${B}focus-visible:ring-ring/40${F}`, "g"), "focus-visible:ring-ring/50"],
  [new RegExp(`${B}ease-out${F}`, "g"), "ease-salida"],
  [new RegExp(`${B}bg-destructive/10${F}`, "g"), "bg-destructive-suave"],
];
const MAYUSCULAS = new RegExp(` ?${B}uppercase${F}`, "g");
// Sobre bg-destructive-suave el rojo base (#dc2547) da 4.25 en claro: en esa línea el texto pasa a destructive-texto,
// y se quita dark:bg-destructive/20, que pisaría al token suave en oscuro.
const TEXTO_ROJO = new RegExp(`${B}text-destructive${F}`, "g");
const FONDO_ROJO_OSCURO = new RegExp(` ?${B}dark:bg-destructive/20${F}`, "g");
function rojoLegible(linea) {
  if (!linea.includes("bg-destructive-suave")) return linea;
  return linea.replace(TEXTO_ROJO, "text-destructive-texto").replace(FONDO_ROJO_OSCURO, "");
}

/** Aplica el barrido a un texto. Las líneas con `tipografia-ok` conservan sus mayúsculas. */
export function transformar(texto) {
  let salida = texto;
  for (const [patron, reemplazo] of REEMPLAZOS) salida = salida.replace(patron, reemplazo);
  return salida
    .split("\n")
    .map((linea) => (linea.includes("tipografia-ok") ? linea : linea.replace(MAYUSCULAS, "")))
    .map(rojoLegible)
    .join("\n");
}

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.tsx?$/.test(entrada) ? [ruta] : [];
  });
}

function principal(dirs) {
  let cambiados = 0;
  for (const dir of dirs) {
    for (const archivo of listarArchivos(resolve(ROOT, dir))) {
      const antes = readFileSync(archivo, "utf8");
      const despues = transformar(antes);
      if (despues === antes) continue;
      writeFileSync(archivo, despues);
      cambiados += 1;
      console.log(relative(ROOT, archivo).replaceAll("\\", "/"));
    }
  }
  console.log(`Codemod: ${cambiados} archivos actualizados.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  principal(args.length > 0 ? args : POR_DEFECTO);
}
