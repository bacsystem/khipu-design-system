import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8");
const { Tabs } = await cargarTsx("components/navegacion/tabs");
const estilos = await cargarTsx("lib/estilos");
const { centrarEnContenedor } = await cargarTsx("lib/navegacion");

const pintar = (props) => renderToStaticMarkup(h(Tabs, props)).replaceAll("&amp;", "&").replaceAll("&#x27;", "'");
/** El `<span>` del contador cuyo texto es `texto`. */
const contador = (salida, texto) => salida.match(new RegExp(`<span class="[^"]*tabular-nums[^"]*">${texto}</span>`))?.[0] ?? "";

const items = [
  { id: "a", etiqueta: "Todas" },
  { id: "b", etiqueta: "Vencidas", contador: "Vencida", tonoContador: "aviso" },
  { id: "c", etiqueta: "Aprobadas", contador: "Aprobada", tonoContador: "ok" },
  { id: "d", etiqueta: "Hechos", contador: "1 resuelto", tonoContador: "info" },
  { id: "e", etiqueta: "Clientes", contador: "1,482" },
  { id: "f", etiqueta: "Cero", contador: 0 },
];

test("contador de texto verbatim y de número tal cual (también el 0)", () => {
  for (const estilo of ["linea", "segmentado"]) {
    const salida = pintar({ items, estilo });
    assert.ok(contador(salida, "Vencida"), `${estilo}: texto verbatim`);
    assert.ok(contador(salida, "1,482"), `${estilo}: el consumidor formatea, no se reformatea`);
    assert.ok(contador(salida, "0"), `${estilo}: el 0 se muestra`);
  }
});

test("tonoContador pinta el color del tono, con la receta CONTADOR_PESTANA", () => {
  for (const estilo of ["linea", "segmentado"]) {
    const salida = pintar({ items, estilo });
    assert.match(contador(salida, "Vencida"), /bg-warning text-warning-foreground/);
    assert.match(contador(salida, "Aprobada"), /bg-success text-success-foreground/);
    assert.match(contador(salida, "1 resuelto"), /bg-accent text-accent-foreground/);
    for (const texto of ["Vencida", "Aprobada", "1 resuelto"]) {
      assert.doesNotMatch(contador(salida, texto), /in-data-active:bg-acento/, "un tono de estado no cambia con la pestaña activa");
      for (const clase of estilos.CONTADOR_PESTANA.split(" ").filter((c) => !/^(bg|text)-(secondary|muted)/.test(c))) assert.ok(contador(salida, texto).includes(clase), `trae ${clase}`);
    }
  }
});

test("sin tono (o neutro) el contador toma el acento en la pestaña activa y no lleva color de estado", () => {
  const neutro = pintar({ items, estilo: "linea" });
  assert.match(contador(neutro, "1,482"), /in-data-active:bg-acento in-data-active:text-acento-texto/);
  assert.doesNotMatch(contador(neutro, "1,482"), /bg-(success|warning|accent)\b/);
  const explicito = pintar({ items: [{ id: "a", etiqueta: "A", contador: 3, tonoContador: "neutro" }] });
  assert.match(contador(explicito, "3"), /in-data-active:bg-acento/);
});

test("colorContadorPestana: tono de estado, o el neutro que le pase el componente", () => {
  const f = estilos.colorContadorPestana;
  assert.equal(f("ok", "NEUTRO"), "bg-success text-success-foreground");
  assert.equal(f("aviso", "NEUTRO"), "bg-warning text-warning-foreground");
  assert.equal(f("info", "NEUTRO"), "bg-accent text-accent-foreground");
  assert.equal(f("neutro", "NEUTRO"), "NEUTRO");
  assert.equal(f(undefined, "NEUTRO"), "NEUTRO");
});

test("Tabs y TabsRuta comparten la receta del contador: ninguno guarda su copia de los tonos", () => {
  for (const archivo of ["tabs", "tabs-ruta"]) {
    const fuente = leer(`src/components/navegacion/${archivo}.tsx`);
    assert.match(fuente, /colorContadorPestana/);
    assert.doesNotMatch(fuente, /bg-success|bg-warning|bg-accent text-accent-foreground/, `${archivo} sin copia de tonos`);
  }
});

test("etiqueta es el aria-label del tablist; sin ella no hay aria-label", () => {
  const con = pintar({ items, etiqueta: "Estado de las cotizaciones" });
  assert.match(con, /role="tablist"[^>]*aria-label="Estado de las cotizaciones"|aria-label="Estado de las cotizaciones"[^>]*role="tablist"/);
  assert.doesNotMatch(pintar({ items }), /aria-label/);
});

test("segmentado: una sola fila que se desplaza, sin barra, y nunca se parte en filas", () => {
  const salida = pintar({ items, estilo: "segmentado" });
  const lista = salida.match(/<div[^>]*role="tablist"[^>]*>/)[0];
  for (const clase of ["overflow-x-auto", "flex-nowrap", "max-w-full", "scroll-px-1", "overscroll-x-contain", "[scrollbar-width:none]", "[&::-webkit-scrollbar]:hidden", "rounded-full", "bg-secondary"]) assert.ok(lista.includes(clase), `la lista trae ${clase}`);
  assert.doesNotMatch(lista, /flex-wrap(?!\w)/, "ya no se parte en filas");
  // La línea sigue igual: subrayada, también desplazable.
  const linea = pintar({ items, estilo: "linea" }).match(/<div[^>]*role="tablist"[^>]*>/)[0];
  assert.match(linea, /overflow-x-auto/);
  assert.doesNotMatch(linea, /bg-secondary/);
});

test("el anillo de foco del segmento va hacia dentro (la caja recorta), sin separación", () => {
  assert.match(estilos.SEGMENTO_BASE, /focus-visible:ring-2 focus-visible:ring-inset/);
  assert.doesNotMatch(estilos.SEGMENTO_BASE, /ring-offset/);
  assert.ok(pintar({ items, estilo: "segmentado" }).includes("focus-visible:ring-inset"));
});

test("centrarEnContenedor: centra el elemento solo si hay desborde, sin animar con «reducir movimiento»", () => {
  const llamadas = [];
  const caja = (izquierda, ancho) => ({ getBoundingClientRect: () => ({ left: izquierda, width: ancho }) });
  const contenedor = (scrollWidth, clientWidth) => ({ ...caja(0, clientWidth), scrollWidth, clientWidth, clientLeft: 0, scrollLeft: 100, scrollTo: (o) => llamadas.push(o) });
  globalThis.window = { matchMedia: () => ({ matches: true }) };
  try {
    centrarEnContenedor(contenedor(300, 300), caja(240, 70));
    assert.equal(llamadas.length, 0, "sin desborde no se mueve");
    centrarEnContenedor(contenedor(600, 300), caja(240, 70));
    assert.deepEqual(llamadas, [{ left: 100 + 240 - (300 - 70) / 2, behavior: "auto" }]);
    globalThis.window = { matchMedia: () => ({ matches: false }) };
    centrarEnContenedor(contenedor(600, 300), caja(0, 70));
    assert.equal(llamadas[1].behavior, "smooth");
    assert.equal(llamadas[1].left, 0, "nunca negativo");
  } finally {
    delete globalThis.window;
  }
});

test("Tabs centra la pestaña activa al montar con el helper compartido (el de TabsRuta)", () => {
  const fuente = leer("src/components/navegacion/tabs.tsx");
  assert.match(fuente, /centrarEnContenedor\(lista, activa\)/);
  assert.match(leer("src/components/navegacion/tabs-ruta.tsx"), /centrarEnContenedor\(nav, enlace\)/);
});
