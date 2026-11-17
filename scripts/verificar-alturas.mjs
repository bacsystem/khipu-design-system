#!/usr/bin/env node
// Falla si algún archivo de src/ le cambia la altura a una receta de control con `cn(RECETA, "h-N")`, o si una
// receta de control de lib/estilos.ts deja de medir h-control (34 px). Todos los controles miden lo mismo (docs/design-system.md §4):
// sobrescribir la altura a mano es lo que hace que dos controles de la misma fila terminen midiendo distinto, y el
// consumidor que copia el ejemplo copia también la sobrescritura.
// `h-auto` sí se permite: es el textarea de `Entrada`, que crece con su contenido y no forma fila con nadie.
// Las reglas (RECETAS, ALTURA) viven en cli/reglas.mjs y las comparte la CLI `khipu-ds verificar`.

import { readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ALTURA, RECETAS } from "../cli/reglas.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

/** Hallazgos `{ linea, texto }` de `cn(RECETA, "h-N")` en un texto. */
export function revisarRecetas(texto) {
  const hallazgos = [];
  for (const m of texto.matchAll(RECETAS)) {
    if (!ALTURA.test(m[2])) continue;
    hallazgos.push({ linea: texto.slice(0, m.index).split("\n").length, texto: m[0].replace(/\s+/g, " ").slice(0, 120) });
  }
  return hallazgos;
}

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.(tsx?|jsx?)$/.test(entrada) ? [ruta] : [];
  });
}

function principal() {
  const errores = [];
  for (const archivo of listarArchivos(SRC)) {
    for (const h of revisarRecetas(readFileSync(archivo, "utf8"))) {
      errores.push(`${relative(ROOT, archivo).replaceAll("\\", "/")}:${h.linea}  ${h.texto}`);
    }
  }

  // Altura única de control (§4): toda receta de control de lib/estilos.ts mide h-control. Si alguien sube o baja una,
  // los controles de una misma fila vuelven a desalinearse, así que se verifica la receta misma, no solo sus usos.
  const ESTILOS = join(SRC, "lib", "estilos.ts");
  const textoEstilos = readFileSync(ESTILOS, "utf8");
  // Las recetas se escriben con comillas dobles o con backticks (las que interpolan `${FOCO}`): hay que leer las dos.
  // Excepción explícita: `ACCION_FLOTANTE` es el botón redondo de 56 px de `BarraInferior`; no forma fila con otros controles y por eso mide size-14.
  const SIN_ALTURA_DE_CONTROL = new Set(["ACCION_FLOTANTE"]);
  for (const m of textoEstilos.matchAll(/export const ((?:CAMPO|BOTON_\w+|ACCION_\w+|CONTROL_FILTRO))\s*=\s*\n?\s*(["`])([^"`]*)\2/g)) {
    if (!/(?<![\w-])h-control(?![\w-])/.test(m[3]) && !SIN_ALTURA_DE_CONTROL.has(m[1])) {
      const linea = textoEstilos.slice(0, m.index).split("\n").length;
      errores.push(`src/lib/estilos.ts:${linea}  ${m[1]} no mide h-control (altura única de control)`);
    }
  }

  if (errores.length > 0) {
    console.error(`Alturas fuera de la altura única de control (h-control, 34 px; docs/design-system.md §4):\n${errores.join("\n")}`);
    process.exit(1);
  }
  console.log("Alturas: ninguna receta de control sobrescrita.");
}

if (process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))) principal();
