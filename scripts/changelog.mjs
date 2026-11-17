#!/usr/bin/env node
// Changelog por fragmentos: cada PR añade changelog.d/<slug>.md en vez de editar CHANGELOG.md, así dos PRs
// nunca tocan la misma línea. El PR de release junta los fragmentos en una sección fechada y los borra.
//
//   node scripts/changelog.mjs check                       valida los fragmentos (formato) y que CHANGELOG.md no tenga [Unreleased]
//   node scripts/changelog.mjs release [X.Y.Z] [--date YYYY-MM-DD]
//                                                          arma `## [X.Y.Z] - fecha` en CHANGELOG.md y borra los fragmentos
//   node scripts/changelog.mjs pr-check --base <ref> [--sin-changelog]
//                                                          falla si el PR cambia src/ sin añadir un fragmento
//
// Formato de un fragmento: Markdown con una sección `### <Tipo>` por tipo (Added, Changed, Fixed, Removed,
// Deprecated, Security) y debajo las viñetas tal como irán en el CHANGELOG. Sin dependencias.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const TIPOS = ["Added", "Changed", "Deprecated", "Removed", "Fixed", "Security"];
const DIR_FRAGMENTOS = "changelog.d";
const SEMVER = /^\d+\.\d+\.\d+$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** Parsea un fragmento a { Tipo: texto }. Lanza con el nombre del archivo si el formato no es válido. */
export function parsearFragmento(texto, nombre = "(fragmento)") {
  const secciones = {};
  let tipo = null;
  let enCodigo = false;
  for (const linea of texto.replace(/\r\n/g, "\n").split("\n")) {
    if (/^\s*(```|~~~)/.test(linea)) enCodigo = !enCodigo;
    const h = enCodigo ? null : /^(#{1,6})\s+(.*?)\s*$/.exec(linea);
    if (h && h[1].length <= 3) {
      if (h[1].length !== 3 || !TIPOS.includes(h[2])) {
        throw new Error(`${nombre}: encabezado "${linea}" no válido; usa "### " + uno de ${TIPOS.join(", ")}.`);
      }
      if (h[2] in secciones) throw new Error(`${nombre}: la sección "### ${h[2]}" está repetida.`);
      tipo = h[2];
      secciones[tipo] = [];
    } else if (tipo) {
      secciones[tipo].push(linea);
    } else if (linea.trim() !== "") {
      throw new Error(`${nombre}: hay texto antes del primer "### <Tipo>" (${TIPOS.join(", ")}).`);
    }
  }
  const resultado = {};
  for (const [t, lineas] of Object.entries(secciones)) {
    const cuerpo = lineas.join("\n").trim();
    if (!cuerpo) throw new Error(`${nombre}: la sección "### ${t}" está vacía.`);
    resultado[t] = cuerpo;
  }
  if (!Object.keys(resultado).length) throw new Error(`${nombre}: no tiene ninguna sección "### <Tipo>".`);
  return resultado;
}

/** Junta fragmentos [{nombre, texto}] (orden de `nombre`) en el cuerpo de una sección de versión. */
export function ensamblar(fragmentos) {
  const porTipo = {};
  for (const { nombre, texto } of [...fragmentos].sort((a, b) => (a.nombre < b.nombre ? -1 : a.nombre > b.nombre ? 1 : 0))) {
    for (const [tipo, cuerpo] of Object.entries(parsearFragmento(texto, nombre))) (porTipo[tipo] ??= []).push(cuerpo);
  }
  return TIPOS.filter((t) => porTipo[t]).map((t) => `### ${t}\n${porTipo[t].join("\n")}`).join("\n\n");
}

/** Inserta `## [version] - fecha` antes de la primera sección de versión del CHANGELOG. */
export function insertarSeccion(changelog, version, fecha, cuerpo) {
  if (!SEMVER.test(version)) throw new Error(`versión "${version}" no es X.Y.Z.`);
  if (!FECHA.test(fecha)) throw new Error(`fecha "${fecha}" no es YYYY-MM-DD.`);
  if (changelog.includes(`## [${version}]`)) throw new Error(`CHANGELOG.md ya tiene una sección ## [${version}].`);
  const m = /^## \[/m.exec(changelog);
  const pos = m ? m.index : changelog.length;
  const antes = changelog.slice(0, pos).replace(/\s*$/, "\n\n");
  return `${antes}## [${version}] - ${fecha}\n\n${cuerpo}\n${m ? "\n" + changelog.slice(pos) : ""}`;
}

export function listarFragmentos(raiz = ROOT) {
  const dir = join(raiz, DIR_FRAGMENTOS);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".md") && n.toLowerCase() !== "readme.md")
    .sort()
    .map((nombre) => ({ nombre, texto: readFileSync(join(dir, nombre), "utf8") }));
}

/** [Unreleased] ya no existe: lo que está por salir vive en changelog.d/. */
export function validarChangelog(changelog) {
  if (/^## \[Unreleased\]/im.test(changelog)) {
    throw new Error("CHANGELOG.md no debe tener '## [Unreleased]': añade un fragmento en changelog.d/ (ver CONTRIBUTING.md).");
  }
}

/** true si `package.json` solo difiere en `version` (lo que hace el PR de release). */
export function soloCambiaVersion(base, cabeza) {
  const sinVersion = (t) => {
    const { version: _v, ...resto } = JSON.parse(t);
    return JSON.stringify(resto);
  };
  return sinVersion(base) === sinVersion(cabeza);
}

/**
 * Regla del PR: si cambia algo que llega al consumidor debe añadir (estado A) un fragmento, salvo opt-out. Cuenta:
 * cualquier cambio en src/ (también borrados), en cli/ (viaja en el paquete) y en package.json salvo que solo cambie `version`.
 * `cambios` = líneas de `git diff --name-status` ("A\tchangelog.d/x.md", "M\tsrc/..."); un rename "R100\told\tnew" cuenta por ambas rutas.
 */
export function necesitaFragmento(cambios, { sinChangelog = false, packageSoloVersion = false } = {}) {
  const entradas = cambios.map((l) => l.trim()).filter(Boolean).map((l) => {
    const [estado, ...rutas] = l.split("\t");
    return { estado: estado[0], rutas };
  });
  const visible = (r) => r.startsWith("src/") || r.startsWith("cli/") || (r === "package.json" && !packageSoloVersion);
  const tocaVisible = entradas.some((e) => e.rutas.some(visible));
  const anade = entradas.some((e) => "AR".includes(e.estado) && /^changelog\.d\/(?!README\.md$)[^/]+\.md$/i.test(e.rutas.at(-1)));
  if (!tocaVisible || anade || sinChangelog) return { ok: true };
  return {
    ok: false,
    motivo:
      "el PR cambia src/, cli/ o package.json (o borra algo de src/) pero no añade un changelog.d/<slug>.md nuevo (editar uno existente no cuenta: añade otro). Si no cambia nada visible para quien consume el kit, ponle la etiqueta 'sin-changelog'.",
  };
}

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function ejecutar(argv) {
  const [cmd, ...resto] = argv;
  const opcion = (n) => (resto.includes(n) ? resto[resto.indexOf(n) + 1] : undefined);
  const ruta = join(ROOT, "CHANGELOG.md");
  if (cmd === "check") {
    validarChangelog(readFileSync(ruta, "utf8"));
    const frags = listarFragmentos();
    ensamblar(frags);
    console.log(`changelog.d: ${frags.length} fragmento(s) válidos.`);
  } else if (cmd === "release") {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).version;
    const version = resto.find((a) => SEMVER.test(a)) ?? pkg;
    if (version !== pkg) throw new Error(`la versión ${version} no coincide con package.json (${pkg}): súbela primero.`);
    const changelog = readFileSync(ruta, "utf8");
    validarChangelog(changelog);
    const frags = listarFragmentos();
    if (!frags.length) throw new Error("no hay fragmentos en changelog.d/: nada que publicar.");
    writeFileSync(ruta, insertarSeccion(changelog, version, opcion("--date") ?? hoy(), ensamblar(frags)));
    for (const f of frags) rmSync(join(ROOT, DIR_FRAGMENTOS, f.nombre));
    console.log(`CHANGELOG.md: sección ${version} con ${frags.length} fragmento(s); fragmentos borrados.`);
  } else if (cmd === "pr-check") {
    const base = opcion("--base");
    if (!base) throw new Error("falta --base <ref>.");
    const salida = execFileSync("git", ["diff", "--name-status", `${base}...HEAD`], { cwd: ROOT, encoding: "utf8" });
    const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
    const packageSoloVersion = soloCambiaVersion(git("show", `${base}:package.json`), readFileSync(join(ROOT, "package.json"), "utf8"));
    const r = necesitaFragmento(salida.split("\n"), { sinChangelog: resto.includes("--sin-changelog"), packageSoloVersion });
    if (!r.ok) throw new Error(r.motivo);
    console.log("Changelog: OK.");
  } else {
    throw new Error("uso: changelog.mjs check | release [X.Y.Z] [--date YYYY-MM-DD] | pr-check --base <ref> [--sin-changelog]");
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  try {
    ejecutar(process.argv.slice(2));
  } catch (e) {
    console.error(`::error::${e.message}`);
    process.exit(1);
  }
}
