import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

// Los textos del menú de usuario, del selector de tema y del panel de apariencia estaban fijos en castellano:
// ahora son `textos` con ese valor por defecto, y cada nivel pasa los suyos al de abajo.
const TOGGLE = leer("src/components/nav/theme-toggle.tsx");
const PANEL = leer("src/components/nav/panel-apariencia.tsx");
const MENU = leer("src/components/nav/menu-usuario.tsx");

/** El valor por defecto de cada clave del objeto `TEXTOS_*_ES` de un archivo. */
function porDefecto(fuente, objeto) {
  const bloque = fuente.match(new RegExp(`export const ${objeto}[^=]*= \\{([\\s\\S]*?)\\n\\};`))?.[1] ?? "";
  return Object.fromEntries([...bloque.matchAll(/^\s+(\w+): "([^"]*)",/gm)].map((m) => [m[1], m[2]]));
}

test("ThemeToggle conserva sus textos de siempre por defecto", () => {
  assert.deepEqual(porDefecto(TOGGLE, "TEXTOS_THEME_TOGGLE_ES"), {
    temaInterfaz: "Tema de la interfaz",
    claro: "Claro",
    oscuro: "Oscuro",
    sistema: "Sistema",
  });
});

test("MenuUsuario conserva sus textos de siempre por defecto", () => {
  assert.deepEqual(porDefecto(MENU, "TEXTOS_MENU_USUARIO_ES"), {
    menu: "Menú de usuario",
    cuenta: "Tu cuenta",
    tema: "Tema",
    apariencia: "Apariencia…",
  });
});

test("PanelApariencia conserva sus textos de siempre por defecto", () => {
  const textos = porDefecto(PANEL, "TEXTOS_PANEL_APARIENCIA_ES");
  assert.equal(textos.aparienciaTitulo, "Apariencia");
  assert.equal(textos.aparienciaDescripcion, "Se aplica al instante y se guarda en este navegador.");
  assert.equal(textos.tema, "Tema");
  assert.equal(textos.paleta, "Paleta");
  assert.equal(textos.tonoOscuro, "Tono oscuro");
  assert.equal(textos.tipografia, "Tipografía");
  assert.equal(textos.diseno, "Diseño");
  assert.equal(textos.disenoInterfaz, "Diseño de la interfaz");
});

// Todas las claves de texto del panel (menos la frase de muestra, que es JSX) con su valor de siempre: cambiar una rompe este test.
test("PanelApariencia: todos sus textos por defecto son los de siempre", () => {
  assert.deepEqual(porDefecto(PANEL, "TEXTOS_PANEL_APARIENCIA_ES"), {
    aparienciaTitulo: "Apariencia",
    aparienciaDescripcion: "Se aplica al instante y se guarda en este navegador.",
    tema: "Tema",
    paleta: "Paleta",
    paletaAyuda: "El color de acento: ítem activo, métricas destacadas y gráficos.",
    tonoOscuro: "Tono oscuro",
    tonoOscuroAyuda: "Se usa cuando el tema es oscuro.",
    tipografia: "Tipografía",
    tipografiaAyuda: "Los datos (correlativos, ids) siguen en JetBrains Mono.",
    diseno: "Diseño",
    disenoInterfaz: "Diseño de la interfaz",
    paletaColor: "Paleta de color",
    tonoModoOscuro: "Tono del modo oscuro",
    tipografiaFuente: "Tipografía",
    cerrar: "Cerrar",
  });
  assert.match(PANEL, /tipografiaMuestra: \(\s*<>\s*Factura <span className="font-mono">F001-00000136<\/span> · S\/ 4,820\.00 aceptada por SUNAT\./);
});

// Sin esta fusión un componente ignoraría los textos que recibe, o perdería los de por defecto.
test("cada componente fusiona sus textos con los de por defecto", () => {
  assert.match(TOGGLE, /const textos = \{ \.\.\.TEXTOS_THEME_TOGGLE_ES, \.\.\.textosParciales \};/);
  assert.match(PANEL, /const textos = \{ \.\.\.TEXTOS_PANEL_APARIENCIA_ES, \.\.\.textosParciales \};/);
  assert.match(MENU, /const textos = \{ \.\.\.TEXTOS_MENU_USUARIO_ES, \.\.\.textosParciales \};/);
});

test("los componentes usan los textos en vez de castellano fijo", () => {
  for (const clave of ["temaInterfaz"]) assert.match(TOGGLE, new RegExp(`aria-label=\\{textos\\.${clave}\\}`));
  assert.match(TOGGLE, /const etiqueta = textos\[clave\];/);
  for (const clave of ["menu", "cuenta", "tema", "apariencia"]) {
    assert.match(MENU, new RegExp(`\\{textos\\.${clave}\\}`), `MenuUsuario debe usar textos.${clave}`);
  }
  for (const clave of ["aparienciaTitulo", "aparienciaDescripcion", "tema", "paleta", "paletaAyuda", "tonoOscuro", "tonoOscuroAyuda", "tipografia", "tipografiaAyuda", "tipografiaMuestra", "diseno", "disenoInterfaz", "paletaColor", "tonoModoOscuro", "tipografiaFuente", "cerrar"]) {
    assert.match(PANEL, new RegExp(`textos\\.${clave}`), `PanelApariencia debe usar textos.${clave}`);
  }
  // Ya no queda castellano fuera de los objetos de valores por defecto.
  assert.doesNotMatch(MENU.split("export function MenuUsuario")[1], /aria-label="Menú de usuario"|>Tu cuenta<|>Tema<|>Apariencia…</);
  assert.doesNotMatch(TOGGLE.split("export function ThemeToggle")[1], /"Tema de la interfaz"|"Claro"|"Oscuro"|"Sistema"/);
  assert.doesNotMatch(PANEL.split("export function PanelApariencia")[1], /titulo="|ayuda="/);
});

test("cada nivel pasa sus textos al de abajo", () => {
  assert.match(MENU, /<ThemeToggle textos=\{textosParciales\} \/>/);
  assert.match(MENU, /<PanelApariencia[^>]*textos=\{textosParciales\}/);
  assert.match(PANEL, /<ThemeToggle conTexto textos=\{textosParciales\} \/>/);
  assert.match(PANEL, /<SelectorDiseno etiqueta=\{textos\.disenoInterfaz\} \/>/);
  assert.match(PANEL, /<SelectorPaleta grande etiqueta=\{textos\.paletaColor\} \/>/);
  assert.match(PANEL, /<SelectorTonoOscuro grande etiqueta=\{textos\.tonoModoOscuro\} \/>/);
  assert.match(PANEL, /<SelectorTipografia grande etiqueta=\{textos\.tipografiaFuente\} \/>/);
  const selectores = leer("src/components/nav/selector-apariencia.tsx");
  for (const [nombre, defecto] of [["SelectorPaleta", "Paleta de color"], ["SelectorTonoOscuro", "Tono del modo oscuro"], ["SelectorTipografia", "Tipografía"]]) {
    assert.match(selectores, new RegExp(`export function ${nombre}\\(\\{[^}]*etiqueta = "${defecto}"`), `${nombre} debe recibir etiqueta con su valor de siempre`);
  }
  assert.equal(selectores.match(/etiqueta=\{etiqueta\}/g)?.length, 3);
  assert.match(leer("src/components/nav/selector-diseno.tsx"), /aria-label=\{etiqueta\}/);
});

// El botón de cerrar de `PanelLateral` tenía «Cerrar» fijo: ahora es `etiquetaCerrar`, y `PanelApariencia` la recibe en `textos.cerrar`.
test("PanelLateral traduce su botón de cerrar y PanelApariencia se lo pasa", () => {
  const panelLateral = leer("src/components/navegacion/panel-lateral.tsx");
  assert.match(panelLateral, /etiquetaCerrar = "Cerrar"/);
  assert.match(panelLateral, /<SheetClose aria-label=\{etiquetaCerrar\}/);
  assert.doesNotMatch(panelLateral, /aria-label="Cerrar"/);
  assert.match(PANEL, /etiquetaCerrar=\{textos\.cerrar\}/);
});
