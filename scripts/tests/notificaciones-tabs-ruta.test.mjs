import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { createElement, isValidElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { PathnameContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime.js";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8");

const { TabsRuta, indiceActivoRuta } = await cargarTsx("components/navegacion/tabs-ruta");
const { Popover } = await cargarTsx("components/ui/popover");
const { CentroNotificaciones, PanelNotificaciones, etiquetaBotonNotificaciones, hrefNotificacionSeguro, TEXTOS_NOTIFICACIONES_ES } = await cargarTsx("components/nav/centro-notificaciones");

const enRuta = (ruta, hijo) => createElement(PathnameContext.Provider, { value: ruta }, hijo);
const html = (nodo) => renderToStaticMarkup(nodo);
/** El panel va dentro de un Popover (su título y descripción nombran el diálogo). */
const panelHtml = (props) => html(createElement(Popover, null, createElement(PanelNotificaciones, props)));

// ── TabsRuta ──────────────────────────────────────────────────────────────────────────────────────────────────────

const ITEMS = [
  { href: "/compras", etiqueta: "Registro", exacto: true },
  { href: "/compras/proveedores", etiqueta: "Proveedores", contador: 12 },
  { href: "/compras/ordenes", etiqueta: "Órdenes", contador: 0 },
];

test("indiceActivoRuta: exacto solo en igualdad; sin exacto, por segmento y gana el href más largo", () => {
  assert.equal(indiceActivoRuta(ITEMS, "/compras"), 0);
  assert.equal(indiceActivoRuta(ITEMS, "/compras/proveedores"), 1);
  assert.equal(indiceActivoRuta(ITEMS, "/compras/proveedores/42"), 1, "una subruta mantiene su pestaña");
  assert.equal(indiceActivoRuta(ITEMS, "/compras/otra"), -1, "el registro es exacto: no se enciende en una subruta");
  assert.equal(indiceActivoRuta(ITEMS, "/ventas"), -1);
  assert.equal(indiceActivoRuta([{ href: "/compras", etiqueta: "A" }, { href: "/comprasx", etiqueta: "B" }], "/comprasx"), 1, "/compras no es prefijo de /comprasx");
  assert.equal(indiceActivoRuta([{ href: "/a", etiqueta: "A" }, { href: "/a/b", etiqueta: "B" }], "/a/b/c"), 1, "el más específico gana, solo hay una activa");
  assert.equal(indiceActivoRuta([{ href: "/compras/", etiqueta: "A" }], "/compras"), 0, "barra final");
  assert.equal(indiceActivoRuta([{ href: "/compras?vista=1", etiqueta: "A" }], "/compras"), 0, "query ignorada");
  assert.equal(indiceActivoRuta([{ href: "/", etiqueta: "Inicio", exacto: true }], "/"), 0);
});

test("TabsRuta: <nav aria-label> de enlaces con aria-current=page solo en la ruta activa, sin roles de tabs", () => {
  const salida = html(enRuta("/compras/proveedores", createElement(TabsRuta, { items: ITEMS, etiqueta: "Secciones de compras" })));
  assert.match(salida, /<nav[^>]*aria-label="Secciones de compras"/);
  assert.ok(!/role="tablist"|role="tab"/.test(salida), "son rutas, no tabs ARIA");
  assert.equal((salida.match(/aria-current="page"/g) ?? []).length, 1);
  assert.match(salida, /<a[^>]*href="\/compras\/proveedores"[^>]*aria-current="page"|<a[^>]*aria-current="page"[^>]*href="\/compras\/proveedores"/);
  assert.match(salida, /href="\/compras"/);
  assert.match(salida, /<ul/, "lista: el lector de pantalla anuncia «3 elementos»");
});

test("TabsRuta: contador visible (también el 0) y etiqueta como ReactNode", () => {
  const salida = html(enRuta("/compras", createElement(TabsRuta, { items: [...ITEMS, { href: "/x", etiqueta: createElement("em", null, "Rica") }], etiqueta: "x" })));
  assert.match(salida, />12</);
  assert.match(salida, />0</);
  assert.match(salida, /<em>Rica<\/em>/);
});

test("TabsRuta: segmentado usa las recetas del kit; línea es subrayada; ambas se desplazan en horizontal en móvil", () => {
  const seg = html(enRuta("/compras", createElement(TabsRuta, { items: ITEMS, etiqueta: "x", estilo: "segmentado" })));
  assert.match(seg, /rounded-full bg-secondary/);
  assert.match(seg, /overflow-x-auto/);
  const linea = html(enRuta("/compras", createElement(TabsRuta, { items: ITEMS, etiqueta: "x" })));
  assert.match(linea, /after:bg-foreground/, "por defecto: subrayada");
  assert.match(linea, /overflow-x-auto/);
  assert.ok(!/bg-secondary p-\[3px\]/.test(linea));
});

test("TabsRuta: lleva su propio archivo y documenta el Suspense de cacheComponents", () => {
  const fuente = leer("src/components/navegacion/tabs-ruta.tsx");
  assert.match(fuente, /^"use client"/);
  assert.match(fuente, /Suspense/);
  assert.match(fuente, /usePathname/);
});

// ── CentroNotificaciones ──────────────────────────────────────────────────────────────────────────────────────────

const N = [
  { id: "a", titulo: "Factura F001-842 aceptada", descripcion: "CDR recibido", fecha: "2026-09-15T15:32:00Z", tono: "ok", href: "/comprobantes/F001-842", leida: false },
  { id: "b", titulo: "Stock agotado", fecha: "2026-09-15T13:00:00Z", tono: "aviso", leida: false },
  { id: "c", titulo: "Certificado vigente", fecha: "2026-09-14T13:00:00Z", href: "/configuracion", leida: true },
  { id: "d", titulo: "Aviso leído sin enlace", fecha: "2026-09-13T13:00:00Z", leida: true },
];

/** Expande componentes de función sin hooks hasta elementos de host y devuelve todos los elementos del árbol. */
function arbol(nodo, salida = []) {
  if (Array.isArray(nodo)) {
    nodo.forEach((n) => arbol(n, salida));
  } else if (isValidElement(nodo)) {
    salida.push(nodo);
    if (typeof nodo.type === "function") {
      let hijo = nodo.props.children;
      try {
        hijo = nodo.type(nodo.props);
      } catch {
        // Partes de base-ui que necesitan su contexto: basta con sus hijos.
      }
      arbol(hijo, salida);
    }
    else arbol(nodo.props.children, salida);
  }
  return salida;
}

test("etiquetaBotonNotificaciones: «Notificaciones, 3 sin leer» / singular / sin pendientes", () => {
  assert.equal(etiquetaBotonNotificaciones(3, TEXTOS_NOTIFICACIONES_ES), "Notificaciones, 3 sin leer");
  assert.equal(etiquetaBotonNotificaciones(1, TEXTOS_NOTIFICACIONES_ES), "Notificaciones, 1 sin leer");
  assert.equal(etiquetaBotonNotificaciones(0, TEXTOS_NOTIFICACIONES_ES), "Notificaciones");
});

test("el disparador es un botón con aria-label que cuenta las sin leer y un punto solo si hay", () => {
  const con = html(createElement(CentroNotificaciones, { notificaciones: N }));
  assert.match(con, /<button[^>]*aria-label="Notificaciones, 2 sin leer"/);
  assert.match(con, /data-sin-leer/);
  const sin = html(createElement(CentroNotificaciones, { notificaciones: N.map((n) => ({ ...n, leida: true })) }));
  assert.match(sin, /aria-label="Notificaciones"/);
  assert.ok(!/data-sin-leer/.test(sin));
  const traducido = html(createElement(CentroNotificaciones, { notificaciones: N, textos: { etiquetaBoton: (n) => `Alerts (${n})` } }));
  assert.match(traducido, /aria-label="Alerts \(2\)"/);
  assert.ok(!html(createElement(CentroNotificaciones, { notificaciones: N })).includes("Marcar"), "el panel cerrado no se pinta");
});

test("el panel lista las notificaciones: enlaces, marca de «sin leer» para el lector y fecha en hora de Lima", () => {
  const salida = panelHtml({ notificaciones: N, textos: TEXTOS_NOTIFICACIONES_ES });
  assert.match(salida, /href="\/comprobantes\/F001-842"/);
  assert.match(salida, /Factura F001-842 aceptada/);
  assert.match(salida, /CDR recibido/);
  assert.match(salida, /<time[^>]*dateTime="2026-09-15T15:32:00Z"[^>]*>15 Set 2026, 10:32</);
  assert.equal((salida.match(/Sin leer<\/span>/g) ?? []).length, 2, "una marca accesible por notificación sin leer");
  assert.match(salida, /2 sin leer/);
  assert.equal((salida.match(/<li/g) ?? []).length, 4);
});

test("el panel vacío muestra el estado vacío y ninguna lista ni «marcar todas»", () => {
  const salida = panelHtml({ notificaciones: [], onLeerTodas: () => {}, textos: TEXTOS_NOTIFICACIONES_ES });
  assert.match(salida, /No hay notificaciones/);
  assert.ok(!/<li/.test(salida));
  assert.ok(!salida.includes("Marcar todas"));
});

test("«Marcar todas como leídas» solo con callback y con pendientes; «Ver todas» solo si se pasa", () => {
  const base = { notificaciones: N, textos: TEXTOS_NOTIFICACIONES_ES };
  assert.ok(!panelHtml(base).includes("Marcar todas"));
  assert.match(panelHtml({ ...base, onLeerTodas: () => {} }), /Marcar todas como leídas/);
  assert.ok(!panelHtml({ ...base, notificaciones: N.map((n) => ({ ...n, leida: true })), onLeerTodas: () => {} }).includes("Marcar todas"));
  assert.match(panelHtml({ ...base, verTodas: { href: "/auditoria", etiqueta: "Ver historial" } }), /<a[^>]*href="\/auditoria"[^>]*>[^]*Ver historial/);
});

test("interacción: abrir una sin leer llama a onLeer(id) y cierra; una leída no llama a onLeer; sin href la sin leer es un botón", () => {
  const leidas = [];
  let cerrado = 0;
  let todas = 0;
  const props = { notificaciones: N, onLeer: (id) => leidas.push(id), onLeerTodas: () => todas++, alCerrar: () => cerrado++, textos: TEXTOS_NOTIFICACIONES_ES };
  const nodos = arbol(createElement(PanelNotificaciones, props));
  const porTitulo = (t) => nodos.find((n) => n.props.onClick && JSON.stringify(n.props.children).includes(t));
  const evento = { defaultPrevented: false, button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false };

  porTitulo("Factura F001-842").props.onClick(evento);
  assert.deepEqual(leidas, ["a"]);
  assert.equal(cerrado, 1);

  const boton = porTitulo("Stock agotado");
  assert.equal(boton.type, "button", "sin href y sin leer: botón que la marca");
  boton.props.onClick(evento);
  assert.deepEqual(leidas, ["a", "b"]);

  porTitulo("Certificado vigente").props.onClick(evento);
  assert.deepEqual(leidas, ["a", "b"], "ya leída: no se vuelve a marcar");
  assert.equal(cerrado, 2, "el botón sin enlace marca en el sitio y no cierra");

  assert.equal(porTitulo("Aviso leído sin enlace"), undefined, "leída y sin enlace: no es interactiva");
  nodos.find((n) => n.props.onClick && JSON.stringify(n.props.children ?? "").includes("Marcar todas")).props.onClick();
  assert.equal(todas, 1);
});

test("clic con tecla modificadora (nueva pestaña) marca como leída pero no cierra el panel", () => {
  let cerrado = 0;
  const leidas = [];
  const nodos = arbol(createElement(PanelNotificaciones, { notificaciones: [N[0]], onLeer: (id) => leidas.push(id), alCerrar: () => cerrado++, textos: TEXTOS_NOTIFICACIONES_ES }));
  nodos.find((n) => n.props.href === "/comprobantes/F001-842").props.onClick({ defaultPrevented: false, button: 0, metaKey: true, ctrlKey: false, shiftKey: false, altKey: false });
  assert.deepEqual(leidas, ["a"]);
  assert.equal(cerrado, 0);
});

test("hrefNotificacionSeguro: solo rutas de la app o http(s); nada de javascript:, data: ni //host", () => {
  assert.equal(hrefNotificacionSeguro("/a/b?x=1"), "/a/b?x=1");
  assert.equal(hrefNotificacionSeguro("https://khipu.pe/x"), "https://khipu.pe/x");
  for (const malo of ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,x", "//evil.com", "mailto:a@b.c", "", undefined]) {
    assert.equal(hrefNotificacionSeguro(malo), undefined, String(malo));
  }
  const salida = panelHtml({ notificaciones: [{ ...N[0], href: "javascript:alert(1)" }], textos: TEXTOS_NOTIFICACIONES_ES });
  assert.ok(!salida.includes("javascript:"), "un href peligroso no llega al DOM");
});

test("textos traducibles y el tono pone icono distinto sin depender solo del color", () => {
  const salida = panelHtml({ notificaciones: [], textos: { ...TEXTOS_NOTIFICACIONES_ES, vacioTitulo: "Nothing here" } });
  assert.match(salida, /Nothing here/);
  const conTonos = panelHtml({ notificaciones: ["ok", "aviso", "error", "neutro"].map((tono, i) => ({ id: String(i), titulo: tono, fecha: "2026-09-15T15:00:00Z", tono, leida: true })), textos: TEXTOS_NOTIFICACIONES_ES });
  assert.equal((conTonos.match(/<svg/g) ?? []).length, 4);
});

test("CentroNotificaciones: cliente, sin lucide y con rol de diálogo nombrado por su título", () => {
  const fuente = leer("src/components/nav/centro-notificaciones.tsx");
  assert.match(fuente, /^"use client"/);
  assert.ok(!/lucide/.test(fuente));
  assert.match(fuente, /Popover/);
  assert.match(fuente, /Title/);
});
