#!/usr/bin/env node
// Falla si algún archivo de src/ le cambia la altura a una receta de control con `cn(RECETA, "h-N")`.
// La escala de alturas (docs/design-system.md §4) tiene una receta por altura y contexto: si un control necesita otra
// altura, se usa la receta de esa altura. Sobrescribirla a mano es lo que hace que dos controles de la misma fila
// terminen midiendo distinto, y el consumidor que copia el ejemplo copia también la sobrescritura.
// `h-auto` sí se permite: es el textarea de `Entrada`, que crece con su contenido y no forma fila con nadie.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

const RECETAS = /\bcn\(\s*(CAMPO\w*|BOTON_\w+|ACCION_\w+|CONTROL_FILTRO)\s*,([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
const ALTURA = /(?<![\w-])(?:[a-z-]+:)*h-(?!auto\b)[\d.[]/;

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.(tsx?|jsx?)$/.test(entrada) ? [ruta] : [];
  });
}

const errores = [];
for (const archivo of listarArchivos(SRC)) {
  const texto = readFileSync(archivo, "utf8");
  for (const m of texto.matchAll(RECETAS)) {
    if (!ALTURA.test(m[2])) continue;
    const linea = texto.slice(0, m.index).split("\n").length;
    errores.push(`${relative(ROOT, archivo).replaceAll("\\", "/")}:${linea}  ${m[0].replace(/\s+/g, " ").slice(0, 120)}`);
  }
}

if (errores.length > 0) {
  console.error(`Sobrescrituras de altura sobre una receta (usa la receta de esa altura, ver docs/design-system.md §4):\n${errores.join("\n")}`);
  process.exit(1);
}
console.log("Alturas: ninguna receta de control sobrescrita.");
