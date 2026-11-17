import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

const rail = await cargarTsx("lib/rail");
const { Shell } = await cargarTsx("components/nav/shell");
const { ContextoRail, BotonRail, fuenteDePantalla } = await cargarTsx("components/nav/rail");
const { SidebarContent } = await cargarTsx("components/nav/sidebar");
const { SidebarNav } = await cargarTsx("components/nav/sidebar-nav");
const { BarraInferior } = await cargarTsx("components/nav/barra-inferior");
const { TopBar } = await cargarTsx("components/nav/top-bar");
const { MobileNav } = await cargarTsx("components/nav/mobile-nav");
const { ScriptDiseno } = await cargarTsx("components/script-diseno");

const Icono = (props) => createElement("svg", { "data-icono": "x", ...props });
const item = (href, label, extra = {}) => ({ href, label, icon: Icono, ...extra });
const enRuta = (ruta, hijo) => createElement(PathnameContext.Provider, { value: ruta }, hijo);
const html = (nodo) => renderToStaticMarkup(nodo);

// ── Lógica pura del rail ──────────────────────────────────────────────────────────────────────────────────────────

test("railEfectivo: por debajo de md nunca hay rail; sin preferencia es rail entre md y xl; con preferencia manda ella", () => {
  const { railEfectivo } = rail;
  assert.equal(railEfectivo({ preferencia: null, desdeMd: false, desdeXl: false }), false);
  assert.equal(railEfectivo({ preferencia: "rail", desdeMd: false, desdeXl: false }), false);
  assert.equal(railEfectivo({ preferencia: null, desdeMd: true, desdeXl: false }), true, "768–1279 → rail");
  assert.equal(railEfectivo({ preferencia: null, desdeMd: true, desdeXl: true }), false, "≥1280 → expandido");
  assert.equal(railEfectivo({ preferencia: "expandido", desdeMd: true, desdeXl: false }), false, "el usuario lo expandió");
  assert.equal(railEfectivo({ preferencia: "rail", desdeMd: true, desdeXl: true }), true, "el usuario lo plegó en escritorio");
});

function conAlmacenamiento(almacen, fn) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: almacen });
  try {
    return fn();
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else delete globalThis.localStorage;
  }
}

test("la preferencia se guarda y se lee en khipu-sidebar-rail, y nunca lanza", () => {
  assert.equal(rail.CLAVE_RAIL, "khipu-sidebar-rail");
  const datos = new Map();
  const bueno = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v) };
  conAlmacenamiento(bueno, () => {
    assert.equal(rail.leerPreferenciaRail(), null);
    rail.guardarPreferenciaRail("rail");
    assert.equal(datos.get("khipu-sidebar-rail"), "rail");
    assert.equal(rail.leerPreferenciaRail(), "rail");
    datos.set("khipu-sidebar-rail", "basura");
    assert.equal(rail.leerPreferenciaRail(), null, "un valor desconocido se ignora");
  });
  const roto = {
    getItem: () => {
      throw new Error("bloqueado");
    },
    setItem: () => {
      throw new Error("bloqueado");
    },
  };
  conAlmacenamiento(roto, () => {
    assert.equal(rail.leerPreferenciaRail(), null);
    assert.doesNotThrow(() => rail.guardarPreferenciaRail("expandido"));
  });
  assert.equal(rail.leerPreferenciaRail(), null, "sin localStorage (SSR)");
});

test("el script del <head> copia la preferencia a <html data-rail> y solo acepta valores válidos", () => {
  const ejecutar = (valor, lanza = false) => {
    const documento = { documentElement: { dataset: {} } };
    const almacen = { getItem: () => (lanza ? (() => { throw new Error("x"); })() : valor) };
    new Function("document", "localStorage", rail.codigoScriptRail())(documento, almacen);
    return documento.documentElement.dataset.rail;
  };
  assert.equal(ejecutar("rail"), "rail");
  assert.equal(ejecutar("expandido"), "expandido");
  assert.equal(ejecutar("<script>"), undefined);
  assert.equal(ejecutar(null), undefined);
  assert.equal(ejecutar("rail", true), undefined, "con el almacenamiento bloqueado no rompe la página");
  assert.match(html(createElement(ScriptDiseno)), /khipu-sidebar-rail/, "ScriptDiseno lo incluye");
});

test("la variante CSS rail: coincide con railEfectivo (md–xl sin elegir expandido, o elegido rail) y solo dentro de [data-khipu-rail=auto]", () => {
  const css = leer("src/styles/theme.css");
  assert.match(css, /@custom-variant rail \{/);
  assert.match(css, /@media \(width >= 48rem\)[^{]*\{[^}]*html\[data-rail="rail"\] \[data-khipu-rail="auto"\] \*/s);
  assert.match(css, /@media \(width >= 48rem\) and \(width < 80rem\)[^{]*\{[^}]*html:not\(\[data-rail="expandido"\]\) \[data-khipu-rail="auto"\] \*/s);
  assert.equal(rail.MEDIA_RAIL_MD, "(min-width: 48rem)");
  assert.equal(rail.MEDIA_RAIL_XL, "(min-width: 80rem)");
});

// ── Shell ─────────────────────────────────────────────────────────────────────────────────────────────────────────

const shell = (props = {}) =>
  html(createElement(Shell, { sidebar: createElement("i", null, "SB"), topBar: createElement("header", null, "TB"), ...props }, createElement("p", null, "contenido")));

test("Shell por defecto no cambia: sin marcador de rail ni id, 260 px de columna", () => {
  const salida = shell();
  assert.doesNotMatch(salida, /data-khipu-rail/);
  assert.doesNotMatch(salida, /id="khipu-sidebar"/);
  assert.match(salida, /w-\[260px\]/);
  assert.doesNotMatch(salida, /data-barra-inferior/);
});

test('Shell rail="auto" marca el contenedor, identifica el <aside> y reduce su columna a 76 px (64 + margen) con la variante rail', () => {
  const salida = shell({ rail: "auto" });
  assert.match(salida, /data-khipu-rail="auto"/);
  assert.match(salida, /<aside id="khipu-sidebar"/);
  assert.match(salida, /rail:w-\[76px\]/);
});

test("Shell pone barraInferior al final de la columna, después de main", () => {
  const salida = shell({ barraInferior: createElement("footer", { id: "barra" }, "B") });
  assert.ok(salida.indexOf("</main>") < salida.indexOf('id="barra"'));
});

test("BotonRail solo existe con Shell rail=\"auto\": aria-controls apunta al aside, aria-expanded y etiqueta dicen cómo está", () => {
  const grupos = [{ titulo: "G", items: [item("/a", "Alfa")] }];
  const sidebar = createElement(SidebarContent, { marca: createElement("b", null, "M"), grupos });
  assert.doesNotMatch(html(enRuta("/a", createElement(Shell, { sidebar, topBar: null }, null))), /aria-controls/);
  const auto = html(enRuta("/a", createElement(Shell, { sidebar, topBar: null, rail: "auto" }, null)));
  assert.match(auto, /aria-controls="khipu-sidebar"/);
  assert.match(auto, /aria-expanded="true"/);
  assert.match(auto, /aria-label="Contraer menú"/);
  const plegado = html(createElement(ContextoRail.Provider, { value: { modo: "auto", rail: true } }, createElement(BotonRail)));
  assert.match(plegado, /aria-expanded="false"/);
  assert.match(plegado, /aria-label="Expandir menú"/);
  const traducido = html(createElement(ContextoRail.Provider, { value: { modo: "auto", rail: false } }, createElement(BotonRail, { textos: { contraer: "Collapse" } })));
  assert.match(traducido, /aria-label="Collapse"/);
  assert.equal(html(createElement(BotonRail)), "", "sin Shell rail=auto no pinta nada");
});

// ── Contenido del sidebar en el rail ──────────────────────────────────────────────────────────────────────────────

const GRUPOS = [
  { titulo: "Operación", items: [item("/a", "Alfa"), { label: "Pronto", icon: Icono }] },
  { titulo: "Gestión", id: "gestion", colapsable: true, items: [item("/g/uno", "Uno")] },
];
const nav = (estado, ruta = "/a") => html(enRuta(ruta, createElement(ContextoRail.Provider, { value: estado }, createElement(SidebarNav, { grupos: GRUPOS, etiqueta: "Menú" }))));

test("rail: los títulos de grupo se ocultan, la etiqueta queda para el lector de pantalla y el grupo colapsado se aplana (sin inert)", () => {
  const plegado = nav({ modo: "auto", rail: true });
  assert.match(plegado, /rail:hidden/);
  assert.match(plegado, /rail:sr-only/);
  assert.match(plegado, /rail:grid-rows-\[1fr\]/);
  assert.doesNotMatch(plegado, /inert/, "los ítems del grupo colapsado son alcanzables en el rail");
  assert.match(plegado, /aria-current="page"/);
  assert.match(plegado, /data-base-ui-tooltip-trigger/, "cada ítem del rail tiene tooltip");
  assert.doesNotMatch(nav({ modo: "auto", rail: false }), /data-base-ui-tooltip-trigger/, "expandido no hay tooltip: la etiqueta ya se ve");
  assert.match(plegado, />Alfa</, "el nombre accesible sigue en el DOM");
  const expandido = nav({ modo: "nunca", rail: false });
  assert.match(expandido, /inert/, "expandido, el grupo cerrado sigue fuera del teclado");
});

test("rail: la navegación sale con los mismos landmarks y el ítem activo conserva su peso de icono", () => {
  const salida = nav({ modo: "auto", rail: true });
  assert.match(salida, /<nav aria-label="Menú"/);
});

test("fuera de un Shell rail=auto el estado por defecto es «nunca» y sin rail", () => {
  assert.match(leer("src/components/nav/rail.tsx"), /const ESTADO_INICIAL: EstadoRail = \{ modo: "nunca", rail: false \}/);
  assert.doesNotMatch(nav({ modo: "nunca", rail: false }), /Tooltip|data-trigger/);
});

test("el selector, el menú de usuario y la marca se reducen a su icono o avatar en el rail", () => {
  const selector = leer("src/components/nav/selector-contexto.tsx");
  const usuario = leer("src/components/nav/menu-usuario.tsx");
  for (const [nombre, fuente] of [["selector", selector], ["usuario", usuario]]) {
    assert.match(fuente, /rail:justify-center/, `${nombre}: disparador centrado`);
    assert.match(fuente, /overflow-hidden rail:hidden/, `${nombre}: el texto se oculta`);
    assert.match(fuente, /rail \? "w-64/, `${nombre}: el popup tiene ancho propio`);
    assert.match(fuente, /rail \? "right"/, `${nombre}: el popup se abre a la derecha`);
  }
  assert.match(leer("src/components/nav/logo.tsx"), /rail:sr-only/);
});

// ── BarraInferior ─────────────────────────────────────────────────────────────────────────────────────────────────

const ITEMS = [item("/", "Inicio", { exacto: true }), item("/ventas", "Ventas"), item("/clientes", "Clientes"), item("/inventario", "Inventario")];
const barra = (ruta, props = {}) => html(enRuta(ruta, createElement(BarraInferior, { items: ITEMS, ...props })));

test("BarraInferior: <nav> con nombre, solo en móvil, enlaces de ≥44 px y la ruta activa con aria-current", () => {
  const salida = barra("/ventas/nueva");
  assert.match(salida, /<nav aria-label="Navegación principal"/);
  assert.match(salida, /md:hidden/);
  assert.match(salida, /data-barra-inferior/);
  assert.equal((salida.match(/aria-current="page"/g) ?? []).length, 1);
  assert.match(salida, /<a aria-current="page"[^>]*href="\/ventas"/);
  assert.match(salida, /min-h-12/);
  assert.doesNotMatch(salida, /<a aria-current="page"[^>]*href="\/"/, "Inicio es exacto: no se marca en /ventas");
  assert.match(barra("/", {}), /<a aria-current="page"[^>]*href="\/"/);
  assert.match(barra("/", { etiqueta: "Main" }), /<nav aria-label="Main"/);
});

test("BarraInferior: las entradas son datos de la app, sin lista fija, y como mucho 4 propias", () => {
  const dos = barra("/x", { items: [item("/uno", "Uno"), item("/dos", "Dos")] });
  assert.match(dos, />Uno</);
  assert.doesNotMatch(dos, /Inicio|Ventas/);
  const seis = barra("/x", { items: [1, 2, 3, 4, 5, 6].map((n) => item(`/p${n}`, `P${n}`)) });
  assert.equal((seis.match(/<a /g) ?? []).length, 4);
});

test("BarraInferior: una entrada sin href es un «próximamente» deshabilitado, no un enlace", () => {
  const salida = barra("/x", { items: [{ label: "Pronto", icon: Icono }] });
  assert.match(salida, /aria-disabled="true"/);
  assert.doesNotMatch(salida, /<a /);
});

test("BarraInferior: «Más» es un botón con su etiqueta que abre un cajón con nombre y foco gestionado por el Sheet", () => {
  const salida = barra("/x", { mas: { etiqueta: "Más", contenido: createElement("p", null, "todo el menú") } });
  assert.match(salida, /<button[^>]*type="button"[^>]*>.*Más/s);
  assert.doesNotMatch(salida, /todo el menú/, "cerrado, el contenido no está en la página");
  assert.doesNotMatch(salida, /Abrir menú/, "sin hamburguesa");
  const fuente = leer("src/components/nav/mobile-nav.tsx");
  assert.match(fuente, /aria-label=\{etiquetaCajon\}/);
  assert.match(fuente, /SheetTrigger render=\{disparador\}/);
});

test("BarraInferior: la acción es un enlace redondo con aria-label y reserva su hueco en el flujo para no tapar contenido", () => {
  const sin = barra("/x");
  assert.doesNotMatch(sin, /h-20/);
  const con = barra("/x", { accion: { href: "/ventas/nueva", etiqueta: "Nueva venta", icono: Icono } });
  assert.match(con, /<a aria-label="Nueva venta"[^>]*href="\/ventas\/nueva"/);
  assert.match(con, /rounded-full/);
  assert.match(con, /bottom-full/, "flota justo encima de la barra");
  assert.match(con, /<div aria-hidden="true" class="h-20"><\/div>/, "el hueco está en el flujo");
  assert.match(con, /sticky bottom-0/);
});

test("BarraInferior respeta la zona segura y los avisos suben por encima de ella", () => {
  assert.match(barra("/x"), /pb-\[env\(safe-area-inset-bottom\)\]/);
  assert.match(leer("src/styles/theme.css"), /:root:has\(\[data-barra-inferior\]\)\s*\{\s*--khipu-reserva-inferior:[^;]*safe-area-inset-bottom/);
  assert.match(leer("src/components/feedback/toast.tsx"), /bottom-\[calc\(1rem\+var\(--khipu-reserva-inferior,0px\)\)\]/);
});

// ── TopBar y MobileNav ────────────────────────────────────────────────────────────────────────────────────────────

const MIGAS = [{ prefijo: "/ventas", seccion: "Ventas", pagina: "Comprobantes" }];
const topBar = (props = {}) => html(enRuta("/ventas", createElement(TopBar, { migas: MIGAS, ...props })));

test("TopBar: la miga es el h1 por defecto y con migaComoTitulo={false} es solo texto de ubicación dentro de <nav>", () => {
  const porDefecto = topBar();
  assert.match(porDefecto, /<h1[^>]*>Comprobantes<\/h1>/);
  const sinTitulo = topBar({ migaComoTitulo: false });
  assert.doesNotMatch(sinTitulo, /<h1/);
  assert.match(sinTitulo, /<nav aria-label="Ubicación"/);
  assert.match(sinTitulo, /<span aria-current="page"[^>]*>Comprobantes<\/span>/);
  assert.match(sinTitulo, />Ventas</);
});

test("TopBar sin menuMovil no pinta hamburguesa", () => {
  assert.doesNotMatch(topBar({ migaComoTitulo: false }), /Abrir menú/);
});

test("MobileNav sigue teniendo su hamburguesa por defecto y acepta otro disparador", () => {
  const defecto = html(createElement(MobileNav, null, createElement("p", null, "x")));
  assert.match(defecto, /Abrir menú/);
  const otro = html(createElement(MobileNav, { disparador: createElement("button", { type: "button", id: "mio" }, "Mío") }, createElement("p", null, "x")));
  assert.match(otro, /id="mio"/);
  assert.doesNotMatch(otro, /Abrir menú/);
});

// ── Revisión PR #61 ───────────────────────────────────────────────────────────────────────────────────────────────

test("H1: la acción flotante es un círculo de 56 px: receta sin h-control, size-14 y objetivo ≥ 44 px", async () => {
  const { ACCION_FLOTANTE } = await cargarTsx("lib/estilos");
  assert.doesNotMatch(ACCION_FLOTANTE, /(?<![\w-])h-control(?![\w-])/);
  assert.match(ACCION_FLOTANTE, /(?<![\w-])size-14(?![\w-])/);
  assert.match(ACCION_FLOTANTE, /rounded-full/);
  const con = barra("/x", { accion: { href: "/n", etiqueta: "Nueva", icono: Icono } });
  const fab = con.match(/<a aria-label="Nueva"[^>]*>/)[0];
  assert.match(fab, /size-14/);
  assert.doesNotMatch(fab, /h-control/);
  assert.doesNotMatch(leer("src/components/nav/barra-inferior.tsx"), /ACCION_PRINCIPAL/);
});

test("H1: check:alturas rechaza size-N sobre una receta de control", async () => {
  const { spawnSync } = await import("node:child_process");
  const { mkdtempSync, mkdirSync, writeFileSync, cpSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const raiz = mkdtempSync(join(tmpdir(), "alturas-"));
  mkdirSync(join(raiz, "scripts"));
  mkdirSync(join(raiz, "src/lib"), { recursive: true });
  cpSync(join(RAIZ, "scripts/verificar-alturas.mjs"), join(raiz, "scripts/verificar-alturas.mjs"));
  mkdirSync(join(raiz, "cli"));
  cpSync(join(RAIZ, "cli/reglas.mjs"), join(raiz, "cli/reglas.mjs"));
  writeFileSync(join(raiz, "src/lib/estilos.ts"), 'export const ACCION_X = "h-control";\n');
  writeFileSync(join(raiz, "src/a.tsx"), 'const c = cn(ACCION_PRINCIPAL, "size-14 rounded-full");\n');
  const r = spawnSync(process.execPath, [join(raiz, "scripts/verificar-alturas.mjs")], { encoding: "utf8" });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stderr, /src\/a\.tsx/);
});

test("H2: un Shell por defecto no toca matchMedia (ni existe en jsdom); con auto y sin matchMedia tampoco rompe", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const explota = () => {
    throw new Error("matchMedia no debe llamarse");
  };
  try {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { matchMedia: explota } });
    const nunca = fuenteDePantalla("nunca");
    assert.equal(nunca.instantanea(), false);
    assert.doesNotThrow(() => nunca.suscribir(() => {})());
    Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
    const auto = fuenteDePantalla("auto");
    assert.equal(auto.instantanea(), false, "sin matchMedia (jsdom): expandido");
    assert.doesNotThrow(() => auto.suscribir(() => {})());
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else delete globalThis.window;
  }
});

test("H3: con acción flotante los avisos suben también por encima de ella", () => {
  const css = leer("src/styles/theme.css");
  assert.match(css, /:root:has\(\[data-barra-inferior\]\[data-con-accion\]\)\s*\{\s*--khipu-reserva-inferior: calc\(3\.5rem \+ 1px \+ 4\.5rem/);
  assert.match(barra("/x", { accion: { href: "/n", etiqueta: "N", icono: Icono } }), /data-con-accion=""/);
  assert.doesNotMatch(barra("/x"), /data-con-accion/);
});

test("H4: el cajón de «Más» no hereda el rail del Shell", () => {
  const fuente = leer("src/components/nav/mobile-nav.tsx");
  assert.match(fuente, /<ContextoRail\.Provider value=\{\{ modo: "nunca", rail: false \}\}>\{children\}<\/ContextoRail\.Provider>/);
});

test("H5: varios hijos de pie conservan su separación", () => {
  const salida = html(enRuta("/a", createElement(SidebarContent, { marca: null, grupos: [], pie: [createElement("i", { key: 1 }, "p1"), createElement("i", { key: 2 }, "p2")] })));
  assert.match(salida, /<div class="flex w-full min-w-0 flex-col gap-2\.5 rail:hidden"><i>p1<\/i><i>p2<\/i><\/div>/);
});

test("H7: check:alturas lee también las recetas con backticks (ACCION_*, BOTON_*) y solo exime a ACCION_FLOTANTE", async () => {
  const { spawnSync } = await import("node:child_process");
  const { mkdtempSync, mkdirSync, writeFileSync, cpSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");
  const correr = (estilos) => {
    const raiz = mkdtempSync(join(tmpdir(), "alturas-"));
    mkdirSync(join(raiz, "scripts"));
    mkdirSync(join(raiz, "src/lib"), { recursive: true });
    cpSync(join(RAIZ, "scripts/verificar-alturas.mjs"), join(raiz, "scripts/verificar-alturas.mjs"));
    mkdirSync(join(raiz, "cli"));
    cpSync(join(RAIZ, "cli/reglas.mjs"), join(raiz, "cli/reglas.mjs"));
    writeFileSync(join(raiz, "src/lib/estilos.ts"), estilos);
    return spawnSync(process.execPath, [join(raiz, "scripts/verificar-alturas.mjs")], { encoding: "utf8" });
  };
  const roto = correr("export const ACCION_PRINCIPAL = `inline-flex h-12 ${FOCO}`;\n");
  assert.equal(roto.status, 1);
  assert.match(roto.stderr, /ACCION_PRINCIPAL/);
  const bien = correr("export const ACCION_PRINCIPAL = `inline-flex h-control ${FOCO}`;\nexport const ACCION_FLOTANTE = `inline-flex size-14 ${FOCO}`;\n");
  assert.equal(bien.status, 0, bien.stderr);
});
