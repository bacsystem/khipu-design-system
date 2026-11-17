#!/usr/bin/env node
// Falla si algún par texto/fondo baja de 4.5 (WCAG AA) o un indicador no textual (anillo de foco) baja de 3, en las
// 20 combinaciones de apariencia: 5 paletas × (claro + 3 tonos oscuros) de src/styles/tokens.css. Resuelve var() y
// color-mix(in srgb, …) igual que el navegador; un color translúcido se compone sobre su fondo antes de medir.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MINIMO = 4.5;
const MINIMO_NO_TEXTO = 3;

export const PALETAS = ["lima", "indigo", "oceano", "coral", "violeta"];
export const TONOS = ["medianoche", "grafito", "tintado"];
const selectorPaleta = (p) => `html:root[data-paleta="${p}"]`;
const selectorTono = (t) => `html:root.dark[data-oscuro="${t}"]`;

export const PARES = [
  ["--foreground", "--background"],
  ["--foreground", "--card"],
  ["--muted-foreground", "--background"],
  ["--muted-foreground", "--card"],
  ["--muted-foreground", "--popover"],
  ["--muted-foreground", "--secondary"],
  ["--texto-terciario", "--background"],
  ["--texto-terciario", "--card"],
  ["--texto-terciario", "--secondary"],
  ["--texto-terciario", "--popover"],
  ["--primary-foreground", "--primary"],
  ["--accent-foreground", "--accent"],
  ["--acento-texto", "--acento"],
  ["--acento-2-texto", "--acento-2"],
  ["--acento-superficie-texto", "--acento-superficie"],
  ["--destructive-foreground", "--destructive"],
  ["--destructive-texto", "--destructive-suave"],
  ["--destructive-texto", "--card"],
  ["--success-foreground", "--success"],
  ["--warning-foreground", "--warning"],
  ["--info-foreground", "--info"],
  // Chip sólido (`Chip solido`): el color del texto del tono hace de fondo y el tinte de texto.
  ["--success", "--success-foreground"],
  ["--warning", "--warning-foreground"],
  ["--info", "--info-foreground"],
  ["--background", "--foreground"],
  ["--sidebar-foreground", "--sidebar"],
  ["--sidebar-primary-foreground", "--sidebar-primary"],
  ["--sidebar-accent-foreground", "--sidebar-accent"],
  ["--codigo-foreground", "--codigo"],
  // `valorConTono` de Metrica/Kpi pinta el valor y la ayuda en el color del tono sobre la tarjeta y, dentro de otra tarjeta, sobre `--secondary`.
  ["--success-foreground", "--card"],
  ["--success-foreground", "--secondary"],
  ["--warning-foreground", "--card"],
  ["--warning-foreground", "--secondary"],
  ["--destructive-texto", "--secondary"],
];
// El tono `acento` de una métrica usa `--acento-2-texto` en claro y `--acento-2` en oscuro (`dark:`).
export const PARES_CLARO = [
  ["--acento-2-texto", "--card"],
  ["--acento-2-texto", "--secondary"],
];
export const PARES_OSCURO = [
  ["--acento-2", "--card"],
  ["--acento-2", "--secondary"],
];
// Series contiguas de una composición (apiladas, dona): distancia mínima OKLab ×100 entre sus bordes (`--chart-trazo-*`).
// Con el hueco de 2 px entre segmentos hay frontera de todos modos; esto garantiza que se distingan por color.
export const DELTA_E_MINIMO = 7.5;
export const TRAZO_POR_INDICE = ["--chart-trazo-base", "--chart-trazo-destacado", "--chart-trazo-3", "--chart-trazo-4", "--chart-trazo-5"];
// Indicadores no textuales (≥ 3:1): el anillo de foco y el borde de las marcas de gráfico (sus rellenos pastel no llegan).
export const PARES_NO_TEXTO = [
  ["--ring", "--card"],
  ["--info-foreground", "--info"], // punto de la PillEstado info
  ["--chart-trazo-base", "--card"],
  ["--chart-trazo-destacado", "--card"],
  ["--chart-trazo-3", "--card"],
  ["--chart-trazo-4", "--card"],
  ["--chart-trazo-5", "--card"],
];

function luminanciaRgb({ r, g, b }) {
  const [R, G, B] = [r, g, b].map((v) => v / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function desdeHex(hex) {
  const h = hex.replace("#", "");
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 };
}

function razon(a, b) {
  const [claro, oscuro] = [luminanciaRgb(a), luminanciaRgb(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Razón de contraste WCAG entre dos colores `#rrggbb`. */
export function contraste(a, b) {
  return razon(desdeHex(a), desdeHex(b));
}

/** Variables `--x: valor;` del primer bloque cuyo selector empieza una línea (`:root {`, `.dark {`, `html…[data-paleta="x"] {`). */
export function leerBloque(css, selector) {
  const texto = `\n${css}`;
  const inicio = texto.indexOf(`\n${selector} {`);
  if (inicio === -1) throw new Error(`No se encontró el bloque ${selector}`);
  const fin = texto.indexOf("\n}", inicio + 1);
  const vars = new Map();
  for (const m of texto.slice(inicio, fin).matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
  return vars;
}

/** Separa los argumentos de una función CSS por las comas de primer nivel. */
function argumentos(texto) {
  const partes = [];
  let nivel = 0;
  let actual = "";
  for (const ch of texto) {
    if (ch === "(") nivel++;
    if (ch === ")") nivel--;
    if (ch === "," && nivel === 0) {
      partes.push(actual.trim());
      actual = "";
    } else actual += ch;
  }
  partes.push(actual.trim());
  return partes;
}

function resolverValor(valor, vars, pila) {
  const v = valor.trim();
  if (v === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  if (/^#[0-9a-f]{6}$/i.test(v)) return desdeHex(v);
  const rgba = v.match(/^rgba?\(([^)]+)\)$/i);
  if (rgba) {
    const [r, g, b, a = "1"] = rgba[1].split(",").map((x) => x.trim());
    return { r: Number(r), g: Number(g), b: Number(b), a: Number(a) };
  }
  const variable = v.match(/^var\((--[\w-]+)\)$/);
  if (variable) return resolverColor(variable[1], vars, pila);
  const mezcla = v.match(/^color-mix\(in srgb,\s*(.+)\)$/i);
  if (mezcla) {
    const [uno, dos] = argumentos(mezcla[1]);
    const conPeso = (arg) => {
      const m = arg.match(/^(.*?)\s+([\d.]+)%$/);
      return m ? { color: m[1], peso: Number(m[2]) / 100 } : { color: arg, peso: null };
    };
    const a1 = conPeso(uno);
    const a2 = conPeso(dos);
    const p1 = a1.peso ?? (a2.peso != null ? 1 - a2.peso : 0.5);
    const p2 = 1 - p1;
    const c1 = resolverValor(a1.color, vars, pila);
    const c2 = resolverValor(a2.color, vars, pila);
    // color-mix interpola con alfa premultiplicado.
    const a = c1.a * p1 + c2.a * p2;
    const canal = (k) => (a === 0 ? 0 : (c1[k] * c1.a * p1 + c2[k] * c2.a * p2) / a);
    return { r: canal("r"), g: canal("g"), b: canal("b"), a };
  }
  throw new Error(`Valor de color no soportado: ${v}`);
}

/** Color `{ r, g, b, a }` de la variable `nombre`, resolviendo var() y color-mix(). */
export function resolverColor(nombre, vars, pila = []) {
  if (pila.includes(nombre)) throw new Error(`Referencia circular: ${[...pila, nombre].join(" → ")}`);
  const valor = vars.get(nombre);
  if (valor == null) throw new Error(`Falta ${nombre}`);
  return resolverValor(valor, vars, [...pila, nombre]);
}

function sobre(color, fondo) {
  const a = color.a;
  return { r: color.r * a + fondo.r * (1 - a), g: color.g * a + fondo.g * (1 - a), b: color.b * a + fondo.b * (1 - a), a: 1 };
}

/** Un fondo translúcido se ve sobre la tarjeta, y la tarjeta sobre el lienzo. */
function fondoOpaco(nombre, vars) {
  const lienzo = resolverColor("--background", vars);
  if (nombre === "--background") return lienzo;
  const tarjeta = sobre(resolverColor("--card", vars), lienzo);
  if (nombre === "--card") return tarjeta;
  return sobre(resolverColor(nombre, vars), tarjeta);
}

/** Las 20 combinaciones `{ nombre, vars }`: cada bloque solo sobrescribe, lo que no define lo hereda. */
export function combinaciones(css) {
  const raiz = leerBloque(css, ":root");
  const oscuro = leerBloque(css, ".dark");
  const lista = [];
  for (const p of PALETAS) {
    const paleta = p === "lima" ? new Map() : leerBloque(css, selectorPaleta(p));
    lista.push({ nombre: `claro/${p}`, vars: new Map([...raiz, ...paleta]) });
    for (const t of TONOS) {
      const tono = t === "medianoche" ? new Map() : leerBloque(css, selectorTono(t));
      lista.push({ nombre: `oscuro-${t}/${p}`, vars: new Map([...raiz, ...paleta, ...oscuro, ...tono]) });
    }
  }
  return lista;
}

const lineal = (v) => ((v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function oklab({ r, g, b }) {
  const [R, G, B] = [lineal(r), lineal(g), lineal(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
/** Distancia OKLab ×100 entre dos colores (ya sobre la tarjeta). */
export function deltaE(a, b) {
  const [A, B] = [oklab(a), oklab(b)];
  return 100 * Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
}

/** `ORDEN_COMPOSICION` de `lib/escala-grafico.ts` (el script es .mjs y no importa .ts). */
export function leerOrdenComposicion(fuente) {
  const m = fuente.match(/ORDEN_COMPOSICION\s*=\s*\[([\d,\s]+)\]/);
  if (!m) throw new Error("No se encontró ORDEN_COMPOSICION en lib/escala-grafico.ts");
  return m[1].split(",").map((n) => Number(n.trim()));
}

/** Pares de índices contiguos de una composición (sin cerrar el círculo: la primera y la última no se tocan). */
export function paresContiguos(orden) {
  return orden.slice(1).map((o, i) => [orden[i], o]);
}

function medir(combo, texto, fondo) {
  const f = fondoOpaco(fondo, combo.vars);
  return razon(sobre(resolverColor(texto, combo.vars), f), f);
}

function principal() {
  const css = readFileSync(join(ROOT, "src", "styles", "tokens.css"), "utf8");
  const errores = [];
  let pares = 0;
  const orden = leerOrdenComposicion(readFileSync(join(ROOT, "src", "lib", "escala-grafico.ts"), "utf8"));
  for (const combo of combinaciones(css)) {
    const claro = combo.nombre.startsWith("claro");
    for (const [i, j] of paresContiguos(orden)) {
      pares++;
      const tarjeta = fondoOpaco("--card", combo.vars);
      const d = deltaE(sobre(resolverColor(TRAZO_POR_INDICE[i], combo.vars), tarjeta), sobre(resolverColor(TRAZO_POR_INDICE[j], combo.vars), tarjeta));
      if (d < DELTA_E_MINIMO) errores.push(`${combo.nombre} series contiguas ${TRAZO_POR_INDICE[i]} / ${TRAZO_POR_INDICE[j]}: ΔE ${d.toFixed(1)} < ${DELTA_E_MINIMO}`);
    }
    for (const [lista, minimo] of [[PARES, MINIMO], [claro ? PARES_CLARO : PARES_OSCURO, MINIMO], [PARES_NO_TEXTO, MINIMO_NO_TEXTO]]) {
      for (const [texto, fondo] of lista) {
        pares++;
        try {
          const c = medir(combo, texto, fondo);
          if (c < minimo) errores.push(`${combo.nombre} ${texto} sobre ${fondo}: ${c.toFixed(2)} < ${minimo}`);
        } catch (e) {
          errores.push(`${combo.nombre} ${texto}/${fondo}: ${e.message}`);
        }
      }
    }
  }
  if (errores.length > 0) {
    console.error(`Contraste fuera de WCAG AA (docs/design-system.md §2):\n${errores.join("\n")}`);
    process.exit(1);
  }
  console.log(`Contraste: ${pares} pares en 20 combinaciones (texto ≥ ${MINIMO}; foco y gráficos ≥ ${MINIMO_NO_TEXTO}).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
