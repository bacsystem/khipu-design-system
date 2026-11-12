import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Children, createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatearMmSs } from "../../src/lib/formato.ts";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const RUTAS = ["aviso-responsivo", "franja-cuenta-regresiva"].map((n) => `src/components/patrones/${n}.tsx`);
const sinComentarios = (ruta) =>
  readFileSync(join(RAIZ, ruta), "utf8")
    .replaceAll("\r\n", "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const { AvisoResponsivo, CabeceraAviso, PieAviso } = await cargarTsx("components/patrones/aviso-responsivo");
const { FranjaCuentaRegresiva } = await cargarTsx("components/patrones/franja-cuenta-regresiva");
const { Dialog } = await cargarTsx("components/ui/dialog");
const { Dialog: Primitiva } = await import("@base-ui/react/dialog");
const IconoPrueba = (props) => createElement("svg", { "data-icono": "x", ...props });

/** Recorre el árbol de elementos que devuelve el componente (sin montarlo) y junta los que cumplen `coincide`. */
function buscar(nodo, coincide, encontrados = []) {
  if (!isValidElement(nodo)) return encontrados;
  if (coincide(nodo)) encontrados.push(nodo);
  Children.forEach(nodo.props.children, (hijo) => buscar(hijo, coincide, encontrados));
  return encontrados;
}

// ── formatearMmSs ────────────────────────────────────────────────────────────────────────────────────────────────────

test("formatearMmSs: segundos a mm:ss", () => {
  assert.equal(formatearMmSs(4), "00:04");
  assert.equal(formatearMmSs(65), "01:05");
  assert.equal(formatearMmSs(600), "10:00");
  assert.equal(formatearMmSs(0), "00:00");
  assert.equal(formatearMmSs(59), "00:59");
  assert.equal(formatearMmSs(60), "01:00");
});

test("formatearMmSs: los minutos no se limitan a 2 dígitos", () => {
  assert.equal(formatearMmSs(6000), "100:00");
  assert.equal(formatearMmSs(6001), "100:01");
});

test("formatearMmSs: negativos y no finitos dan 00:00 y los decimales se truncan", () => {
  for (const malo of [-1, -0.5, -Infinity, Infinity, NaN]) assert.equal(formatearMmSs(malo), "00:00", String(malo));
  assert.equal(formatearMmSs(4.9), "00:04");
  assert.equal(formatearMmSs(0.9), "00:00");
  assert.equal(formatearMmSs(65.99), "01:05");
});

// ── FranjaCuentaRegresiva ────────────────────────────────────────────────────────────────────────────────────────────

const franja = (props) => renderToStaticMarkup(createElement(FranjaCuentaRegresiva, { etiqueta: "ETIQUETA-X", segundos: 4, ...props }));

test("la franja muestra la etiqueta, el reloj decorativo y el tiempo con dígitos de ancho fijo", () => {
  const html = franja({});
  assert.match(html, /ETIQUETA-X/);
  assert.match(html, /<span class="[^"]*\bfont-mono\b[^"]*\btabular-nums\b[^"]*">.*00:04<\/span>/);
  assert.match(html, /<svg[^>]*aria-hidden="true"/, "el reloj es decorativo");
  assert.ok(html.indexOf("ETIQUETA-X") < html.indexOf("00:04"), "la etiqueta va a la izquierda y el tiempo a la derecha");
});

test("la franja no es una región viva: el lector de pantalla no repite el tiempo en cada tic", () => {
  for (const props of [{}, { tono: "aviso" }, { segundos: 0 }, { segundos: 3599 }]) {
    assert.doesNotMatch(franja(props), /\b(role|aria-live|aria-atomic|aria-busy)=/, JSON.stringify(props));
  }
});

test("la franja es peligro por defecto y admite aviso, con los tokens de Aviso", () => {
  assert.match(franja({}), /bg-destructive-suave text-destructive-texto/);
  assert.match(franja({ tono: "peligro" }), /bg-destructive-suave text-destructive-texto/);
  assert.match(franja({ tono: "aviso" }), /bg-warning text-warning-foreground/);
  assert.doesNotMatch(franja({ tono: "aviso" }), /destructive/);
});

test("la franja formatea con formatearMmSs", () => {
  assert.match(franja({ segundos: 65 }), /01:05/);
  assert.match(franja({ segundos: -3 }), /00:00/);
  assert.match(franja({ segundos: 6000 }), /100:00/);
});

// ── CabeceraAviso y PieAviso ─────────────────────────────────────────────────────────────────────────────────────────

// El título y la descripción son los de Dialog.Title / Dialog.Description: necesitan el contexto de un Dialog.
const cabecera = (props) =>
  renderToStaticMarkup(createElement(Dialog, { open: true }, createElement(CabeceraAviso, { icon: IconoPrueba, titulo: "TITULO-X", descripcion: "DESC-X", ...props })));

test("la cabecera centra un círculo de size-12 con el icono, el título y la descripción", () => {
  const html = cabecera({});
  assert.match(html, /text-center/);
  assert.match(html, /<span class="[^"]*\bsize-12\b[^"]*rounded-full[^"]*"><svg[^>]*data-icono="x"[^>]*aria-hidden="true"/);
  assert.match(html, /<h2[^>]*>TITULO-X<\/h2>/, "el título es el DialogTitle (nombre accesible del aviso)");
  assert.match(html, /<p[^>]*>DESC-X<\/p>/, "la descripción es el DialogDescription");
});

test("la cabecera usa los tonos de CabeceraDialogo y por defecto es neutro", () => {
  assert.match(cabecera({}), /bg-accent text-accent-foreground/);
  assert.match(cabecera({ tono: "peligro" }), /bg-destructive-suave text-destructive-texto/);
  assert.match(cabecera({ tono: "aviso" }), /bg-warning text-warning-foreground/);
  assert.match(cabecera({ tono: "ok" }), /bg-success text-success-foreground/);
});

test("la cabecera sin descripción no pinta un párrafo vacío", () => {
  assert.doesNotMatch(cabecera({ descripcion: undefined }), /<p/);
});

test("el pie apila al revés bajo sm (el primario arriba) y va en fila desde sm, sin alterar el orden del DOM", () => {
  const html = renderToStaticMarkup(createElement(PieAviso, null, createElement("button", null, "SECUNDARIO"), createElement("button", null, "PRIMARIO")));
  assert.match(html, /\bflex-col-reverse\b/);
  assert.match(html, /\bsm:flex-row\b/);
  assert.match(html, /\bsm:justify-end\b/);
  assert.match(html, /\[&amp;&gt;\*\]:w-full/, "los botones ocupan todo el ancho bajo sm");
  assert.ok(html.indexOf("SECUNDARIO") < html.indexOf("PRIMARIO"), "el orden del DOM es secundario, primario");
});

// ── AvisoResponsivo ──────────────────────────────────────────────────────────────────────────────────────────────────

const arbol = (props) => AvisoResponsivo({ open: true, children: "contenido", ...props });
const popup = (props) => buscar(arbol(props), (el) => el.type === Primitiva.Popup)[0];

test("descartable (por defecto) informa el cierre por onOpenChange", () => {
  const alCambiar = () => {};
  assert.equal(arbol({ onOpenChange: alCambiar }).props.onOpenChange, alCambiar);
  assert.equal(arbol({ onOpenChange: alCambiar, descartable: true }).props.onOpenChange, alCambiar);
});

// Esto prueba el cableado, no el comportamiento de base-ui: sin DOM de pruebas en el repo, que Escape y el clic afuera dejan el
// aviso abierto se comprobó a mano en un navegador (galería: «Aviso no descartable», en escritorio y en una vista de 390 px).
test("con descartable={false} el aviso no recibe onOpenChange: al ser controlado, nada lo cierra salvo `open` del consumidor", () => {
  const alCambiar = () => assert.fail("no debe informar un cierre");
  const raiz = arbol({ onOpenChange: alCambiar, descartable: false });
  assert.equal(raiz.props.onOpenChange, undefined);
  assert.equal(raiz.props.open, true);
  assert.equal(arbol({ open: false, descartable: false }).props.open, false);
});

test("el clic afuera nunca cierra, descartable o no", () => {
  for (const descartable of [true, false]) assert.equal(arbol({ descartable }).props.disablePointerDismissal, true);
});

test("no hay botón de cerrar ni arrastre en ningún modo", () => {
  for (const descartable of [true, false]) {
    assert.equal(buscar(arbol({ descartable }), (el) => el.type === Primitiva.Close).length, 0);
  }
  const codigo = sinComentarios(RUTAS[0]);
  assert.doesNotMatch(codigo, /drawer|Drawer|Sheet|Close\b|showCloseButton/);
});

test("el foco inicial y el resto de props del popup llegan al popup", () => {
  const foco = { current: null };
  const el = popup({ initialFocus: foco, finalFocus: false, "data-testid": "aviso", id: "mi-aviso" });
  assert.equal(el.props.initialFocus, foco);
  assert.equal(el.props.finalFocus, false);
  assert.equal(el.props["data-testid"], "aviso");
  assert.equal(el.props.id, "mi-aviso");
  const funcion = () => null;
  assert.equal(popup({ initialFocus: funcion }).props.initialFocus, funcion);
});

test("el popup es una hoja inferior bajo sm y un diálogo centrado desde sm", () => {
  const clases = popup({}).props.className;
  for (const clase of ["max-sm:rounded-t-[22px]", "sm:rounded-[22px]", "sm:max-w-lg", "pb-[max(1.25rem,env(safe-area-inset-bottom))]", "w-full"]) {
    assert.ok(clases.includes(clase), `falta ${clase}`);
  }
  const visor = buscar(arbol({}), (el) => el.props?.["data-slot"] === "aviso-responsivo-visor")[0];
  assert.match(visor.props.className, /\bitems-end\b/);
  assert.match(visor.props.className, /\bsm:items-center\b/);
  assert.match(visor.props.className, /\bsm:p-4\b/);
});

test("la hoja solo se desliza con motion-safe; con «reducir movimiento» queda la opacidad", () => {
  const clases = popup({}).props.className.split(/\s+/);
  const traslados = clases.filter((c) => c.includes("translate-y"));
  assert.ok(traslados.length >= 2, "entra y sale deslizándose");
  for (const c of traslados) assert.ok(c.includes("motion-safe:"), `${c} debe ir bajo motion-safe:`);
  assert.ok(clases.includes("data-starting-style:opacity-0") && clases.includes("data-ending-style:opacity-0"));
  assert.ok(clases.includes("duration-(--duracion-media)") && clases.includes("ease-salida"), "duración y curva de lib/movimiento");
});

test("className del consumidor se suma al del popup", () => {
  assert.ok(popup({ className: "mi-clase" }).props.className.split(/\s+/).includes("mi-clase"));
});

test("el mecanismo es una sola primitiva Dialog: sin hook de media query ni conmutación", () => {
  const codigo = sinComentarios(RUTAS[0]);
  assert.doesNotMatch(codigo, /matchMedia|useMediaQuery|useEffect|useState|useSyncExternalStore/);
});

// ── Sin texto fijo ───────────────────────────────────────────────────────────────────────────────────────────────────

test("ningún texto visible o accesible está fijo en español: todo entra por props o children", () => {
  for (const ruta of RUTAS) {
    const codigo = sinComentarios(ruta);
    assert.doesNotMatch(codigo, /[áéíóúñÁÉÍÓÚÑ¿¡]/, `${ruta} tiene texto en español`);
    assert.doesNotMatch(codigo, /\b(aria-label|title|alt|placeholder)=["'{]/, `${ruta} fija un texto accesible`);
    assert.doesNotMatch(codigo, /sr-only/, `${ruta} fija un texto para el lector de pantalla`);
  }
});
