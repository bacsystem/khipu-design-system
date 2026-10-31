#!/usr/bin/env node
// Falla si un archivo usa tamaños de texto sueltos (`text-[Npx]`), mayúsculas o tracking ancho.
// La escala tipográfica tiene nombre (docs/design-system.md §3): text-etiqueta, text-control, text-cuerpo, text-base, text-metrica.
// Una línea que contiene `tipografia-ok` queda exenta (para un literal que de verdad deba ir en mayúsculas).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POR_DEFECTO = ["src/components", "src/app/ejemplo", "src/lib"];

export const REGLAS = [
  { patron: /(?<![\w-])text-\[\d+(?:\.\d+)?(?:px|rem|em)\]/, mensaje: "tamaño suelto: usa text-etiqueta, text-control, text-cuerpo, text-base o text-metrica" },
  { patron: /(?<![\w-])uppercase(?![\w-])/, mensaje: "mayúsculas: el kit usa tipo oración" },
  { patron: /(?<![\w-])tracking-wider?(?![\w-])/, mensaje: "tracking ancho: solo acompañaba a las mayúsculas" },
];

/** Hallazgos `{ linea, mensaje }` de un texto, línea por línea. */
export function revisarTexto(texto) {
  const hallazgos = [];
  texto.split("\n").forEach((linea, i) => {
    if (linea.includes("tipografia-ok")) return;
    for (const { patron, mensaje } of REGLAS) if (patron.test(linea)) hallazgos.push({ linea: i + 1, mensaje });
  });
  return hallazgos;
}

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.(tsx?|jsx?)$/.test(entrada) ? [ruta] : [];
  });
}

function principal(dirs) {
  const errores = [];
  for (const dir of dirs) {
    for (const archivo of listarArchivos(resolve(ROOT, dir))) {
      for (const h of revisarTexto(readFileSync(archivo, "utf8"))) {
        errores.push(`${relative(ROOT, archivo).replaceAll("\\", "/")}:${h.linea}  ${h.mensaje}`);
      }
    }
  }
  if (errores.length > 0) {
    console.error(`Tipografía fuera de la escala (docs/design-system.md §3):\n${errores.join("\n")}`);
    process.exit(1);
  }
  console.log("Tipografía: todo dentro de la escala.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  principal(args.length > 0 ? args : POR_DEFECTO);
}
