import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

const { TablaDatos } = await cargarTsx("components/datos/tabla-datos");
const columnasOcultas = await cargarTsx("lib/columnas-visibles");

const filas = [
  { id: "a", nombre: "Ana", total: 10 },
  { id: "b", nombre: "Beto", total: 20 },
];
const columnas = [
  { id: "nombre", titulo: "Nombre" },
  { id: "total", titulo: "Total", alinear: "derecha" },
];
const base = { columnas, filas, clave: (f) => f.id, titulo: "Clientes" };
const html = (props = {}) => renderToStaticMarkup(h(TablaDatos, { ...base, ...props }));
const tarjeta = (f) => h("span", { "data-tarjeta": f.id }, f.nombre);

// ── tarjetaMovil ────────────────────────────────────────────────────────────
test("sin tarjetaMovil no hay lista de tarjetas y la tabla se ve siempre", () => {
  const out = html();
  assert.doesNotMatch(out, /<ul/);
  assert.doesNotMatch(out, /hidden md:block/);
});

test("tarjetaMovil: una lista con nombre y una tarjeta por fila bajo md; la tabla solo desde md", () => {
  const out = html({ tarjetaMovil: tarjeta });
  assert.match(out, /<ul[^>]*role="list"[^>]*aria-label="Clientes"[^>]*class="[^"]*md:hidden/);
  assert.equal([...out.matchAll(/<li[ >]/g)].length, 2);
  assert.match(out, /data-tarjeta="a"/);
  assert.match(out, /data-tarjeta="b"/);
  // La tabla (semántica de tabla) queda en un contenedor oculto bajo md.
  assert.match(out, /<div class="[^"]*hidden md:block[^"]*"><div data-slot="table-container"/);
  assert.match(out, /<table/);
});

test("tarjetaMovil con onFila: la tarjeta es un botón; con tarjetaMovilInteractiva es un div (sin botón anidado)", () => {
  const simple = html({ tarjetaMovil: tarjeta, onFila: () => {} });
  assert.equal([...simple.matchAll(/<li[^>]*><button type="button"/g)].length, 2);
  const interactiva = html({ tarjetaMovil: tarjeta, onFila: () => {}, tarjetaMovilInteractiva: true });
  assert.doesNotMatch(interactiva, /<li[^>]*><button/);
  assert.match(interactiva, /<li[^>]*><div/);
});

test("tarjetaMovil con seleccion: cada tarjeta lleva su casilla", () => {
  const out = html({ tarjetaMovil: tarjeta, seleccion: { seleccionados: ["a"], onCambio: () => {} } });
  const lista = out.slice(out.indexOf("<ul"), out.indexOf("</ul>"));
  assert.equal([...lista.matchAll(/aria-label="Seleccionar fila (a|b)"/g)].length, 2);
});

test("tarjetaMovil sin filas muestra el vacío una sola vez en la lista", () => {
  const out = html({ tarjetaMovil: tarjeta, filas: [], vacio: "Nada por aquí" });
  const lista = out.slice(out.indexOf("<ul"), out.indexOf("</ul>"));
  assert.match(lista, /Nada por aquí/);
});

// ── anchoMinimo ─────────────────────────────────────────────────────────────
test("anchoMinimo fija el min-width de la tabla dentro del contenedor con scroll", () => {
  const out = html({ anchoMinimo: "48rem" });
  assert.match(out, /<table[^>]*style="[^"]*min-width:48rem/);
  assert.match(out, /data-slot="table-container" class="[^"]*overflow-x-auto/);
  assert.doesNotMatch(html(), /min-width/);
});

// ── pie ─────────────────────────────────────────────────────────────────────
test("pie: una fila <tfoot> con los totales de las columnas visibles", () => {
  const out = html({ pie: { nombre: "Totales", total: "S/ 30.00" } });
  const pie = out.slice(out.indexOf("<tfoot"), out.indexOf("</tfoot>"));
  assert.match(pie, /Totales/);
  assert.match(pie, /S\/ 30\.00/);
  assert.equal([...pie.matchAll(/<td/g)].length, 2);
  assert.doesNotMatch(html(), /<tfoot/);
});

test("pie solo pinta las columnas que existen (una oculta no deja su total) y deja vacías las que no lo traen", () => {
  const out = html({ pie: { total: "S/ 30.00", oculta: "NO" } });
  assert.doesNotMatch(out, /NO</);
  const pie = out.slice(out.indexOf("<tfoot"), out.indexOf("</tfoot>"));
  assert.equal([...pie.matchAll(/<td/g)].length, 2);
});

test("pie en móvil: una tarjeta resumen al final de la lista", () => {
  const out = html({ tarjetaMovil: tarjeta, pie: { total: "S/ 30.00" } });
  const lista = out.slice(out.indexOf("<ul"), out.indexOf("</ul>"));
  assert.equal([...lista.matchAll(/<li[ >]/g)].length, 3);
  assert.match(lista, /data-resumen/);
  assert.match(lista, /S\/ 30\.00/);
});

// ── filaActiva ──────────────────────────────────────────────────────────────
test("filaActiva marca solo esa fila con aria-selected", () => {
  const out = html({ filaActiva: "b" });
  assert.equal([...out.matchAll(/aria-selected="true"/g)].length, 1);
  assert.match(out, /<tr[^>]*aria-selected="true"[^>]*>(?:(?!<\/tr>)[\s\S])*Beto/);
  assert.doesNotMatch(html(), /aria-selected="/);
});

test("filaActiva en móvil marca la tarjeta con aria-current", () => {
  const out = html({ tarjetaMovil: tarjeta, filaActiva: "a" });
  const lista = out.slice(out.indexOf("<ul"), out.indexOf("</ul>"));
  assert.equal([...lista.matchAll(/aria-current="true"/g)].length, 1);
});

// ── columnas visibles recordadas ────────────────────────────────────────────
function conAlmacen(almacen, fn) {
  const previo = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { value: almacen, configurable: true });
  try {
    return fn();
  } finally {
    if (previo) Object.defineProperty(globalThis, "localStorage", previo);
    else delete globalThis.localStorage;
  }
}

test("columnas ocultas: se guardan y se leen por clave", () => {
  const datos = new Map();
  const almacen = { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v), removeItem: (k) => datos.delete(k) };
  conAlmacen(almacen, () => {
    columnasOcultas.guardarColumnasOcultas("t1", ["total"]);
    assert.deepEqual(columnasOcultas.leerColumnasOcultas("t1"), ["total"]);
    assert.equal(columnasOcultas.leerColumnasOcultas("otra"), null);
    columnasOcultas.guardarColumnasOcultas("t1", null);
    assert.equal(columnasOcultas.leerColumnasOcultas("t1"), null);
  });
});

test("columnas ocultas: JSON roto, forma inesperada o almacenamiento que lanza no rompen", () => {
  const roto = { getItem: () => "{no", setItem: () => {}, removeItem: () => {} };
  conAlmacen(roto, () => assert.equal(columnasOcultas.leerColumnasOcultas("t"), null));
  const objeto = { getItem: () => '{"a":1}', setItem: () => {}, removeItem: () => {} };
  conAlmacen(objeto, () => assert.equal(columnasOcultas.leerColumnasOcultas("t"), null));
  const mixto = { getItem: () => '["a",1,null,"b"]', setItem: () => {}, removeItem: () => {} };
  conAlmacen(mixto, () => assert.deepEqual(columnasOcultas.leerColumnasOcultas("t"), ["a", "b"]));
  const lanza = {
    getItem: () => {
      throw new Error("bloqueado");
    },
    setItem: () => {
      throw new Error("bloqueado");
    },
    removeItem: () => {
      throw new Error("bloqueado");
    },
  };
  conAlmacen(lanza, () => {
    assert.equal(columnasOcultas.leerColumnasOcultas("t"), null);
    columnasOcultas.guardarColumnasOcultas("t", ["a"]);
    columnasOcultas.guardarColumnasOcultas("t", null);
  });
  // Sin localStorage (SSR).
  assert.equal(columnasOcultas.leerColumnasOcultas("t"), null);
});

// ── selector de columnas de TablaListado ────────────────────────────────────
const listado = leer("src/components/datos/tabla-listado.tsx");

test("TablaListado: columnas fijas con «Fijo», «Restablecer» y claveAlmacenamiento", () => {
  assert.match(listado, /fijo: "Fijo"/);
  assert.match(listado, /restablecer: "Restablecer"/);
  assert.match(listado, /claveAlmacenamiento\?: string/);
  assert.match(listado, /<MenuCheckboxItem[\s\S]*?disabled/); // la fija no se puede desmarcar
  assert.match(listado, /textos\.fijo/);
  assert.match(listado, /textos\.restablecer/);
  assert.match(listado, /ocultaInicial/);
  assert.match(listado, /interpretarColumnasOcultas\(/);
  assert.match(listado, /useSyncExternalStore/); // lo recordado se aplica tras hidratar: sin desajuste con el servidor
  assert.match(listado, /guardarColumnasOcultas\(/);
});

test("TablaListado pasa titulo, tarjetaMovil y el resto a TablaDatos sin cambiar el contrato anterior", () => {
  assert.match(listado, /<TablaDatos[\s\S]*?titulo=\{titulo\}/);
  assert.match(listado, /\{\.\.\.resto\}\s*reinicioPagina=\{reinicio\}/);
});
