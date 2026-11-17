import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { Tabs } = await cargarTsx("components/navegacion/tabs");

const items = [
  { id: "a", etiqueta: "Alfa" },
  { id: "b", etiqueta: "Beta", contador: 2 },
];
const pintar = (props = {}, hijos) => renderToStaticMarkup(h(Tabs, { items, ...props }, hijos));

test("solo tira: sin children ni paneles no hay tabpanel ni aria-controls", () => {
  for (const estilo of ["linea", "segmentado"]) {
    const salida = pintar({ estilo });
    assert.match(salida, /role="tablist"/);
    assert.equal((salida.match(/role="tab"/g) ?? []).length, 2);
    assert.match(salida, /aria-selected="true"/);
    assert.doesNotMatch(salida, /role="tabpanel"/);
    assert.doesNotMatch(salida, /aria-controls/);
  }
});

test("solo tira controlada: valor marca la pestaña activa", () => {
  const salida = pintar({ valor: "b", onCambio: () => {} });
  assert.match(salida, /role="tab"[^>]*aria-selected="true"[^>]*>Beta|aria-selected="true"[^>]*>Beta/);
  assert.doesNotMatch(salida, /role="tabpanel"/);
});

test("con children o con paneles se montan los paneles, como antes", () => {
  const conFuncion = pintar({}, (id) => h("p", null, `contenido ${id}`));
  assert.match(conFuncion, /role="tabpanel"/);
  assert.match(conFuncion, /pt-4 outline-none/);
  assert.match(conFuncion, /contenido a/);
  const conPaneles = pintar({ paneles: { a: h("p", null, "panel a") } });
  assert.match(conPaneles, /role="tabpanel"/);
  assert.match(conPaneles, /panel a/);
});

test("las dos recetas de pestaña fijan el tamaño del icono, sin encoger", () => {
  const fuente = readFileSync(join(RAIZ, "src/components/navegacion/tabs.tsx"), "utf8");
  const estilos = readFileSync(join(RAIZ, "src/lib/estilos.ts"), "utf8");
  const linea = fuente.match(/const PESTANA_LINEA =\s*"([^"]+)"/)[1];
  const segmento = estilos.match(/export const SEGMENTO_BASE =\s*"([^"]+)"/)[1];
  for (const receta of [linea, segmento]) {
    assert.match(receta, /\[&_svg\]:shrink-0/);
    assert.match(receta, /\[&_svg:not\(\[class\*='size-'\]\)\]:size-4/);
  }
});

test("controla: en tira sola cada pestaña lleva aria-controls con ese id; sin él, ninguna", () => {
  const con = pintar({ controla: "region-x" });
  assert.equal((con.match(/aria-controls="region-x"/g) ?? []).length, 2);
  assert.doesNotMatch(con, /role="tabpanel"/);
  assert.doesNotMatch(pintar({}), /aria-controls/);
});

test("TabsPrimitive.Tab nunca recibe un aria-controls incondicional (pisaría el de base-ui cuando hay paneles)", () => {
  const fuente = readFileSync(join(RAIZ, "src/components/navegacion/tabs.tsx"), "utf8");
  const tab = fuente.match(/<TabsPrimitive\.Tab\b[\s\S]*?>/)[0];
  assert.doesNotMatch(tab, /aria-controls=/);
  assert.match(tab, /\.\.\.\(!conPaneles && controla \? \{ "aria-controls": controla \} : \{\}\)/);
});
