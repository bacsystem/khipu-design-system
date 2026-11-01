# Rediseño pastel 0.5 con paletas y tonos oscuros elegibles — Implementation Plan

> **For agentic workers:** execute this plan with the
> parallel-plan-executor Workflow (cys:run / the /cys:run-plan command).
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved spec `docs/cys/specs/2026-11-01-rediseno-pastel-paletas-design.md`: compact pastel look, 5 user-selectable palettes, 3 user-selectable dark tones, Inter + JetBrains Mono, Phosphor duotone icons, new metric cards — visual layer only, no export or prop removed.

**Architecture:** Every color comes from tokens in `src/styles/tokens.css`; a palette is a block that overrides only the accent tokens (`html[data-paleta]`), a dark tone a block that overrides only surfaces (`.dark[data-oscuro]`). Existing tokens (`--sidebar-primary`, `--accent`, `--chart-1`, `--ring`…) are mapped onto the accent tokens, so components pick up the palette without knowing it. `AparienciaProvider` + `ScriptDiseno` own the two preferences the same way `DisenoProvider` owns `data-diseno`. Icons and the 36→34 px control height are migrated by one tested codemod.

**Tech Stack:** Next.js 15.5 (Turbopack), React 19, Tailwind v4 (`@theme inline`), base-ui 1.8, Motion 14, `@phosphor-icons/react` 2.1.10 (new), `node --test` on Node 24 (type stripping).

## Global Constraints

- Language of code identifiers, comments and UI strings: Spanish, matching the surrounding code. Commit messages: Conventional Commits in English, ending with the two trailer lines `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr`.
- Shell rules from the user's CLAUDE.md: never chain commands with `&&`; never `cd` — use `git -C <path>` / `npm --prefix <path>`; one atomic command per invocation.
- No exported symbol or prop is removed or renamed. New props are optional.
- Text contrast ≥ 4.5:1 in all 20 combinations (5 palettes × light + 3 dark tones); non-text indicators (focus ring) ≥ 3:1. `npm run check:contraste` is the judge.
- Named type scale only (`text-etiqueta` 11.5, `text-control` 13, `text-cuerpo` 13, `text-titulo` 14.5, `text-titulo-pagina` 21, `text-metrica` 26); no `text-[Npx]`. `uppercase`/`tracking-*` only inside `src/lib/estilos.ts`.
- Control height token `h-control` = 34 px (`--spacing-control: 2.125rem`). No `h-9`/`size-9`/`min-h-9` left in controls.
- Radii: `--radius: 0.75rem` → `rounded-lg` 12 px (fields), `rounded-xl` 18 px (cards, popovers, dialogs); buttons, chips, pills, segmented, menu items and pagination are `rounded-full`.
- Icons: Phosphor, default weight `duotone`, active/highlighted weight `fill`, never on a tinted background/container; meaning by color only.
- Primary action: `bg-primary` = `#16181d` light / `#f4f5f7` dark. The palette lives in surfaces, not in buttons.
- «papel» design: palettes and dark tones do not apply (`html:not([data-diseno="papel"])…` selectors) and the appearance selector hides.
- Palettes: `lima` (default, lives in `:root`), `indigo`, `oceano`, `coral`, `violeta`. Dark tones: `medianoche` (default, lives in `.dark`), `grafito`, `tintado`. localStorage keys `khipu-paleta`, `khipu-oscuro`.
- Version 0.5.0.

---

### Task 1: Appearance options and no-flash script code

**Files:**
- Create: `src/components/apariencia-opciones.ts`
- Test: `scripts/tests/apariencia.test.mjs`

**Interfaces:**
- Consumes: None
- Produces: `src/components/apariencia-opciones.ts`
- Produces: `Paleta`
- Produces: `TonoOscuro`
- Produces: `PreferenciasApariencia`
- Produces: `PALETAS`
- Produces: `TONOS_OSCURO`
- Produces: `PALETA_POR_DEFECTO`
- Produces: `TONO_OSCURO_POR_DEFECTO`
- Produces: `CLAVE_PALETA`
- Produces: `CLAVE_TONO_OSCURO`
- Produces: `valorValido()`
- Produces: `codigoScriptApariencia()`

- [ ] **Step 1: Write the failing test** — create `scripts/tests/apariencia.test.mjs`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CLAVE_PALETA,
  CLAVE_TONO_OSCURO,
  PALETAS,
  PALETA_POR_DEFECTO,
  TONOS_OSCURO,
  TONO_OSCURO_POR_DEFECTO,
  codigoScriptApariencia,
  valorValido,
} from "../../src/components/apariencia-opciones.ts";

const HEX = /^#[0-9a-f]{6}$/i;

test("paletas: valores únicos, la por defecto existe y cada muestra tiene 3 colores", () => {
  const valores = PALETAS.map((p) => p.valor);
  assert.deepEqual(valores, ["lima", "indigo", "oceano", "coral", "violeta"]);
  assert.ok(valores.includes(PALETA_POR_DEFECTO));
  for (const p of PALETAS) {
    assert.equal(p.muestra.length, 3);
    assert.ok(p.muestra.every((c) => HEX.test(c)), p.valor);
  }
});

test("tonos oscuros: medianoche por defecto, muestras #rrggbb", () => {
  assert.deepEqual(TONOS_OSCURO.map((t) => t.valor), ["medianoche", "grafito", "tintado"]);
  assert.equal(TONO_OSCURO_POR_DEFECTO, "medianoche");
  assert.ok(TONOS_OSCURO.every((t) => HEX.test(t.muestra)));
});

test("valorValido devuelve el pedido solo si existe", () => {
  assert.equal(valorValido("coral", PALETAS, "lima"), "coral");
  assert.equal(valorValido("rojo", PALETAS, "lima"), "lima");
  assert.equal(valorValido(null, PALETAS, "lima"), "lima");
});

function ejecutar(codigo, guardado) {
  const documento = { documentElement: { dataset: {} } };
  const almacenamiento = { getItem: (k) => guardado[k] ?? null };
  new Function("document", "localStorage", codigo)(documento, almacenamiento);
  return documento.documentElement.dataset;
}

test("el script aplica lo guardado, ignora valores inválidos e `inicial` gana", () => {
  assert.deepEqual(ejecutar(codigoScriptApariencia(), {}), { paleta: "lima", oscuro: "medianoche" });
  assert.deepEqual(ejecutar(codigoScriptApariencia(), { [CLAVE_PALETA]: "coral", [CLAVE_TONO_OSCURO]: "grafito" }), { paleta: "coral", oscuro: "grafito" });
  assert.deepEqual(ejecutar(codigoScriptApariencia(), { [CLAVE_PALETA]: "x", [CLAVE_TONO_OSCURO]: "y" }), { paleta: "lima", oscuro: "medianoche" });
  const conInicial = codigoScriptApariencia({ inicial: { paleta: "violeta", tonoOscuro: "tintado" } });
  assert.deepEqual(ejecutar(conInicial, { [CLAVE_PALETA]: "coral" }), { paleta: "violeta", oscuro: "tintado" });
});

test("el script sobrevive a un localStorage bloqueado", () => {
  const documento = { documentElement: { dataset: {} } };
  const bloqueado = { getItem: () => { throw new Error("SecurityError"); } };
  new Function("document", "localStorage", codigoScriptApariencia())(documento, bloqueado);
  assert.deepEqual(documento.documentElement.dataset, { paleta: "lima", oscuro: "medianoche" });
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `node --test scripts/tests/apariencia.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `apariencia-opciones.ts`.

- [ ] **Step 3: Write the implementation** — create `src/components/apariencia-opciones.ts` (plain TS with only erasable syntax and no imports: it is loaded by `node --test`, by Server Components and by the client):

```ts
/**
 * Preferencias de apariencia que elige cada usuario: la paleta (los tres acentos) y el tono del modo oscuro.
 * Cada opción es un bloque de tokens en `src/styles/tokens.css`: `html[data-paleta="…"]` y `.dark[data-oscuro="…"]`.
 * La paleta y el tono por defecto no tienen bloque: son los tokens de `:root` y `.dark`. Claro/oscuro/sistema sigue
 * siendo de next-themes. Este archivo no importa nada: lo usan `ScriptDiseno` (servidor), `AparienciaProvider` (cliente) y los tests.
 */

export type Paleta = { valor: string; etiqueta: string; muestra: [string, string, string] };
export type TonoOscuro = { valor: string; etiqueta: string; muestra: string };
export type PreferenciasApariencia = { paleta: string; tonoOscuro: string };

/** Claves de localStorage. */
export const CLAVE_PALETA = "khipu-paleta";
export const CLAVE_TONO_OSCURO = "khipu-oscuro";

export const PALETA_POR_DEFECTO = "lima";
export const TONO_OSCURO_POR_DEFECTO = "medianoche";

/** `muestra`: acento, acento 2 y acento 3, en ese orden (los mismos hex que su bloque en tokens.css). */
export const PALETAS: Paleta[] = [
  { valor: "lima", etiqueta: "Lima", muestra: ["#d4f06b", "#cfe2fb", "#f8ec84"] },
  { valor: "indigo", etiqueta: "Índigo", muestra: ["#c9c8ff", "#cdeee9", "#ffdcc2"] },
  { valor: "oceano", etiqueta: "Océano", muestra: ["#9fe3dc", "#d3e4fd", "#ffe7a0"] },
  { valor: "coral", etiqueta: "Coral", muestra: ["#ffc6b3", "#e3dafb", "#fbe39b"] },
  { valor: "violeta", etiqueta: "Violeta", muestra: ["#dacbff", "#c6efdf", "#ffd3e6"] },
];

/** `muestra`: el color de tarjeta del tono (Tintado varía con la paleta; la muestra es la de Lima). */
export const TONOS_OSCURO: TonoOscuro[] = [
  { valor: "medianoche", etiqueta: "Medianoche", muestra: "#111a2c" },
  { valor: "grafito", etiqueta: "Grafito", muestra: "#1a1b1f" },
  { valor: "tintado", etiqueta: "Tintado", muestra: "#202420" },
];

/** El valor pedido si está entre las opciones; si no, el por defecto. */
export function valorValido(valor: string | null | undefined, opciones: ReadonlyArray<{ valor: string }>, porDefecto: string): string {
  return valor != null && opciones.some((o) => o.valor === valor) ? valor : porDefecto;
}

/**
 * Código en línea para el `<head>`: pone `data-paleta` y `data-oscuro` en `<html>` antes del primer pintado.
 * `inicial` (p. ej. leído del perfil del usuario en el servidor) gana sobre localStorage; un valor desconocido cae al por defecto.
 */
export function codigoScriptApariencia({
  paletas = PALETAS,
  tonosOscuro = TONOS_OSCURO,
  inicial,
}: { paletas?: Paleta[]; tonosOscuro?: TonoOscuro[]; inicial?: Partial<PreferenciasApariencia> } = {}): string {
  const lista = (opciones: ReadonlyArray<{ valor: string }>) => JSON.stringify(opciones.map((o) => o.valor));
  const paletaPorDefecto = valorValido(PALETA_POR_DEFECTO, paletas, paletas[0]?.valor ?? PALETA_POR_DEFECTO);
  const tonoPorDefecto = valorValido(TONO_OSCURO_POR_DEFECTO, tonosOscuro, tonosOscuro[0]?.valor ?? TONO_OSCURO_POR_DEFECTO);
  return (
    `(function(){var d=document.documentElement.dataset;` +
    `function v(c,l,p,i){var x=i;if(!x){try{x=localStorage.getItem(c)}catch(e){}}return l.indexOf(x)>-1?x:p}` +
    `d.paleta=v(${JSON.stringify(CLAVE_PALETA)},${lista(paletas)},${JSON.stringify(paletaPorDefecto)},${JSON.stringify(inicial?.paleta ?? null)});` +
    `d.oscuro=v(${JSON.stringify(CLAVE_TONO_OSCURO)},${lista(tonosOscuro)},${JSON.stringify(tonoPorDefecto)},${JSON.stringify(inicial?.tonoOscuro ?? null)})})()`
  );
}
```

- [ ] **Step 4: Run the test, expect PASS**

Run: `node --test scripts/tests/apariencia.test.mjs`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```
git -C D:/github/khipu-design-system add src/components/apariencia-opciones.ts scripts/tests/apariencia.test.mjs
git -C D:/github/khipu-design-system commit -m "feat(ds): add palette and dark-tone options with a no-flash script" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 2: AparienciaProvider and useApariencia

**Files:**
- Create: `src/components/apariencia.tsx`

**Interfaces:**
- Consumes: `src/components/apariencia-opciones.ts`
- Consumes: `valorValido()`
- Produces: `AparienciaProvider`
- Produces: `useApariencia()`

- [ ] **Step 1: Write the implementation** — create `src/components/apariencia.tsx` (a React provider has no meaningful unit test without a DOM harness; it is exercised by the browser check in Task 17 and its pure logic is already tested in Task 1):

```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CLAVE_PALETA,
  CLAVE_TONO_OSCURO,
  PALETAS,
  PALETA_POR_DEFECTO,
  TONOS_OSCURO,
  TONO_OSCURO_POR_DEFECTO,
  valorValido,
  type Paleta,
  type PreferenciasApariencia,
  type TonoOscuro,
} from "@/components/apariencia-opciones";

type ContextoApariencia = {
  paleta: string;
  setPaleta: (valor: string) => void;
  paletas: Paleta[];
  tonoOscuro: string;
  setTonoOscuro: (valor: string) => void;
  tonosOscuro: TonoOscuro[];
};

// Sin proveedor no hay nada que elegir: las listas vacías hacen que SelectorApariencia y el menú de usuario no muestren nada.
const SIN_PROVEEDOR: ContextoApariencia = {
  paleta: PALETA_POR_DEFECTO,
  setPaleta: () => {},
  paletas: [],
  tonoOscuro: TONO_OSCURO_POR_DEFECTO,
  setTonoOscuro: () => {},
  tonosOscuro: [],
};
const Contexto = createContext<ContextoApariencia>(SIN_PROVEEDOR);

/** Paleta y tono oscuro activos, y cómo cambiarlos. Fuera de `AparienciaProvider` devuelve listas vacías y no falla. */
export function useApariencia(): ContextoApariencia {
  return useContext(Contexto);
}

function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // Sin localStorage (modo privado, almacenamiento bloqueado) la preferencia vale solo para esta visita.
  }
}

/**
 * Guarda la paleta y el tono oscuro elegidos en localStorage y los aplica como `data-paleta` / `data-oscuro` en `<html>`.
 * `inicial` (p. ej. el perfil del usuario leído en el servidor) gana sobre lo guardado; `onCambio` recibe las dos
 * preferencias en cada cambio para que la app las guarde en su backend. Para que no haya parpadeo, pon `ScriptDiseno`
 * (con el mismo `inicial`) en el `<head>`.
 */
export function AparienciaProvider({
  children,
  paletas = PALETAS,
  tonosOscuro = TONOS_OSCURO,
  inicial,
  onCambio,
}: {
  children: ReactNode;
  paletas?: Paleta[];
  tonosOscuro?: TonoOscuro[];
  inicial?: Partial<PreferenciasApariencia>;
  onCambio?: (preferencias: PreferenciasApariencia) => void;
}) {
  const [paleta, setPaletaEstado] = useState(() => valorValido(inicial?.paleta, paletas, PALETA_POR_DEFECTO));
  const [tonoOscuro, setTonoEstado] = useState(() => valorValido(inicial?.tonoOscuro, tonosOscuro, TONO_OSCURO_POR_DEFECTO));
  const actual = useRef<PreferenciasApariencia>({ paleta, tonoOscuro });
  actual.current = { paleta, tonoOscuro };
  const avisar = useRef(onCambio);
  avisar.current = onCambio;

  // El valor real solo se conoce en el cliente; ScriptDiseno ya lo puso en <html> antes de pintar, aquí solo se lee.
  useEffect(() => {
    const d = document.documentElement.dataset;
    setPaletaEstado(valorValido(d.paleta, paletas, PALETA_POR_DEFECTO));
    setTonoEstado(valorValido(d.oscuro, tonosOscuro, TONO_OSCURO_POR_DEFECTO));
  }, [paletas, tonosOscuro]);

  const setPaleta = useCallback(
    (valor: string) => {
      if (!paletas.some((p) => p.valor === valor)) return;
      setPaletaEstado(valor);
      document.documentElement.dataset.paleta = valor;
      guardar(CLAVE_PALETA, valor);
      avisar.current?.({ ...actual.current, paleta: valor });
    },
    [paletas],
  );

  const setTonoOscuro = useCallback(
    (valor: string) => {
      if (!tonosOscuro.some((t) => t.valor === valor)) return;
      setTonoEstado(valor);
      document.documentElement.dataset.oscuro = valor;
      guardar(CLAVE_TONO_OSCURO, valor);
      avisar.current?.({ ...actual.current, tonoOscuro: valor });
    },
    [tonosOscuro],
  );

  const valor = useMemo(
    () => ({ paleta, setPaleta, paletas, tonoOscuro, setTonoOscuro, tonosOscuro }),
    [paleta, setPaleta, paletas, tonoOscuro, setTonoOscuro, tonosOscuro],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```
git -C D:/github/khipu-design-system add src/components/apariencia.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): add AparienciaProvider for palette and dark-tone preferences" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 3: ScriptDiseno applies the preferences; Inter + JetBrains Mono

**Files:**
- Modify: `src/components/script-diseno.tsx`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `codigoScriptApariencia()`
- Consumes: `Paleta`
- Produces: `ScriptDiseno`

- [ ] **Step 1: Replace `src/components/script-diseno.tsx`** with:

```tsx
import { codigoScriptApariencia, type Paleta, type PreferenciasApariencia, type TonoOscuro } from "@/components/apariencia-opciones";
import { CLAVE_DISENO, DISENO_POR_DEFECTO, DISENOS, type Diseno } from "@/components/disenos";

/**
 * Script en línea para el `<head>` del layout raíz: aplica el diseño, la paleta y el tono oscuro guardados a `<html>`
 * antes del primer pintado, para que no se vea un instante el aspecto por defecto. Server Component; las listas deben ser
 * las mismas que reciben `DisenoProvider` y `AparienciaProvider`, y `inicial` el mismo que el de `AparienciaProvider`.
 */
export function ScriptDiseno({
  disenos = DISENOS,
  porDefecto = DISENO_POR_DEFECTO,
  paletas,
  tonosOscuro,
  inicial,
}: {
  disenos?: Diseno[];
  porDefecto?: string;
  paletas?: Paleta[];
  tonosOscuro?: TonoOscuro[];
  inicial?: Partial<PreferenciasApariencia>;
}) {
  const validos = JSON.stringify(disenos.map((d) => d.valor));
  const diseno = `try{var v=localStorage.getItem(${JSON.stringify(CLAVE_DISENO)});document.documentElement.dataset.diseno=${validos}.indexOf(v)>-1?v:${JSON.stringify(porDefecto)}}catch(e){document.documentElement.dataset.diseno=${JSON.stringify(porDefecto)}}`;
  const codigo = `${diseno};${codigoScriptApariencia({ paletas, tonosOscuro, inicial })}`;
  return <script dangerouslySetInnerHTML={{ __html: codigo }} />;
}
```

- [ ] **Step 2: Fonts in `src/app/layout.tsx`** — replace lines 2 and 7–10 so the file reads:

```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ScriptDiseno } from "@/components/script-diseno";
import "./globals.css";

// Inter para la interfaz y JetBrains Mono para datos (correlativos, ids, código): la pareja de IntelliJ. Vienen en next/font.
// Las variables --font-sans / --font-mono van en <html> (no en <body>) para que las lea todo el árbol, portales incluidos.
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", weight: ["400", "500", "600"], subsets: ["latin"] });
```

(the rest of the file — `metadata` and `RootLayout` — stays as is).

- [ ] **Step 3: Typecheck**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

- [ ] **Step 4: Commit**

```
git -C D:/github/khipu-design-system add src/components/script-diseno.tsx src/app/layout.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): apply palette and dark tone before paint; switch to Inter and JetBrains Mono" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 4: Tokens — light, Medianoche, palettes and dark tones

**Files:**
- Modify: `src/styles/tokens.css`

**Interfaces:**
- Consumes: None
- Produces: `src/styles/tokens.css`

- [ ] **Step 1: Replace the header comment, the `:root` block and the `.dark` block** (lines 1–145 today, up to and excluding the `/*\n * Diseños:` comment). Keep the «papel» comment and its three `html[data-diseno="papel"]…` blocks exactly as they are. New content for that range:

```css
/*
 * khipu design system: color, radius, chart, shadow and motion tokens and the user's appearance preferences.
 * Light in :root, dark in .dark; palettes in html[data-paleta], dark tones in .dark[data-oscuro], designs in html[data-diseno].
 * Plain CSS, no Tailwind directives. Override any of them after importing this file to rebrand an app.
 * Source of truth for both the demo app (src/app/globals.css) and the package (khipu-design-system/tokens.css).
 */

/*
 * Diseño base «khipu» 0.5: pastel compacto. Lienzo gris claro, tarjetas blancas sin borde, el color de la paleta en
 * superficies (ítem activo, métrica destacada, gráficos) y no en botones: la acción principal es casi negra.
 * La paleta por defecto (Lima) y el tono oscuro por defecto (Medianoche) viven aquí; las demás son bloques más abajo.
 * Todo par texto/fondo de las 20 combinaciones (5 paletas × claro + 3 oscuros) lo verifica `npm run check:contraste`.
 * Las duraciones deben coincidir con DURACION de src/lib/movimiento.ts.
 */
:root {
  --duracion-rapida: 120ms;
  --duracion-media: 200ms;
  --duracion-lenta: 320ms;
  /* Paleta Lima (por defecto). Cada paleta redefine solo estos cinco. */
  --acento: #d4f06b;
  --acento-texto: #2f3a07;
  --acento-2: #cfe2fb;
  --acento-2-texto: #1d4f91;
  --acento-3: #f8ec84;
  /* Derivados de la paleta: en claro, el acento al 30 % sobre blanco; la superficie de acento es el acento pleno. */
  --acento-suave: color-mix(in srgb, var(--acento) 30%, #ffffff);
  --acento-2-suave: color-mix(in srgb, var(--acento-2) 30%, #ffffff);
  --acento-3-suave: color-mix(in srgb, var(--acento-3) 30%, #ffffff);
  --acento-superficie: var(--acento);
  --acento-superficie-texto: var(--acento-texto);
  --acento-borde: transparent;
  --background: #eceef1;
  --foreground: #16181d;
  --card: #ffffff;
  --card-foreground: #16181d;
  --popover: #ffffff;
  --popover-foreground: #16181d;
  --primary: #16181d;
  --primary-foreground: #ffffff;
  --secondary: #f4f5f7;
  --secondary-foreground: #16181d;
  --muted: #f4f5f7;
  --muted-foreground: #5d6170;
  --texto-terciario: #666a76;
  --accent: var(--acento-suave);
  --accent-foreground: var(--acento-texto);
  --destructive: #dc2547;
  --destructive-foreground: #ffffff;
  --destructive-suave: #fde3e7;
  --destructive-texto: #a3263c;
  --border: rgba(16, 17, 20, 0.08);
  --input: #dcdee4;
  --ring: var(--acento-texto);
  --success: #e5f5c4;
  --success-foreground: #2f6b12;
  --success-border: rgba(47, 107, 18, 0.18);
  --success-solid: #16a34a;
  --warning: #fdf0c2;
  --warning-foreground: #8a5a00;
  --warning-border: rgba(138, 90, 0, 0.18);
  --warning-solid: #f59e0b;
  --info: #dcebfd;
  --info-foreground: #1d4f91;
  --destructive-border: rgba(163, 38, 60, 0.2);
  --accent-border: color-mix(in srgb, var(--acento-texto) 20%, transparent);
  --primary-light: #3a3d45;
  --overlay: rgba(16, 17, 20, 0.32);
  --brand: var(--acento);
  --brand-foreground: var(--acento-texto);
  --codigo: #16181d;
  --codigo-foreground: #e4e4e9;
  /* Gráficos: chart-1 es la serie principal (líneas, sparklines); chart-base las barras de una serie y chart-destacado la barra resaltada. */
  --chart-1: var(--acento-2-texto);
  --chart-base: var(--acento-2);
  --chart-destacado: var(--acento);
  --chart-2: #10b981;
  --chart-3: #f59e0b;
  --chart-4: #e11d48;
  --chart-5: #0ea5e9;
  --radius: 0.75rem;
  --sidebar: #ffffff;
  --sidebar-foreground: #5d6170;
  --sidebar-primary: var(--acento-superficie);
  --sidebar-primary-foreground: var(--acento-superficie-texto);
  --sidebar-accent: #f4f5f7;
  --sidebar-accent-foreground: #16181d;
  --sidebar-border: transparent;
  --sidebar-ring: var(--ring);
  /* Tarjetas: sin borde ni sombra en reposo en claro; en oscuro llevan borde fino y brillo arriba. */
  --borde-tarjeta: transparent;
  --brillo-tarjeta: 0 0 #0000;
  --sombra-xs: 0 1px 2px rgba(16, 17, 20, 0.05);
  --sombra-sm: 0 1px 2px rgba(16, 17, 20, 0.06), 0 1px 3px rgba(16, 17, 20, 0.04);
  --sombra-md: 0 4px 12px -2px rgba(16, 17, 20, 0.08), 0 2px 4px -2px rgba(16, 17, 20, 0.05);
  --sombra-lg: 0 16px 40px -8px rgba(16, 17, 20, 0.16), 0 4px 12px -4px rgba(16, 17, 20, 0.08);
  --sombra-elevada: 0 1px 2px rgba(16, 17, 20, 0.04), 0 10px 24px -10px rgba(16, 17, 20, 0.14);
}

/* Oscuro Medianoche (por defecto). El acento se usa como luz: superficie teñida + texto pastel, nunca relleno pastel grande. */
.dark {
  --acento-suave: color-mix(in srgb, var(--acento) 14%, var(--card));
  --acento-2-suave: color-mix(in srgb, var(--acento-2) 14%, var(--card));
  --acento-3-suave: color-mix(in srgb, var(--acento-3) 14%, var(--card));
  --acento-superficie: color-mix(in srgb, var(--acento) 14%, var(--card));
  --acento-superficie-texto: var(--acento);
  --acento-borde: color-mix(in srgb, var(--acento) 26%, transparent);
  --background: #0a0f1c;
  --foreground: #e9eef8;
  --card: #111a2c;
  --card-foreground: #e9eef8;
  --popover: #16203a;
  --popover-foreground: #e9eef8;
  --primary: #f4f5f7;
  --primary-foreground: #0a0b0e;
  --secondary: #19233a;
  --secondary-foreground: #e9eef8;
  --muted: #19233a;
  --muted-foreground: #a3afc7;
  --texto-terciario: #8794ad;
  --accent: var(--acento-suave);
  --accent-foreground: var(--acento);
  --destructive: #fb7189;
  --destructive-foreground: #0a0b0e;
  --destructive-suave: color-mix(in srgb, #f7899b 13%, var(--card));
  --destructive-texto: #f7899b;
  --border: rgba(233, 238, 248, 0.07);
  --input: rgba(233, 238, 248, 0.12);
  --ring: var(--acento);
  --success: color-mix(in srgb, #b9e45a 13%, var(--card));
  --success-foreground: #b9e45a;
  --success-border: rgba(185, 228, 90, 0.25);
  --success-solid: #a3d94a;
  --warning: color-mix(in srgb, #f3cf5a 13%, var(--card));
  --warning-foreground: #f3cf5a;
  --warning-border: rgba(243, 207, 90, 0.25);
  --warning-solid: #fbbf24;
  --info: color-mix(in srgb, #8fc0f7 14%, var(--card));
  --info-foreground: #8fc0f7;
  --destructive-border: rgba(247, 137, 155, 0.3);
  --accent-border: var(--acento-borde);
  --primary-light: #ffffff;
  --overlay: rgba(0, 0, 0, 0.6);
  --codigo: #0b1222;
  --codigo-foreground: #e4e4e9;
  --chart-1: var(--acento-2);
  --chart-base: color-mix(in srgb, var(--acento-2) 38%, transparent);
  /* Marcas de gráfico en oscuro: pasos validados para CVD y contraste (se conservan de 0.4). */
  --chart-2: #27a070;
  --chart-3: #bf8a26;
  --chart-4: #dc4a68;
  --chart-5: #3a88c6;
  --sidebar: #0f1626;
  --sidebar-foreground: #a3afc7;
  --sidebar-accent: #19233a;
  --sidebar-accent-foreground: #e9eef8;
  --sidebar-border: rgba(233, 238, 248, 0.06);
  --borde-tarjeta: color-mix(in srgb, var(--foreground) 7%, transparent);
  --brillo-tarjeta: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.5);
  --sombra-xs: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 2px rgba(0, 0, 0, 0.4);
  --sombra-sm: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 1px 3px rgba(0, 0, 0, 0.45);
  --sombra-md: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 24px -4px rgba(0, 0, 0, 0.6);
  --sombra-lg: inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 24px 48px -12px rgba(0, 0, 0, 0.7);
  --sombra-elevada: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 12px 28px -12px rgba(0, 0, 0, 0.8);
}

/*
 * Paletas (preferencia del usuario, components/apariencia.tsx). Cada una redefine solo los cinco acentos; todo lo demás
 * se deriva. Contraste acento-texto/acento · acento-2-texto/acento-2: Índigo 9.09 · 6.53, Océano 8.32 · 6.31,
 * Coral 8.65 · 7.78, Violeta 9.58 · 6.49 (Lima 9.53 · 6.17). «papel» no usa paletas.
 */
html:not([data-diseno="papel"])[data-paleta="indigo"] {
  --acento: #c9c8ff;
  --acento-texto: #23215e;
  --acento-2: #cdeee9;
  --acento-2-texto: #0f5a52;
  --acento-3: #ffdcc2;
}

html:not([data-diseno="papel"])[data-paleta="oceano"] {
  --acento: #9fe3dc;
  --acento-texto: #0b3d3a;
  --acento-2: #d3e4fd;
  --acento-2-texto: #1d4f91;
  --acento-3: #ffe7a0;
}

html:not([data-diseno="papel"])[data-paleta="coral"] {
  --acento: #ffc6b3;
  --acento-texto: #5a1d0c;
  --acento-2: #e3dafb;
  --acento-2-texto: #4a2b8c;
  --acento-3: #fbe39b;
}

html:not([data-diseno="papel"])[data-paleta="violeta"] {
  --acento: #dacbff;
  --acento-texto: #34146b;
  --acento-2: #c6efdf;
  --acento-2-texto: #0f5b40;
  --acento-3: #ffd3e6;
}

/*
 * Tonos del modo oscuro (preferencia del usuario). Medianoche es `.dark`; estos redefinen solo superficies y textos.
 * Contraste sobre tarjeta / soft: Grafito principal 14.81, secundario 7.51, terciario 5.41 / 4.82;
 * Tintado (calculado para las 5 paletas) terciario 5.67–5.72 / 4.78–4.94.
 */
html:not([data-diseno="papel"]).dark[data-oscuro="grafito"] {
  --background: #111214;
  --foreground: #eceef2;
  --card: #1a1b1f;
  --card-foreground: #eceef2;
  --popover: #202126;
  --popover-foreground: #eceef2;
  --secondary: #232529;
  --secondary-foreground: #eceef2;
  --muted: #232529;
  --muted-foreground: #a9abb3;
  --texto-terciario: #8e9099;
  --codigo: #0e0f11;
  --sidebar: #161719;
  --sidebar-foreground: #a9abb3;
  --sidebar-accent: #232529;
  --sidebar-accent-foreground: #eceef2;
}

html:not([data-diseno="papel"]).dark[data-oscuro="tintado"] {
  --background: color-mix(in srgb, var(--acento) 5%, #0b0c10);
  --foreground: #eceef2;
  --card: color-mix(in srgb, var(--acento) 6%, #15171b);
  --card-foreground: #eceef2;
  --popover: color-mix(in srgb, var(--acento) 7%, #1a1c22);
  --popover-foreground: #eceef2;
  --secondary: color-mix(in srgb, var(--acento) 8%, #1d2025);
  --secondary-foreground: #eceef2;
  --muted: color-mix(in srgb, var(--acento) 8%, #1d2025);
  --muted-foreground: #a2a6b2;
  --texto-terciario: #979ba7;
  --codigo: color-mix(in srgb, var(--acento) 4%, #0d0e12);
  --sidebar: color-mix(in srgb, var(--acento) 5%, #121317);
  --sidebar-foreground: #a2a6b2;
  --sidebar-accent: color-mix(in srgb, var(--acento) 8%, #1d2025);
  --sidebar-accent-foreground: #eceef2;
}
```

- [ ] **Step 2: Sanity check the CSS parses** — Run: `npm --prefix D:/github/khipu-design-system run build`
Expected: build succeeds (Tailwind/PostCSS would fail on a syntax error). Visual correctness is checked in Task 17.

- [ ] **Step 3: Commit**

```
git -C D:/github/khipu-design-system add src/styles/tokens.css
git -C D:/github/khipu-design-system commit -m "feat(ds): pastel tokens with five palettes and three dark tones" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 5: Theme mapping, type scale, control height and cn

**Files:**
- Modify: `src/styles/theme.css`
- Modify: `src/lib/utils.ts`
- Test: `scripts/tests/utils.test.mjs`

**Interfaces:**
- Consumes: `src/styles/tokens.css`
- Produces: `h-control`
- Produces: `text-titulo`
- Produces: `shadow-tarjeta`

- [ ] **Step 1: Write the failing test** — append to `scripts/tests/utils.test.mjs`:

```js
test("cn trata text-titulo y text-titulo-pagina como tamaño, no como color", () => {
  assert.equal(cn("text-titulo text-muted-foreground"), "text-titulo text-muted-foreground");
  assert.equal(cn("text-titulo-pagina text-foreground"), "text-titulo-pagina text-foreground");
  assert.equal(cn("text-cuerpo", "text-titulo"), "text-titulo");
});
```

(`cn`, `assert` and `test` are already imported at the top of that file.)

- [ ] **Step 2: Run it, expect FAIL**

Run: `node --test scripts/tests/utils.test.mjs`
Expected: FAIL — `cn("text-titulo text-muted-foreground")` drops one of the two classes.

- [ ] **Step 3: `src/lib/utils.ts`** — in the `createCn` call, change the font-size group to:

```ts
  extend: { classGroups: { "font-size": [{ text: ["etiqueta", "control", "cuerpo", "titulo", "titulo-pagina", "metrica"] }] } },
```

and in the JSDoc above it replace `` (`text-etiqueta`, `text-control`, `text-cuerpo`, `text-metrica`) `` with `` (`text-etiqueta`, `text-control`, `text-cuerpo`, `text-titulo`, `text-titulo-pagina`, `text-metrica`) ``.

- [ ] **Step 4: `src/styles/theme.css`** — inside `@theme inline { … }`:

1. After `--color-codigo-foreground: var(--codigo-foreground);` add:

```css
  --color-acento: var(--acento);
  --color-acento-texto: var(--acento-texto);
  --color-acento-2: var(--acento-2);
  --color-acento-2-texto: var(--acento-2-texto);
  --color-acento-3: var(--acento-3);
  --color-acento-suave: var(--acento-suave);
  --color-acento-2-suave: var(--acento-2-suave);
  --color-acento-3-suave: var(--acento-3-suave);
  --color-acento-superficie: var(--acento-superficie);
  --color-acento-superficie-texto: var(--acento-superficie-texto);
  --color-acento-borde: var(--acento-borde);
  --color-texto-terciario: var(--texto-terciario);
  --color-info: var(--info);
  --color-info-foreground: var(--info-foreground);
  --color-chart-base: var(--chart-base);
  --color-chart-destacado: var(--chart-destacado);
  --color-borde-tarjeta: var(--borde-tarjeta);
```

2. After `--shadow-lg: var(--sombra-lg);` add:

```css
  --shadow-tarjeta: var(--brillo-tarjeta);
  --shadow-elevada: var(--sombra-elevada);
  /* Altura única de control (docs/design-system.md §4): 34 px. `h-control`, `size-control`, `min-h-control`. */
  --spacing-control: 2.125rem;
```

3. Replace the whole type-scale block (from `--text-etiqueta: 0.75rem;` to `--text-metrica--font-weight: 600;`) with:

```css
  --text-etiqueta: 0.71875rem;
  --text-etiqueta--line-height: 1rem;
  --text-control: 0.8125rem;
  --text-control--line-height: 1.25rem;
  --text-cuerpo: 0.8125rem;
  --text-cuerpo--line-height: 1.25rem;
  --text-titulo: 0.90625rem;
  --text-titulo--line-height: 1.25rem;
  --text-titulo--letter-spacing: -0.014em;
  --text-titulo--font-weight: 620;
  --text-titulo-pagina: 1.3125rem;
  --text-titulo-pagina--line-height: 1.5rem;
  --text-titulo-pagina--letter-spacing: -0.028em;
  --text-titulo-pagina--font-weight: 650;
  --text-metrica: 1.625rem;
  --text-metrica--line-height: 1.75rem;
  --text-metrica--letter-spacing: -0.035em;
  --text-metrica--font-weight: 650;
```

4. Replace the `@layer base { … }` block with:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-cuerpo text-foreground;
    /* Inter: 1 con base, a de un piso y dígitos abiertos (los rasgos que usa IntelliJ). */
    font-feature-settings: "cv11", "ss01", "ss03";
  }
  /* Oscuro: dos resplandores tenues de la paleta desde arriba; el lienzo deja de ser un negro plano. */
  .dark body {
    background-image:
      radial-gradient(900px 380px at 55% -160px, color-mix(in srgb, var(--acento) 9%, transparent), transparent 70%),
      radial-gradient(700px 300px at 100% 0, color-mix(in srgb, var(--acento-2) 6%, transparent), transparent 70%);
    background-attachment: fixed;
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

- [ ] **Step 5: Run the tests, expect PASS**

Run: `node --test scripts/tests/utils.test.mjs`
Expected: PASS.

Run: `npm --prefix D:/github/khipu-design-system run build`
Expected: build succeeds.

- [ ] **Step 6: Commit**

```
git -C D:/github/khipu-design-system add src/styles/theme.css src/lib/utils.ts scripts/tests/utils.test.mjs
git -C D:/github/khipu-design-system commit -m "feat(ds): map accent tokens, compact type scale and 34px control height" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 6: Contrast check across 20 combinations

**Files:**
- Modify: `scripts/verificar-contraste.mjs`
- Test: `scripts/tests/contraste.test.mjs`

**Interfaces:**
- Consumes: `src/styles/tokens.css`
- Produces: `resolverColor()`
- Produces: `combinaciones()`

- [ ] **Step 1: Write the failing test** — create `scripts/tests/contraste.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { combinaciones, contraste, resolverColor } from "../verificar-contraste.mjs";

const vars = new Map([
  ["--a", "#ffffff"],
  ["--b", "#000000"],
  ["--c", "var(--a)"],
  ["--d", "color-mix(in srgb, var(--a) 50%, var(--b))"],
  ["--e", "color-mix(in srgb, #ff0000 50%, transparent)"],
  ["--f", "rgba(0, 0, 0, 0.5)"],
]);

test("resuelve var() y color-mix() en srgb", () => {
  assert.deepEqual(resolverColor("--c", vars), { r: 255, g: 255, b: 255, a: 1 });
  const d = resolverColor("--d", vars);
  assert.equal(Math.round(d.r), 128);
  assert.equal(d.a, 1);
  const e = resolverColor("--e", vars);
  assert.equal(e.r, 255);
  assert.equal(e.a, 0.5);
  assert.equal(resolverColor("--f", vars).a, 0.5);
});

test("contraste sigue aceptando #rrggbb", () => {
  assert.equal(contraste("#ffffff", "#000000").toFixed(2), "21.00");
});

test("tokens.css da 20 combinaciones: 5 paletas × (claro + 3 tonos)", () => {
  const css = readFileSync(new URL("../../src/styles/tokens.css", import.meta.url), "utf8");
  const nombres = combinaciones(css).map((c) => c.nombre);
  assert.equal(nombres.length, 20);
  assert.ok(nombres.includes("claro/lima"));
  assert.ok(nombres.includes("oscuro-tintado/violeta"));
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `node --test scripts/tests/contraste.test.mjs`
Expected: FAIL — `resolverColor` / `combinaciones` are not exported.

- [ ] **Step 3: Replace `scripts/verificar-contraste.mjs`** with:

```js
#!/usr/bin/env node
// Falla si algún par texto/fondo baja de 4.5 (WCAG AA) o un indicador no textual (anillo de foco) baja de 3, en las
// 20 combinaciones de apariencia: 5 paletas × (claro + 3 tonos oscuros) de src/styles/tokens.css. Resuelve var() y
// color-mix(in srgb, …) igual que el navegador; un color translúcido se compone sobre su fondo antes de medir.
// «papel» documenta su contraste en su comentario.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MINIMO = 4.5;
const MINIMO_NO_TEXTO = 3;

export const PALETAS = ["lima", "indigo", "oceano", "coral", "violeta"];
export const TONOS = ["medianoche", "grafito", "tintado"];
const selectorPaleta = (p) => `html:not([data-diseno="papel"])[data-paleta="${p}"]`;
const selectorTono = (t) => `html:not([data-diseno="papel"]).dark[data-oscuro="${t}"]`;

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
  ["--sidebar-foreground", "--sidebar"],
  ["--sidebar-primary-foreground", "--sidebar-primary"],
  ["--sidebar-accent-foreground", "--sidebar-accent"],
  ["--codigo-foreground", "--codigo"],
];
export const PARES_NO_TEXTO = [["--ring", "--card"]];

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

function medir(combo, texto, fondo) {
  const f = fondoOpaco(fondo, combo.vars);
  return razon(sobre(resolverColor(texto, combo.vars), f), f);
}

function principal() {
  const css = readFileSync(join(ROOT, "src", "styles", "tokens.css"), "utf8");
  const errores = [];
  let pares = 0;
  for (const combo of combinaciones(css)) {
    for (const [lista, minimo] of [[PARES, MINIMO], [PARES_NO_TEXTO, MINIMO_NO_TEXTO]]) {
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
  console.log(`Contraste: ${pares} pares en 20 combinaciones (texto ≥ ${MINIMO}, foco ≥ ${MINIMO_NO_TEXTO}).`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) principal();
```

- [ ] **Step 4: Run the tests, expect PASS**

Run: `node --test scripts/tests/contraste.test.mjs scripts/tests/verificadores.test.mjs`
Expected: PASS (the existing `verificadores.test.mjs` still imports `contraste` and `leerBloque`, both kept).

Run: `node scripts/verificar-contraste.mjs`
Expected (after Task 4 is merged): `Contraste: 520 pares en 20 combinaciones (texto ≥ 4.5, foco ≥ 3).` If a pair fails, the failing token value in `src/styles/tokens.css` is wrong — fix the token, not the checker.

- [ ] **Step 5: Commit**

```
git -C D:/github/khipu-design-system add scripts/verificar-contraste.mjs scripts/tests/contraste.test.mjs
git -C D:/github/khipu-design-system commit -m "test(ds): check contrast across 5 palettes x 4 appearances, resolving color-mix" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 7: Typography and height checkers for the new scale

**Files:**
- Modify: `scripts/verificar-tipografia.mjs`
- Modify: `scripts/verificar-alturas.mjs`
- Test: `scripts/tests/tipografia-alturas.test.mjs`

**Interfaces:**
- Consumes: `h-control`
- Produces: `revisarTexto()`

- [ ] **Step 1: Write the failing test** — create `scripts/tests/tipografia-alturas.test.mjs`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import { revisarTexto } from "../verificar-tipografia.mjs";

test("uppercase y tracking se permiten solo en src/lib/estilos.ts", () => {
  const linea = '"text-etiqueta uppercase tracking-wider"';
  assert.equal(revisarTexto(linea, "src/components/ui/x.tsx").length, 2);
  assert.deepEqual(revisarTexto(linea, "src/lib/estilos.ts"), []);
});

test("los tamaños nuevos de la escala no se marcan", () => {
  assert.deepEqual(revisarTexto('"text-titulo text-titulo-pagina text-metrica"', "src/x.tsx"), []);
});

test("text-base y text-sm sueltos se marcan fuera de ui/", () => {
  assert.equal(revisarTexto('"text-base"', "src/components/patrones/x.tsx").length, 1);
  assert.equal(revisarTexto('"text-sm"', "src/components/patrones/x.tsx").length, 1);
});
```

- [ ] **Step 2: Run it, expect FAIL**

Run: `node --test scripts/tests/tipografia-alturas.test.mjs`
Expected: FAIL — `revisarTexto` ignores `ruta` and does not flag `text-base`.

- [ ] **Step 3: `scripts/verificar-tipografia.mjs`** — replace the header comment, `REGLAS`, `revisarTexto` and the loop inside `principal` with:

```js
// Falla si un archivo usa tamaños de texto sueltos (`text-[Npx]`, `text-sm`, `text-base`…), mayúsculas o tracking ancho.
// La escala tipográfica tiene nombre (docs/design-system.md §3): text-etiqueta, text-control, text-cuerpo, text-titulo,
// text-titulo-pagina, text-metrica. `uppercase` y `tracking-*` solo viven en las recetas de src/lib/estilos.ts (ROTULO,
// CABECERA_TABLA). Una línea que contiene `tipografia-ok` queda exenta.
```

```js
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
```

and in `principal`, call `revisarTexto(readFileSync(archivo, "utf8"), relative(ROOT, archivo))`.

Note: the existing test in `scripts/tests/verificadores.test.mjs` `"no confunde tracking-tight, text-control ni toUpperCase"` passes `"… text-sm"` and expects no findings; change that test's string to `'"tracking-tight text-control" x.toUpperCase()'` (drop `text-sm`) — that is the only edit to that file.

- [ ] **Step 4: `scripts/verificar-alturas.mjs`** — the control height is now `h-control`:
  - In the header comment, replace "deja de medir h-9" with "deja de medir h-control (34 px)".
  - Replace `const ALTURA = /(?<![\w-])(?:[a-z-]+:)*h-(?!auto\b)[\d.[]/;` with `const ALTURA = /(?<![\w-])(?:[a-z-]+:)*h-(?!auto\b|control\b)[\w.[]/;` (any explicit height other than `h-control`/`h-auto` is an override).
  - Replace the recipe check regex `/(?<![\w-])h-9(?![\w.])/` with `/(?<![\w-])h-control(?![\w-])/`, the message `no mide h-9 (altura única de control)` with `no mide h-control (altura única de control)`, and the comment `toda receta de control de lib/estilos.ts mide h-9` with `… mide h-control`.
  - Final error header: `Alturas fuera de la altura única de control (h-control, 34 px; docs/design-system.md §4):`.

- [ ] **Step 5: Run the tests, expect PASS**

Run: `node --test scripts/tests/tipografia-alturas.test.mjs scripts/tests/verificadores.test.mjs`
Expected: PASS. (`npm run lint` as a whole is only expected green after Tasks 8, 10–16 migrate the sources.)

- [ ] **Step 6: Commit**

```
git -C D:/github/khipu-design-system add scripts/verificar-tipografia.mjs scripts/verificar-alturas.mjs scripts/tests/tipografia-alturas.test.mjs scripts/tests/verificadores.test.mjs
git -C D:/github/khipu-design-system commit -m "test(ds): typography and height checks for the 0.5 scale" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 8: Phosphor icons and 34 px height — codemod

**Files:**
- Create: `scripts/codemod-05.mjs`
- Create: `src/lib/iconos.ts`
- Test: `scripts/tests/codemod-05.test.mjs`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/app/ejemplo/acciones.tsx`
- Modify: `src/app/ejemplo/galeria.tsx`
- Modify: `src/app/ejemplo/page.tsx`
- Modify: `src/app/ejemplo/sidebar-app.tsx`
- Modify: `src/app/ejemplo/tabla.tsx`
- Modify: `src/components/datos/kpi.tsx`
- Modify: `src/components/datos/tabla-datos.tsx`
- Modify: `src/components/feedback/alerta.tsx`
- Modify: `src/components/feedback/banner.tsx`
- Modify: `src/components/feedback/estado-vacio.tsx`
- Modify: `src/components/feedback/spinner.tsx`
- Modify: `src/components/feedback/toast.tsx`
- Modify: `src/components/formularios/autocomplete.tsx`
- Modify: `src/components/formularios/buscador.tsx`
- Modify: `src/components/formularios/casilla.tsx`
- Modify: `src/components/formularios/combobox.tsx`
- Modify: `src/components/formularios/contrasena.tsx`
- Modify: `src/components/formularios/entrada-fecha.tsx`
- Modify: `src/components/formularios/entrada-monto.tsx`
- Modify: `src/components/formularios/stepper-numerico.tsx`
- Modify: `src/components/formularios/zona-archivos.tsx`
- Modify: `src/components/nav/menu-usuario.tsx`
- Modify: `src/components/nav/mobile-nav.tsx`
- Modify: `src/components/nav/selector-contexto.tsx`
- Modify: `src/components/nav/sidebar-nav.tsx`
- Modify: `src/components/nav/theme-toggle.tsx`
- Modify: `src/components/nav/top-bar.tsx`
- Modify: `src/components/navegacion/acordeon.tsx`
- Modify: `src/components/navegacion/dialogo-confirmacion.tsx`
- Modify: `src/components/navegacion/menu-acciones.tsx`
- Modify: `src/components/navegacion/paleta.tsx`
- Modify: `src/components/navegacion/panel-lateral.tsx`
- Modify: `src/components/navegacion/pasos.tsx`
- Modify: `src/components/patrones/bloque-codigo.tsx`
- Modify: `src/components/patrones/boton-copiar.tsx`
- Modify: `src/components/patrones/cabecera-dialogo.tsx`
- Modify: `src/components/patrones/cabecera-seccion.tsx`
- Modify: `src/components/patrones/confirmacion-en-linea.tsx`
- Modify: `src/components/patrones/pie-tabla.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Modify: `src/components/ui/grupo-botones.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/menu.tsx`
- Modify: `src/components/ui/pagination.tsx`
- Modify: `src/components/ui/popover.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/selector-por-pagina.tsx`
- Modify: `src/components/ui/sheet.tsx`
- Modify: `src/components/ui/toolbar.tsx`
- Modify: `src/lib/estilos.ts`

**Interfaces:**
- Consumes: None
- Produces: `IconoComponente`
- Produces: `PESO_ICONO`
- Produces: `PESO_ICONO_ACTIVO`
- Produces: `src/lib/iconos.ts`
- Produces: `migrarIconos()`
- Produces: `migrarAlturas()`

- [ ] **Step 1: Install Phosphor**

Run: `npm --prefix D:/github/khipu-design-system install @phosphor-icons/react@^2.1.10`
Expected: `package.json` gains `"@phosphor-icons/react": "^2.1.10"` under `dependencies`.

- [ ] **Step 2: Write the failing test** — create `scripts/tests/codemod-05.test.mjs`:

```js
import assert from "node:assert/strict";
import { test } from "node:test";
import * as phosphor from "@phosphor-icons/react";
import { MAPA_ICONOS, migrarAlturas, migrarIconos } from "../codemod-05.mjs";

test("cada icono del mapa existe en @phosphor-icons/react", () => {
  for (const [lucide, nuevo] of Object.entries(MAPA_ICONOS)) assert.ok(nuevo in phosphor, `${lucide} → ${nuevo}`);
});

test("reescribe imports, usos, el tipo LucideIcon y strokeWidth", () => {
  const antes = [
    'import { CheckIcon, ChevronDownIcon, type LucideIcon } from "lucide-react";',
    'import { cn } from "@/lib/utils";',
    "type P = { icon: LucideIcon };",
    'const a = <ChevronDownIcon className="size-4" />;',
    'const b = <CheckIcon className="size-3" strokeWidth={3} />;',
  ].join("\n");
  const despues = migrarIconos(antes);
  assert.ok(despues.startsWith('import { CaretDownIcon, CheckIcon } from "@phosphor-icons/react";\nimport type { IconoComponente } from "@/lib/iconos";'));
  assert.ok(!despues.includes("lucide-react"));
  assert.ok(despues.includes("type P = { icon: IconoComponente };"));
  assert.ok(despues.includes('<CaretDownIcon className="size-4" />'));
  assert.ok(despues.includes('<CheckIcon className="size-3" weight="bold" />'));
});

test("renombra Menu de lucide sin tocar otros identificadores", () => {
  const antes = 'import { Menu } from "lucide-react";\nconst x = <Menu className="size-5" />; const MenuTrigger = 1;';
  const despues = migrarIconos(antes);
  assert.ok(despues.includes("<ListIcon"));
  assert.ok(despues.includes("const MenuTrigger = 1;"));
});

test("un archivo sin lucide no cambia", () => {
  assert.equal(migrarIconos('import { cn } from "@/lib/utils";\n'), 'import { cn } from "@/lib/utils";\n');
});

test("alturas: h-9, size-9 y min-h-9 pasan a control; h-90 y h-9/50 no", () => {
  assert.equal(migrarAlturas('"h-9 sm:h-9 size-9 min-h-9"'), '"h-control sm:h-control size-control min-h-control"');
  assert.equal(migrarAlturas('"h-90 w-9 h-9.5"'), '"h-90 w-9 h-9.5"');
});

test("idempotente", () => {
  const una = migrarAlturas(migrarIconos('import { XIcon } from "lucide-react";\n<XIcon className="h-9" />'));
  assert.equal(migrarAlturas(migrarIconos(una)), una);
});
```

- [ ] **Step 3: Run it, expect FAIL**

Run: `node --test scripts/tests/codemod-05.test.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `codemod-05.mjs`.

- [ ] **Step 4: Create `scripts/codemod-05.mjs`**:

```js
#!/usr/bin/env node
// Codemod de 0.5: (1) iconos de lucide-react → @phosphor-icons/react (mismo componente, otro nombre) y el tipo
// `LucideIcon` → `IconoComponente`; (2) la altura de control h-9 / size-9 / min-h-9 → h-control (34 px).
// Idempotente. Uso: node scripts/codemod-05.mjs [carpetas…]   (por defecto: src)

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Nombre en lucide-react → nombre en @phosphor-icons/react 2.1 (sufijo Icon). */
export const MAPA_ICONOS = {
  ArrowDownIcon: "ArrowDownIcon",
  ArrowDownRightIcon: "ArrowDownRightIcon",
  ArrowUpDownIcon: "ArrowsDownUpIcon",
  ArrowUpIcon: "ArrowUpIcon",
  ArrowUpRightIcon: "ArrowUpRightIcon",
  BanIcon: "ProhibitIcon",
  BellIcon: "BellIcon",
  BoldIcon: "TextBIcon",
  BookOpenIcon: "BookOpenIcon",
  CalendarIcon: "CalendarBlankIcon",
  CheckCircle2Icon: "CheckCircleIcon",
  CheckIcon: "CheckIcon",
  ChevronDownIcon: "CaretDownIcon",
  ChevronLeftIcon: "CaretLeftIcon",
  ChevronRightIcon: "CaretRightIcon",
  ChevronUpIcon: "CaretUpIcon",
  ChevronsUpDownIcon: "CaretUpDownIcon",
  CircleAlertIcon: "WarningCircleIcon",
  CopyIcon: "CopyIcon",
  DownloadIcon: "DownloadSimpleIcon",
  EyeIcon: "EyeIcon",
  EyeOffIcon: "EyeSlashIcon",
  FileIcon: "FileIcon",
  FileTextIcon: "FileTextIcon",
  InboxIcon: "TrayIcon",
  InfoIcon: "InfoIcon",
  ItalicIcon: "TextItalicIcon",
  KeyRoundIcon: "KeyIcon",
  ListOrderedIcon: "ListNumbersIcon",
  LoaderCircleIcon: "CircleNotchIcon",
  LogOutIcon: "SignOutIcon",
  Menu: "ListIcon",
  MinusIcon: "MinusIcon",
  MonitorIcon: "MonitorIcon",
  MoonIcon: "MoonIcon",
  MoreHorizontalIcon: "DotsThreeIcon",
  PackageIcon: "PackageIcon",
  PaletteIcon: "PaletteIcon",
  PencilIcon: "PencilSimpleIcon",
  PlusIcon: "PlusIcon",
  ReceiptTextIcon: "ReceiptIcon",
  RefreshCwIcon: "ArrowClockwiseIcon",
  RocketIcon: "RocketLaunchIcon",
  SearchIcon: "MagnifyingGlassIcon",
  SendIcon: "PaperPlaneTiltIcon",
  ShieldCheckIcon: "ShieldCheckIcon",
  SparklesIcon: "SparkleIcon",
  SunIcon: "SunIcon",
  Trash2Icon: "TrashIcon",
  TriangleAlertIcon: "WarningIcon",
  UnderlineIcon: "TextUnderlineIcon",
  UploadCloudIcon: "CloudArrowUpIcon",
  XIcon: "XIcon",
};

const IMPORT_LUCIDE = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+"lucide-react";?[ \t]*\r?\n?/gm;

/** Reescribe los imports y usos de lucide-react de un archivo. Un nombre que no está en el mapa es un error. */
export function migrarIconos(texto) {
  const imports = [...texto.matchAll(IMPORT_LUCIDE)];
  if (imports.length === 0) return texto;
  const valores = new Set();
  let usaTipo = false;
  for (const m of imports) {
    for (const crudo of m[2].split(",").map((x) => x.trim()).filter(Boolean)) {
      const nombre = crudo.replace(/^type\s+/, "");
      if (nombre === "LucideIcon") {
        usaTipo = true;
        continue;
      }
      if (!(nombre in MAPA_ICONOS)) throw new Error(`Icono sin equivalencia en MAPA_ICONOS: ${nombre}`);
      valores.add(nombre);
    }
  }
  // El primer import de lucide se cambia por un marcador (ahí van los imports nuevos); los demás se quitan.
  const MARCADOR = "\u0000IMPORTS_KHIPU\u0000\n";
  let primero = true;
  let cuerpo = texto.replace(IMPORT_LUCIDE, () => {
    if (!primero) return "";
    primero = false;
    return MARCADOR;
  });
  for (const viejo of [...valores].sort((a, b) => b.length - a.length)) {
    const nuevo = MAPA_ICONOS[viejo];
    if (viejo !== nuevo) cuerpo = cuerpo.replace(new RegExp(`\\b${viejo}\\b`, "g"), nuevo);
  }
  if (usaTipo) cuerpo = cuerpo.replace(/\bLucideIcon\b/g, "IconoComponente");
  // lucide engrosaba el check con strokeWidth={3}; en Phosphor es el peso bold.
  cuerpo = cuerpo.replace(/strokeWidth=\{3\}/g, 'weight="bold"');
  const lineas = [];
  if (valores.size > 0) lineas.push(`import { ${[...valores].map((v) => MAPA_ICONOS[v]).sort().join(", ")} } from "@phosphor-icons/react";`);
  if (usaTipo) lineas.push('import type { IconoComponente } from "@/lib/iconos";');
  // Los imports nuevos van donde estaba el primero de lucide (después de un eventual "use client").
  return cuerpo.replace(MARCADOR, lineas.length > 0 ? `${lineas.join("\n")}\n` : "");
}

/** La altura única de control pasa de 36 px (h-9) a 34 px (h-control). */
export function migrarAlturas(texto) {
  return texto.replace(/(?<![\w-])(min-h|h|size)-9(?![\w./-])/g, "$1-control");
}

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.(tsx?)$/.test(entrada) ? [ruta] : [];
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  let cambiados = 0;
  for (const dir of dirs.length > 0 ? dirs : ["src"]) {
    for (const archivo of listarArchivos(resolve(ROOT, dir))) {
      const antes = readFileSync(archivo, "utf8");
      const despues = migrarAlturas(migrarIconos(antes));
      if (despues !== antes) {
        writeFileSync(archivo, despues);
        cambiados++;
        console.log(relative(ROOT, archivo).replaceAll("\\", "/"));
      }
    }
  }
  console.log(`codemod-05: ${cambiados} archivos.`);
}
```

- [ ] **Step 5: Create `src/lib/iconos.ts`**:

```ts
import type { IconWeight } from "@phosphor-icons/react";
import type { ComponentType } from "react";

/**
 * Cualquier componente de icono: Phosphor (usa `weight`) o Lucide (lo ignora). Es el tipo de las props `icon`/`icono`
 * del kit, así que una app que ya pasa iconos de lucide-react sigue funcionando.
 */
export type IconoComponente = ComponentType<{ className?: string; weight?: IconWeight; "aria-hidden"?: boolean | "true" | "false" }>;

/** Peso por defecto del kit (docs/design-system.md «Iconos»): duotono. */
export const PESO_ICONO: IconWeight = "duotone";
/** Peso del estado activo o destacado (ítem del sidebar, métrica destacada, tab activa): relleno. */
export const PESO_ICONO_ACTIVO: IconWeight = "fill";
```

- [ ] **Step 6: Run the tests, expect PASS**

Run: `node --test scripts/tests/codemod-05.test.mjs`
Expected: PASS, 6 tests. If the first test names a missing icon, fix its entry in `MAPA_ICONOS` with the closest Phosphor 2.1 export.

- [ ] **Step 7: Run the codemod over the sources**

Run: `node D:/github/khipu-design-system/scripts/codemod-05.mjs`
Expected: lists the files changed (the ones in **Files** above) and ends with `codemod-05: N archivos.` Run it a second time: `codemod-05: 0 archivos.`

Then verify no lucide import or 36 px height is left:

Run: `git -C D:/github/khipu-design-system grep -nE "lucide-react|(^|[^-a-z])(h|size|min-h)-9([^0-9./-]|$)" -- src`
Expected: no output (exit code 1 from `git grep` means no matches — that is the success case). A match inside a comment is fine; a match in a class string means the codemod missed it — fix it by hand.

- [ ] **Step 8: package.json** — lucide becomes an optional peer (consumers that still pass Lucide icons keep working; the kit no longer imports it):
  - In `peerDependencies` keep `"lucide-react": "^1.45.0"`.
  - Add a top-level `"peerDependenciesMeta": { "lucide-react": { "optional": true } }` right after `peerDependencies`.
  - Keep `lucide-react` in `devDependencies` (the type test of `IconoComponente` in Task 17 uses it).
  - Change `"description"` to end with `(React 19, base-ui, Phosphor, Motion).` instead of `(React 19, base-ui, lucide).`

- [ ] **Step 9: Typecheck**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0. A `strokeWidth` other than `{3}` or a Lucide-only prop flagged here gets the Phosphor equivalent (`weight`) by hand.

- [ ] **Step 10: Commit**

```
git -C D:/github/khipu-design-system add -A
git -C D:/github/khipu-design-system commit -m "refactor(ds): migrate icons to Phosphor and controls to the 34px height" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 9: Providers — appearance and default icon weight

**Files:**
- Modify: `src/components/providers.tsx`

**Interfaces:**
- Consumes: `AparienciaProvider`
- Consumes: `PESO_ICONO`
- Produces: `Providers`

- [ ] **Step 1: Replace `src/components/providers.tsx`** with:

```tsx
"use client";

import { IconContext, type IconProps } from "@phosphor-icons/react";
import { ThemeProvider } from "next-themes";
import type { ComponentProps } from "react";
import { AparienciaProvider } from "@/components/apariencia";
import { DisenoProvider } from "@/components/diseno";
import { ToastProvider } from "@/components/feedback/toast";
import { TooltipProvider } from "@/components/feedback/tooltip";
import { ProveedorMovimiento } from "@/components/movimiento";
import { PESO_ICONO } from "@/lib/iconos";

// Fuera del render: un objeto nuevo en cada render volvería a pintar todos los iconos.
const ICONOS: IconProps = { weight: PESO_ICONO };

/**
 * attribute="class" pone `.dark` en <html>, que es lo que espera el @custom-variant de src/styles/theme.css.
 * `DisenoProvider` maneja `data-diseno`; `AparienciaProvider` la paleta y el tono oscuro (`apariencia` le pasa
 * `inicial` y `onCambio` para guardarlos en el perfil del usuario). Los iconos de Phosphor salen en duotono.
 */
export function Providers({
  children,
  apariencia,
}: {
  children: React.ReactNode;
  apariencia?: Omit<ComponentProps<typeof AparienciaProvider>, "children">;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <DisenoProvider>
        <AparienciaProvider {...apariencia}>
          <IconContext.Provider value={ICONOS}>
            <ProveedorMovimiento>
              <TooltipProvider delay={300}>
                <ToastProvider>{children}</ToastProvider>
              </TooltipProvider>
            </ProveedorMovimiento>
          </IconContext.Provider>
        </AparienciaProvider>
      </DisenoProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```
git -C D:/github/khipu-design-system add src/components/providers.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): wire AparienciaProvider and duotone icons into Providers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 10: Recipes — pills, 12/18 px radii, cards, table header

**Files:**
- Modify: `src/lib/estilos.ts`

**Interfaces:**
- Consumes: `h-control`
- Consumes: `shadow-tarjeta`
- Produces: `ROTULO`
- Produces: `TARJETA_ELEVABLE`
- Produces: `TARJETA`
- Produces: `CABECERA_TABLA`

- [ ] **Step 1: Edit `src/lib/estilos.ts`** (after Task 8 the heights already read `h-control`). Replace the following exports with exactly these values; everything not listed stays as is:

```ts
// La principal es casi negra (primary) en claro y casi blanca en oscuro: el color de la paleta vive en superficies, no en botones.
export const ACCION_PRINCIPAL = `inline-flex h-control items-center gap-1.5 rounded-full bg-primary px-4 text-control font-semibold whitespace-nowrap text-primary-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-primary/85 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const ACCION_SECUNDARIA = `inline-flex h-control items-center gap-1.5 rounded-full bg-card px-3.5 text-control font-medium whitespace-nowrap text-foreground ring-1 ring-border ${TRANSICION_CONTROL} hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const CONTROL_FILTRO = "h-control rounded-full border border-border bg-card text-control font-medium text-foreground";
export const SEGMENTADO = "inline-flex min-h-control w-fit flex-wrap items-center gap-0.5 rounded-full bg-secondary p-[3px]";
export const SEGMENTO_BASE =
  "relative inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-control font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-active:text-foreground aria-[current=page]:text-foreground";
export const CAMPO =
  "h-control w-full rounded-lg border border-input bg-card px-3 text-control text-foreground transition-[border-color,box-shadow] duration-(--duracion-rapida) ease-salida outline-none placeholder:text-texto-terciario focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";
export const SELECT_NATIVO =
  "h-control rounded-lg border border-input bg-card px-2.5 text-control text-foreground transition-[border-color,box-shadow] duration-(--duracion-rapida) ease-salida outline-none focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_PRIMARIO = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-control font-semibold text-primary-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-primary/85 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_SECUNDARIO = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-card px-4 text-control font-medium text-foreground ring-1 ring-border ${TRANSICION_CONTROL} hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_DESTRUCTIVO = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-destructive px-4 text-control font-semibold text-destructive-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-destructive/90 ${FOCO} ${PRESION} ${DESHABILITADO}`;
```

```ts
// ── Rótulos: encabezados de tabla y de grupo del menú. Las únicas mayúsculas del kit (verificar-tipografia lo permite solo aquí). ──
export const ROTULO = "text-etiqueta font-semibold uppercase tracking-[0.04em] text-texto-terciario";

// ── Tablas ──
// Celda de cabecera de la tabla estándar (`TableHead`). `patrones/pie-tabla` la re-exporta para no romper a quien la importa desde allí.
export const CABECERA_TABLA = `h-auto px-3 pt-2.5 pb-1 ${ROTULO}`;

// ── Tarjetas y secciones ──
// Sin borde ni sombra en claro (la separación la da el lienzo gris); en oscuro, borde fino, brillo arriba y un degradado leve.
export const TARJETA =
  "rounded-xl border border-borde-tarjeta bg-card shadow-tarjeta dark:bg-[linear-gradient(180deg,color-mix(in_srgb,#fff_2.5%,var(--card)),var(--card)_120px)]";
/** Tarjeta que se eleva 2 px al pasar el mouse (métricas). Con «reducir movimiento» solo cambia la sombra. */
export const TARJETA_ELEVABLE = `${TARJETA} transition-[transform,box-shadow,border-color] duration-(--duracion-media) ease-salida hover:shadow-elevada motion-safe:hover:-translate-y-0.5`;
```

Also update the file's top JSDoc: replace `` `h-9` (36 px) `` with `` `h-control` (34 px) `` and the scale line with `` Texto solo de la escala con nombre (§3): `text-etiqueta` 11.5, `text-control` 13, `text-cuerpo` 13, `text-titulo` 14.5, `text-titulo-pagina` 21, `text-metrica` 26. ``

- [ ] **Step 2: Verify**

Run: `node D:/github/khipu-design-system/scripts/verificar-alturas.mjs`
Expected: `Alturas: ninguna receta de control sobrescrita.`

Run: `node --test D:/github/khipu-design-system/scripts/tests/tipografia-alturas.test.mjs`
Expected: PASS.

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

- [ ] **Step 3: Commit**

```
git -C D:/github/khipu-design-system add src/lib/estilos.ts
git -C D:/github/khipu-design-system commit -m "feat(ds): pill controls, borderless cards and uppercase table header recipe" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 11: Base components — shapes, bands and popovers

**Files:**
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/select.tsx`
- Modify: `src/components/ui/table.tsx`
- Modify: `src/components/ui/popover.tsx`
- Modify: `src/components/ui/menu.tsx`
- Modify: `src/components/ui/hover-card.tsx`
- Modify: `src/components/feedback/tooltip.tsx`
- Modify: `src/components/feedback/toast.tsx`
- Modify: `src/components/patrones/pill-estado.tsx`
- Modify: `src/components/patrones/pie-tabla.tsx`
- Modify: `src/components/datos/tabla-datos.tsx`
- Modify: `src/app/ejemplo/tabla.tsx`
- Modify: `src/components/nav/logo.tsx`
- Modify: `src/components/navegacion/panel-lateral.tsx`
- Modify: `src/components/navegacion/pasos.tsx`
- Modify: `src/components/patrones/cabecera-dialogo.tsx`
- Modify: `src/components/patrones/tarjeta-destacada.tsx`

**Interfaces:**
- Consumes: `TARJETA`
- Consumes: `CABECERA_TABLA`
- Consumes: `shadow-tarjeta`
- Produces: `CONTENEDOR_TABLA`

Apply these exact class replacements (each is a literal substring replacement inside the named file; run the file's surrounding code unchanged):

- [ ] **Step 1: `ui/button.tsx`**
  - Base string: `rounded-lg border border-transparent` → `rounded-full border border-transparent`.
  - `xs` size: `rounded-[min(var(--radius-md),10px)]` → `rounded-full` (both occurrences, `xs` and `icon-xs`).
  - `outline` variant: `"border-border bg-card shadow-xs hover:border-input hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"` → `"border-border bg-card hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"`.
  - Comment above `size`: `miden h-9 (la altura única de control, §4)` → `miden h-control (34 px, la altura única de control, §4)`.
  - Base string: append ` font-semibold` is NOT wanted; keep `font-medium`.

- [ ] **Step 2: `ui/card.tsx`**
  - `Card`: `rounded-xl bg-card py-(--card-spacing) text-sm text-card-foreground ring-1 ring-border [--card-spacing:--spacing(4)]` → `rounded-xl border border-borde-tarjeta bg-card py-(--card-spacing) text-cuerpo text-card-foreground shadow-tarjeta [--card-spacing:--spacing(3.5)]`.
  - `CardTitle`: `"font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm"` → `"font-heading text-titulo group-data-[size=sm]/card:text-control"`.
  - `CardDescription`: `"text-sm text-muted-foreground"` → `"text-control text-muted-foreground"`.

- [ ] **Step 3: `ui/input.tsx`** — in the class string: `bg-transparent px-2.5 py-1 text-base` → `bg-card px-3 py-1 text-control`, and remove any `md:text-sm` token.

- [ ] **Step 4: `ui/select.tsx`**
  - Trigger: `rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm` → `rounded-lg border border-input bg-card py-2 pr-2 pl-3 text-control`.
  - Popup: `rounded-lg bg-popover` → `rounded-xl bg-popover`.
  - Item: `rounded-md py-1 pr-8 pl-1.5 text-sm` → `rounded-lg py-1.5 pr-8 pl-2 text-control`.

- [ ] **Step 5: `ui/table.tsx`** — rows become rounded bands:
  - `Table` inner `<table>`: `"w-full caption-bottom text-sm"` → `"w-full caption-bottom border-separate border-spacing-x-0 border-spacing-y-[3px] text-cuerpo"`.
  - `TableHeader`: `"[&_tr]:border-b"` → `""` (keep the `cn(…, className)` call with the empty string).
  - `TableBody`: `"[&_tr:last-child]:border-0"` → `""`.
  - `TableFooter`: `"border-t bg-muted/50 font-medium [&>tr]:last:border-b-0"` → `"font-medium"`.
  - `TableRow`: `"border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted"` → `"group/fila"`.
  - `TableHead`: `"h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0"` → `"h-8 px-3 text-left align-middle font-medium whitespace-nowrap text-texto-terciario [&:has([role=checkbox])]:pr-0"`.
  - `TableCell`: `"p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0"` → `"bg-secondary px-3 py-2 align-middle whitespace-nowrap transition-colors duration-(--duracion-rapida) first:rounded-l-xl last:rounded-r-xl group-hover/fila:bg-[color-mix(in_srgb,var(--secondary),var(--foreground)_4%)] group-data-[state=selected]/fila:bg-accent group-has-aria-expanded/fila:bg-[color-mix(in_srgb,var(--secondary),var(--foreground)_4%)] [&:has([role=checkbox])]:pr-0"`.

- [ ] **Step 6: Popups** (radius 18, items rounded-lg)
  - `ui/popover.tsx`: `"w-72 rounded-lg bg-popover p-3.5` → `"w-72 rounded-xl bg-popover p-3.5`.
  - `ui/menu.tsx`: `"min-w-56 rounded-lg bg-popover p-1` → `"min-w-56 rounded-xl bg-popover p-1.5`; item: `rounded-md px-2 py-1.5` → `rounded-lg px-2.5 py-1.5`.
  - `ui/hover-card.tsx`: `"w-64 rounded-lg bg-popover p-3` → `"w-64 rounded-xl bg-popover p-3`.
  - `feedback/tooltip.tsx`: `"max-w-64 rounded-md bg-foreground` → `"max-w-64 rounded-lg bg-foreground`.
  - `feedback/toast.tsx`: the `ToastPrimitive.Action` class `rounded-lg border border-border bg-card` → `rounded-full border border-border bg-card`.

- [ ] **Step 7: Pills and chips — `patrones/pill-estado.tsx`**
  - `Chip`: `"inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-mono text-etiqueta whitespace-nowrap text-muted-foreground"` → `"inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap text-muted-foreground tabular-nums"`, and its JSDoc → `/** Chip informativo (contadores, versiones). Los ids van en `ChipCodigo` (mono). */`.
  - `ChipCodigo`: `"rounded-md px-2 py-0.5 font-mono text-control font-medium"` → `"rounded-full px-2.5 py-0.5 font-mono text-etiqueta font-medium"`.
  - `ChipPronto`: `"rounded-md bg-secondary px-1.5 py-0.5` → `"rounded-full bg-secondary px-2 py-0.5`.
  - `PillEstado` stays (already `rounded-full`, no border).

- [ ] **Step 8: Table container and headers**
  - `patrones/pie-tabla.tsx`: `export const CONTENEDOR_TABLA = "min-w-0 overflow-hidden rounded-xl border border-border/90 bg-card shadow-xs transition-opacity";` → `export const CONTENEDOR_TABLA = "min-w-0 overflow-hidden rounded-xl border border-borde-tarjeta bg-card px-2 pb-1 shadow-tarjeta transition-opacity";`. In the same file, the pagination's active page `bg-foreground … text-background` stays; its `rounded-lg` page/number buttons become `rounded-full`, and the footer bar `border-t border-border/60 bg-muted` becomes `bg-transparent` (no top border).
  - `datos/tabla-datos.tsx` line with `<TableRow className="border-b border-border/80 bg-muted hover:bg-muted">` → `<TableRow className="hover:bg-transparent">`.
  - `app/ejemplo/tabla.tsx` same replacement on its header row.

- [ ] **Step 9: Titles onto the named scale** (the only Tailwind sizes left outside `ui/`, which the new typography rule flags):
  - `nav/logo.tsx`: `"truncate text-base font-bold tracking-tight text-foreground"` → `"truncate text-titulo font-bold text-foreground"`.
  - `navegacion/panel-lateral.tsx`: `"text-base font-semibold tracking-tight text-foreground"` → `"text-titulo text-foreground"`.
  - `navegacion/pasos.tsx`: `"mt-0.5 text-base font-semibold tracking-tight text-foreground"` → `"mt-0.5 text-titulo text-foreground"`.
  - `patrones/cabecera-dialogo.tsx`: `<DialogTitle className="text-base font-semibold tracking-tight">` → `<DialogTitle className="text-titulo">`.
  - `patrones/tarjeta-destacada.tsx`: `"text-base leading-snug font-semibold break-words"` → `"text-titulo break-words"`.
  - `patrones/pie-tabla.tsx` (`TablaVacia`): `<p className="text-sm">` → `<p className="text-cuerpo">`.

Run: `node D:/github/khipu-design-system/scripts/verificar-tipografia.mjs`
Expected: `Tipografía: todo dentro de la escala.` (if Tasks 12 and 15 are not merged yet, findings may remain only in their files).

- [ ] **Step 10: Verify**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

Run: `node D:/github/khipu-design-system/scripts/verificar-alturas.mjs`
Expected: `Alturas: ninguna receta de control sobrescrita.`

Run: `npm --prefix D:/github/khipu-design-system run build`
Expected: success.

- [ ] **Step 11: Commit**

```
git -C D:/github/khipu-design-system add src/components/ui src/components/feedback/tooltip.tsx src/components/feedback/toast.tsx src/components/patrones src/components/datos/tabla-datos.tsx src/app/ejemplo/tabla.tsx src/components/nav/logo.tsx src/components/navegacion/panel-lateral.tsx src/components/navegacion/pasos.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): pill buttons, banded table rows and 18px popovers" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 12: Shell and sidebar — floating card, pill items, filled active icon

**Files:**
- Modify: `src/components/nav/shell.tsx`
- Modify: `src/components/nav/sidebar.tsx`
- Modify: `src/components/nav/sidebar-nav.tsx`

**Interfaces:**
- Consumes: `ROTULO`
- Consumes: `PESO_ICONO_ACTIVO`
- Consumes: `PESO_ICONO`
- Consumes: `IconoComponente`
- Produces: `SidebarNav`

- [ ] **Step 1: `nav/shell.tsx`** — replace `Shell` and `Pagina` bodies with:

```tsx
export function Shell({ sidebar, topBar, children }: { sidebar: ReactNode; topBar: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar flotante: tarjeta de 216px con 12px de margen sobre el lienzo. */}
      <aside className="hidden w-[228px] shrink-0 py-3 pl-3 md:sticky md:top-0 md:block md:h-screen">
        <div className="h-full overflow-x-hidden overflow-y-auto rounded-xl border border-borde-tarjeta bg-sidebar text-sidebar-foreground shadow-tarjeta">
          {sidebar}
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {topBar}
        <main className="min-w-0 flex-1 overflow-x-auto p-3">{children}</main>
      </div>
    </div>
  );
}

/** Contenedor de página: bloques separados por gap-3 y ancho máximo 1520px. */
export function Pagina({ children }: { children: ReactNode }) {
  return <div className="mx-auto grid w-full max-w-[1520px] min-w-0 grid-cols-1 gap-3">{children}</div>;
}
```

and update the JSDoc of `Shell` to: `Esqueleto de la app privada: sidebar flotante de 216px (md+) + columna con top bar y main.`

- [ ] **Step 2: `nav/sidebar.tsx`** — remove the separators: `border-b border-border/60 px-4` → `px-4`, and `border-t border-border/60 p-3` → `p-3`. JSDoc `(240px en desktop` → `(216px en desktop`.

- [ ] **Step 3: `nav/sidebar-nav.tsx`** (after Task 8 it imports `type IconoComponente`):
  - Add imports: `import { ROTULO } from "@/lib/estilos";` and `import { PESO_ICONO, PESO_ICONO_ACTIVO } from "@/lib/iconos";`.
  - `const ITEM_BASE = "relative isolate flex w-full min-w-0 items-center gap-2.5 rounded-md px-2.5 py-1.5 text-control";` → `const ITEM_BASE = "relative isolate flex w-full min-w-0 items-center gap-2.5 rounded-full px-3 py-[7px] text-control";`
  - Group title `<span className="truncate px-2.5 pt-1 pb-1 text-etiqueta font-medium text-muted-foreground">` → `<span className={cn("truncate px-3 pt-1 pb-1.5", ROTULO)}>`.
  - Pending chip `rounded-md bg-secondary px-1.5` → `rounded-full bg-secondary px-2`.
  - Disabled icon: `<Icono className="size-4 shrink-0 text-muted-foreground/50" />` → `<Icono weight={PESO_ICONO} className="size-[18px] shrink-0 text-muted-foreground/50" />`.
  - Active link classes `active ? "font-medium text-sidebar-primary-foreground"` → `active ? "font-semibold text-sidebar-primary-foreground"`.
  - Indicator: `className="absolute inset-0 -z-10 rounded-md bg-sidebar-primary"` → `className="absolute inset-0 -z-10 rounded-full border border-acento-borde bg-sidebar-primary"`.
  - Icon: `<Icono className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />` → `<Icono weight={active ? PESO_ICONO_ACTIVO : PESO_ICONO} className={cn("size-[18px] shrink-0", active ? "text-current" : "text-muted-foreground")} />`.
  - The `nav` wrapper: `gap-3 px-2 pt-2` → `gap-4 px-2.5 pt-2`.

- [ ] **Step 4: Verify**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

Run: `node D:/github/khipu-design-system/scripts/verificar-tipografia.mjs`
Expected: no finding in the three files of this task (other files may still be pending other tasks).

- [ ] **Step 5: Commit**

```
git -C D:/github/khipu-design-system add src/components/nav/shell.tsx src/components/nav/sidebar.tsx src/components/nav/sidebar-nav.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): floating sidebar with pill items and filled active icon" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 13: Appearance selector in the user menu

**Files:**
- Create: `src/components/nav/selector-apariencia.tsx`
- Modify: `src/components/nav/menu-usuario.tsx`

**Interfaces:**
- Consumes: `useApariencia()`
- Produces: `SelectorApariencia`
- Produces: `SelectorPaleta`
- Produces: `SelectorTonoOscuro`

- [ ] **Step 1: Create `src/components/nav/selector-apariencia.tsx`**:

```tsx
"use client";

import { useRef, type CSSProperties } from "react";
import { useApariencia } from "@/components/apariencia";
import { useDiseno } from "@/components/diseno";
import { FOCO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

type Opcion = { valor: string; etiqueta: string; fondo: string };

/**
 * Grupo de muestras redondas que se elige como un radio: Tab entra a la elegida, las flechas cambian y aplican.
 * Cada muestra lleva su nombre en `aria-label` y en el tooltip nativo.
 */
function GrupoMuestras({ etiqueta, opciones, valor, onCambio }: { etiqueta: string; opciones: Opcion[]; valor: string; onCambio: (valor: string) => void }) {
  const botones = useRef<Array<HTMLButtonElement | null>>([]);

  function mover(desde: number, paso: number) {
    const i = (desde + paso + opciones.length) % opciones.length;
    onCambio(opciones[i].valor);
    botones.current[i]?.focus();
  }

  return (
    <div role="radiogroup" aria-label={etiqueta} className="flex flex-wrap items-center gap-1.5">
      {opciones.map((o, i) => {
        const activa = o.valor === valor;
        return (
          <button
            key={o.valor}
            ref={(el) => {
              botones.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={activa}
            aria-label={o.etiqueta}
            title={o.etiqueta}
            tabIndex={activa ? 0 : -1}
            onClick={() => onCambio(o.valor)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowDown") {
                e.preventDefault();
                mover(i, 1);
              } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                mover(i, -1);
              }
            }}
            style={{ background: o.fondo } as CSSProperties}
            className={cn(
              "size-6 shrink-0 cursor-pointer rounded-full border-2 border-popover ring-1 ring-border transition-shadow duration-(--duracion-rapida) ease-salida",
              activa && "ring-2 ring-foreground",
              FOCO,
            )}
          />
        );
      })}
    </div>
  );
}

/** Muestras de las paletas (acento, acento 2 y acento 3 en un círculo). No pinta nada sin `AparienciaProvider` ni con «papel». */
export function SelectorPaleta({ className }: { className?: string }) {
  const { paleta, setPaleta, paletas } = useApariencia();
  const { diseno } = useDiseno();
  if (paletas.length < 2 || diseno === "papel") return null;
  const opciones = paletas.map((p) => ({
    valor: p.valor,
    etiqueta: p.etiqueta,
    fondo: `conic-gradient(${p.muestra[0]} 0 50%, ${p.muestra[1]} 0 75%, ${p.muestra[2]} 0)`,
  }));
  return (
    <div className={className}>
      <GrupoMuestras etiqueta="Paleta de color" opciones={opciones} valor={paleta} onCambio={setPaleta} />
    </div>
  );
}

/** Muestras de los tonos del modo oscuro. Se puede elegir estando en claro: se aplica al pasar a oscuro. */
export function SelectorTonoOscuro({ className }: { className?: string }) {
  const { tonoOscuro, setTonoOscuro, tonosOscuro } = useApariencia();
  const { diseno } = useDiseno();
  if (tonosOscuro.length < 2 || diseno === "papel") return null;
  const opciones = tonosOscuro.map((t) => ({ valor: t.valor, etiqueta: t.etiqueta, fondo: t.muestra }));
  return (
    <div className={className}>
      <GrupoMuestras etiqueta="Tono del modo oscuro" opciones={opciones} valor={tonoOscuro} onCambio={setTonoOscuro} />
    </div>
  );
}

/** Paleta y tono oscuro, uno debajo del otro con su rótulo. Va en el menú de usuario bajo el tema. */
export function SelectorApariencia({ className }: { className?: string }) {
  const { paletas } = useApariencia();
  const { diseno } = useDiseno();
  if (paletas.length < 2 || diseno === "papel") return null;
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="grid gap-1">
        <span className="text-etiqueta font-medium text-muted-foreground">Paleta</span>
        <SelectorPaleta />
      </div>
      <div className="grid gap-1">
        <span className="text-etiqueta font-medium text-muted-foreground">Oscuro</span>
        <SelectorTonoOscuro />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `nav/menu-usuario.tsx`**
  - Imports: add `import { useApariencia } from "@/components/apariencia";` and `import { SelectorApariencia } from "@/components/nav/selector-apariencia";`.
  - Props: after `mostrarDiseno = true,` add `mostrarApariencia = true,`; in the type, after the `mostrarDiseno?: boolean;` line add:

```tsx
  /** Muestra la paleta y el tono oscuro bajo el diseño. Solo aparece con `AparienciaProvider` y fuera de «papel». */
  mostrarApariencia?: boolean;
```

  - Body: change `const { disenos } = useDiseno();` to `const { diseno, disenos } = useDiseno();` and below `const conDiseno = …` add:

```tsx
  const { paletas } = useApariencia();
  const conApariencia = mostrarApariencia && paletas.length > 1 && diseno !== "papel";
```

  - After the `{conDiseno ? ( … ) : null}` block add:

```tsx
        {conApariencia ? (
          <>
            <MenuSeparator />
            <div className="px-2 pt-1.5 pb-1 text-etiqueta font-medium text-muted-foreground">Apariencia</div>
            <div className="px-2 pb-2">
              <SelectorApariencia />
            </div>
          </>
        ) : null}
```

  - Visual: the trigger `rounded-lg border border-border/60 bg-muted/80 p-2` → `rounded-xl bg-secondary p-2`; both avatar boxes `rounded-md bg-primary … text-primary-foreground` → `rounded-full bg-acento text-acento-texto`; the account card `rounded-md bg-accent/70` → `rounded-lg bg-accent`; `ShieldCheckIcon … text-primary` → `ShieldCheckIcon … text-accent-foreground`.
  - JSDoc of `MenuUsuario`: `la cuenta, el tema en línea, el diseño (debajo del tema), acciones propias` → `la cuenta, el tema en línea, el diseño y la apariencia (paleta y tono oscuro), acciones propias`.

- [ ] **Step 3: Verify**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

- [ ] **Step 4: Commit**

```
git -C D:/github/khipu-design-system add src/components/nav/selector-apariencia.tsx src/components/nav/menu-usuario.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): palette and dark-tone selector in the user menu" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 14: Metric cards — header, visual, comparison chip

**Files:**
- Modify: `src/components/patrones/metricas.tsx`
- Modify: `src/components/datos/kpi.tsx`

**Interfaces:**
- Consumes: `TARJETA_ELEVABLE`
- Consumes: `IconoComponente`
- Consumes: `PESO_ICONO`
- Consumes: `PESO_ICONO_ACTIVO`
- Produces: `TonoMetrica`
- Produces: `VisualMetrica`
- Produces: `TarjetaMetrica`
- Produces: `VisualDeMetrica`
- Produces: `ChipVariacion`
- Produces: `Metrica`
- Produces: `Kpi`

- [ ] **Step 1: Replace `src/components/patrones/metricas.tsx`** with:

```tsx
import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { TARJETA_ELEVABLE } from "@/lib/estilos";
import { PESO_ICONO, PESO_ICONO_ACTIVO, type IconoComponente } from "@/lib/iconos";
import { cn } from "@/lib/utils";

export type Tono = "ok" | "aviso" | "error" | "neutro";
/** Tono de una métrica: los de estado más `acento` (la paleta del usuario) para métricas sin juicio (facturado, emitidos). */
export type TonoMetrica = Tono | "acento";
export type VisualMetrica = { tipo: "barra"; valor: number } | { tipo: "puntos"; total: number; marcados: number };

const TEXTO_TONO: Record<TonoMetrica, string> = {
  ok: "text-success-foreground",
  aviso: "text-warning-foreground",
  error: "text-destructive-texto",
  neutro: "text-muted-foreground",
  acento: "text-acento-2-texto dark:text-acento-2",
};
const RELLENO_TONO: Record<TonoMetrica, string> = {
  ok: "bg-success-solid",
  aviso: "bg-warning-solid",
  error: "bg-destructive",
  neutro: "bg-muted-foreground/50",
  acento: "bg-chart-destacado",
};

/** Punto de estado de 6px para ayudas y pills. */
export function Punto({ tono }: { tono: Tono }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", RELLENO_TONO[tono])} />;
}

/** Ayuda de una métrica con punto y color según tono. */
export function AyudaMetrica({ tono, children }: { tono: Tono; children: ReactNode }) {
  return (
    <span className={cn("flex min-w-0 items-center gap-1", tono !== "neutro" && TEXTO_TONO[tono])}>
      <Punto tono={tono} />
      <span className="truncate">{children}</span>
    </span>
  );
}

/**
 * Tarjeta de métrica: encabezado (icono por tono, etiqueta y `acciones` a la derecha, típicamente un `MenuAcciones`)
 * y el cuerpo que le pases. `destacada` la pinta con la superficie de acento de la paleta (en oscuro, teñida).
 * El icono va sin fondo: el color dice el tono (docs/design-system.md «Iconos»).
 */
export function TarjetaMetrica({
  etiqueta,
  icono: Icono,
  tono = "neutro",
  destacada,
  acciones,
  className,
  children,
}: {
  etiqueta: ReactNode;
  icono?: IconoComponente;
  tono?: TonoMetrica;
  destacada?: boolean;
  acciones?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        TARJETA_ELEVABLE,
        "flex min-w-0 flex-col gap-2 px-[15px] pt-3.5 pb-[13px]",
        destacada && "border-acento-borde bg-acento-superficie text-acento-superficie-texto dark:bg-acento-superficie",
        className,
      )}
    >
      <div className="flex min-h-6 min-w-0 items-center gap-[7px] text-control font-medium">
        {Icono ? (
          <Icono aria-hidden weight={destacada ? PESO_ICONO_ACTIVO : PESO_ICONO} className={cn("size-4 shrink-0", destacada ? "text-current" : TEXTO_TONO[tono])} />
        ) : null}
        <span className={cn("min-w-0 flex-1 truncate", destacada ? "text-current" : "text-muted-foreground")}>{etiqueta}</span>
        {acciones ? <span className="-my-1 shrink-0">{acciones}</span> : null}
      </div>
      {children}
    </div>
  );
}

/** Mini visual de la métrica: barra de progreso (0–100) o puntos (n de total marcados en el color del tono). */
export function VisualDeMetrica({ visual, tono = "neutro", destacada }: { visual: VisualMetrica; tono?: TonoMetrica; destacada?: boolean }) {
  if (visual.tipo === "barra") {
    const valor = Math.max(0, Math.min(100, visual.valor));
    return (
      <div role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={100} className={cn("h-1.5 overflow-hidden rounded-full", destacada ? "bg-current/15" : "bg-secondary")}>
        <div className={cn("h-full rounded-full", destacada ? "bg-current" : RELLENO_TONO[tono])} style={{ width: `${valor}%` }} />
      </div>
    );
  }
  const marcados = Math.max(0, Math.min(visual.total, visual.marcados));
  return (
    <div aria-hidden className="grid h-1.5 gap-1" style={{ gridTemplateColumns: `repeat(${visual.total}, minmax(0, 1fr))` }}>
      {Array.from({ length: visual.total }, (_, i) => (
        <span key={i} className={cn("rounded-full", i < marcados ? (destacada ? "bg-current" : RELLENO_TONO[tono]) : destacada ? "bg-current/15" : "bg-secondary")} />
      ))}
    </div>
  );
}

/** Chip de variación: verde si es buena, rojo si es mala, neutro si es cero. `invertir` cuando bajar es bueno. */
export function ChipVariacion({ variacion, invertir, destacada }: { variacion: number; invertir?: boolean; destacada?: boolean }) {
  const positiva = variacion > 0;
  const negativa = variacion < 0;
  const buena = invertir ? negativa : positiva;
  const mala = invertir ? positiva : negativa;
  const Flecha = positiva ? ArrowUpRightIcon : negativa ? ArrowDownRightIcon : MinusIcon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-etiqueta font-semibold tabular-nums",
        destacada ? "bg-current/12 text-current" : buena ? "bg-success text-success-foreground" : mala ? "bg-destructive-suave text-destructive-texto" : "bg-secondary text-foreground",
      )}
    >
      <Flecha weight="bold" className="size-3" />
      {Math.abs(variacion).toFixed(1)}%
    </span>
  );
}

/**
 * Una métrica en su tarjeta: etiqueta, valor grande (con sufijo opcional), mini visual opcional y ayuda. Para que el
 * valor cuente al aparecer, pásale `<NumeroAnimado valor={…} />` como hijo; un identificador va envuelto en `font-mono`.
 */
export function Metrica({
  etiqueta,
  children,
  sufijo,
  ayuda,
  icono,
  tono,
  visual,
  destacada,
  acciones,
}: {
  etiqueta: string;
  children: ReactNode;
  sufijo?: ReactNode;
  ayuda: ReactNode;
  icono?: IconoComponente;
  tono?: TonoMetrica;
  visual?: VisualMetrica;
  destacada?: boolean;
  acciones?: ReactNode;
}) {
  return (
    <TarjetaMetrica etiqueta={etiqueta} icono={icono} tono={tono} destacada={destacada} acciones={acciones}>
      <div className={cn("flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-metrica tabular-nums", destacada ? "text-current" : "text-foreground")}>
        {children}
        {sufijo ? <span className={cn("text-control font-normal", destacada ? "opacity-70" : "text-texto-terciario")}>{sufijo}</span> : null}
      </div>
      {visual ? <VisualDeMetrica visual={visual} tono={tono} destacada={destacada} /> : null}
      <div className={cn("flex min-w-0 items-center gap-1.5 truncate text-etiqueta", destacada ? "opacity-80" : "text-texto-terciario")}>{ayuda}</div>
    </TarjetaMetrica>
  );
}

/** Fila de métricas: tarjetas separadas por 12px (4 columnas en desktop, 2 en tablet, 1 en móvil). */
export function FilaMetricas({ children, columnas = 4 }: { children: ReactNode; columnas?: 2 | 3 | 4 }) {
  return (
    <section
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-2",
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

- [ ] **Step 2: Replace `src/components/datos/kpi.tsx`** with:

```tsx
import type { ReactNode } from "react";
import { TrazoAnimado } from "@/components/datos/trazo-animado";
import { ChipVariacion, TarjetaMetrica, VisualDeMetrica, type TonoMetrica, type VisualMetrica } from "@/components/patrones/metricas";
import type { IconoComponente } from "@/lib/iconos";
import { cn } from "@/lib/utils";

/** Sparkline de una serie (sin ejes): línea de la serie principal que se dibuja al aparecer, área tenue y punto final. */
export function Sparkline({ datos, ancho = 120, alto = 28, className }: { datos: number[]; ancho?: number; alto?: number; className?: string }) {
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
      <path d={`${linea} L${ux.toFixed(1)},${alto} L${px},${alto} Z`} fill="var(--chart-base)" opacity="0.7" />
      <TrazoAnimado d={linea} stroke="var(--chart-1)" />
      <circle cx={ux} cy={uy} r="3" fill="var(--chart-1)" stroke="var(--card)" strokeWidth="2" />
    </svg>
  );
}

/**
 * KPI con tendencia en su tarjeta: encabezado con icono, valor grande, sparkline (`serie`) o mini visual (`visual`) y
 * chip de variación vs. período anterior. `invertir` cuando bajar es bueno (rechazos, errores). Para que el valor cuente
 * al aparecer, pásale `<NumeroAnimado valor={…} />`.
 */
export function Kpi({
  etiqueta,
  valor,
  variacion,
  periodo = "vs. período anterior",
  invertir,
  serie,
  icono,
  tono,
  visual,
  destacada,
  acciones,
  className,
}: {
  etiqueta: ReactNode;
  valor: ReactNode;
  /** Porcentaje, p. ej. 12.5 o -3; omite para no mostrar tendencia. */
  variacion?: number;
  periodo?: ReactNode;
  invertir?: boolean;
  serie?: number[];
  icono?: IconoComponente;
  tono?: TonoMetrica;
  visual?: VisualMetrica;
  destacada?: boolean;
  acciones?: ReactNode;
  className?: string;
}) {
  return (
    <TarjetaMetrica etiqueta={etiqueta} icono={icono} tono={tono} destacada={destacada} acciones={acciones} className={className}>
      <div className={cn("text-metrica tabular-nums", destacada ? "text-current" : "text-foreground")}>{valor}</div>
      {serie ? <Sparkline datos={serie} /> : visual ? <VisualDeMetrica visual={visual} tono={tono} destacada={destacada} /> : null}
      {variacion != null ? (
        <div className={cn("flex min-w-0 items-center gap-1.5 text-etiqueta", destacada ? "opacity-80" : "text-texto-terciario")}>
          <ChipVariacion variacion={variacion} invertir={invertir} destacada={destacada} />
          <span className="truncate">{periodo}</span>
        </div>
      ) : null}
    </TarjetaMetrica>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0 (existing callers of `Kpi`, `Metrica`, `FilaMetricas`, `AyudaMetrica`, `Punto` compile unchanged).

- [ ] **Step 4: Commit**

```
git -C D:/github/khipu-design-system add src/components/patrones/metricas.tsx src/components/datos/kpi.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): metric cards with icon header, mini visual and comparison chip" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 15: Charts — highlighted bar, palette colors, accessible values

**Files:**
- Modify: `src/components/datos/grafico.tsx`

**Interfaces:**
- Consumes: `TARJETA`
- Consumes: `h-control`
- Produces: `GraficoBarras`

- [ ] **Step 1: Edit `src/components/datos/grafico.tsx`**
  - Add `import { TARJETA } from "@/lib/estilos";`.
  - `GraficoBarras` props: add `destacado?: number` (destructured as `destacado`) with the type comment `/** Índice de la categoría a resaltar con el acento de la paleta (solo con una serie). */`.
  - Container of both charts: `cn("relative rounded-xl border border-border bg-card px-3 py-3 shadow-xs", className)` → `cn(TARJETA, "relative px-4 py-3.5", className)`.
  - Title of both charts: `"px-1 pb-2 text-cuerpo font-semibold text-foreground"` → `"px-1 pb-2 text-titulo text-foreground"`.
  - Axis labels: remove `fontFamily="var(--font-mono)"` and change `fill="var(--muted-foreground)"` → `fill="var(--texto-terciario)"` on the tick and category `<text>` elements; add `className="tabular-nums"` to the tick `<text>`.
  - Grid: `stroke="var(--border)" strokeDasharray={t === 0 ? undefined : "2 3"}` → `stroke="var(--border)"` (solid recessive lines).
  - Hover column: `fill={hover === i ? "var(--muted)" : "transparent"}` stays.
  - Bar fill: replace `fill={COLORES[j % COLORES.length]}` in `GraficoBarras` with

```tsx
                    fill={series.length === 1 ? (i === destacado ? "var(--chart-destacado)" : "var(--chart-base)") : COLORES[j % COLORES.length]}
```

  - Bar shape: the path uses a 4 px corner radius (`a4,4`); change both `a4,4 0 0 1 4,-4` / `a4,4 0 0 1 4,4` to an 8 px radius capped by the bar width: compute `const r = Math.min(8, barra / 2);` next to `const bh = …` and use template values `a${r},${r} 0 0 1 ${r},${-r}`, `h${barra - 2 * r}`, `a${r},${r} 0 0 1 ${r},${r}` and `v${-Math.max(0, bh - r)}` / `v${Math.max(0, bh - r)}`.
  - Accessibility: inside each `<m.path …>` add a child `<title>{`${c}: ${formato(v)}`}</title>` (change the self-closing `/>` to `>…</m.path>`).
  - Tooltip (`function Tooltip`): `rounded-md border border-border bg-popover … text-popover-foreground shadow-md` → `rounded-lg bg-foreground px-2.5 py-1.5 text-etiqueta text-background shadow-md`; inside, `text-muted-foreground` → `text-background/70` and the value span `font-mono tabular-nums` → `font-semibold tabular-nums`. Its swatch for a single-series chart uses the bar color: in `GraficoBarras` pass `color: series.length === 1 ? (hover === destacado ? "var(--chart-destacado)" : "var(--chart-base)") : COLORES[j % COLORES.length]`.

- [ ] **Step 2: Verify**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

Run: `node D:/github/khipu-design-system/scripts/verificar-tipografia.mjs src/components/datos`
Expected: no findings.

- [ ] **Step 3: Commit**

```
git -C D:/github/khipu-design-system add src/components/datos/grafico.tsx
git -C D:/github/khipu-design-system commit -m "feat(ds): palette-colored charts with a highlighted bar and value titles" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 16: Demo dashboard

**Files:**
- Modify: `src/app/ejemplo/page.tsx`
- Modify: `src/app/ejemplo/galeria.tsx`

**Interfaces:**
- Consumes: `Metrica`
- Consumes: `GraficoBarras`
- Consumes: `SelectorApariencia`
- Consumes: `CONTENEDOR_TABLA`
- Consumes: `TARJETA`
- Produces: `src/app/ejemplo/page.tsx`

- [ ] **Step 1: `src/app/ejemplo/page.tsx`** — replace everything from `export default function EjemploPage() {` down to (not including) the `<section className={`${ENTRADA} rounded-xl border border-border bg-card shadow-xs`} style={pasoEntrada(2)}>` of «Pills y chips» with:

```tsx
export default function EjemploPage() {
  return (
    <Pagina>
      <header className={`${ENTRADA} flex flex-wrap items-end justify-between gap-3 px-1 pt-1`} style={pasoEntrada(0)}>
        <div>
          <h1 className="text-titulo-pagina text-foreground">Documentos</h1>
          <p className="mt-0.5 text-control text-texto-terciario">Comprobantes electrónicos emitidos y su estado ante SUNAT.</p>
        </div>
      </header>

      <div className={ENTRADA} style={pasoEntrada(1)}>
        <FilaMetricas>
          <Metrica etiqueta="Aceptados" icono={CheckCircleIcon} tono="ok" destacada sufijo="/ 136" visual={{ tipo: "barra", valor: 98 }} ayuda="98% con CDR · +12% vs. agosto">
            <NumeroAnimado valor={133} />
          </Metrica>
          <Metrica etiqueta="Facturado" icono={WalletIcon} tono="acento" ayuda="Septiembre · 136 comprobantes">
            <span>S/ 48.2k</span>
          </Metrica>
          <Metrica etiqueta="Pendientes" icono={ClockIcon} tono="aviso" visual={{ tipo: "puntos", total: 10, marcados: 2 }} ayuda={<AyudaMetrica tono="aviso">Reintento automático 16:00</AyudaMetrica>}>
            <NumeroAnimado valor={2} />
          </Metrica>
          <Metrica etiqueta="Rechazados" icono={XCircleIcon} tono="error" visual={{ tipo: "puntos", total: 10, marcados: 1 }} ayuda={<AyudaMetrica tono="error">Revisar observaciones</AyudaMetrica>}>
            <NumeroAnimado valor={1} />
          </Metrica>
        </FilaMetricas>
      </div>

      <div className={`${ENTRADA} grid grid-cols-1 items-start gap-3 xl:grid-cols-[1fr_300px]`} style={pasoEntrada(2)}>
        <GraficoBarras
          titulo="Comprobantes emitidos"
          categorias={["1 set", "2 set", "3 set", "4 set", "5 set", "6 set", "7 set", "8 set", "9 set", "10 set", "11 set", "12 set"]}
          series={[{ nombre: "Comprobantes", valores: [18, 25, 14, 28, 22, 35, 20, 27, 17, 29, 24, 32] }]}
          destacado={5}
          alto={190}
        />
        <section className={`${TARJETA} grid gap-3 px-4 py-3.5`}>
          <h2 className="text-titulo text-foreground">Estado ante SUNAT</h2>
          <div className="flex items-center justify-around py-1">
            <ProgresoCircular valor={95} tono="success" tamano="lg" />
            <ProgresoCircular valor={85} tono="warning" tamano="lg" />
            <ProgresoCircular valor={64} tono="destructive" tamano="lg" />
          </div>
          <Timeline
            eventos={[
              { id: "1", titulo: "F001-136 aceptada", detalle: "CDR recibido", fecha: "15:00", tono: "ok", actual: true },
              { id: "2", titulo: "B001-2210 observada", detalle: "Reintento 16:00", fecha: "14:59", tono: "aviso" },
              { id: "3", titulo: "Nueva llave de API", detalle: "por Ana", fecha: "14:52", tono: "neutro" },
            ]}
          />
        </section>
      </div>

      <div className={ENTRADA} style={pasoEntrada(3)}>
        <TablaEjemplo />
      </div>
```

and adjust the remaining `pasoEntrada(n)` calls after it so they keep increasing (`2→4`, `3→5`, `4→6`). Imports at the top of the file become:

```tsx
import { CheckCircleIcon, ClockIcon, KeyIcon, TrayIcon, WalletIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { GraficoBarras } from "@/components/datos/grafico";
import { Timeline } from "@/components/datos/timeline";
import { ProgresoCircular } from "@/components/feedback/progreso";
import { Pagina } from "@/components/nav/shell";
import { BloqueCodigo } from "@/components/patrones/bloque-codigo";
import { CabeceraSeccion } from "@/components/patrones/cabecera-seccion";
import { AyudaMetrica, FilaMetricas, Metrica } from "@/components/patrones/metricas";
import { Chip, ChipCodigo, PillEstado } from "@/components/patrones/pill-estado";
import { NumeroAnimado } from "@/components/patrones/numero-animado";
import { TablaVacia } from "@/components/patrones/pie-tabla";
import { ENTRADA, TARJETA, pasoEntrada } from "@/lib/estilos";
import { Galeria } from "./galeria";
import { TablaEjemplo } from "./tabla";
```

(`page.tsx` is a Server Component: it imports Phosphor from `@phosphor-icons/react/dist/ssr`, and passes icon components to `Metrica`, which is also a Server Component, so no client boundary is crossed. Keep `KeyIcon` and `TrayIcon` — the codemod's names for the old `KeyRoundIcon`/`InboxIcon` — for «Pills y chips» and the empty state.) Replace the remaining `rounded-xl border border-border bg-card shadow-xs` section wrappers in this file with `${TARJETA}`.

- [ ] **Step 2: `src/app/ejemplo/galeria.tsx`** — in the «Diseño, botones y tarjetas destacadas» section, after the `<SelectorDiseno />` row add:

```tsx
          <span className="text-etiqueta font-medium text-muted-foreground">Apariencia</span>
          <SelectorApariencia />
```

with `import { SelectorApariencia } from "@/components/nav/selector-apariencia";` next to the `SelectorDiseno` import, and update that section's `subtitulo` to `"selector de diseño · paleta y tono oscuro · button · tarjeta destacada"`. Replace in this file every `rounded-xl border border-border bg-card shadow-xs` with `${TARJETA}` (import `TARJETA` from `@/lib/estilos` if it is not imported).

- [ ] **Step 3: Verify**

Run: `npm --prefix D:/github/khipu-design-system run typecheck`
Expected: exit 0.

Run: `npm --prefix D:/github/khipu-design-system run build`
Expected: success, `/ejemplo` prerendered.

- [ ] **Step 4: Commit**

```
git -C D:/github/khipu-design-system add src/app/ejemplo/page.tsx src/app/ejemplo/galeria.tsx
git -C D:/github/khipu-design-system commit -m "feat(demo): dashboard with metric cards, highlighted chart and appearance selector" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```

---

### Task 17: Package, registry, docs, version 0.5.0 and full verification

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `registry/registry.json`
- Modify: `CHANGELOG.md`
- Modify: `README.md`
- Modify: `docs/design-system.md`
- Modify: `docs/guia-visual.html`
- Modify: `cli/khipu.mjs`
- Modify: `scripts/build-registry.mjs`
- Create: `scripts/tests/iconos-tipo.test.mjs`

**Interfaces:**
- Consumes: `src/app/ejemplo/page.tsx`
- Consumes: `ScriptDiseno`
- Consumes: `h-control`
- Consumes: `combinaciones()`
- Consumes: `revisarTexto()`
- Consumes: `Providers`
- Consumes: `CONTENEDOR_TABLA`
- Consumes: `SidebarNav`
- Consumes: `IconoComponente`
- Produces: `package.json`

- [ ] **Step 1: package.json**
  - `"version": "0.5.0"`.
  - In `exports`, after `"./script-diseno"` add:

```json
    "./apariencia": {
      "types": "./dist/components/apariencia.d.ts",
      "default": "./dist/components/apariencia.js"
    },
    "./apariencia-opciones": {
      "types": "./dist/components/apariencia-opciones.d.ts",
      "default": "./dist/components/apariencia-opciones.js"
    },
```

Then run `npm --prefix D:/github/khipu-design-system install` to sync `package-lock.json` (version field).

- [ ] **Step 2: Type test of `IconoComponente`** — create `scripts/tests/iconos-tipo.test.mjs`. It writes a temporary `.ts` file and type-checks it with the project's TypeScript, proving a Lucide icon and a Phosphor icon are both assignable:

```js
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

test("IconoComponente acepta iconos de Phosphor y de Lucide", () => {
  const dir = mkdtempSync(join(ROOT, ".tmp-iconos-"));
  try {
    writeFileSync(
      join(dir, "prueba.ts"),
      [
        'import { CheckIcon } from "@phosphor-icons/react";',
        'import { Check } from "lucide-react";',
        'import type { IconoComponente } from "../src/lib/iconos";',
        "const a: IconoComponente = CheckIcon;",
        "const b: IconoComponente = Check;",
        "export { a, b };",
      ].join("\n"),
    );
    const tsc = join(ROOT, "node_modules", "typescript", "bin", "tsc");
    execFileSync(process.execPath, [tsc, "--noEmit", "--strict", "--skipLibCheck", "--jsx", "react-jsx", "--moduleResolution", "bundler", "--module", "esnext", "--target", "es2022", join(dir, "prueba.ts")], { cwd: ROOT, stdio: "pipe" });
    assert.ok(true);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

Run: `node --test scripts/tests/iconos-tipo.test.mjs`
Expected: PASS. If it fails on the Lucide assignment, widen `IconoComponente` in `src/lib/iconos.ts` to `ComponentType<any>`-free form `ComponentType<{ className?: string } & Record<string, unknown>>` and re-run.

- [ ] **Step 3: Registry and package**

Run: `npm --prefix D:/github/khipu-design-system run registry:build`
Expected: `registry/registry.json actualizado con N items.` (N = previous 87 + `apariencia`, `apariencia-opciones`, `nav/selector-apariencia`, `lib/iconos`; `lib/iconos.ts` must be added to the explicit list in `scripts/build-registry.mjs` next to `lib/movimiento.ts`, since `lib/` files are listed by hand.)

Run: `npm --prefix D:/github/khipu-design-system run verify:paquete`
Expected: `verificar-paquete: … módulos con subruta pública, … importados sin error, exports y CSS en orden.`

- [ ] **Step 4: cli/khipu.mjs** — in the closing instructions printed after `add`, mention that animated components need `motion` and that icons are `@phosphor-icons/react` (the peers line next to the `lucide` comment at line ~126 becomes: `// React, Next, base-ui y next-themes son peerDependencies; lucide-react es peer opcional desde 0.5.0 (los iconos del kit son @phosphor-icons/react, dependencia).`).

- [ ] **Step 5: Docs**
  - `CHANGELOG.md`: add on top a `## [0.5.0] - 2026-11-01` entry with `### Changed` (pastel compact look, Inter + JetBrains Mono, Phosphor duotone icons without background, 34 px controls, pill controls, 12/18 px radii, banded table rows, floating sidebar, near-black primary action, metric cards as separate cards), `### Added` (`AparienciaProvider`, `useApariencia`, `SelectorApariencia`/`SelectorPaleta`/`SelectorTonoOscuro`, `PALETAS`, `TONOS_OSCURO`, 5 palettes, 3 dark tones, `ScriptDiseno` `paletas`/`tonosOscuro`/`inicial`, `Providers` `apariencia`, `Metrica`/`Kpi` `icono`/`tono`/`visual`/`destacada`/`acciones`, `TarjetaMetrica`, `VisualDeMetrica`, `ChipVariacion`, `GraficoBarras` `destacado`, `IconoComponente`, `ROTULO`, `TARJETA_ELEVABLE`, tokens `--acento*`, `--texto-terciario`, `--info`, `--chart-base`, `--chart-destacado`, `--borde-tarjeta`, `--brillo-tarjeta`, `--sombra-elevada`, `text-titulo`, `text-titulo-pagina`, `h-control`) and `### Upgrading from 0.4.x` (re-paste `src/styles/tokens.css` and `theme.css`; install `@phosphor-icons/react`; `lucide-react` optional; switch `next/font` to `Inter` + `JetBrains_Mono` as in `src/app/layout.tsx`; controls are 34 px — any hand-written `h-9` next to a kit control becomes `h-control`; pass `inicial`/`onCambio` to persist preferences per user).
  - `README.md`: stack line `Motion · Phosphor`; «Usarlo en tu proyecto» step 1 lists the new tokens and the palette/tone blocks; step 2 mentions `AparienciaProvider` in `Providers`; package section adds `khipu-design-system/apariencia`; estructura tree adds `components/apariencia.tsx`, `apariencia-opciones.ts`, `nav/selector-apariencia.tsx`, `lib/iconos.ts`; `app/layout.tsx  Inter + JetBrains Mono`; the install example pins `#v0.5.0`; conventions: «Top bar: la acción principal es casi negra (clara en oscuro); el color de la paleta vive en superficies» and «Iconos Phosphor duotono sin fondo; relleno en el activo».
  - `docs/design-system.md`: §1 tokens (light, Medianoche, the five palettes with their contrast, three dark tones), §2 contrast (20 combinations, numbers from the spec §8–§10), §3 type scale table from the spec §4, §4 height `h-control` 34 px, a new «Apariencia» section (mechanism from spec §8, `inicial`/`onCambio` example), «Iconos» section (spec §5), «Tarjetas de métrica» (spec §7), «Gráficos» (base/destacado colors; pastel bars below 3:1 compensated by `<title>` values and the highlighted bar), and replace mentions of Geist/Lucide/índigo.
  - `docs/guia-visual.html`: swatches for the new light and Medianoche tokens and the five palette swatches (acento, acento 2, acento 3), font names, and the 34 px control height.

- [ ] **Step 6: Full verification**

Run each, expect success:
- `npm --prefix D:/github/khipu-design-system test` → all tests pass.
- `npm --prefix D:/github/khipu-design-system run typecheck` → exit 0.
- `npm --prefix D:/github/khipu-design-system run lint` → ESLint clean, `Alturas: …`, `Tipografía: todo dentro de la escala.`, `Contraste: 520 pares en 20 combinaciones (texto ≥ 4.5, foco ≥ 3).`
- `npm --prefix D:/github/khipu-design-system run build` → success.
- `npm --prefix D:/github/khipu-design-system run verify:paquete` → success.
- Browser: `npm --prefix D:/github/khipu-design-system run dev`, open `/ejemplo`; in the user menu pick each palette in light and each dark tone in dark; reload after a change and confirm no flash of the default; no console errors; compare against the approved mockup captures (pastel cards, pill nav with filled active icon, highlighted bar, banded table).

- [ ] **Step 7: Commit**

```
git -C D:/github/khipu-design-system add -A
git -C D:/github/khipu-design-system commit -m "docs(ds): document the 0.5 redesign, palettes and dark tones; bump to 0.5.0" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_01MH8P6t55Uv1jJNuTubMmzr"
```
