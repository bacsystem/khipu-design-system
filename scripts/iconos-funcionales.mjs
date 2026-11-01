#!/usr/bin/env node
// Aplica la regla de iconos (docs/design-system.md «Iconos»): los funcionales (caret, check, cerrar, más/menos,
// flechas, ⋯, lupa, copiar, refrescar, spinner, hamburguesa) van en bold; el duotono queda para los semánticos.
// Agrega weight="bold" a cada <Icono …> funcional que no traiga un `weight`. Idempotente.
// Uso: node scripts/iconos-funcionales.mjs [carpetas…]   (por defecto: src)

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const FUNCIONALES = [
  "ArrowClockwiseIcon",
  "ArrowDownIcon",
  "ArrowDownRightIcon",
  "ArrowUpIcon",
  "ArrowUpRightIcon",
  "ArrowsDownUpIcon",
  "CaretDownIcon",
  "CaretLeftIcon",
  "CaretRightIcon",
  "CaretUpDownIcon",
  "CaretUpIcon",
  "CheckIcon",
  "CircleNotchIcon",
  "CopyIcon",
  "DotsThreeIcon",
  "ListIcon",
  "MagnifyingGlassIcon",
  "MinusIcon",
  "PlusIcon",
  "XIcon",
];

const ETIQUETA = new RegExp(`<(${FUNCIONALES.join("|")})(?![\\w])([^>]*?)(\\/?)>`, "g");

/** Agrega weight="bold" a las etiquetas de iconos funcionales que no lo tengan. */
export function aplicarPesoFuncional(texto) {
  return texto.replace(ETIQUETA, (completa, nombre, atributos, cierre) => {
    if (/\bweight=/.test(atributos)) return completa;
    return `<${nombre} weight="bold"${atributos}${cierre}>`;
  });
}

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.tsx$/.test(entrada) ? [ruta] : [];
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  let cambiados = 0;
  for (const dir of dirs.length > 0 ? dirs : ["src"]) {
    for (const archivo of listarArchivos(resolve(ROOT, dir))) {
      const antes = readFileSync(archivo, "utf8");
      const despues = aplicarPesoFuncional(antes);
      if (despues !== antes) {
        writeFileSync(archivo, despues);
        cambiados++;
        console.log(relative(ROOT, archivo).replaceAll("\\", "/"));
      }
    }
  }
  console.log(`iconos-funcionales: ${cambiados} archivos.`);
}
