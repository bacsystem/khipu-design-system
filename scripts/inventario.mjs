#!/usr/bin/env node
// Escribe el inventario de componentes (carpeta -> módulos) entre las marcas
//   <!-- generado:componentes -->  ...  <!-- /generado:componentes -->
// de README.md y docs/design-system.md, a partir del mismo recorrido de src/ que usa el registro
// (scripts/build-registry.mjs). Así un PR que añade un componente no edita esas listas.
//
//   node scripts/inventario.mjs           reescribe los bloques
//   node scripts/inventario.mjs --check   falla (exit 1) si algún bloque está desactualizado
//   node scripts/inventario.mjs --check --si-release
//                                         lo mismo, pero solo cuando package.json trae una versión sin tag v<versión>
//                                         (un release en curso). Es lo que corre la CI: los PR normales NO regeneran estas
//                                         listas (dos PR que añaden componentes en la misma carpeta chocarían); las
//                                         regenera el PR de release (ver CONTRIBUTING.md).

import { execFileSync } from "node:child_process";
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { construirRegistro } from "./build-registry.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const ARCHIVOS = ["README.md", "docs/design-system.md"];
export const INICIO = "<!-- generado:componentes -->";
export const FIN = "<!-- /generado:componentes -->";

/** Tabla `| Carpeta | Módulos |` con una fila por carpeta de src/components (y src/lib), en orden alfabético. */
export function generarInventario(items) {
  const grupos = {};
  for (const clave of Object.keys(items)) {
    const partes = clave.split("/"); // components/ui/button | components/providers | lib/utils
    const carpeta = partes.length > 2 ? partes.slice(0, 2).join("/") : partes[0] === "components" ? "components" : partes[0];
    (grupos[carpeta] ??= []).push(partes.at(-1));
  }
  const filas = Object.keys(grupos).sort().map((c) => `| \`${c}\` | ${grupos[c].sort().map((n) => `\`${n}\``).join(", ")} |`);
  return ["| Carpeta | Módulos |", "|---|---|", ...filas].join("\n");
}

/** Sustituye lo que hay entre las marcas; lanza si faltan o están desordenadas. */
export function reemplazarBloque(texto, contenido, nombre = "(archivo)") {
  const i = texto.indexOf(INICIO);
  const f = texto.indexOf(FIN);
  if (i < 0 || f < i) throw new Error(`${nombre}: faltan las marcas ${INICIO} ... ${FIN}.`);
  return `${texto.slice(0, i + INICIO.length)}\n${contenido}\n${texto.slice(f)}`;
}

/** Un release está en curso si el tag v<versión> aún no existe (`lsRemote` = salida de `git ls-remote --tags origin refs/tags/v<versión>`). */
export function releaseEnCurso(lsRemote) {
  return lsRemote.trim() === "";
}

function ejecutar(comprobar, soloSiRelease) {
  if (soloSiRelease) {
    const version = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
    const remoto = execFileSync("git", ["ls-remote", "--tags", "origin", `refs/tags/v${version}`], { cwd: ROOT, encoding: "utf8" });
    if (!releaseEnCurso(remoto)) {
      console.log(`v${version} ya tiene tag: no es un release, el inventario se regenera en el PR de release. Nada que comprobar.`);
      return;
    }
    console.log(`v${version} no tiene tag: es un release, se comprueba el inventario.`);
  }
  const bloque = generarInventario(construirRegistro());
  const desactualizados = [];
  for (const archivo of ARCHIVOS) {
    const ruta = join(ROOT, archivo);
    const actual = readFileSync(ruta, "utf8");
    const nuevo = reemplazarBloque(actual, bloque, archivo);
    if (nuevo === actual) continue;
    desactualizados.push(archivo);
    if (!comprobar) writeFileSync(ruta, nuevo);
  }
  if (comprobar && desactualizados.length) {
    console.error(`::error::El inventario de componentes de ${desactualizados.join(", ")} está desactualizado: ejecuta 'npm run docs:build' en el PR de release y sube el resultado.`);
    process.exit(1);
  }
  console.log(comprobar ? "Inventario de componentes al día." : `Inventario actualizado (${desactualizados.length} archivo(s) cambiados).`);
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  ejecutar(process.argv.includes("--check"), process.argv.includes("--si-release"));
}
