import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Children, isValidElement } from "react";
import { cargarTsx } from "./cargar-tsx.mjs";

const { opcionesPorPagina, porPaginaValido } = await cargarTsx("lib/paginacion");
const { PillEstado, Chip } = await cargarTsx("components/patrones/pill-estado");
const { PieTabla } = await cargarTsx("components/patrones/pie-tabla");
const { SelectorPorPagina } = await cargarTsx("components/ui/selector-por-pagina");

test("opcionesPorPagina ordena, quita repetidos e inserta el valor actual", () => {
  assert.deepEqual(opcionesPorPagina([50, 10, 25, 5], 25), [5, 10, 25, 50]);
  assert.deepEqual(opcionesPorPagina([5, 10, 25, 50], 20), [5, 10, 20, 25, 50]);
  assert.deepEqual(opcionesPorPagina([10, 10, 20], 10), [10, 20]);
  assert.deepEqual(opcionesPorPagina([10, 20, 50], 7), [7, 10, 20, 50]);
});

test("opcionesPorPagina descarta valores que no son un tamaño de página", () => {
  assert.deepEqual(opcionesPorPagina([0, -5, 2.5, Number.NaN, 10], 20), [10, 20]);
  assert.deepEqual(opcionesPorPagina([], 10), [10]);
});

test("PillEstado info usa los tokens info, con su punto", () => {
  const html = renderToStaticMarkup(createElement(PillEstado, { tono: "info" }, "Enviada"));
  assert.match(html, /bg-info text-info-foreground/);
  assert.match(html, /size-1\.5 shrink-0 rounded-full bg-info-foreground/);
  assert.doesNotMatch(html, /bg-secondary/, "info no debe verse como el neutro");
});

test("Chip: sin props es el gris de siempre; cada tono y sólido tienen su par", () => {
  const chip = (props) => renderToStaticMarkup(createElement(Chip, props, "x"));
  assert.match(chip({}), /bg-secondary[^"]* text-muted-foreground/);
  assert.match(chip({ tono: "ok" }), /bg-success text-success-foreground/);
  assert.match(chip({ tono: "aviso" }), /bg-warning text-warning-foreground/);
  assert.match(chip({ tono: "error" }), /bg-destructive-suave text-destructive-texto/);
  assert.match(chip({ tono: "info" }), /bg-info text-info-foreground/);
  assert.match(chip({ tono: "acento" }), /bg-accent text-accent-foreground/);
  assert.match(chip({ tono: "ok", solido: true }), /bg-success-foreground text-success"/);
  assert.match(chip({ tono: "error", solido: true }), /bg-destructive text-destructive-foreground/);
  assert.match(chip({ tono: "neutro", solido: true }), /bg-foreground text-background/);
  assert.match(chip({ tono: "acento", solido: true }), /bg-acento-superficie text-acento-superficie-texto/);
  assert.doesNotMatch(chip({ tono: "info", solido: true }), /bg-info text-info-foreground/);
});

const base = { desde: 21, hasta: 30, total: 95, unidad: "filas", porPagina: 10, pagina: 3, ultimaPagina: 10, onPagina: () => {} };
const pie = (props) => renderToStaticMarkup(createElement(PieTabla, { ...base, ...props }));

test("SelectorPorPagina muestra las opciones dadas y marca el valor aunque no esté", () => {
  const html = renderToStaticMarkup(createElement(SelectorPorPagina, { valor: 25, onCambio: () => {}, opciones: [5, 10, 50] }));
  const nums = [...html.matchAll(/<button[^>]*aria-pressed="(true|false)"[^>]*>(\d+)<\/button>/g)].map((m) => [m[2], m[1]]);
  assert.deepEqual(nums, [["5", "false"], ["10", "false"], ["25", "true"], ["50", "false"]]);
});

test("PieTabla sin opciones conserva 10, 20 y 50", () => {
  const html = pie({ onPorPagina: () => {} });
  assert.deepEqual([...html.matchAll(/aria-pressed="[a-z]+"[^>]*>(\d+)<\/button>/g)].map((m) => m[1]), ["10", "20", "50"]);
});

test("PieTabla sin onPorPagina no pinta el selector de filas ni su separador", () => {
  const sin = pie({});
  assert.doesNotMatch(sin, /Filas por página/);
  assert.doesNotMatch(sin, /aria-pressed/);
  assert.equal([...sin.matchAll(/>·</g)].length, 0);
  assert.match(pie({ onPorPagina: () => {} }), /aria-label="Filas por página"/);
});

test("PieTabla envuelve las páginas en una nav con nombre traducible", () => {
  assert.match(pie({}), /<nav aria-label="Paginación"[^>]*>[\s\S]*Anterior[\s\S]*Siguiente[\s\S]*<\/nav>/);
  assert.match(pie({ textos: { paginacion: "Pagination" } }), /<nav aria-label="Pagination"/);
  assert.match(pie({}), /<span aria-current="page"[^>]*>3<\/span>/);
});

test("PieTabla extremos: Primera/Última página con nombre accesible y deshabilitadas en los límites", () => {
  assert.doesNotMatch(pie({}), /Primera página|Última página/);
  const html = pie({ extremos: true });
  assert.match(html, /<button type="button" aria-label="Primera página" class=/);
  assert.match(html, /<button type="button" aria-label="Última página" class=/);
  assert.ok(html.indexOf("Primera página") < html.indexOf("Anterior") && html.indexOf("Siguiente") < html.indexOf("Última página"));
  assert.match(pie({ extremos: true, pagina: 1 }), /aria-label="Primera página" aria-disabled="true"/);
  assert.match(pie({ extremos: true, pagina: 10 }), /aria-label="Última página" aria-disabled="true"/);
  assert.match(pie({ extremos: true, textos: { primera: "First page", ultima: "Last page" } }), /aria-label="First page"[\s\S]*aria-label="Last page"/);
});

test("porPaginaValido acepta las opciones dadas: un 25 de la URL sobrevive", () => {
  assert.equal(porPaginaValido("25", [5, 10, 25, 50]), 25);
  assert.equal(porPaginaValido("25"), 10, "sin opciones, 25 no es válido (10, 20, 50)");
  assert.equal(porPaginaValido("20"), 20);
  assert.equal(porPaginaValido("7", [5, 10, 25, 50]), 10);
  assert.equal(porPaginaValido(null, [5, 25]), 5, "sin 10 entre las opciones, la primera");
});

test("PieTabla móvil: la nav hace wrap y los números se sustituyen por «pág. / total» bajo sm", () => {
  const html = pie({ extremos: true, ultimaPagina: 24 });
  assert.match(html, /<nav aria-label="Paginación" class="[^"]*\bflex-wrap\b/);
  assert.match(html, /<span aria-current="page" class="[^"]*\bsm:hidden\b[^"]*">3 \/ 24<\/span>/);
  assert.match(html, /<div class="[^"]*\bhidden\b[^"]*\bsm:flex\b/);
  assert.equal([...html.matchAll(/aria-current="page"/g)].length, 2, "uno visible por tamaño; el otro es el número actual");
});

// Recorre el árbol de elementos (sin renderizar los hijos de otros componentes) y devuelve los que cumplen `f`.
function buscar(nodo, f, salida = []) {
  if (Array.isArray(nodo)) nodo.forEach((n) => buscar(n, f, salida));
  else if (isValidElement(nodo)) {
    if (f(nodo)) salida.push(nodo);
    buscar(nodo.props.children, f, salida);
  }
  return salida;
}

test("PieTabla: los saltos sin destino usan aria-disabled (conservan el foco) y no navegan", () => {
  const html = pie({ extremos: true, pagina: 1 });
  assert.doesNotMatch(html, /<button[^>]* disabled=""/, "ningún botón usa disabled");
  assert.match(html, /aria-label="Primera página" aria-disabled="true"/);
  assert.doesNotMatch(pie({ extremos: true, pagina: 3 }), /aria-disabled="/);
  const llamadas = [];
  const arbol = PieTabla({ ...base, extremos: true, pagina: 1, onPagina: (p) => llamadas.push(p) });
  const saltos = buscar(arbol, (e) => typeof e.type === "function" && "habilitado" in e.props);
  assert.ok(saltos.length >= 4);
  for (const salto of saltos) {
    const boton = salto.type(salto.props);
    boton.props.onClick();
  }
  // Solo los habilitados (números y siguiente/última) navegan; Primera y Anterior, aria-disabled, no.
  assert.deepEqual(llamadas.sort((a, b) => a - b), saltos.filter((s) => s.props.habilitado).map((s) => s.props.a).sort((a, b) => a - b));
  assert.ok(saltos.some((s) => !s.props.habilitado), "hay saltos inertes que probar");
});

test("Chip acento sólido es distinto del tenue también en oscuro", () => {
  const tenue = renderToStaticMarkup(createElement(Chip, { tono: "acento" }, "x"));
  const solido = renderToStaticMarkup(createElement(Chip, { tono: "acento", solido: true }, "x"));
  assert.match(solido, /dark:bg-acento dark:text-acento-texto/);
  assert.doesNotMatch(tenue, /dark:/);
});
