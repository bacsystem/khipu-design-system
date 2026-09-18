#!/usr/bin/env node
// CLI estilo shadcn/ui para copiar componentes de khipu-design-system a un proyecto consumidor,
// sin publicar el design system como paquete npm. Se ejecuta desde una copia local del repo
// (clonado, o vía `npx github:bacsystem/khipu-design-system add <componente>`), y escribe los
// archivos directamente en el `cwd` desde el que se invoca — que debe ser la raíz del proyecto
// consumidor (Next.js + Tailwind v4, con el alias "@/*" -> "./src/*", ver README §Usarlo en tu
// proyecto).
//
// Uso:
//   node cli/khipu.mjs list [categoria]
//   node cli/khipu.mjs add <componente...> [--force]
//
// El registro (registry/registry.json) se genera con `node scripts/build-registry.mjs` a partir
// de los imports reales del código — nunca se edita a mano.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CWD = process.cwd();

function cargarJson(ruta) {
  return JSON.parse(readFileSync(ruta, "utf8"));
}

const registro = cargarJson(join(REPO_ROOT, "registry", "registry.json"));
const pkgKhipu = cargarJson(join(REPO_ROOT, "package.json"));

function porNombre(nombre) {
  const directo = registro.items[nombre];
  if (directo) return [nombre, directo];
  const entrada = Object.entries(registro.items).find(([, item]) => item.name === nombre);
  return entrada ?? [null, null];
}

function resolverConDependencias(nombres) {
  const claves = new Set();
  const pendientes = [...nombres];
  const noEncontrados = [];

  while (pendientes.length) {
    const actual = pendientes.pop();
    const [clave, item] = porNombre(actual);
    if (!item) {
      if (!noEncontrados.includes(actual)) noEncontrados.push(actual);
      continue;
    }
    if (claves.has(clave)) continue;
    claves.add(clave);
    pendientes.push(...item.registryDependencies);
  }
  return { claves: [...claves], noEncontrados };
}

function agruparPorCategoria() {
  const grupos = {};
  for (const item of Object.values(registro.items)) {
    (grupos[item.category] ??= []).push(item.name);
  }
  for (const nombres of Object.values(grupos)) nombres.sort();
  return grupos;
}

function comandoList(filtro) {
  const grupos = agruparPorCategoria();
  const categorias = filtro ? [filtro] : Object.keys(grupos).sort();
  for (const categoria of categorias) {
    const nombres = grupos[categoria];
    if (!nombres) {
      console.log(`Categoría desconocida: "${categoria}". Usa una de: ${Object.keys(grupos).sort().join(", ")}`);
      continue;
    }
    console.log(`\n${categoria}/`);
    for (const nombre of nombres) console.log(`  ${nombre}`);
  }
  console.log(`\n${Object.keys(registro.items).length} componentes en total. Instala con: node cli/khipu.mjs add <nombre> [<nombre>...]`);
}

function comandoAdd(nombres, { force }) {
  if (!nombres.length) {
    console.error("Uso: node cli/khipu.mjs add <componente> [<componente>...] [--force]");
    process.exitCode = 1;
    return;
  }

  const { claves, noEncontrados } = resolverConDependencias(nombres);
  if (noEncontrados.length) {
    console.error(`No se encontró: ${noEncontrados.join(", ")}. Usa "node cli/khipu.mjs list" para ver los nombres disponibles.`);
    process.exitCode = 1;
    return;
  }

  const copiados = [];
  const saltados = [];
  const dependenciasNpm = new Set();

  for (const clave of claves) {
    const item = registro.items[clave];
    for (const dep of item.dependencies) dependenciasNpm.add(dep);
    for (const archivo of item.files) {
      const origen = join(REPO_ROOT, archivo);
      const destino = join(CWD, archivo);
      if (existsSync(destino) && !force) {
        saltados.push(archivo);
        continue;
      }
      mkdirSync(dirname(destino), { recursive: true });
      writeFileSync(destino, readFileSync(origen));
      copiados.push(archivo);
    }
  }

  console.log(`\nComponentes resueltos (con dependencias): ${claves.map((c) => registro.items[c].name).join(", ")}\n`);
  if (copiados.length) {
    console.log("Copiados:");
    for (const f of copiados) console.log(`  + ${f}`);
  }
  if (saltados.length) {
    console.log("\nYa existían (sin tocar — usa --force para sobrescribir):");
    for (const f of saltados) console.log(`  = ${f}`);
  }

  if (dependenciasNpm.size) {
    const conVersion = [...dependenciasNpm].sort().map((dep) => {
      const version = pkgKhipu.dependencies?.[dep];
      return version ? `${dep}@${version}` : dep;
    });
    console.log(`\nInstala las dependencias de npm que falten:\n  npm i ${conVersion.join(" ")}`);
  }

  console.log(
    "\nRecuerda (una sola vez por proyecto, ver README §Usarlo en tu proyecto):" +
      "\n  1. Pega en tu globals.css los bloques de tokens de src/app/globals.css." +
      "\n  2. Envuelve la app con <Providers> y carga las fuentes como en src/app/layout.tsx." +
      '\n  3. Alias "@/*": ["./src/*"] en tsconfig.json.',
  );
}

const [, , comando, ...resto] = process.argv;
const force = resto.includes("--force") || resto.includes("-f");
const argumentos = resto.filter((a) => a !== "--force" && a !== "-f");

switch (comando) {
  case "list":
    comandoList(argumentos[0]);
    break;
  case "add":
    comandoAdd(argumentos, { force });
    break;
  default:
    console.log(
      "khipu-design-system CLI\n\n" +
        "  node cli/khipu.mjs list [categoria]        Lista los componentes disponibles\n" +
        "  node cli/khipu.mjs add <nombre...> [-f]    Copia un componente y sus dependencias a este proyecto\n",
    );
    if (comando) process.exitCode = 1;
}
