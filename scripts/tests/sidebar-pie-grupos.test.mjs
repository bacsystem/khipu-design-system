import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Children, createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

const { SidebarContent } = await cargarTsx("components/nav/sidebar");
const { SidebarNav } = await cargarTsx("components/nav/sidebar-nav");
const { leerGruposAbiertos, guardarGruposAbiertos, reducirGrupos, grupoAbierto, ESTADO_GRUPOS_INICIAL } = await cargarTsx("lib/navegacion");
const Icono = (props) => createElement("svg", { "data-icono": "x", ...props });

const item = (href, label) => ({ href, label, icon: Icono });
const GRUPOS = [
  { titulo: "Operación", items: [item("/a", "Alfa"), item("/b", "Beta")] },
  { titulo: "Gestión", id: "gestion", colapsable: true, items: [item("/g/uno", "Uno")] },
  { titulo: "Ajustes", id: "ajustes", colapsable: true, abiertoPorDefecto: true, items: [item("/s/dos", "Dos")] },
  { titulo: "Ayuda", id: "ayuda", colapsable: true, items: [item("/h/tres", "Tres")] },
];

const html = (ruta, props = {}) =>
  renderToStaticMarkup(createElement(PathnameContext.Provider, { value: ruta }, createElement(SidebarNav, { grupos: GRUPOS, ...props })));

/** Recorre el árbol de elementos que devuelve un componente sin montarlo y junta los que cumplen `coincide`. */
function buscar(nodo, coincide, encontrados = []) {
  if (!isValidElement(nodo)) return encontrados;
  if (coincide(nodo)) encontrados.push(nodo);
  Children.forEach(nodo.props.children, (hijo) => buscar(hijo, coincide, encontrados));
  return encontrados;
}

// ── Pie fijo ─────────────────────────────────────────────────────────────────────────────────────────────────────────

test("SidebarContent: la navegación hace scroll propio y el usuario queda fuera de ese scroll", () => {
  const arbol = SidebarContent({
    marca: createElement("b", { id: "marca" }),
    grupos: GRUPOS,
    pie: createElement("i", { id: "pie" }),
    usuario: createElement("u", { id: "usuario" }),
  });
  const conScroll = buscar(arbol, (n) => String(n.props.className ?? "").includes("overflow-y-auto"));
  assert.equal(conScroll.length, 1, "debe haber un único contenedor con scroll");
  assert.match(conScroll[0].props.className, /min-h-0/);
  assert.match(conScroll[0].props.className, /flex-1/);
  const ids = (nodo) => buscar(nodo, (n) => n.props.id).map((n) => n.props.id);
  assert.deepEqual(ids(conScroll[0]), [], "ni la marca ni el pie ni el usuario van dentro del scroll");
  assert.ok(buscar(conScroll[0], (n) => n.type === SidebarNav).length === 1, "la navegación sí");
  for (const id of ["marca", "pie", "usuario"]) assert.ok(ids(arbol).includes(id), id);
});

test("SidebarContent: la marca y el pie no se encogen", () => {
  const arbol = SidebarContent({ marca: createElement("b"), grupos: GRUPOS, usuario: createElement("u", { id: "usuario" }) });
  const contenedorUsuario = buscar(arbol, (n) => Children.toArray(n.props.children).some((h) => isValidElement(h) && h.props.id === "usuario"))[0];
  assert.match(contenedorUsuario.props.className, /shrink-0/);
});

test("Shell ya no hace scroll del contenedor externo", () => {
  const shell = leer("src/components/nav/shell.tsx");
  assert.doesNotMatch(shell, /overflow-y-auto/);
});

test("MobileNav deja que SidebarContent haga su scroll (sin el contenedor que desplaza todo)", () => {
  const movil = leer("src/components/nav/mobile-nav.tsx");
  assert.doesNotMatch(movil, /overflow-y-auto/);
  assert.doesNotMatch(movil, /\[&>div\]:overflow-visible/);
});

// ── Grupos colapsables ───────────────────────────────────────────────────────────────────────────────────────────────

test("sin la opción, un grupo es el de siempre: sin botón ni aria-expanded", () => {
  const marcado = renderToStaticMarkup(
    createElement(PathnameContext.Provider, { value: "/a" }, createElement(SidebarNav, { grupos: [GRUPOS[0]] })),
  );
  assert.doesNotMatch(marcado, /<button/);
  assert.doesNotMatch(marcado, /aria-expanded/);
  assert.match(marcado, /<span class="[^"]*">Operación<\/span>/);
});

test("un grupo colapsable tiene un botón con aria-expanded y aria-controls al panel", () => {
  const marcado = html("/a");
  const botones = [...marcado.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
  assert.equal(botones.length, 3);
  for (const boton of botones) {
    const controla = boton.match(/aria-controls="([^"]+)"/)?.[1];
    assert.ok(controla, boton);
    assert.match(boton, /aria-expanded="(true|false)"/);
    assert.match(marcado, new RegExp(`id="${controla.replace(/[:]/g, "\\:")}"`), "el panel controlado existe");
  }
});

test("un grupo colapsable sin id y con título de varias palabras tiene un aria-controls válido", () => {
  const grupos = [{ titulo: "Emisión & SUNAT", colapsable: true, items: [item("/e", "Emitir")] }];
  const marcado = renderToStaticMarkup(createElement(PathnameContext.Provider, { value: "/z" }, createElement(SidebarNav, { grupos })));
  const controla = marcado.match(/aria-controls="([^"]*)"/)?.[1];
  assert.match(controla, /^\S+$/, "sin espacios");
  assert.ok(marcado.includes(`id="${controla}"`), "el panel existe con ese id");
});

test("el grupo con la ruta activa arranca abierto y los demás cerrados", () => {
  const marcado = html("/g/uno");
  const estado = (titulo) => marcado.match(new RegExp(`aria-expanded="(true|false)"[^>]*>(?:(?!</button>).)*${titulo}`))?.[1] ?? marcado.match(new RegExp(`${titulo}(?:(?!<button).)*?aria-expanded="(true|false)"`))?.[1];
  assert.equal(estado("Gestión"), "true");
  assert.equal(estado("Ayuda"), "false");
});

test("abiertoPorDefecto abre el grupo sin ruta activa; el resto sigue cerrado", () => {
  const marcado = html("/a");
  const botones = [...marcado.matchAll(/<button[^>]*aria-expanded="(true|false)"[^>]*>[\s\S]*?<\/button>/g)];
  const porTitulo = Object.fromEntries(botones.map((b) => [["Gestión", "Ajustes", "Ayuda"].find((t) => b[0].includes(t)), b[1]]));
  assert.deepEqual(porTitulo, { Gestión: "false", Ajustes: "true", Ayuda: "false" });
});

test("los ítems de un grupo cerrado no reciben foco (inert) y los del abierto sí", () => {
  const marcado = html("/a");
  const panel = (titulo) => {
    const controla = [...marcado.matchAll(/<button[^>]*>/g)].map((m) => m[0]).find((b) => b.includes(`${titulo}"`))?.match(/aria-controls="([^"]+)"/)?.[1];
    return marcado.match(new RegExp(`<div[^>]*id="${controla}"[^>]*>`))?.[0] ?? "";
  };
  assert.match(panel("Gestión"), /inert/);
  assert.doesNotMatch(panel("Ajustes"), /inert/);
});

test("el movimiento del despliegue es motion-safe", () => {
  const fuente = leer("src/components/nav/sidebar-nav.tsx");
  assert.match(fuente, /motion-safe:transition-/);
  assert.doesNotMatch(fuente, /(?<!motion-safe:)transition-\[grid-template-rows\]/);
});

test("los textos del botón son traducibles y por defecto están en castellano", () => {
  const defecto = html("/a");
  assert.match(defecto, /title="Contraer Ajustes"/);
  assert.match(defecto, /title="Expandir Ayuda"/);
  const ingles = html("/a", { textos: { expandirGrupo: "Expand {grupo}", contraerGrupo: "Collapse {grupo}" } });
  assert.match(ingles, /title="Collapse Ajustes"/);
  assert.match(ingles, /title="Expand Ayuda"/);
});

// ── Estado recordado ─────────────────────────────────────────────────────────────────────────────────────────────────

function conAlmacenamiento(almacen, fn) {
  const previo = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { value: almacen, configurable: true });
  try {
    return fn();
  } finally {
    if (previo) Object.defineProperty(globalThis, "localStorage", previo);
    else delete globalThis.localStorage;
  }
}
const memoria = () => {
  const datos = new Map();
  return { getItem: (k) => datos.get(k) ?? null, setItem: (k, v) => datos.set(k, v) };
};

test("el estado de los grupos se guarda y se lee por clave", () => {
  conAlmacenamiento(memoria(), () => {
    guardarGruposAbiertos("k", { gestion: true, ayuda: false });
    assert.deepEqual(leerGruposAbiertos("k"), { gestion: true, ayuda: false });
    assert.deepEqual(leerGruposAbiertos("otra"), {});
  });
});

test("sin localStorage, con acceso bloqueado o con JSON roto no lanza", () => {
  const bloqueado = { getItem: () => { throw new Error("bloqueado"); }, setItem: () => { throw new Error("bloqueado"); } };
  conAlmacenamiento(bloqueado, () => {
    assert.deepEqual(leerGruposAbiertos("k"), {});
    assert.doesNotThrow(() => guardarGruposAbiertos("k", { a: true }));
  });
  conAlmacenamiento({ getItem: () => "{no es json", setItem() {} }, () => assert.deepEqual(leerGruposAbiertos("k"), {}));
  conAlmacenamiento({ getItem: () => '{"a":"si","b":true,"c":1}', setItem() {} }, () => assert.deepEqual(leerGruposAbiertos("k"), { b: true }));
  assert.deepEqual(leerGruposAbiertos("k"), {});
});

// ── Lo que abre la ruta no se guarda ─────────────────────────────────────────────────────────────────────────────────

test("lo que abre la ruta no entra en lo que se guarda al alternar otro grupo", () => {
  let estado = reducirGrupos(ESTADO_GRUPOS_INICIAL, { tipo: "ruta", id: "gestion" });
  assert.equal(grupoAbierto(estado, "gestion", false), true);
  estado = reducirGrupos(estado, { tipo: "alternar", id: "ayuda", abierto: false });
  assert.deepEqual(estado.elegidos, { ayuda: true }, "solo la decisión del usuario");
  assert.equal(grupoAbierto(estado, "gestion", false), true, "sigue abierto por la ruta");
});

test("la ruta abre un grupo que estaba recordado como cerrado, y el usuario puede volver a cerrarlo", () => {
  let estado = reducirGrupos(ESTADO_GRUPOS_INICIAL, { tipo: "recordado", guardado: { gestion: false } });
  estado = reducirGrupos(estado, { tipo: "ruta", id: "gestion" });
  assert.equal(grupoAbierto(estado, "gestion", false), true);
  estado = reducirGrupos(estado, { tipo: "alternar", id: "gestion", abierto: true });
  assert.equal(grupoAbierto(estado, "gestion", false), false);
  assert.deepEqual(estado.elegidos, { gestion: false });
});

test("lo elegido en esta visita manda sobre lo recordado", () => {
  let estado = reducirGrupos(ESTADO_GRUPOS_INICIAL, { tipo: "alternar", id: "a", abierto: false });
  estado = reducirGrupos(estado, { tipo: "recordado", guardado: { a: false, b: true } });
  assert.deepEqual(estado.elegidos, { a: true, b: true });
});
