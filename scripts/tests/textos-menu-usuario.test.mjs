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

test("los componentes usan los textos en vez de castellano fijo", () => {
  for (const clave of ["temaInterfaz"]) assert.match(TOGGLE, new RegExp(`aria-label=\\{textos\\.${clave}\\}`));
  assert.match(TOGGLE, /const etiqueta = textos\[clave\];/);
  for (const clave of ["menu", "cuenta", "tema", "apariencia"]) {
    assert.match(MENU, new RegExp(`\\{textos\\.${clave}\\}`), `MenuUsuario debe usar textos.${clave}`);
  }
  for (const clave of ["aparienciaTitulo", "aparienciaDescripcion", "tema", "paleta", "paletaAyuda", "tonoOscuro", "tonoOscuroAyuda", "tipografia", "tipografiaAyuda", "tipografiaMuestra", "diseno", "disenoInterfaz"]) {
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
  assert.match(leer("src/components/nav/selector-diseno.tsx"), /aria-label=\{etiqueta\}/);
});
