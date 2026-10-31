#!/usr/bin/env node
// Falla si algún par texto/fondo del diseño base (bloques `:root` y `.dark` de src/app/globals.css) baja de 4.5 (WCAG AA),
// o si el acento no es el del rediseño 0.3.0. Los diseños alternativos («papel») documentan su contraste en su comentario.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MINIMO = 4.5;
const ACENTO = { ":root": "#5b5bd6", ".dark": "#8585f2" };

export const PARES = [
  ["--foreground", "--background"],
  ["--muted-foreground", "--background"],
  ["--muted-foreground", "--card"],
  ["--muted-foreground", "--popover"],
  ["--muted-foreground", "--secondary"],
  ["--muted-foreground", "--muted"],
  ["--primary-foreground", "--primary"],
  ["--primary", "--background"],
  ["--primary", "--card"],
  ["--accent-foreground", "--accent"],
  ["--destructive-foreground", "--destructive"],
  ["--destructive", "--card"],
  ["--destructive-texto", "--destructive-suave"],
  ["--destructive-texto", "--card"],
  ["--success-foreground", "--success"],
  ["--warning-foreground", "--warning"],
  ["--sidebar-foreground", "--sidebar"],
  ["--sidebar-primary-foreground", "--sidebar-primary"],
  ["--sidebar-accent-foreground", "--sidebar-accent"],
  ["--codigo-foreground", "--codigo"],
];

function luminancia(hex) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razón de contraste WCAG entre dos colores `#rrggbb`. */
export function contraste(a, b) {
  const [claro, oscuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (claro + 0.05) / (oscuro + 0.05);
}

/** Variables `--x: valor;` del primer bloque cuyo selector empieza una línea (`:root {`, `.dark {`). */
export function leerBloque(css, selector) {
  const texto = `\n${css}`;
  const inicio = texto.indexOf(`\n${selector} {`);
  if (inicio === -1) throw new Error(`No se encontró el bloque ${selector}`);
  const fin = texto.indexOf("\n}", inicio + 1);
  const vars = new Map();
  for (const m of texto.slice(inicio, fin).matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars.set(m[1], m[2].trim());
  return vars;
}

function principal() {
  const css = readFileSync(join(ROOT, "src", "app", "globals.css"), "utf8");
  const raiz = leerBloque(css, ":root");
  const errores = [];
  for (const selector of [":root", ".dark"]) {
    // .dark solo sobrescribe: lo que no define lo hereda de :root.
    const vars = selector === ":root" ? raiz : new Map([...raiz, ...leerBloque(css, selector)]);
    if (vars.get("--primary") !== ACENTO[selector]) errores.push(`${selector} --primary es ${vars.get("--primary")}, se esperaba ${ACENTO[selector]}`);
    for (const [texto, fondo] of PARES) {
      const a = vars.get(texto);
      const b = vars.get(fondo);
      if (!a || !b) {
        errores.push(`${selector} falta ${!a ? texto : fondo}`);
        continue;
      }
      if (!/^#[0-9a-f]{6}$/i.test(a) || !/^#[0-9a-f]{6}$/i.test(b)) {
        errores.push(`${selector} ${texto}/${fondo} no son #rrggbb (${a} / ${b})`);
        continue;
      }
      const c = contraste(a, b);
      if (c < MINIMO) errores.push(`${selector} ${texto} sobre ${fondo}: ${c.toFixed(2)} < ${MINIMO}`);
    }
  }
  if (errores.length > 0) {
    console.error(`Contraste fuera de WCAG AA (docs/design-system.md §2):\n${errores.join("\n")}`);
    process.exit(1);
  }
  console.log(`Contraste: ${PARES.length * 2} pares ≥ ${MINIMO}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
