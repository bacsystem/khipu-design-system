#!/usr/bin/env node
// Falla si un archivo usa tamaños de texto sueltos (`text-[Npx]`, `text-sm`, `text-base`…), mayúsculas o tracking ancho.
// La escala tipográfica tiene nombre (docs/design-system.md §3): text-etiqueta, text-control, text-cuerpo, text-titulo,
// text-titulo-pagina, text-metrica. `uppercase` y `tracking-*` solo viven en las recetas de src/lib/estilos.ts (ROTULO,
// CABECERA_TABLA). Una línea que contiene `tipografia-ok` queda exenta.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POR_DEFECTO = ["src/components", "src/app/ejemplo", "src/lib"];

const RECETAS = "src/lib/estilos.ts";

export const REGLAS = [
  { patron: /(?<![\w-])text-\[\d+(?:\.\d+)?(?:px|rem|em)\]/, mensaje: "tamaño suelto: usa la escala con nombre (text-etiqueta … text-metrica)" },
  { patron: /(?<![\w:-])text-(?:xs|sm|base|lg|xl|2xl)(?![\w-])/, mensaje: "tamaño de Tailwind: usa la escala con nombre", salvoUi: true },
  { patron: /(?<![\w-])uppercase(?![\w-])/, mensaje: "mayúsculas: solo en las recetas de lib/estilos.ts", salvoRecetas: true },
  { patron: /(?<![\w-])tracking-(?:wide|wider|widest|\[0\.\d+em\])(?![\w-])/, mensaje: "tracking ancho: solo en las recetas de lib/estilos.ts", salvoRecetas: true },
];

/** Hallazgos `{ linea, mensaje }` de un texto, línea por línea. `ruta` (relativa a la raíz) habilita las excepciones. */
export function revisarTexto(texto, ruta = "") {
  const r = ruta.replaceAll("\\", "/");
  const esRecetas = r.endsWith(RECETAS);
  // ui/ son los primitivos de shadcn: sus tamaños internos (text-xs en un badge) se migran aparte (docs §3 «Pendientes»).
  const esUi = r.includes("src/components/ui/");
  const hallazgos = [];
  texto.split("\n").forEach((linea, i) => {
    if (linea.includes("tipografia-ok")) return;
    for (const { patron, mensaje, salvoRecetas, salvoUi } of REGLAS) {
      if (salvoRecetas && esRecetas) continue;
      if (salvoUi && esUi) continue;
      if (patron.test(linea)) hallazgos.push({ linea: i + 1, mensaje });
    }
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
      for (const h of revisarTexto(readFileSync(archivo, "utf8"), relative(ROOT, archivo))) {
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
