# Rediseño visual moderno de khipu Implementation Plan

> **For agentic workers:** execute this plan with the
> parallel-plan-executor Workflow (cys:run / the /cys:run-plan command).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernizar la capa visual de khipu al estilo Linear/Vercel (paleta zinc + índigo `#5b5bd6`, Geist, escala tipográfica con nombre, sombras en capas) y sumar movimiento con Motion, sin cambiar la API de ningún componente.

**Architecture:** Los tokens viven en `src/app/globals.css` (claro/oscuro, sombras, escala `--text-*`, curva `--ease-salida`, duraciones `--duracion-*`); las recetas en `src/lib/estilos.ts`; un codemod mecánico barre las clases escritas a mano en `src/components` y `src/app/ejemplo`; los efectos de Motion usan `src/lib/movimiento.ts` como única fuente de resortes y curvas, montados bajo `ProveedorMovimiento` (`LazyMotion` + `domMax` + `MotionConfig reducedMotion="user"`). Dos verificadores nuevos en `npm run lint` impiden volver atrás: tipografía fuera de escala y contraste WCAG bajo 4.5.

**Tech Stack:** Next.js 15.5 (Turbopack) · React 19.1 · Tailwind v4 · base-ui 1.8 · motion ^14.9 · Node 24 (`node --test`, type stripping nativo para `.ts`).

**Spec:** `docs/cys/specs/2026-10-31-rediseno-visual-moderno-design.md`

## Global Constraints

- Ningún componente exportado cambia nombre, props ni tipos; las recetas de `src/lib/estilos.ts` conservan todos sus nombres de export (incluidos los `@deprecated`).
- Todo control interactivo mide `h-9`; nunca `cn(RECETA, "h-N")` (lo verifica `npm run check:alturas`).
- Color solo por token (`bg-card`, `text-muted-foreground`…); nunca hex ni paleta de Tailwind en componentes. Única excepción existente: ninguna nueva.
- Tamaños de texto solo de la escala: `text-etiqueta` (12/16), `text-control` (13/20), `text-cuerpo` (14/20), `text-base` (16), `text-metrica` (24/28). Nada de `text-[Npx]`, `uppercase` ni `tracking-wide(r)` en `src/components`, `src/app/ejemplo` ni `src/lib`.
- Mono (`font-mono`) solo para datos: ids, series, RUC, montos, fechas en celdas, hashes y código. `tabular-nums` en todo número.
- Todo par texto/fondo de `:root` y `.dark` ≥ 4.5 de contraste WCAG (lo verifica `npm run check:contraste`).
- Acento claro `#5b5bd6`, oscuro `#8585f2`. Acción principal de página casi negra (`bg-foreground`); índigo para confirmar formularios.
- Movimiento: solo valores de `src/lib/movimiento.ts` (`RESORTE`, `RESORTE_SUAVE`, `CURVA_SALIDA`, `DURACION`) en Motion, y `ease-salida` + `duration-(--duracion-rapida|media|lenta)` en CSS. Resortes críticamente amortiguados (sin rebote). Componentes que usan Motion importan `m` (no `motion`) de `motion/react`.
- Con «reducir movimiento»: nada se desplaza, escala ni se dibuja; solo quedan fundidos de opacidad.
- Diálogos, sheets, drawers, popovers, menús, selects, combobox, hover-card, tooltip, acordeón y toasts siguen con transiciones CSS de base-ui.
- No ejecutar `cd` ni encadenar con `&&` (CLAUDE.md del usuario): un comando por invocación, rutas desde la raíz del repo.
- Commits en Conventional Commits, en inglés, terminando con la línea `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Cada commit agrega solo los archivos de su tarea con `git add <ruta>`; nunca `git add -A` ni `git add .`.

## Preconditions

- The branch `feat/estilo-notion` must have no uncommitted changes before execution starts: the executor runs tasks in git worktrees created from HEAD, so uncommitted work (the «papel» design system: `src/components/diseno.tsx`, `disenos.ts`, `script-diseno.tsx`, `nav/selector-diseno.tsx`, `patrones/tarjeta-destacada.tsx` and the modified files) would be missing from every worktree. Commit it first as its own commit (e.g. `feat(ds): selectable designs with the «papel» variant`).
- `npm install` has been run (`node_modules` present).

---

### Task 1: Verificadores de tipografía y contraste

**Files:**
- Create: `scripts/verificar-tipografia.mjs`
- Create: `scripts/verificar-contraste.mjs`
- Create: `scripts/tests/verificadores.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: None
- Produces: `scripts/verificar-tipografia.mjs`
- Produces: `scripts/verificar-contraste.mjs`
- Produces: `revisarTexto(texto)`
- Produces: `contraste(a, b)`
- Produces: `leerBloque(css, selector)`
- Produces: `npm run check:tipografia`
- Produces: `npm run check:contraste`
- Produces: `npm test`

- [ ] **Step 1: Write the failing test**

Create `scripts/tests/verificadores.test.mjs`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { contraste, leerBloque } from "../verificar-contraste.mjs";
import { revisarTexto } from "../verificar-tipografia.mjs";

test("marca tamaños sueltos, mayúsculas y tracking ancho", () => {
  const hallazgos = revisarTexto('a "text-[11px] uppercase tracking-wider"\nb "text-control"');
  assert.equal(hallazgos.length, 3);
  assert.ok(hallazgos.every((h) => h.linea === 1));
});

test("respeta la exención tipografia-ok", () => {
  assert.deepEqual(revisarTexto('"uppercase" // tipografia-ok'), []);
});

test("no confunde tracking-tight, text-control ni toUpperCase", () => {
  assert.deepEqual(revisarTexto('"tracking-tight text-control text-sm" x.toUpperCase()'), []);
});

test("contraste WCAG conocido", () => {
  assert.equal(contraste("#ffffff", "#000000").toFixed(2), "21.00");
  assert.equal(contraste("#18181b", "#fbfbfc").toFixed(2), "17.13");
});

test("lee las variables de un bloque", () => {
  const css = ":root {\n  --a: #fff;\n  --b: 1px;\n}\n\n.dark {\n  --a: #000;\n}\n";
  assert.equal(leerBloque(css, ":root").get("--a"), "#fff");
  assert.equal(leerBloque(css, ".dark").get("--a"), "#000");
  assert.equal(leerBloque(css, ".dark").has("--b"), false);
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `node --test scripts/tests/verificadores.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../verificar-contraste.mjs`.

- [ ] **Step 3: Write `scripts/verificar-tipografia.mjs`**

```js
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
```

- [ ] **Step 4: Write `scripts/verificar-contraste.mjs`**

```js
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
```

- [ ] **Step 5: Add the scripts to `package.json`**

Replace the `"scripts"` object with:

```json
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint && npm run check:alturas && npm run check:tipografia && npm run check:contraste",
    "check:alturas": "node scripts/verificar-alturas.mjs",
    "check:tipografia": "node scripts/verificar-tipografia.mjs",
    "check:contraste": "node scripts/verificar-contraste.mjs",
    "test": "node --test \"scripts/tests/*.test.mjs\"",
    "typecheck": "tsc --noEmit",
    "registry:build": "node scripts/build-registry.mjs"
  },
```

- [ ] **Step 6: Run the tests, expect PASS**

Run: `npm test`
Expected: PASS, `# pass 5`, `# fail 0`.

Run: `npm run check:contraste`
Expected: FAIL (exit 1) with `:root --primary es #4f46e5, se esperaba #5b5bd6` — the tokens arrive in Task 2. This failure is correct at this point.

- [ ] **Step 7: Commit**

```
git add scripts/verificar-tipografia.mjs scripts/verificar-contraste.mjs scripts/tests/verificadores.test.mjs package.json
git commit -m "build(ds): add typography and WCAG contrast checks to lint

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Tokens del diseño base

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: `scripts/verificar-contraste.mjs`
- Consumes: `npm run check:contraste`
- Produces: `text-etiqueta`
- Produces: `text-control`
- Produces: `text-cuerpo`
- Produces: `text-metrica`
- Produces: `ease-salida`
- Produces: `--duracion-rapida`
- Produces: `--duracion-media`
- Produces: `--duracion-lenta`
- Produces: `bg-codigo`
- Produces: `text-codigo-foreground`
- Produces: `bg-destructive-suave`
- Produces: `text-destructive-texto`
- Produces: `shadow-xs`
- Produces: `shadow-sm`
- Produces: `shadow-md`
- Produces: `shadow-lg`

- [ ] **Step 1: Confirm the failing check**

Run: `npm run check:contraste`
Expected: FAIL with `:root --primary es #4f46e5, se esperaba #5b5bd6` and `falta --destructive-texto` / `falta --codigo-foreground`.

- [ ] **Step 2: Replace `src/app/globals.css`**

Overwrite the whole file with exactly this content (the «papel» block is unchanged from the current file):

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-heading: var(--font-sans);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive-suave: var(--destructive-suave);
  --color-destructive-texto: var(--destructive-texto);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-success-border: var(--success-border);
  --color-success-solid: var(--success-solid);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --color-warning-border: var(--warning-border);
  --color-warning-solid: var(--warning-solid);
  --color-destructive-border: var(--destructive-border);
  --color-accent-border: var(--accent-border);
  --color-primary-light: var(--primary-light);
  --color-overlay: var(--overlay);
  --color-brand: var(--brand);
  --color-brand-foreground: var(--brand-foreground);
  --color-codigo: var(--codigo);
  --color-codigo-foreground: var(--codigo-foreground);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.5);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  /* Sombras en capas: cambian con el modo (en oscuro llevan un brillo interior de 1 px arriba). */
  --shadow-xs: var(--sombra-xs);
  --shadow-sm: var(--sombra-sm);
  --shadow-md: var(--sombra-md);
  --shadow-lg: var(--sombra-lg);
  /* Escala tipográfica con nombre (docs/design-system.md §3). `npm run check:tipografia` prohíbe los tamaños sueltos. */
  --text-etiqueta: 0.75rem;
  --text-etiqueta--line-height: 1rem;
  --text-control: 0.8125rem;
  --text-control--line-height: 1.25rem;
  --text-cuerpo: 0.875rem;
  --text-cuerpo--line-height: 1.25rem;
  --text-metrica: 1.5rem;
  --text-metrica--line-height: 1.75rem;
  --text-metrica--letter-spacing: -0.02em;
  --text-metrica--font-weight: 600;
  /* Curva de salida única. Debe coincidir con CURVA_SALIDA de src/lib/movimiento.ts. */
  --ease-salida: cubic-bezier(0.16, 1, 0.3, 1);
  /* Barrido de la barra de progreso indeterminada (`ProgresoLineal` sin `valor`). */
  --animate-progreso-indeterminado: progreso-indeterminado 1.4s ease-in-out infinite;
  /* Entrada de contenido: fundido + 8 px hacia arriba. Se usa con `ENTRADA` (lib/estilos.ts), que la protege con `motion-safe:`. */
  /* El retraso (40 ms por posición `--i`) va dentro del atajo: un `animation-delay` aparte lo pisaría este mismo atajo. */
  /* `backwards` y no `both`: al terminar suelta el transform, que si no dejaría un contexto de apilamiento permanente. */
  --animate-entrada: entrada 240ms cubic-bezier(0.16, 1, 0.3, 1) calc(var(--i, 0) * 40ms) backwards;
}

@keyframes entrada {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes progreso-indeterminado {
  0% {
    transform: translateX(-100%);
  }
  60%,
  100% {
    transform: translateX(250%);
  }
}

/*
 * Diseño base «khipu» (0.3.0): estilo Linear/Vercel. Neutros zinc casi monocromos y un solo acento índigo.
 * Contraste WCAG calculado (claro · oscuro), verificado por `npm run check:contraste`:
 * foreground/background 17.13 · 16.81 · muted-foreground/background 5.09 · 7.14 · /card 5.26 · 6.73 · /secondary 4.79 · 6.16
 * primary-foreground/primary 5.37 · 6.21 · accent-foreground/accent 6.30 · 8.42 · destructive-texto/destructive-suave 5.67 · 6.11
 * success 4.93 · 7.96 · warning 4.90 · 9.19 · sidebar-primary 7.31 · 8.42 · codigo 15.08.
 * Las duraciones deben coincidir con DURACION de src/lib/movimiento.ts.
 */
:root {
  --duracion-rapida: 120ms;
  --duracion-media: 200ms;
  --duracion-lenta: 320ms;
  --background: #fbfbfc;
  --foreground: #18181b;
  --card: #ffffff;
  --card-foreground: #18181b;
  --popover: #ffffff;
  --popover-foreground: #18181b;
  --primary: #5b5bd6;
  --primary-foreground: #ffffff;
  --secondary: #f4f4f5;
  --secondary-foreground: #18181b;
  --muted: #f7f7f8;
  --muted-foreground: #6b6b76;
  --accent: #f0f0fd;
  --accent-foreground: #4747c2;
  --destructive: #dc2547;
  --destructive-foreground: #ffffff;
  --destructive-suave: #fdeef1;
  --destructive-texto: #b91c3c;
  --border: #e8e8ec;
  --input: #dedee3;
  --ring: #5b5bd6;
  --success: #edfaf3;
  --success-foreground: #0f7b4f;
  --success-border: rgba(15, 123, 79, 0.18);
  --success-solid: #16a34a;
  --warning: #fef8ec;
  --warning-foreground: #a15c07;
  --warning-border: rgba(161, 92, 7, 0.18);
  --warning-solid: #f59e0b;
  --destructive-border: rgba(220, 37, 71, 0.2);
  --accent-border: rgba(91, 91, 214, 0.22);
  --primary-light: #7373e0;
  --overlay: rgba(10, 10, 15, 0.32);
  --brand: #5b5bd6;
  --brand-foreground: #ffffff;
  --codigo: #0f0f14;
  --codigo-foreground: #e4e4e9;
  --chart-1: #5b5bd6;
  --chart-2: #10b981;
  --chart-3: #f59e0b;
  --chart-4: #e11d48;
  --chart-5: #0ea5e9;
  --radius: 0.5rem;
  --sidebar: #fbfbfc;
  --sidebar-foreground: #3f3f46;
  --sidebar-primary: #ededf5;
  --sidebar-primary-foreground: #3c3cb0;
  --sidebar-accent: #f2f2f4;
  --sidebar-accent-foreground: #18181b;
  --sidebar-border: #e8e8ec;
  --sidebar-ring: #5b5bd6;
  --sombra-xs: 0 1px 2px rgba(16, 16, 24, 0.05);
  --sombra-sm: 0 1px 2px rgba(16, 16, 24, 0.06), 0 1px 3px rgba(16, 16, 24, 0.04);
  --sombra-md: 0 4px 12px -2px rgba(16, 16, 24, 0.08), 0 2px 4px -2px rgba(16, 16, 24, 0.05);
  --sombra-lg: 0 16px 40px -8px rgba(16, 16, 24, 0.16), 0 4px 12px -4px rgba(16, 16, 24, 0.08);
}

.dark {
  --background: #0b0b0f;
  --foreground: #ededf0;
  --card: #131318;
  --card-foreground: #ededf0;
  --popover: #18181e;
  --popover-foreground: #ededf0;
  --primary: #8585f2;
  --primary-foreground: #0b0b0f;
  --secondary: #1c1c22;
  --secondary-foreground: #ededf0;
  --muted: #16161b;
  --muted-foreground: #9b9ba6;
  --accent: #1e1e33;
  --accent-foreground: #b4b4fa;
  --destructive: #fb6f8a;
  --destructive-foreground: #0b0b0f;
  --destructive-suave: #2a1a20;
  --destructive-texto: #fb6f8a;
  --border: rgba(255, 255, 255, 0.08);
  --input: rgba(255, 255, 255, 0.12);
  --ring: #8585f2;
  --success: #0f2a1f;
  --success-foreground: #4fd19a;
  --success-border: rgba(79, 209, 154, 0.25);
  --success-solid: #34d399;
  --warning: #2e2410;
  --warning-foreground: #f2c25c;
  --warning-border: rgba(242, 194, 92, 0.25);
  --warning-solid: #fbbf24;
  --destructive-border: rgba(251, 111, 138, 0.3);
  --accent-border: rgba(133, 133, 242, 0.28);
  --primary-light: #a3a3f7;
  --overlay: rgba(0, 0, 0, 0.6);
  --brand: #8585f2;
  --brand-foreground: #0b0b0f;
  /* Marcas de gráfico en oscuro: pasos más saturados y menos claros que los semánticos (validados para CVD y contraste sobre #111827). */
  --chart-1: #7b72f0;
  --chart-2: #27a070;
  --chart-3: #bf8a26;
  --chart-4: #dc4a68;
  --chart-5: #3a88c6;
  --sidebar: #0b0b0f;
  --sidebar-foreground: #c4c4cc;
  --sidebar-primary: #1e1e33;
  --sidebar-primary-foreground: #b4b4fa;
  --sidebar-accent: #16161b;
  --sidebar-accent-foreground: #ededf0;
  --sidebar-border: rgba(255, 255, 255, 0.08);
  --sidebar-ring: #8585f2;
  --sombra-xs: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.4);
  --sombra-sm: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 3px rgba(0, 0, 0, 0.45);
  --sombra-md: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 24px -4px rgba(0, 0, 0, 0.6);
  --sombra-lg: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 24px 48px -12px rgba(0, 0, 0, 0.7);
}

/*
 * Diseños: bloques que sobrescriben solo los tokens que cambian, activados con <html data-diseno="…"> (components/diseno.tsx).
 * El diseño base «khipu» no tiene bloque: son los tokens de :root y .dark. Cada bloque va acotado con :not(.dark) o .dark
 * para que sus valores claros no le ganen al modo oscuro por especificidad. Heredan del base la tipografía, las sombras,
 * los radios, el movimiento y los tokens que no redefinen (destructive-suave/-texto, codigo).
 *
 * «papel» — derivado del estilo Notion de Refero (https://styles.refero.design/style/2bf4c61f-de10-4614-ba1b-20c0453bd2a9):
 * lienzo cálido con tarjetas blancas encima, bordes de 1 px en vez de sombras, un solo azul de acción y transiciones de 200 ms.
 * Contraste (WCAG, calculado): foreground/background 17.34, muted-foreground/background 5.99, /card 6.53, /secondary 5.63,
 * primary-foreground/primary 4.57, accent-foreground/accent 6.04. Excepción: el azul #0075de de la referencia sobre el lienzo
 * da 4.19 (sobre card, 4.57), por eso el texto sobre fondo de acento usa #005bab; un enlace text-primary sobre el lienzo queda bajo 4.5.
 * Los radios (12 px tarjetas, 8 px botones) ya son los de khipu. --chart-1 no cambia: un segundo azul
 * se confundiría con --chart-5. Los valores de secondary, muted, sidebar y todo el oscuro no vienen de la referencia: Notion
 * no define modo oscuro ni esas superficies, se derivaron del mismo matiz cálido.
 */
html[data-diseno="papel"] {
  --default-transition-duration: 200ms;
  --default-transition-timing-function: ease;
}

html[data-diseno="papel"]:not(.dark) {
  --background: #f6f5f4;
  --foreground: #111111;
  --card-foreground: #111111;
  --popover-foreground: #111111;
  --primary: #0075de;
  --primary-foreground: #ffffff;
  --primary-light: #097fe8;
  --brand: #0075de;
  --brand-foreground: #ffffff;
  --ring: #0075de;
  --secondary: #efeeec;
  --secondary-foreground: #111111;
  --muted: #faf9f8;
  --muted-foreground: #615d59;
  --accent: #e6f3fe;
  --accent-foreground: #005bab;
  --accent-border: rgba(0, 117, 222, 0.25);
  --border: rgba(0, 0, 0, 0.08);
  --input: rgba(0, 0, 0, 0.08);
  --sidebar-foreground: #37332f;
  --sidebar-primary: #e6f3fe;
  --sidebar-primary-foreground: #005bab;
  --sidebar-accent: #f1efee;
  --sidebar-accent-foreground: #111111;
  --sidebar-border: rgba(0, 0, 0, 0.08);
  --sidebar-ring: #0075de;
}

html[data-diseno="papel"].dark {
  --background: #191817;
  --foreground: #f6f5f4;
  --card: #211f1e;
  --card-foreground: #f6f5f4;
  --popover: #211f1e;
  --popover-foreground: #f6f5f4;
  --primary: #62aef0;
  --primary-foreground: #111111;
  --primary-light: #8cc4f4;
  --brand: #62aef0;
  --brand-foreground: #111111;
  --ring: #62aef0;
  --secondary: #2b2927;
  --secondary-foreground: #f6f5f4;
  --muted: #242220;
  --muted-foreground: #a8a29e;
  --accent: #0f2a45;
  --accent-foreground: #9fd0f7;
  --accent-border: rgba(98, 174, 240, 0.3);
  --border: rgba(246, 245, 244, 0.12);
  --input: rgba(246, 245, 244, 0.16);
  --sidebar: #1c1a19;
  --sidebar-foreground: #d6d3d1;
  --sidebar-primary: #0f2a45;
  --sidebar-primary-foreground: #9fd0f7;
  --sidebar-accent: #2b2927;
  --sidebar-accent-foreground: #f6f5f4;
  --sidebar-border: rgba(246, 245, 244, 0.12);
  --sidebar-ring: #62aef0;
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-cuerpo text-foreground;
  }
  html {
    @apply font-sans;
  }
  h1,
  h2,
  h3 {
    @apply font-heading;
  }
}
```

- [ ] **Step 3: Run the check, expect PASS**

Run: `npm run check:contraste`
Expected: PASS, `Contraste: 40 pares ≥ 4.5.`

Run: `npm test`
Expected: PASS, `# fail 0`.

- [ ] **Step 4: Commit**

```
git add src/app/globals.css
git commit -m "feat(ds)!: Linear/Vercel base tokens with named type scale and layered shadows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Tipografía Geist

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: None
- Produces: `--font-sans`
- Produces: `--font-mono`

- [ ] **Step 1: Confirm the current fonts (the "failing" state)**

Run: `node -e "process.exit(/Geist/.test(require('fs').readFileSync('src/app/layout.tsx','utf8'))?0:1)"`
Expected: exit code 1 (layout still loads Inter + JetBrains Mono).

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ScriptDiseno } from "@/components/script-diseno";
import "./globals.css";

// Geist y Geist Mono (Vercel): diseñadas para interfaces densas, con cifras tabulares. Vienen en next/font, sin dependencia extra.
// Las variables --font-sans / --font-mono van en <html> (no en <body>) para que las lea todo el árbol, portales incluidos.
const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", weight: ["400", "500"], subsets: ["latin"] });

export const metadata: Metadata = { title: "Mi aplicación" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <ScriptDiseno />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify, expect PASS**

Run: `node -e "process.exit(/Geist/.test(require('fs').readFileSync('src/app/layout.tsx','utf8'))?0:1)"`
Expected: exit code 0.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```
git add src/app/layout.tsx
git commit -m "feat(ds): switch to Geist and Geist Mono

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Base de Motion

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/lib/movimiento.ts`
- Create: `src/components/movimiento.tsx`
- Modify: `src/components/providers.tsx`
- Create: `scripts/tests/movimiento.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `RESORTE`
- Produces: `RESORTE_SUAVE`
- Produces: `CURVA_SALIDA`
- Produces: `DURACION`
- Produces: `textoContador(valor, opciones)`
- Produces: `OpcionesContador`
- Produces: `ProveedorMovimiento`
- Produces: `motion/react`

- [ ] **Step 1: Write the failing test**

Create `scripts/tests/movimiento.test.mjs`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { CURVA_SALIDA, DURACION, RESORTE, RESORTE_SUAVE, textoContador } from "../../src/lib/movimiento.ts";

// Sin rebote: razón de amortiguamiento ζ = c / (2·√(k·m)) ≥ 1 (docs/design-system.md «Movimiento»).
const amortiguamiento = (r) => r.damping / (2 * Math.sqrt(r.stiffness * r.mass));

test("los resortes no rebotan", () => {
  assert.ok(amortiguamiento(RESORTE) >= 1, `RESORTE ζ=${amortiguamiento(RESORTE)}`);
  assert.ok(amortiguamiento(RESORTE_SUAVE) >= 1, `RESORTE_SUAVE ζ=${amortiguamiento(RESORTE_SUAVE)}`);
});

test("curva y duraciones coinciden con globals.css", () => {
  assert.deepEqual(CURVA_SALIDA, [0.16, 1, 0.3, 1]);
  assert.equal(DURACION.rapida, 0.12);
  assert.equal(DURACION.media, 0.2);
  assert.equal(DURACION.lenta, 0.32);
});

test("textoContador formatea como formato.ts (en-US)", () => {
  assert.equal(textoContador(128430, { prefijo: "S/ " }), "S/ 128,430");
  assert.equal(textoContador(1236.4), "1,236");
  assert.equal(textoContador(98.456, { decimales: 1, sufijo: "%" }), "98.5%");
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `node --test scripts/tests/movimiento.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/lib/movimiento.ts`.

- [ ] **Step 3: Install Motion**

Run: `npm install motion@^14.9.0`
Expected: `package.json` gains `"motion": "^14.9.0"` under `dependencies`; `package-lock.json` updated.

- [ ] **Step 4: Create `src/lib/movimiento.ts`**

```ts
/**
 * Fuente única del movimiento con Motion (docs/design-system.md «Movimiento»). Los primitivos de base-ui animan con CSS
 * usando los mismos valores, declarados en src/app/globals.css: `--ease-salida` = CURVA_SALIDA y `--duracion-*` = DURACION.
 * Si cambias uno, cambia el otro. Los resortes están críticamente amortiguados (ζ ≥ 1): llegan sin rebote.
 */

/** Curva de salida (rápida al inicio, suave al final). Igual a `--ease-salida`. */
export const CURVA_SALIDA: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Duraciones en segundos. `rapida`/`media`/`lenta` = `--duracion-*` de globals.css. */
export const DURACION = { rapida: 0.12, media: 0.2, lenta: 0.32, trazo: 0.6, contador: 0.8 } as const;

/** Resorte de indicadores y piezas que se desplazan (ζ = 1). */
export const RESORTE = { type: "spring", stiffness: 500, damping: 40, mass: 0.8 } as const;

/** Resorte de avances de valor: barras de gráfico, anillo de progreso (ζ ≈ 1.01). */
export const RESORTE_SUAVE = { type: "spring", stiffness: 300, damping: 35, mass: 1 } as const;

export type OpcionesContador = { decimales?: number; prefijo?: string; sufijo?: string };

/** Texto de un número animado: separador de miles en-US (como lib/formato.ts), decimales fijos, prefijo y sufijo. */
export function textoContador(valor: number, { decimales = 0, prefijo = "", sufijo = "" }: OpcionesContador = {}): string {
  const numero = valor.toLocaleString("en-US", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
  return `${prefijo}${numero}${sufijo}`;
}
```

- [ ] **Step 5: Create `src/components/movimiento.tsx`**

```tsx
"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import type { ReactNode } from "react";

/**
 * Habilita Motion en la app. `domMax` y no `domAnimation`: trae las animaciones de layout que necesita `layoutId`
 * (el fondo del ítem activo del sidebar). `strict` hace fallar en desarrollo cualquier `motion.*`: los componentes usan `m.*`,
 * que no carga el bundle completo. `reducedMotion="user"` respeta «reducir movimiento» del sistema.
 * Sin este proveedor los `m.*` renderizan bien pero no animan.
 */
export function ProveedorMovimiento({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
```

- [ ] **Step 6: Replace `src/components/providers.tsx`**

```tsx
"use client";

import { ThemeProvider } from "next-themes";
import { DisenoProvider } from "@/components/diseno";
import { ToastProvider } from "@/components/feedback/toast";
import { TooltipProvider } from "@/components/feedback/tooltip";
import { ProveedorMovimiento } from "@/components/movimiento";

/** attribute="class" pone `.dark` en <html>, que es lo que espera el @custom-variant de globals.css. `DisenoProvider` maneja `data-diseno`. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DisenoProvider>
        <ProveedorMovimiento>
          <TooltipProvider delay={300}>
            <ToastProvider>{children}</ToastProvider>
          </TooltipProvider>
        </ProveedorMovimiento>
      </DisenoProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 7: Run the tests, expect PASS**

Run: `node --test scripts/tests/movimiento.test.mjs`
Expected: PASS, `# pass 3`.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 8: Commit**

```
git add package.json package-lock.json src/lib/movimiento.ts src/components/movimiento.tsx src/components/providers.tsx scripts/tests/movimiento.test.mjs
git commit -m "feat(ds): add Motion with shared springs, curve and durations

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Codemod de estilo y barrido

**Files:**
- Create: `scripts/codemod-estilo.mjs`
- Create: `scripts/tests/codemod.test.mjs`
- Modify: `src/app/ejemplo/galeria.tsx`
- Modify: `src/app/ejemplo/page.tsx`
- Modify: `src/app/ejemplo/tabla.tsx`
- Modify: `src/components/datos/grafico.tsx`
- Modify: `src/components/datos/kpi.tsx`
- Modify: `src/components/datos/lista-datos.tsx`
- Modify: `src/components/datos/tabla-datos.tsx`
- Modify: `src/components/datos/timeline.tsx`
- Modify: `src/components/feedback/alerta.tsx`
- Modify: `src/components/feedback/banner.tsx`
- Modify: `src/components/feedback/estado-vacio.tsx`
- Modify: `src/components/feedback/progreso.tsx`
- Modify: `src/components/feedback/skeleton.tsx`
- Modify: `src/components/feedback/toast.tsx`
- Modify: `src/components/feedback/tooltip.tsx`
- Modify: `src/components/formularios/autocomplete.tsx`
- Modify: `src/components/formularios/campo.tsx`
- Modify: `src/components/formularios/casilla.tsx`
- Modify: `src/components/formularios/combobox.tsx`
- Modify: `src/components/formularios/contrasena.tsx`
- Modify: `src/components/formularios/deslizador.tsx`
- Modify: `src/components/formularios/entrada-fecha.tsx`
- Modify: `src/components/formularios/entrada-monto.tsx`
- Modify: `src/components/formularios/entrada-rango-fechas.tsx`
- Modify: `src/components/formularios/opciones.tsx`
- Modify: `src/components/formularios/stepper-numerico.tsx`
- Modify: `src/components/formularios/zona-archivos.tsx`
- Modify: `src/components/nav/logo.tsx`
- Modify: `src/components/nav/menu-usuario.tsx`
- Modify: `src/components/nav/selector-contexto.tsx`
- Modify: `src/components/nav/selector-diseno.tsx`
- Modify: `src/components/nav/sidebar.tsx`
- Modify: `src/components/nav/sidebar-nav.tsx`
- Modify: `src/components/nav/theme-toggle.tsx`
- Modify: `src/components/nav/top-bar.tsx`
- Modify: `src/components/navegacion/acordeon.tsx`
- Modify: `src/components/navegacion/dialogo-confirmacion.tsx`
- Modify: `src/components/navegacion/menu-acciones.tsx`
- Modify: `src/components/navegacion/paleta.tsx`
- Modify: `src/components/navegacion/panel-lateral.tsx`
- Modify: `src/components/navegacion/pasos.tsx`
- Modify: `src/components/navegacion/tabs.tsx`
- Modify: `src/components/patrones/bloque-codigo.tsx`
- Modify: `src/components/patrones/cabecera-dialogo.tsx`
- Modify: `src/components/patrones/cabecera-seccion.tsx`
- Modify: `src/components/patrones/confirmacion-en-linea.tsx`
- Modify: `src/components/patrones/metricas.tsx`
- Modify: `src/components/patrones/pie-tabla.tsx`
- Modify: `src/components/patrones/pill-estado.tsx`
- Modify: `src/components/patrones/tarjeta-destacada.tsx`
- Modify: `src/components/ui/avatar.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/grupo-botones.tsx`
- Modify: `src/components/ui/hover-card.tsx`
- Modify: `src/components/ui/kbd.tsx`
- Modify: `src/components/ui/menu.tsx`
- Modify: `src/components/ui/popover.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/selector-por-pagina.tsx`
- Modify: `src/components/ui/toolbar.tsx`

**Interfaces:**
- Consumes: `text-etiqueta`
- Consumes: `text-control`
- Consumes: `text-cuerpo`
- Consumes: `ease-salida`
- Consumes: `bg-destructive-suave`
- Consumes: `scripts/verificar-tipografia.mjs`
- Produces: `scripts/codemod-estilo.mjs`
- Produces: `transformar(texto)`

- [ ] **Step 1: Write the failing test**

Create `scripts/tests/codemod.test.mjs`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { transformar } from "../codemod-estilo.mjs";

test("mapea tamaños sueltos a la escala", () => {
  assert.equal(transformar('"text-[10px] text-[11px] text-[11.5px]"'), '"text-etiqueta text-etiqueta text-etiqueta"');
  assert.equal(transformar('"text-[12px] text-[0.8rem]"'), '"text-control text-control"');
  assert.equal(transformar('"text-[13px] font-semibold"'), '"text-cuerpo font-semibold"');
  assert.equal(transformar('"text-[13px] text-foreground"'), '"text-control text-foreground"');
  assert.equal(transformar('"text-[14px] text-[15px]"'), '"text-cuerpo text-base"');
});

test("quita mayúsculas y tracking ancho, salvo tipografia-ok", () => {
  assert.equal(transformar('"text-[11px] font-medium tracking-wider text-muted-foreground uppercase"'), '"text-etiqueta font-medium text-muted-foreground"');
  assert.equal(transformar('"px-1 tracking-wide uppercase"'), '"px-1"');
  assert.equal(transformar('"uppercase" // tipografia-ok'), '"uppercase" // tipografia-ok');
  assert.equal(transformar('"tracking-tight"'), '"tracking-tight"');
});

test("sombras, anillos, curva y rojo suave", () => {
  assert.equal(transformar('"shadow-2xs data-active:shadow-2xs shadow-xl"'), '"shadow-xs data-active:shadow-xs shadow-lg"');
  assert.equal(transformar('"ring-1 ring-foreground/10 ring-foreground/5"'), '"ring-1 ring-border ring-border"');
  assert.equal(transformar('"focus-visible:ring-ring/40"'), '"focus-visible:ring-ring/50"');
  assert.equal(transformar('"duration-150 ease-out"'), '"duration-150 ease-salida"');
  assert.equal(transformar('"bg-destructive/10 hover:bg-destructive/10"'), '"bg-destructive-suave hover:bg-destructive-suave"');
});

test("rojo legible sobre el fondo suave", () => {
  assert.equal(transformar('"bg-destructive/10 text-destructive dark:bg-destructive/20"'), '"bg-destructive-suave text-destructive-texto"');
  assert.equal(transformar('"text-destructive hover:bg-muted"'), '"text-destructive hover:bg-muted"');
});

test("es idempotente", () => {
  const una = transformar('"text-[11px] uppercase shadow-2xs ease-out"');
  assert.equal(transformar(una), una);
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `node --test scripts/tests/codemod.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `../codemod-estilo.mjs`.

- [ ] **Step 3: Create `scripts/codemod-estilo.mjs`**

```js
#!/usr/bin/env node
// Barrido mecánico del rediseño 0.3.0 (docs/cys/specs/2026-10-31-rediseno-visual-moderno-design.md §4.5).
// Idempotente: correrlo dos veces no cambia nada. No toca src/lib (las recetas se reescriben a mano).
// Uso: node scripts/codemod-estilo.mjs [dir…]   (por defecto src/components y src/app/ejemplo)

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POR_DEFECTO = ["src/components", "src/app/ejemplo"];
const B = "(?<![\\w-])"; // inicio de clase
const F = "(?![\\w-])"; // fin de clase

export const REEMPLAZOS = [
  [new RegExp(`${B}text-\\[(?:9|10|11|11\\.5)px\\]`, "g"), "text-etiqueta"],
  [new RegExp(`${B}text-\\[13px\\](\\s+font-semibold)`, "g"), "text-cuerpo$1"],
  [new RegExp(`${B}text-\\[(?:12|13)px\\]`, "g"), "text-control"],
  [new RegExp(`${B}text-\\[0\\.8rem\\]`, "g"), "text-control"],
  [new RegExp(`${B}text-\\[14px\\]`, "g"), "text-cuerpo"],
  [new RegExp(`${B}text-\\[15px\\]`, "g"), "text-base"],
  [new RegExp(` ?${B}tracking-wider?${F}`, "g"), ""],
  [new RegExp(`${B}shadow-2xs${F}`, "g"), "shadow-xs"],
  [new RegExp(`${B}shadow-xl${F}`, "g"), "shadow-lg"],
  [new RegExp(`${B}ring-foreground/(?:10|5)${F}`, "g"), "ring-border"],
  [new RegExp(`${B}focus-visible:ring-ring/40${F}`, "g"), "focus-visible:ring-ring/50"],
  [new RegExp(`${B}ease-out${F}`, "g"), "ease-salida"],
  [new RegExp(`${B}bg-destructive/10${F}`, "g"), "bg-destructive-suave"],
];
const MAYUSCULAS = new RegExp(` ?${B}uppercase${F}`, "g");
// Sobre bg-destructive-suave el rojo base (#dc2547) da 4.25 en claro: en esa línea el texto pasa a destructive-texto,
// y se quita dark:bg-destructive/20, que pisaría al token suave en oscuro.
const TEXTO_ROJO = new RegExp(`${B}text-destructive${F}`, "g");
const FONDO_ROJO_OSCURO = new RegExp(` ?${B}dark:bg-destructive/20${F}`, "g");
function rojoLegible(linea) {
  if (!linea.includes("bg-destructive-suave")) return linea;
  return linea.replace(TEXTO_ROJO, "text-destructive-texto").replace(FONDO_ROJO_OSCURO, "");
}

/** Aplica el barrido a un texto. Las líneas con `tipografia-ok` conservan sus mayúsculas. */
export function transformar(texto) {
  let salida = texto;
  for (const [patron, reemplazo] of REEMPLAZOS) salida = salida.replace(patron, reemplazo);
  return salida
    .split("\n")
    .map((linea) => (linea.includes("tipografia-ok") ? linea : linea.replace(MAYUSCULAS, "")))
    .map(rojoLegible)
    .join("\n");
}

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.tsx?$/.test(entrada) ? [ruta] : [];
  });
}

function principal(dirs) {
  let cambiados = 0;
  for (const dir of dirs) {
    for (const archivo of listarArchivos(resolve(ROOT, dir))) {
      const antes = readFileSync(archivo, "utf8");
      const despues = transformar(antes);
      if (despues === antes) continue;
      writeFileSync(archivo, despues);
      cambiados += 1;
      console.log(relative(ROOT, archivo).replaceAll("\\", "/"));
    }
  }
  console.log(`Codemod: ${cambiados} archivos actualizados.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  principal(args.length > 0 ? args : POR_DEFECTO);
}
```

- [ ] **Step 4: Run the tests, expect PASS**

Run: `node --test scripts/tests/codemod.test.mjs`
Expected: PASS, `# pass 5`.

- [ ] **Step 5: Confirm the sweep is needed (failing check)**

Run: `node scripts/verificar-tipografia.mjs src/components src/app/ejemplo`
Expected: FAIL (exit 1) listing many `tamaño suelto` / `mayúsculas` hits.

- [ ] **Step 6: Run the codemod**

Run: `node scripts/codemod-estilo.mjs`
Expected: prints changed paths and `Codemod: N archivos actualizados.` with N ≤ 63. Every printed path must appear in this task's **Files** list; if one does not, stop and report it instead of committing.

Run it a second time: `node scripts/codemod-estilo.mjs`
Expected: `Codemod: 0 archivos actualizados.` (idempotent).

- [ ] **Step 7: Verify, expect PASS**

Run: `node scripts/verificar-tipografia.mjs src/components src/app/ejemplo`
Expected: PASS, `Tipografía: todo dentro de la escala.`

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run check:alturas`
Expected: `Alturas: ninguna receta de control sobrescrita.`

- [ ] **Step 8: Commit**

```
git add scripts/codemod-estilo.mjs scripts/tests/codemod.test.mjs src/app/ejemplo/galeria.tsx src/app/ejemplo/page.tsx src/app/ejemplo/tabla.tsx src/components/datos/grafico.tsx src/components/datos/kpi.tsx src/components/datos/lista-datos.tsx src/components/datos/tabla-datos.tsx src/components/datos/timeline.tsx src/components/feedback/alerta.tsx src/components/feedback/banner.tsx src/components/feedback/estado-vacio.tsx src/components/feedback/progreso.tsx src/components/feedback/skeleton.tsx src/components/feedback/toast.tsx src/components/feedback/tooltip.tsx src/components/formularios/autocomplete.tsx src/components/formularios/campo.tsx src/components/formularios/casilla.tsx src/components/formularios/combobox.tsx src/components/formularios/contrasena.tsx src/components/formularios/deslizador.tsx src/components/formularios/entrada-fecha.tsx src/components/formularios/entrada-monto.tsx src/components/formularios/entrada-rango-fechas.tsx src/components/formularios/opciones.tsx src/components/formularios/stepper-numerico.tsx src/components/formularios/zona-archivos.tsx src/components/nav/logo.tsx src/components/nav/menu-usuario.tsx src/components/nav/selector-contexto.tsx src/components/nav/selector-diseno.tsx src/components/nav/sidebar.tsx src/components/nav/sidebar-nav.tsx src/components/nav/theme-toggle.tsx src/components/nav/top-bar.tsx src/components/navegacion/acordeon.tsx src/components/navegacion/dialogo-confirmacion.tsx src/components/navegacion/menu-acciones.tsx src/components/navegacion/paleta.tsx src/components/navegacion/panel-lateral.tsx src/components/navegacion/pasos.tsx src/components/navegacion/tabs.tsx src/components/patrones/bloque-codigo.tsx src/components/patrones/cabecera-dialogo.tsx src/components/patrones/cabecera-seccion.tsx src/components/patrones/confirmacion-en-linea.tsx src/components/patrones/metricas.tsx src/components/patrones/pie-tabla.tsx src/components/patrones/pill-estado.tsx src/components/patrones/tarjeta-destacada.tsx src/components/ui/avatar.tsx src/components/ui/badge.tsx src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/dialog.tsx src/components/ui/grupo-botones.tsx src/components/ui/hover-card.tsx src/components/ui/kbd.tsx src/components/ui/menu.tsx src/components/ui/popover.tsx src/components/ui/select.tsx src/components/ui/selector-por-pagina.tsx src/components/ui/toolbar.tsx
git commit -m "refactor(ds): sweep components onto the named type scale, shadows and easing

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```


---

### Task 6: Recetas y Button

**Files:**
- Modify: `src/lib/estilos.ts`
- Modify: `src/components/ui/button.tsx`

**Interfaces:**
- Consumes: `text-control`
- Consumes: `text-etiqueta`
- Consumes: `ease-salida`
- Consumes: `--duracion-rapida`
- Consumes: `shadow-sm`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `FOCO`
- Produces: `SEGMENTO_BASE`
- Produces: `SEGMENTADO`
- Produces: `SEGMENTO`
- Produces: `TARJETA`
- Produces: `POPUP_LISTA`
- Produces: `ANIMACION_POPUP`

- [ ] **Step 1: Confirm the failing check**

Run: `node scripts/verificar-tipografia.mjs src/lib`
Expected: FAIL listing `src/lib/estilos.ts` lines for `TITULO_SECCION` and `ETIQUETA_DATO` (`text-[11px]`, `uppercase`, `tracking-wider`) and the `text-[12px]`/`text-[13px]` recipes.

- [ ] **Step 2: Replace `src/lib/estilos.ts`**

```ts
/**
 * Recetas de clases compartidas (evita copiar la misma cadena en cada componente).
 *
 * Todos los controles miden lo mismo: `h-9` (36 px), la altura única de docs/design-system.md §4. Un botón, un input,
 * un select, un filtro o una acción de fila puestos lado a lado quedan alineados sin pensarlo. Nunca `cn(RECETA, "h-N")`:
 * sobrescribir la altura a mano es justo lo que hace que dos controles de la misma fila terminen midiendo distinto.
 *
 * Texto solo de la escala con nombre (§3): `text-etiqueta` 12, `text-control` 13, `text-cuerpo` 14, `text-metrica` 24.
 * Movimiento: `ease-salida` y `duration-(--duracion-*)`, los mismos valores que src/lib/movimiento.ts usa en Motion.
 */
import type { CSSProperties } from "react";

// ── Movimiento: una sola respuesta al pulsar y una sola entrada de contenido (docs/design-system.md «Movimiento») ──
// Todo va bajo `motion-safe:`: con «reducir movimiento» activado en el sistema no se anima nada.
/** Respuesta al pulsar un control: se hunde unos 0.7 px. */
export const PRESION = "motion-safe:active:scale-[0.98]";
/** Entrada de un bloque al aparecer (fundido + 8 px hacia arriba). Escalona con `style={{ "--i": n }}`: 40 ms por posición (el retraso vive en `--animate-entrada`). */
export const ENTRADA = "motion-safe:animate-entrada";
/** La posición `i` del bloque en la cascada de `ENTRADA`: `style={pasoEntrada(2)}`. */
export const pasoEntrada = (i: number) => ({ "--i": i }) as CSSProperties;

/** Anillo de foco de teclado: 2 px de acento con 2 px de separación del control. */
export const FOCO = "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const TRANSICION_CONTROL = "transition-[color,background-color,border-color,box-shadow,transform] duration-(--duracion-rapida) ease-salida";
const DESHABILITADO = "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

// ── Acciones de página: top bar, barra de filtros, acciones sueltas en tarjetas, alertas o estados vacíos ──
// La principal es casi negra (foreground) para no competir con los colores de estado; el índigo queda para confirmar formularios.
export const ACCION_PRINCIPAL = `inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-control font-medium whitespace-nowrap text-background shadow-xs ${TRANSICION_CONTROL} hover:bg-foreground/85 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const ACCION_SECUNDARIA = `inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-control font-medium whitespace-nowrap text-foreground shadow-xs ${TRANSICION_CONTROL} hover:border-input hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
// Select, buscador y refrescar de una barra de filtros: la misma altura que las acciones de arriba.
export const CONTROL_FILTRO = "h-9 rounded-lg border border-border bg-card text-control font-medium text-foreground shadow-xs";
// Control segmentado de una barra de filtros (Tabs `estilo="segmentado"`, o vistas que son enlaces): caja de h-9 con segmentos de h-7.
// `min-h-9` y no `h-9`: con muchas opciones la caja se parte en filas en vez de desbordarse, y con una sola fila mide igual.
export const SEGMENTADO = "inline-flex min-h-9 w-fit flex-wrap items-center gap-0.5 rounded-lg bg-secondary p-0.5";
/** Segmento sin fondo de activo: para `Tabs`, que pinta el activo con un indicador que se desliza. */
export const SEGMENTO_BASE =
  "relative inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-control font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-active:text-foreground aria-[current=page]:text-foreground";
// El segmento activo se marca con `data-active` (base-ui) o con `aria-current="page"` (un enlace a la vista actual).
// En oscuro el activo usa `input` (blanco translúcido): `card` es más oscuro que `secondary` y el activo se hundiría.
export const SEGMENTO = `${SEGMENTO_BASE} data-active:bg-card data-active:shadow-sm dark:data-active:bg-input aria-[current=page]:bg-card aria-[current=page]:shadow-sm dark:aria-[current=page]:bg-input`;

// ── Formularios: el campo y su CTA ──
export const CAMPO =
  "h-9 w-full rounded-lg border border-input bg-card px-3 text-control text-foreground shadow-xs transition-[border-color,box-shadow] duration-(--duracion-rapida) ease-salida outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";
/** @deprecated Desde 0.2.0 todos los campos miden lo mismo: usa `CAMPO`. Se conserva para no romper imports. */
export const CAMPO_FILTRO = CAMPO;
export const ETIQUETA_CAMPO = "text-control font-medium text-foreground";
export const AYUDA_CAMPO = "text-etiqueta text-muted-foreground";

// disabled:pointer-events-none (igual que ui/button.tsx) es lo que de verdad evita que el :hover del mouse
// que se quedó sobre el botón le gane a disabled:opacity-60 en la cascada; cursor-not-allowed solo no basta.
export const BOTON_PRIMARIO = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-control font-medium text-primary-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-primary/90 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_SECUNDARIO = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-control font-medium text-foreground shadow-xs ${TRANSICION_CONTROL} hover:border-input hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_DESTRUCTIVO = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3.5 text-control font-medium text-destructive-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-destructive/90 ${FOCO} ${PRESION} ${DESHABILITADO}`;

// El pie de diálogo, PanelLateral, TarjetaPaso y Drawer ya no tiene una altura propia: usa los mismos botones.
/** @deprecated Desde 0.2.0 es igual a `BOTON_PRIMARIO`. Se conserva para no romper imports. */
export const BOTON_PRIMARIO_PIE = BOTON_PRIMARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_SECUNDARIO`. Se conserva para no romper imports. */
export const BOTON_SECUNDARIO_PIE = BOTON_SECUNDARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_DESTRUCTIVO`. Se conserva para no romper imports. */
export const BOTON_DESTRUCTIVO_PIE = BOTON_DESTRUCTIVO;

// ── Tarjetas y secciones ──
export const TARJETA = "rounded-xl border border-border bg-card shadow-sm";
export const TITULO_SECCION = "flex items-center gap-1.5 text-etiqueta font-medium text-muted-foreground";
export const ETIQUETA_DATO = "block text-etiqueta font-medium text-muted-foreground";

// Entrada/salida de cualquier popup posicionado contra un disparador (Select, Combobox, Popover, HoverCard…).
export const ANIMACION_POPUP =
  "origin-(--transform-origin) duration-(--duracion-rapida) ease-salida data-[side=bottom]:slide-in-from-top-1 data-[side=inline-end]:slide-in-from-left-1 data-[side=inline-start]:slide-in-from-right-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

// Panel de sugerencias/opciones de un combobox de búsqueda (Combobox, Autocomplete).
export const POPUP_LISTA =
  "max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto rounded-xl bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-border outline-none";
```

- [ ] **Step 3: Update `src/components/ui/button.tsx`**

In the base string of `buttonVariants` (first argument of `cva`), replace:

`text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px`

with:

`text-control font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-(--duracion-rapida) ease-salida outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:active:not-aria-[haspopup]:scale-[0.98]`

In `variant`, replace the `default` and `outline` lines with:

```ts
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        outline:
          "border-border bg-card shadow-xs hover:border-input hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
```

Replace the `destructive` line with:

```ts
        destructive:
          "bg-destructive-suave text-destructive-texto hover:bg-[color-mix(in_oklch,var(--destructive-suave),var(--destructive)_12%)] focus-visible:ring-destructive/40",
```

- [ ] **Step 4: Verify, expect PASS**

Run: `node scripts/verificar-tipografia.mjs src/lib src/components`
Expected: PASS.

Run: `npm run check:alturas`
Expected: `Alturas: ninguna receta de control sobrescrita.`

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```
git add src/lib/estilos.ts src/components/ui/button.tsx
git commit -m "feat(ds): modern recipes with shared focus ring, transitions and SEGMENTO_BASE

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: BotonCopiar y ConfirmacionEnLinea animados

**Files:**
- Modify: `src/components/patrones/boton-copiar.tsx`
- Modify: `src/components/patrones/confirmacion-en-linea.tsx`

**Interfaces:**
- Consumes: `CURVA_SALIDA`
- Consumes: `DURACION`
- Consumes: `motion/react`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `BotonCopiar`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "const f=require('fs');process.exit(['src/components/patrones/boton-copiar.tsx','src/components/patrones/confirmacion-en-linea.tsx'].every(p=>f.readFileSync(p,'utf8').includes('AnimatePresence'))?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Replace `src/components/patrones/boton-copiar.tsx`**

```tsx
"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/** Copia `texto` al portapapeles; el icono gira a un check durante 1.5 s. `className` ajusta tamaño y radio (p. ej. `size-9 rounded-lg`). */
export function BotonCopiar({ texto, titulo = "Copiar", className }: { texto: string; titulo?: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      title={titulo}
      aria-label={copiado ? "Copiado" : titulo}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1500);
        } catch {
          // el navegador puede denegar el acceso al portapapeles; no hay nada más que hacer
        }
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-0.5 text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={copiado ? "copiado" : "copiar"}
          initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
          transition={{ duration: DURACION.rapida, ease: CURVA_SALIDA }}
          className="inline-flex"
        >
          {copiado ? <CheckIcon className="size-3.5 text-success-foreground" /> : <CopyIcon className="size-3.5" />}
        </m.span>
      </AnimatePresence>
    </button>
  );
}
```

- [ ] **Step 3: Replace `src/components/patrones/confirmacion-en-linea.tsx`**

```tsx
"use client";

import { BanIcon, RefreshCwIcon, type LucideIcon } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState, useTransition } from "react";
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

const ACCION =
  "inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-control font-medium whitespace-nowrap transition-colors duration-(--duracion-rapida) ease-salida disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

// La acción sale hacia la izquierda y la confirmación entra desde la derecha (y al revés al cancelar).
const CAMBIO = {
  initial: { opacity: 0, x: 8 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -8 },
  transition: { duration: DURACION.rapida, ease: CURVA_SALIDA },
};

/**
 * Acción irreversible confirmada en línea (sin diálogo): "Revocar" → "¿Revocar de forma permanente? [Sí, revocar] [Cancelar]".
 * `onConfirmar` puede devolver un mensaje de error para mostrarlo debajo.
 */
export function ConfirmacionEnLinea({
  etiqueta,
  pregunta,
  confirmar,
  icon: Icon = BanIcon,
  onConfirmar,
}: {
  etiqueta: string;
  pregunta: string;
  confirmar: string;
  icon?: LucideIcon;
  onConfirmar: () => Promise<string | null | void>;
}) {
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  function ejecutar() {
    setError(null);
    startTransition(async () => {
      const resultado = await onConfirmar();
      if (resultado) {
        setError(resultado);
        return;
      }
      setAbierto(false);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {/* `relative`: `popLayout` saca de flujo el bloque que sale y lo posiciona contra este contenedor. */}
      <div className="relative flex items-center justify-end">
        <AnimatePresence mode="popLayout" initial={false}>
          {abierto ? (
            <m.div key="confirmar" {...CAMBIO} className="flex items-center justify-end gap-1">
              <span className="mr-1 text-etiqueta text-muted-foreground">{pregunta}</span>
              <button type="button" disabled={pendiente} onClick={ejecutar} className={cn(ACCION, "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90")}>
                {pendiente ? <RefreshCwIcon className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}
                {confirmar}
              </button>
              <button type="button" disabled={pendiente} onClick={() => setAbierto(false)} className={cn(ACCION, "border border-border bg-card text-foreground shadow-xs hover:bg-secondary")}>
                Cancelar
              </button>
            </m.div>
          ) : (
            <m.div key="accion" {...CAMBIO}>
              <button type="button" onClick={() => setAbierto(true)} className={cn(ACCION, "text-destructive-texto hover:bg-destructive-suave")}>
                <Icon className="size-3.5" />
                {etiqueta}
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
      {error ? <span className="text-etiqueta text-destructive-texto">{error}</span> : null}
    </div>
  );
}
```

- [ ] **Step 4: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `npm run typecheck`
Expected: no errors.

Run: `node scripts/verificar-tipografia.mjs src/components/patrones`
Expected: PASS.

- [ ] **Step 5: Commit**

```
git add src/components/patrones/boton-copiar.tsx src/components/patrones/confirmacion-en-linea.tsx
git commit -m "feat(ds): animate copy-button icon and inline confirmation swap

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Superficies: pills, código y mono solo para datos

**Files:**
- Modify: `src/components/patrones/pill-estado.tsx`
- Modify: `src/components/patrones/bloque-codigo.tsx`
- Modify: `src/components/patrones/cabecera-seccion.tsx`
- Modify: `src/components/nav/logo.tsx`
- Modify: `src/components/nav/menu-usuario.tsx`
- Modify: `src/components/navegacion/pasos.tsx`
- Modify: `src/components/formularios/zona-archivos.tsx`

**Interfaces:**
- Consumes: `BotonCopiar`
- Consumes: `bg-codigo`
- Consumes: `text-codigo-foreground`
- Consumes: `bg-destructive-suave`
- Consumes: `text-destructive-texto`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `PillEstado`
- Produces: `BloqueCodigo`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "const t=require('fs').readFileSync('src/components/patrones/pill-estado.tsx','utf8');process.exit(/border-success-border|font-mono text-etiqueta font-medium whitespace-nowrap/.test(t)?1:0)"`
Expected: exit code 1 (pills still have border and mono).

- [ ] **Step 2: Replace `src/components/patrones/pill-estado.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tono } from "./metricas";

const ESTILOS: Record<Tono, string> = {
  ok: "bg-success text-success-foreground",
  aviso: "bg-warning text-warning-foreground",
  error: "bg-destructive-suave text-destructive-texto",
  neutro: "bg-secondary text-muted-foreground",
};
const PUNTOS: Record<Tono, string> = {
  ok: "bg-success-solid",
  aviso: "bg-warning-solid",
  error: "bg-destructive",
  neutro: "bg-muted-foreground/50",
};

/** Pill de estado: relleno tenue + punto sólido, sin borde. Verde = OK, ámbar = provisional, rojo = error, neutro = en proceso/inactivo. */
export function PillEstado({ tono, children, className }: { tono: Tono; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap", ESTILOS[tono], className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", PUNTOS[tono])} />
      {children}
    </span>
  );
}

/** Chip informativo (contadores, ids, versiones): mono porque muestra datos. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-etiqueta whitespace-nowrap text-muted-foreground", className)}>
      {children}
    </span>
  );
}

/** Chip de identificador (código de serie, prefijo de llave): mono sobre acento; `inactivo` lo tacha. */
export function ChipCodigo({ children, inactivo, className }: { children: ReactNode; inactivo?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-control font-medium",
        inactivo ? "bg-secondary text-muted-foreground line-through" : "bg-accent text-accent-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Etiqueta "Próximamente". */
export function ChipPronto({ children = "Próximamente" }: { children?: ReactNode }) {
  return <span className="rounded-md bg-secondary px-1.5 py-0.5 text-etiqueta font-medium whitespace-nowrap text-muted-foreground">{children}</span>;
}
```

- [ ] **Step 3: Replace `src/components/patrones/bloque-codigo.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { BotonCopiar } from "@/components/patrones/boton-copiar";
import { cn } from "@/lib/utils";

/**
 * Bloque de código con barra superior (método + URL + slot para pestañas) y cuerpo en `codigo` (casi negro en los dos modos).
 * `tono="claro"` para respuestas/JSON sobre muted.
 */
export function BloqueCodigo({
  codigo,
  metodo,
  url,
  barra,
  pie,
  tono = "oscuro",
  alturaMax = "52vh",
  className,
}: {
  codigo: string;
  metodo?: string;
  url?: string;
  barra?: ReactNode;
  pie?: ReactNode;
  tono?: "oscuro" | "claro";
  alturaMax?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      {metodo || url || barra ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/60 px-4 py-2">
          {/* El verbo HTTP es un literal: se escribe en mayúsculas con toUpperCase, no con la clase `uppercase`. */}
          {metodo ? <span className="rounded-md bg-accent px-1.5 py-0.5 font-mono text-etiqueta font-semibold text-accent-foreground">{metodo.toUpperCase()}</span> : null}
          {url ? <code className="min-w-0 flex-1 truncate font-mono text-control text-foreground">{url}</code> : null}
          {barra}
          <BotonCopiar texto={codigo} className="size-9 rounded-lg" />
        </div>
      ) : null}
      <pre
        style={{ maxHeight: alturaMax }}
        className={cn(
          "overflow-auto p-4 font-mono text-control leading-relaxed",
          tono === "oscuro" ? "bg-codigo text-codigo-foreground" : "bg-muted/50 text-foreground",
        )}
      >
        <code>{codigo}</code>
      </pre>
      {pie ? <div className="border-t border-border px-4 py-2 text-etiqueta text-muted-foreground">{pie}</div> : null}
    </div>
  );
}

/** Control segmentado pequeño (pestañas de lenguaje, filtros por tipo). */
export function Segmentado<T extends string>({ opciones, valor, onCambio, className }: { opciones: Array<{ id: T; etiqueta: string }>; valor: T; onCambio: (v: T) => void; className?: string }) {
  return (
    <div className={cn("inline-flex h-9 shrink-0 items-center gap-0.5 rounded-lg bg-secondary p-0.5", className)}>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onCambio(o.id)}
          className={cn(
            "h-7 rounded-md px-2.5 text-control font-medium transition-colors duration-(--duracion-rapida) ease-salida",
            valor === o.id ? "bg-card text-foreground shadow-sm dark:bg-input" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Drop mono from non-data text in the remaining files**

Run each command (they edit only the named file; each pattern is the post-codemod class string):

```
node -e "const f='src/components/patrones/cabecera-seccion.tsx',fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('truncate font-mono text-etiqueta text-muted-foreground','truncate text-etiqueta text-muted-foreground').replace('px-4 py-2 font-mono text-etiqueta text-muted-foreground','px-4 py-2 text-etiqueta text-muted-foreground'))"
node -e "const f='src/components/nav/logo.tsx',fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('font-mono text-etiqueta font-medium text-primary','text-etiqueta font-medium text-muted-foreground'))"
node -e "const f='src/components/nav/menu-usuario.tsx',fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replaceAll(' font-mono text-etiqueta',' text-etiqueta'))"
node -e "const f='src/components/navegacion/pasos.tsx',fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('<span className=\"font-mono text-etiqueta text-muted-foreground\">','<span className=\"text-etiqueta text-muted-foreground\">'))"
node -e "const f='src/components/formularios/zona-archivos.tsx',fs=require('fs');fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('{ayuda ? <span className=\"font-mono text-etiqueta text-muted-foreground\">','{ayuda ? <span className=\"text-etiqueta text-muted-foreground\">'))"
```

- [ ] **Step 5: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `git diff --stat -- src/components/patrones/cabecera-seccion.tsx src/components/nav/logo.tsx src/components/nav/menu-usuario.tsx src/components/navegacion/pasos.tsx src/components/formularios/zona-archivos.tsx`
Expected: every one of the five files shows a change. If one shows none, open it, find the class string with `font-mono` on non-data text (subtitle, suffix, email, step caption, help) and remove `font-mono` by hand.

Run: `npm run typecheck`
Expected: no errors.

Run: `node scripts/verificar-tipografia.mjs src/components`
Expected: PASS.

- [ ] **Step 6: Commit**

```
git add src/components/patrones/pill-estado.tsx src/components/patrones/bloque-codigo.tsx src/components/patrones/cabecera-seccion.tsx src/components/nav/logo.tsx src/components/nav/menu-usuario.tsx src/components/navegacion/pasos.tsx src/components/formularios/zona-archivos.tsx
git commit -m "feat(ds): borderless pills, codigo surface and mono only for data

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Tabs con indicador que se desliza

**Files:**
- Modify: `src/components/navegacion/tabs.tsx`

**Interfaces:**
- Consumes: `SEGMENTADO`
- Consumes: `SEGMENTO_BASE`
- Consumes: `ease-salida`
- Consumes: `--duracion-media`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `Tabs`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "process.exit(require('fs').readFileSync('src/components/navegacion/tabs.tsx','utf8').includes('TabsPrimitive.Indicator')?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Replace `src/components/navegacion/tabs.tsx`**

```tsx
"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import type { ReactNode } from "react";
import { SEGMENTADO, SEGMENTO_BASE } from "@/lib/estilos";
import { cn } from "@/lib/utils";

export type TabItem<T extends string> = { id: T; etiqueta: ReactNode; contador?: number; disabled?: boolean };

// h-10 fijo (no padding vertical) para que el contador no altere la altura de la fila.
const PESTANA_LINEA =
  "inline-flex h-10 items-center gap-1.5 px-1 text-control font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-active:text-foreground";

// base-ui posiciona el indicador con --active-tab-left/top/width/height; la transición CSS lo desliza entre pestañas.
// `-z-10` dentro de una lista `isolate`: queda sobre el fondo de la lista y debajo del texto de las pestañas.
const INDICADOR_BASE =
  "absolute -z-10 left-(--active-tab-left) w-(--active-tab-width) transition-[left,width,top,height] duration-(--duracion-media) ease-salida motion-reduce:transition-none";
const INDICADOR = {
  linea: cn(INDICADOR_BASE, "-bottom-px h-0.5 rounded-full bg-foreground"),
  segmentado: cn(INDICADOR_BASE, "top-(--active-tab-top) h-(--active-tab-height) rounded-md bg-card shadow-sm dark:bg-input"),
};

/**
 * Pestañas de página. `estilo="segmentado"` es el control en caja de las barras de filtro; `"linea"` es la pestaña subrayada para secciones de detalle.
 * Los paneles se pasan como `render(id)` (`children`) o, desde un Server Component —que no puede pasarle una función a un componente de cliente—, ya
 * armados en `paneles`, uno por id. En los dos casos solo se monta el panel activo.
 */
export function Tabs<T extends string>({
  items,
  valor,
  defaultValor,
  onCambio,
  estilo = "linea",
  children,
  paneles,
  className,
}: {
  items: TabItem<T>[];
  valor?: T;
  defaultValor?: T;
  onCambio?: (v: T) => void;
  estilo?: "linea" | "segmentado";
  children?: (id: T) => ReactNode;
  paneles?: Partial<Record<T, ReactNode>>;
  className?: string;
}) {
  return (
    <TabsPrimitive.Root value={valor} defaultValue={defaultValor ?? items[0]?.id} onValueChange={(v) => onCambio?.(v as T)} className={className}>
      <TabsPrimitive.List className={cn("relative isolate", estilo === "linea" ? "flex items-center gap-4 border-b border-border" : SEGMENTADO)}>
        {items.map((t) => (
          <TabsPrimitive.Tab key={t.id} value={t.id} disabled={t.disabled} className={estilo === "linea" ? PESTANA_LINEA : SEGMENTO_BASE}>
            {t.etiqueta}
            {t.contador != null ? <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-etiqueta text-muted-foreground tabular-nums">{t.contador}</span> : null}
          </TabsPrimitive.Tab>
        ))}
        <TabsPrimitive.Indicator className={INDICADOR[estilo]} />
      </TabsPrimitive.List>
      {items.map((t) => (
        <TabsPrimitive.Panel key={t.id} value={t.id} className="pt-4 outline-none">
          {children ? children(t.id) : paneles?.[t.id]}
        </TabsPrimitive.Panel>
      ))}
    </TabsPrimitive.Root>
  );
}
```

- [ ] **Step 3: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```
git add src/components/navegacion/tabs.tsx
git commit -m "feat(ds): Tabs indicator slides between tabs via base-ui Indicator

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Sidebar con fondo activo que se desliza

**Files:**
- Modify: `src/components/nav/sidebar-nav.tsx`

**Interfaces:**
- Consumes: `RESORTE`
- Consumes: `ProveedorMovimiento`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `SidebarNav`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "process.exit(require('fs').readFileSync('src/components/nav/sidebar-nav.tsx','utf8').includes('layoutId')?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Replace `src/components/nav/sidebar-nav.tsx`**

```tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";
import { RESORTE } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

export type ItemNav = {
  /** Sin `href` el ítem se muestra deshabilitado con la etiqueta `pendiente` (patrón "próximamente"). */
  href?: string;
  label: string;
  icon: LucideIcon;
  /** Texto del chip cuando no hay href (por defecto "Pronto"). */
  pendiente?: string;
  /** Tooltip explicando por qué todavía no está disponible. */
  title?: string;
};

export type GrupoNav = { titulo: string; items: ItemNav[] };

// Sin overflow-hidden: recortaría el fondo activo mientras se desliza desde otro ítem. La etiqueta trunca por su cuenta (min-w-0).
// `isolate` deja el fondo activo (-z-10) detrás del icono y del texto.
const ITEM_BASE = "relative isolate flex w-full min-w-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-control";

/** Navegación del sidebar por grupos; el ítem activo se detecta por prefijo de la ruta actual y su fondo se desliza al cambiar. */
export function SidebarNav({ grupos }: { grupos: GrupoNav[] }) {
  const pathname = usePathname();
  // Un layoutId por instancia: el sidebar de escritorio y el del menú móvil no comparten indicador.
  const idIndicador = useId();

  return (
    <nav className="grid w-full grid-cols-1 gap-3 px-2 pt-2">
      {grupos.map((grupo) => (
        <div key={grupo.titulo} className="grid w-full grid-cols-1 gap-0.5">
          <span className="truncate px-2.5 pt-1 pb-1 text-etiqueta font-medium text-muted-foreground">{grupo.titulo}</span>
          {grupo.items.map((item) => {
            const Icono = item.icon;
            if (!item.href) {
              return (
                <span key={item.label} aria-disabled="true" title={item.title ?? `${item.label}: próximamente`} className={cn(ITEM_BASE, "cursor-not-allowed text-muted-foreground/60")}>
                  <Icono className="size-4 shrink-0 text-muted-foreground/50" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 rounded-md bg-secondary px-1.5 py-0.5 text-etiqueta font-medium whitespace-nowrap">{item.pendiente ?? "Pronto"}</span>
                </span>
              );
            }
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  ITEM_BASE,
                  "transition-colors duration-(--duracion-rapida) ease-salida",
                  active ? "font-medium text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                {active ? <m.span layoutId={`${idIndicador}-activo`} aria-hidden transition={RESORTE} className="absolute inset-0 -z-10 rounded-md bg-sidebar-primary" /> : null}
                <Icono className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 4: Commit**

```
git add src/components/nav/sidebar-nav.tsx
git commit -m "feat(ds): sidebar active background slides between items

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Barra de acciones masivas de TablaDatos

**Files:**
- Modify: `src/components/datos/tabla-datos.tsx`

**Interfaces:**
- Consumes: `CURVA_SALIDA`
- Consumes: `DURACION`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `TablaDatos`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "process.exit(require('fs').readFileSync('src/components/datos/tabla-datos.tsx','utf8').includes('AnimatePresence')?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Add imports**

In `src/components/datos/tabla-datos.tsx`, replace:

```tsx
import { useMemo, useState, type ReactNode } from "react";
```

with:

```tsx
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { useMemo, useState, type ReactNode } from "react";
```

and replace:

```tsx
import { POR_PAGINA_DEFECTO } from "@/lib/paginacion";
```

with:

```tsx
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";
import { POR_PAGINA_DEFECTO } from "@/lib/paginacion";
```

- [ ] **Step 3: Read the reduced-motion preference**

Find the line `  const seleccionados = seleccion?.seleccionados ?? [];` and insert directly above it:

```tsx
  // La altura no es una transformación: MotionConfig no la anula con «reducir movimiento», así que se corta aquí.
  const reducir = useReducedMotion();
```

- [ ] **Step 4: Animate the bar**

Replace this block (post-codemod text):

```tsx
      {seleccion && seleccionados.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-accent/60 px-4 py-2 text-control text-accent-foreground">
```

with:

```tsx
      <AnimatePresence initial={false}>
      {seleccion && seleccionados.length > 0 ? (
        <m.div
          key="barra-masiva"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reducir ? { duration: 0 } : { duration: DURACION.media, ease: CURVA_SALIDA }}
          className="overflow-hidden"
        >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-accent/60 px-4 py-2 text-control text-accent-foreground">
```

Then replace the end of that block:

```tsx
            </button>
          </div>
        </div>
      ) : null}
      <Table>
```

with:

```tsx
            </button>
          </div>
        </div>
        </m.div>
      ) : null}
      </AnimatePresence>
      <Table>
```

- [ ] **Step 5: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `npx prettier --check src/components/datos/tabla-datos.tsx` only if Prettier is installed; otherwise skip. Then run: `npm run typecheck`
Expected: no errors.

Run: `npx eslint src/components/datos/tabla-datos.tsx`
Expected: no errors.

- [ ] **Step 6: Commit**

```
git add src/components/datos/tabla-datos.tsx
git commit -m "feat(ds): bulk-actions bar slides in and out of TablaDatos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: NumeroAnimado, TrazoAnimado, Kpi y Metricas

**Files:**
- Create: `src/components/patrones/numero-animado.tsx`
- Create: `src/components/datos/trazo-animado.tsx`
- Modify: `src/components/datos/kpi.tsx`
- Modify: `src/components/patrones/metricas.tsx`

**Interfaces:**
- Consumes: `textoContador(valor, opciones)`
- Consumes: `OpcionesContador`
- Consumes: `CURVA_SALIDA`
- Consumes: `DURACION`
- Consumes: `text-metrica`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `NumeroAnimado`
- Produces: `TrazoAnimado`
- Produces: `Kpi`
- Produces: `Metrica`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "process.exit(require('fs').existsSync('src/components/patrones/numero-animado.tsx')?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Create `src/components/patrones/numero-animado.tsx`**

```tsx
"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { CURVA_SALIDA, DURACION, textoContador, type OpcionesContador } from "@/lib/movimiento";

/**
 * Número que cuenta desde 0 hasta `valor` al montarse. El HTML del servidor ya trae el valor final (sin desajuste de
 * hidratación) y con «reducir movimiento» no cuenta. Props serializables: se usa también desde un Server Component,
 * como hijo de `Metrica` o como `valor` de `Kpi`. El lector de pantalla oye solo el valor final.
 */
export function NumeroAnimado({ valor, decimales, prefijo, sufijo, className }: { valor: number; className?: string } & OpcionesContador) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducir = useReducedMotion();
  const final = textoContador(valor, { decimales, prefijo, sufijo });

  useEffect(() => {
    const nodo = ref.current;
    if (!nodo || reducir) return;
    const fin = textoContador(valor, { decimales, prefijo, sufijo });
    const control = animate(0, valor, {
      duration: DURACION.contador,
      ease: CURVA_SALIDA,
      onUpdate: (v) => {
        nodo.textContent = textoContador(v, { decimales, prefijo, sufijo });
      },
    });
    return () => {
      control.stop();
      // React no repinta un texto que cree igual: si se corta a mitad de cuenta, se deja el valor final a mano.
      nodo.textContent = fin;
    };
  }, [valor, decimales, prefijo, sufijo, reducir]);

  return (
    <span className={className}>
      <span className="sr-only">{final}</span>
      <span ref={ref} aria-hidden className="tabular-nums">
        {final}
      </span>
    </span>
  );
}
```

- [ ] **Step 3: Create `src/components/datos/trazo-animado.tsx`**

```tsx
"use client";

import { m, useReducedMotion } from "motion/react";
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";

/**
 * Trazo SVG que se dibuja al montarse (`pathLength` 0 → 1). Es de cliente para que `Sparkline` (Server Component) y los
 * gráficos lo usen. Con «reducir movimiento» aparece completo. `retraso` en segundos, para escalonar varias series.
 */
export function TrazoAnimado({ d, stroke, strokeWidth = 2, retraso = 0 }: { d: string; stroke: string; strokeWidth?: number; retraso?: number }) {
  const reducir = useReducedMotion();
  return (
    <m.path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
      initial={reducir ? false : { pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: DURACION.trazo, ease: CURVA_SALIDA, delay: retraso }}
    />
  );
}
```

- [ ] **Step 4: Replace `src/components/datos/kpi.tsx`**

```tsx
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TrazoAnimado } from "@/components/datos/trazo-animado";
import { cn } from "@/lib/utils";

/** Sparkline de una serie (sin ejes): línea de 2px en el color del gráfico 1 que se dibuja al aparecer, área tenue y punto final. */
export function Sparkline({ datos, ancho = 96, alto = 28, className }: { datos: number[]; ancho?: number; alto?: number; className?: string }) {
  if (datos.length < 2) return null;
  const min = Math.min(...datos);
  const max = Math.max(...datos);
  const rango = max - min || 1;
  const px = 2;
  const puntos = datos.map((v, i) => [px + (i / (datos.length - 1)) * (ancho - px * 2), alto - px - ((v - min) / rango) * (alto - px * 2)] as const);
  const linea = puntos.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [ux, uy] = puntos[puntos.length - 1];
  return (
    <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} aria-hidden="true" className={cn("shrink-0 overflow-visible", className)}>
      <path d={`${linea} L${ux.toFixed(1)},${alto} L${px},${alto} Z`} fill="var(--chart-1)" opacity="0.1" />
      <TrazoAnimado d={linea} stroke="var(--chart-1)" />
      <circle cx={ux} cy={uy} r="3" fill="var(--chart-1)" stroke="var(--card)" strokeWidth="2" />
    </svg>
  );
}

/**
 * KPI con tendencia: valor grande, variación vs. período anterior (verde/rojo/neutro con flecha e importe) y sparkline opcional.
 * `invertir` cuando bajar es bueno (rechazos, errores). Para que el valor cuente al aparecer, pásale `<NumeroAnimado valor={…} />`.
 */
export function Kpi({
  etiqueta,
  valor,
  variacion,
  periodo = "vs. período anterior",
  invertir,
  serie,
  className,
}: {
  etiqueta: ReactNode;
  valor: ReactNode;
  /** Porcentaje, p. ej. 12.5 o -3; omite para no mostrar tendencia. */
  variacion?: number;
  periodo?: ReactNode;
  invertir?: boolean;
  serie?: number[];
  className?: string;
}) {
  const positiva = variacion != null && variacion > 0;
  const negativa = variacion != null && variacion < 0;
  const buena = invertir ? negativa : positiva;
  const mala = invertir ? positiva : negativa;
  const Flecha = positiva ? ArrowUpRightIcon : negativa ? ArrowDownRightIcon : MinusIcon;
  return (
    <div className={cn("flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm", className)}>
      <div className="min-w-0">
        <span className="block truncate text-etiqueta font-medium text-muted-foreground">{etiqueta}</span>
        <div className="mt-1.5 text-metrica text-foreground tabular-nums">{valor}</div>
        {variacion != null ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-etiqueta text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
                buena && "bg-success text-success-foreground",
                mala && "bg-destructive-suave text-destructive-texto",
                !buena && !mala && "bg-secondary",
              )}
            >
              <Flecha className="size-3" />
              {Math.abs(variacion).toFixed(1)}%
            </span>
            <span className="truncate">{periodo}</span>
          </div>
        ) : null}
      </div>
      {serie ? <Sparkline datos={serie} className="mt-1" /> : null}
    </div>
  );
}
```

- [ ] **Step 5: Replace `src/components/patrones/metricas.tsx`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tono = "ok" | "aviso" | "error" | "neutro";

/** Punto de estado de 6px para ayudas y pills. */
export function Punto({ tono }: { tono: Tono }) {
  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        tono === "ok" && "bg-success-solid",
        tono === "aviso" && "bg-warning-solid",
        tono === "error" && "bg-destructive",
        tono === "neutro" && "bg-muted-foreground/50",
      )}
    />
  );
}

/** Ayuda de una métrica con punto y color según tono. */
export function AyudaMetrica({ tono, children }: { tono: Tono; children: ReactNode }) {
  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-1",
        tono === "ok" && "text-success-foreground",
        tono === "aviso" && "text-warning-foreground",
        tono === "error" && "text-destructive-texto",
      )}
    >
      <Punto tono={tono} />
      <span className="truncate">{children}</span>
    </span>
  );
}

/**
 * Una métrica: etiqueta, valor grande (con sufijo opcional) y ayuda. Para que el valor cuente al aparecer, pásale
 * `<NumeroAnimado valor={…} />` como hijo; un identificador (serie, correlativo) va envuelto en `font-mono`.
 */
export function Metrica({ etiqueta, children, sufijo, ayuda }: { etiqueta: string; children: ReactNode; sufijo?: ReactNode; ayuda: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="truncate text-etiqueta font-medium text-muted-foreground">{etiqueta}</span>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-metrica text-foreground tabular-nums">
        {children}
        {sufijo ? <span className="text-control font-normal text-muted-foreground">{sufijo}</span> : null}
      </div>
      <div className="flex min-w-0 items-center gap-1 truncate text-etiqueta text-muted-foreground">{ayuda}</div>
    </div>
  );
}

/** Franja de métricas: una sola tarjeta dividida en 4 columnas (2 en tablet, 1 en móvil). */
export function FilaMetricas({ children, columnas = 4 }: { children: ReactNode; columnas?: 2 | 3 | 4 }) {
  return (
    <section
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm lg:divide-x lg:divide-border lg:[&>*:not(:first-child)]:pl-5",
        columnas === 4 && "lg:grid-cols-4",
        columnas === 3 && "lg:grid-cols-3",
        columnas === 2 && "lg:grid-cols-2",
      )}
    >
      {children}
    </section>
  );
}
```

- [ ] **Step 6: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `npm run typecheck`
Expected: no errors.

Run: `node scripts/verificar-tipografia.mjs src/components`
Expected: PASS.

- [ ] **Step 7: Commit**

```
git add src/components/patrones/numero-animado.tsx src/components/datos/trazo-animado.tsx src/components/datos/kpi.tsx src/components/patrones/metricas.tsx
git commit -m "feat(ds): add NumeroAnimado and TrazoAnimado; Kpi and Metrica on the new scale

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Gráficos animados

**Files:**
- Modify: `src/components/datos/grafico.tsx`

**Interfaces:**
- Consumes: `TrazoAnimado`
- Consumes: `RESORTE_SUAVE`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `GraficoBarras`
- Produces: `GraficoLineas`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "process.exit(require('fs').readFileSync('src/components/datos/grafico.tsx','utf8').includes('TrazoAnimado')?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Add imports**

Replace:

```tsx
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
```

with:

```tsx
import { m } from "motion/react";
import { useId, useState } from "react";
import { TrazoAnimado } from "@/components/datos/trazo-animado";
import { RESORTE_SUAVE } from "@/lib/movimiento";
import { cn } from "@/lib/utils";
```

- [ ] **Step 3: Keep axis text at 10 units of the viewBox**

The codemod turned the SVG class `text-[10px]` into `text-etiqueta`, which grows with the viewBox scale. Replace both occurrences (one per chart) of:

```tsx
className="h-auto w-full overflow-visible text-etiqueta"
```

with:

```tsx
className="h-auto w-full overflow-visible" style={{ fontSize: 10 }}
```

(Inside the SVG the size is in viewBox units, not CSS pixels: it is not part of the text scale.)

- [ ] **Step 4: Bars grow from the baseline**

Replace:

```tsx
                return <path key={s.nombre} d={`M${bx},${m.top + h} v${-Math.max(0, bh - 4)} a4,4 0 0 1 4,-4 h${barra - 8} a4,4 0 0 1 4,4 v${Math.max(0, bh - 4)} z`} fill={COLORES[j % COLORES.length]} />;
```

with:

```tsx
                // Crece desde la línea base; cada categoría entra 30 ms después de la anterior. scaleY es una transformación:
                // con «reducir movimiento» MotionConfig la deja en su estado final.
                return (
                  <m.path
                    key={s.nombre}
                    d={`M${bx},${m.top + h} v${-Math.max(0, bh - 4)} a4,4 0 0 1 4,-4 h${barra - 8} a4,4 0 0 1 4,4 v${Math.max(0, bh - 4)} z`}
                    fill={COLORES[j % COLORES.length]}
                    style={{ originY: 1 }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ ...RESORTE_SUAVE, delay: i * 0.03 }}
                  />
                );
```

Note: inside `GraficoBarras` the margins object is also named `m`. Rename it to avoid shadowing the Motion import: in `GraficoBarras` replace `const m = { top: 8, right: 8, bottom: 24, left: 44 };` with `const mg = { top: 8, right: 8, bottom: 24, left: 44 };` and every `m.top`, `m.right`, `m.bottom`, `m.left` inside `GraficoBarras` with `mg.top`, `mg.right`, `mg.bottom`, `mg.left` (including the ones in the `<m.path>` `d` attribute you just pasted). Do the same in `GraficoLineas` (`const m = { top: 8, right: 12, bottom: 24, left: 44 };` → `const mg = …`, and its `m.*` uses → `mg.*`).

- [ ] **Step 5: Lines draw themselves**

In `GraficoLineas`, replace:

```tsx
        {series.map((s, j) => (
          <path
            key={s.nombre}
            d={s.valores.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
            fill="none"
            stroke={COLORES[j % COLORES.length]}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
```

with:

```tsx
        {series.map((s, j) => (
          <TrazoAnimado
            key={s.nombre}
            d={s.valores.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
            stroke={COLORES[j % COLORES.length]}
            retraso={j * 0.08}
          />
        ))}
```

- [ ] **Step 6: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `node -e "const t=require('fs').readFileSync('src/components/datos/grafico.tsx','utf8');process.exit(/\bm\.(top|left|right|bottom)\b/.test(t)?1:0)"`
Expected: exit code 0 (no margin access left on the Motion `m`).

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 7: Commit**

```
git add src/components/datos/grafico.tsx
git commit -m "feat(ds): chart bars grow and lines draw on mount

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Progreso circular con resorte

**Files:**
- Modify: `src/components/feedback/progreso.tsx`

**Interfaces:**
- Consumes: `RESORTE_SUAVE`
- Consumes: `--duracion-lenta`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `ProgresoCircular`
- Produces: `ProgresoLineal`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "process.exit(require('fs').readFileSync('src/components/feedback/progreso.tsx','utf8').includes('m.circle')?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Add imports**

Replace:

```tsx
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
```

with:

```tsx
import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { RESORTE_SUAVE } from "@/lib/movimiento";
import { cn } from "@/lib/utils";
```

- [ ] **Step 3: Linear bar keeps CSS, on the shared duration**

Replace (post-codemod text):

```tsx
cn("transition-[width] duration-300 ease-salida", TONOS[tono])
```

with:

```tsx
cn("transition-[width] duration-(--duracion-lenta) ease-salida motion-reduce:transition-none", TONOS[tono])
```

- [ ] **Step 4: Circular ring springs to its value**

In `ProgresoCircular`, insert after `const pct = indeterminado ? 0.25 : Math.min(100, Math.max(0, valor)) / 100;`:

```tsx
  // strokeDashoffset no es una transformación: con «reducir movimiento» se salta aquí, no en MotionConfig.
  const reducir = useReducedMotion();
```

Replace (post-codemod text):

```tsx
        <circle
          cx={caja / 2}
          cy={caja / 2}
          r={radio}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={circunferencia * (1 - pct)}
          fill="none"
          className="transition-[stroke-dashoffset] duration-300 ease-salida"
          style={{ stroke: COLOR_TRAZO[tono] }}
        />
```

with:

```tsx
        <m.circle
          cx={caja / 2}
          cy={caja / 2}
          r={radio}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          fill="none"
          style={{ stroke: COLOR_TRAZO[tono] }}
          // initial={false}: el servidor ya pinta el valor; solo se anima cuando cambia.
          initial={false}
          animate={{ strokeDashoffset: circunferencia * (1 - pct) }}
          transition={reducir ? { duration: 0 } : RESORTE_SUAVE}
        />
```

- [ ] **Step 5: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```
git add src/components/feedback/progreso.tsx
git commit -m "feat(ds): circular progress springs to its value

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: Demo de /ejemplo con números animados

**Files:**
- Modify: `src/app/ejemplo/page.tsx`
- Modify: `src/app/ejemplo/galeria.tsx`

**Interfaces:**
- Consumes: `NumeroAnimado`
- Consumes: `Metrica`
- Consumes: `Kpi`
- Consumes: `scripts/codemod-estilo.mjs`
- Produces: `src/app/ejemplo/page.tsx`

- [ ] **Step 1: Confirm the failing state**

Run: `node -e "const f=require('fs');process.exit(['src/app/ejemplo/page.tsx','src/app/ejemplo/galeria.tsx'].every(p=>f.readFileSync(p,'utf8').includes('NumeroAnimado'))?0:1)"`
Expected: exit code 1.

- [ ] **Step 2: Metrics row in `src/app/ejemplo/page.tsx`**

Add the import after `import { Chip, ChipCodigo, PillEstado } from "@/components/patrones/pill-estado";`:

```tsx
import { NumeroAnimado } from "@/components/patrones/numero-animado";
```

Replace the four `Metrica` children:

```tsx
            133
```
→
```tsx
            <NumeroAnimado valor={133} />
```

```tsx
            <span className="text-primary">F001</span>#00000136
```
→
```tsx
            <span className="font-mono">
              <span className="text-primary">F001</span>#00000136
            </span>
```

```tsx
            2
```
(the child of «Pendientes de envío») →
```tsx
            <NumeroAnimado valor={2} />
```

```tsx
            <span className="text-destructive">1</span>
```
→
```tsx
            <NumeroAnimado valor={1} className="text-destructive-texto" />
```

- [ ] **Step 3: KPIs in `src/app/ejemplo/galeria.tsx`**

Add the import after `import { PillEstado } from "@/components/patrones/pill-estado";`:

```tsx
import { NumeroAnimado } from "@/components/patrones/numero-animado";
```

Replace the three `Kpi` lines:

```tsx
          <Kpi etiqueta="Facturado (mes)" valor="S/ 128,430" variacion={12.4} serie={[42, 48, 45, 60, 58, 71, 80]} />
          <Kpi etiqueta="Documentos emitidos" valor="1,236" variacion={-3.1} serie={[120, 110, 130, 125, 118, 121, 116]} />
          <Kpi etiqueta="Rechazados" valor="4" variacion={-40} invertir serie={[9, 7, 8, 6, 5, 6, 4]} />
```

with:

```tsx
          <Kpi etiqueta="Facturado (mes)" valor={<NumeroAnimado valor={128430} prefijo="S/ " />} variacion={12.4} serie={[42, 48, 45, 60, 58, 71, 80]} />
          <Kpi etiqueta="Documentos emitidos" valor={<NumeroAnimado valor={1236} />} variacion={-3.1} serie={[120, 110, 130, 125, 118, 121, 116]} />
          <Kpi etiqueta="Rechazados" valor={<NumeroAnimado valor={4} />} variacion={-40} invertir serie={[9, 7, 8, 6, 5, 6, 4]} />
```

- [ ] **Step 4: Verify, expect PASS**

Run the Step 1 command again. Expected: exit code 0.

Run: `npm run typecheck`
Expected: no errors.

Run: `node scripts/verificar-tipografia.mjs src/app/ejemplo`
Expected: PASS.

- [ ] **Step 5: Commit**

```
git add src/app/ejemplo/page.tsx src/app/ejemplo/galeria.tsx
git commit -m "docs(ejemplo): count up metrics and KPIs with NumeroAnimado

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Documentación, registro, versión y verificación final

**Files:**
- Modify: `docs/design-system.md`
- Modify: `docs/guia-visual.html`
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `package.json`
- Modify: `registry/registry.json`

**Interfaces:**
- Consumes: `FOCO`
- Consumes: `PillEstado`
- Consumes: `BloqueCodigo`
- Consumes: `GraficoLineas`
- Consumes: `ProgresoLineal`
- Consumes: `--font-sans`
- Consumes: `SEGMENTO_BASE`
- Consumes: `NumeroAnimado`
- Consumes: `TrazoAnimado`
- Consumes: `ProveedorMovimiento`
- Consumes: `BotonCopiar`
- Consumes: `Tabs`
- Consumes: `SidebarNav`
- Consumes: `TablaDatos`
- Consumes: `GraficoBarras`
- Consumes: `ProgresoCircular`
- Consumes: `src/app/ejemplo/page.tsx`
- Consumes: `npm run check:tipografia`
- Consumes: `npm run check:contraste`
- Produces: `registry/registry.json`

- [ ] **Step 1: Confirm the docs are stale (failing check)**

Run: `node -e "const t=require('fs').readFileSync('docs/design-system.md','utf8');process.exit(/#4f46e5|JetBrains|tracking-wider uppercase/.test(t)?1:0)"`
Expected: exit code 1.

- [ ] **Step 2: Rewrite §2–§4 of `docs/design-system.md`**

Replace everything from the line `## 2. Tokens de color` up to (not including) the line `### Escala de alturas` with the token, typography and spacing content of the spec: copy the table of §4.1, the shadows table of §4.2, the radii of §4.3 and the type-scale table and rules of §4.4 from `docs/cys/specs/2026-10-31-rediseno-visual-moderno-design.md`, under these headings and keeping the existing numbering:

```markdown
## 2. Tokens de color
(intro paragraph kept: tokens as CSS variables, never hex in components)
(table: spec §4.1, columns Token | Claro | Oscuro | Uso — replace the "Contraste clave" column by "Uso" and move the numbers to a sentence: "Contraste WCAG calculado en el comentario de `:root` de globals.css; `npm run check:contraste` falla si un par baja de 4.5.")
(state-tone rule paragraph kept; add: "El rojo de pills, chips y avisos usa `bg-destructive-suave` + `text-destructive-texto`: `text-destructive` sobre un rojo tenue no llega a 4.5.")

## 3. Tipografía
(Geist + Geist Mono; spec §4.4 table and rules; "Tracking negativo solo en `text-metrica`, que ya lo trae"; `npm run check:tipografia` prohíbe `text-[Npx]`, `uppercase` y `tracking-wide(r)`; exención `tipografia-ok`)

## 4. Espaciado, radios y elevación
(spacing bullets kept; radii from spec §4.3; elevation: spec §4.2 table — `shadow-xs` controles, `shadow-sm` tarjetas, `shadow-md` + `ring-1 ring-border` popups, `shadow-lg` diálogos/sheets/toasts; bordes `border-border` sin opacidades intermedias; foco: receta `FOCO` de lib/estilos.ts)
```

Every value must be copied from the spec, not retyped from memory.

- [ ] **Step 3: Rewrite the «Movimiento» section**

Replace everything from `### Movimiento` up to (not including) `### Pendientes` with:

```markdown
### Movimiento

El movimiento confirma una acción, muestra un cambio de estado o introduce contenido; nunca decora. Tiene dos capas que comparten valores: CSS para lo que debe funcionar en Server Components y en los primitivos de base-ui, y [Motion](https://motion.dev) para lo que CSS no hace bien (layout, trazos, contadores, entradas y salidas de React).

| Valor | CSS (`globals.css`) | Motion (`lib/movimiento.ts`) |
|---|---|---|
| Curva | `ease-salida` = `cubic-bezier(0.16, 1, 0.3, 1)` | `CURVA_SALIDA` |
| Duraciones | `duration-(--duracion-rapida)` 120 ms · `media` 200 ms · `lenta` 320 ms | `DURACION.rapida/media/lenta` (+ `trazo` 0.6 s, `contador` 0.8 s) |
| Resortes | — | `RESORTE` (indicadores) y `RESORTE_SUAVE` (valores), ambos con ζ ≥ 1: sin rebote |

**CSS:** `PRESION` (al pulsar, `scale-[0.98]`), `ENTRADA` + `pasoEntrada(i)` (fundido + 8 px, 240 ms, 40 ms por posición), `ANIMACION_POPUP` y las transiciones de diálogo, sheet, drawer, popover, menú, select, combobox, hover-card, tooltip, acordeón y toasts. El indicador de `Tabs` lo posiciona base-ui (`Tabs.Indicator`, variables `--active-tab-*`) y lo desliza una transición CSS.

**Motion** (requiere `ProveedorMovimiento`, ya incluido en `Providers`; fuera de él los componentes se ven bien pero no animan):

| Componente | Efecto |
|---|---|
| `SidebarNav` | El fondo del ítem activo se desliza (`layoutId`) |
| `TablaDatos` | La barra de acciones masivas entra y sale |
| `NumeroAnimado` | Cuenta desde 0; úsalo como hijo de `Metrica` o `valor` de `Kpi` |
| `Sparkline`, `GraficoLineas` (`TrazoAnimado`) | La línea se dibuja |
| `GraficoBarras` | Las barras crecen desde la base, escalonadas |
| `ProgresoCircular` | El anillo avanza con resorte |
| `ConfirmacionEnLinea`, `BotonCopiar` | Cambio animado de acción a confirmación; el icono gira a un check |

**Reglas:**
- Solo valores de la tabla de arriba; nunca duraciones ni curvas sueltas.
- Los componentes importan `m` (no `motion`) de `motion/react`: `LazyMotion strict` falla en desarrollo si se cuela un `motion.*`.
- Con «reducir movimiento» nada se desplaza, escala ni se dibuja: `MotionConfig reducedMotion="user"` anula transformaciones y layout, los efectos que no lo son (trazos, contador, altura, anillo) consultan `useReducedMotion()`, y el CSS va bajo `motion-safe:`/`motion-reduce:`. Solo quedan fundidos de opacidad.
- Toasts: siguen con la transición CSS de base-ui; `AnimatePresence` competiría con su cierre por tiempo y por gesto.
- El diseño `papel` fija las transiciones por defecto en 200 ms (`--default-transition-duration`, §Diseños).
```

- [ ] **Step 4: Remaining stale references in `docs/design-system.md`**

Run: `node -e "const t=require('fs').readFileSync('docs/design-system.md','utf8').split('\n');t.forEach((l,i)=>{if(/shadow-2xs|text-\[1[0-3]px\]|tracking-wider|uppercase|Inter\b|JetBrains|#4f46e5|#0f172a|oklch\(0\.18/.test(l))console.log(i+1+': '+l.slice(0,140))})"`

For every line printed, apply the mapping of spec §4.5 (sizes → scale names, `shadow-2xs` → `shadow-xs`, no uppercase labels, Geist instead of Inter/JetBrains, new hex values, `bg-codigo` for the code block, pills without border). Rerun the command until it prints nothing, except lines that describe the old behaviour on purpose (none are expected).

- [ ] **Step 5: Update `docs/guia-visual.html`**

Run this command; it replaces the font link and the three token blocks (from the `<link rel="stylesheet" href="https://fonts.googleapis.com` line to the line before `  * { box-sizing: border-box; }`) and makes `.pill` borderless and sans:

```
node -e "const fs=require('fs'),f='docs/guia-visual.html';let t=fs.readFileSync(f,'utf8');const ini=t.indexOf('<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com');const fin=t.indexOf('  * { box-sizing: border-box; }');if(ini<0||fin<0)throw new Error('marcadores no encontrados');const claro='--background: #fbfbfc; --foreground: #18181b;\n    --card: #ffffff; --muted: #f7f7f8; --muted-foreground: #6b6b76;\n    --secondary: #f4f4f5; --border: #e8e8ec;\n    --primary: #5b5bd6; --primary-light: #7373e0; --primary-foreground: #ffffff;\n    --accent: #f0f0fd; --accent-foreground: #4747c2; --accent-border: rgba(91,91,214,.22);\n    --success: #edfaf3; --success-foreground: #0f7b4f; --success-border: rgba(15,123,79,.18); --success-solid: #16a34a;\n    --warning: #fef8ec; --warning-foreground: #a15c07; --warning-border: rgba(161,92,7,.18); --warning-solid: #f59e0b;\n    --destructive: #dc2547; --destructive-soft: #fdeef1; --destructive-text: #b91c3c; --destructive-border: rgba(220,37,71,.2);\n    --overlay: rgba(10,10,15,.32); --ring: #5b5bd6;\n    --sidebar: #fbfbfc; --sidebar-foreground: #3f3f46; --sidebar-primary: #ededf5; --sidebar-primary-foreground: #3c3cb0; --sidebar-accent: #f2f2f4;\n    --code-bg: #0f0f14; --code-fg: #e4e4e9;\n    --shadow-2xs: 0 1px 2px rgba(16,16,24,.05); --shadow-xs: 0 1px 2px rgba(16,16,24,.06), 0 1px 3px rgba(16,16,24,.04); --shadow-md: 0 4px 12px -2px rgba(16,16,24,.08), 0 2px 4px -2px rgba(16,16,24,.05);';const oscuro='--background: #0b0b0f; --foreground: #ededf0;\n    --card: #131318; --muted: #16161b; --muted-foreground: #9b9ba6;\n    --secondary: #1c1c22; --border: rgba(255,255,255,.08);\n    --primary: #8585f2; --primary-light: #a3a3f7; --primary-foreground: #0b0b0f;\n    --accent: #1e1e33; --accent-foreground: #b4b4fa; --accent-border: rgba(133,133,242,.28);\n    --success: #0f2a1f; --success-foreground: #4fd19a; --success-border: rgba(79,209,154,.25); --success-solid: #34d399;\n    --warning: #2e2410; --warning-foreground: #f2c25c; --warning-border: rgba(242,194,92,.25); --warning-solid: #fbbf24;\n    --destructive: #fb6f8a; --destructive-soft: #2a1a20; --destructive-text: #fb6f8a; --destructive-border: rgba(251,111,138,.3);\n    --overlay: rgba(0,0,0,.6); --ring: #8585f2;\n    --sidebar: #0b0b0f; --sidebar-foreground: #c4c4cc; --sidebar-primary: #1e1e33; --sidebar-primary-foreground: #b4b4fa; --sidebar-accent: #16161b;\n    --shadow-2xs: inset 0 1px 0 rgba(255,255,255,.04), 0 1px 2px rgba(0,0,0,.4); --shadow-xs: inset 0 1px 0 rgba(255,255,255,.04), 0 1px 3px rgba(0,0,0,.45); --shadow-md: inset 0 1px 0 rgba(255,255,255,.05), 0 8px 24px -4px rgba(0,0,0,.6);';const bloque='<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap\">\n<style>\n  :root {\n    '+claro+'\n    --radius: 8px;\n    --font-sans: \"Geist\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", sans-serif;\n    --font-mono: \"Geist Mono\", ui-monospace, SFMono-Regular, Menlo, monospace;\n  }\n  @media (prefers-color-scheme: dark) {\n    :root:not([data-theme=\"light\"]) {\n      '+oscuro.replaceAll('\n    ','\n      ')+'\n    }\n  }\n  :root[data-theme=\"dark\"] {\n    '+oscuro+'\n  }\n\n';t=t.slice(0,ini)+bloque+t.slice(fin);t=t.replace(/\.pill \{([^}]*)font-family: var\(--font-mono\); ([^}]*)border: 1px solid var\(--border\); /,'.pill {$1$2border: 0; ');fs.writeFileSync(f,t)"
```

Then run: `node -e "const t=require('fs').readFileSync('docs/guia-visual.html','utf8');for(const s of ['Geist','#5b5bd6','#8585f2','#0f0f14'])if(!t.includes(s))throw new Error('falta '+s);if(/Inter|JetBrains|#4f46e5/.test(t))throw new Error('quedan valores viejos');console.log('ok')"`
Expected: `ok`. If it reports `quedan valores viejos`, search the file for the old value and replace it with the new token value from the blocks above.

- [ ] **Step 6: README, CHANGELOG and version**

In `README.md`, replace `Stack: **Next.js 15 · React 19 · Tailwind v4 · lucide-react**.` with `Stack: **Next.js 15 · React 19 · Tailwind v4 · Motion · lucide-react**.`; in the structure block replace `├── app/layout.tsx           Inter + JetBrains Mono, Providers` with `├── app/layout.tsx           Geist + Geist Mono, Providers`, and `├── components/providers.tsx ThemeProvider + DisenoProvider + ToastProvider + TooltipProvider` with `├── components/providers.tsx ThemeProvider + DisenoProvider + ProveedorMovimiento + ToastProvider + TooltipProvider`; in the «Proyecto existente» numbered list, step 1, append the sentence: `Si copias componentes animados (sidebar, tabla, KPI, gráficos, progreso, copiar), instala también \`motion\` y envuelve la app con \`ProveedorMovimiento\` (ya incluido en \`Providers\`).`; in **Alternativa manual**, change the install list to `@base-ui/react lucide-react class-variance-authority cn next-themes motion`.

In `package.json`, change `"version": "0.2.0"` to `"version": "0.3.0"`.

In `CHANGELOG.md`, add at the top (below the title, above the latest entry; follow the file's existing heading format):

```markdown
## 0.3.0 — 2026-10-31

### Cambiado
- Diseño base «khipu» al estilo Linear/Vercel: neutros zinc, acento índigo `#5b5bd6` / `#8585f2`, sombras en capas (en oscuro con brillo interior), tarjetas de 12 px, sidebar del color del fondo.
- Tipografía Geist + Geist Mono. Escala con nombre: `text-etiqueta` 12, `text-control` 13, `text-cuerpo` 14, `text-metrica` 24. Sin etiquetas en mayúsculas; mono solo para datos.
- Pills sin borde; bloque de código sobre el token `codigo`; anillo de foco único (`FOCO`).
- Los nombres de tokens, recetas y props no cambian: es un cambio visual.

### Añadido
- Motion (`motion` ^14) con `ProveedorMovimiento` y `lib/movimiento.ts`. Sidebar, `TablaDatos`, gráficos, `Sparkline`, `ProgresoCircular`, `ConfirmacionEnLinea` y `BotonCopiar` animados; `Tabs` con indicador que se desliza.
- `NumeroAnimado`, `TrazoAnimado`, receta `SEGMENTO_BASE`, tokens `destructive-suave` / `destructive-texto` (el rojo sobre rojo tenue no llegaba a 4.5) y `codigo` / `codigo-foreground`.
- `npm run check:tipografia` y `npm run check:contraste` (en `npm run lint`), `npm test`.
```

- [ ] **Step 7: Regenerate the registry**

Run: `npm run registry:build`
Expected: success; `registry/registry.json` updated.

Run: `node -e "const r=require('./registry/registry.json');const c=Object.values(r).filter(x=>(x.dependencies||[]).includes('motion')).map(x=>x.name);console.log(c.join(', '));process.exit(c.length>=8?0:1)"`
Expected: exit 0, printing at least `sidebar-nav, tabla-datos, grafico, kpi, progreso, confirmacion-en-linea, boton-copiar, numero-animado` (names as the registry spells them). If the registry shape differs (e.g. an array under a key), open it and confirm by eye that those components list `motion`.

- [ ] **Step 8: Full verification**

Run each, one at a time; each must succeed:

```
npm test
npm run typecheck
npm run lint
npm run build
```

Expected: `npm test` → `# fail 0`; `typecheck` → no errors; `lint` → ESLint clean plus `Alturas: …`, `Tipografía: todo dentro de la escala.`, `Contraste: 40 pares ≥ 4.5.`; `build` → `✓ Compiled successfully` and the `/ejemplo` route listed.

- [ ] **Step 9: Visual verification in the browser**

With `npm run dev` running, open `http://localhost:3000/ejemplo` and check, taking a screenshot of each:

1. Diseño «khipu» claro y oscuro (`document.documentElement.dataset.diseno='khipu'`, toggle `.dark`): neutros zinc, acento índigo, Geist, sin etiquetas en mayúsculas, pills sin borde, código sobre casi negro.
2. Diseño «papel» claro y oscuro: legible, sin texto que se pierda contra su fondo.
3. Movimiento: métricas y KPIs cuentan desde 0; la sparkline y las líneas se dibujan; las barras crecen; al cambiar de pestaña el indicador se desliza; al seleccionar filas la barra masiva entra; «Revocar» → confirmación animada; copiar gira a check.
4. DevTools → Rendering → `prefers-reduced-motion: reduce`, recarga: nada se desplaza, escala ni se dibuja.
5. Consola sin advertencias de hidratación ni errores de `LazyMotion strict`.

Fix any defect found before committing; record anything you could not fix in `docs/design-system.md` «Pendientes».

- [ ] **Step 10: Commit**

Run: `node -e "process.exit(/#4f46e5|JetBrains|tracking-wider uppercase/.test(require('fs').readFileSync('docs/design-system.md','utf8'))?1:0)"`
Expected: exit code 0.

```
git add docs/design-system.md docs/guia-visual.html README.md CHANGELOG.md package.json registry/registry.json
git commit -m "docs(ds): document the 0.3.0 visual redesign and Motion; bump to 0.3.0

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
