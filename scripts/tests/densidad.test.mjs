import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cn } from "../../src/lib/utils.ts";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

// 0.5.3: el portal se veía demasiado grande. Controles de 32 px, valores de métrica de 22 px (18 px si son una palabra), etiquetas de campo
// en text-etiqueta y un sidebar de 248 px en el que entran el nombre de la empresa y el correo.
test("la altura única de control son 32 px", () => {
  assert.match(leer("src/styles/theme.css"), /--spacing-control:\s*2rem;/);
});

test("el valor de una métrica mide 22 px, y 18 px cuando es una palabra", () => {
  const tema = leer("src/styles/theme.css");
  assert.match(tema, /--text-metrica:\s*1\.375rem;/);
  assert.match(tema, /--text-metrica-texto:\s*1\.125rem;/);
  const metricas = leer("src/components/patrones/metricas.tsx");
  assert.match(metricas, /texto \? "text-metrica-texto" : "text-metrica tabular-nums"/);
});

test("cn trata text-metrica-texto como tamaño, no como color", () => {
  assert.equal(cn("text-metrica-texto text-foreground"), "text-metrica-texto text-foreground");
  assert.equal(cn("text-metrica text-metrica-texto"), "text-metrica-texto");
});

test("las etiquetas de campo van en text-etiqueta", () => {
  assert.match(leer("src/lib/estilos.ts"), /export const ETIQUETA_CAMPO = "text-etiqueta /);
  assert.match(leer("src/components/ui/label.tsx"), /gap-2 text-etiqueta leading-none/);
});

test("el sidebar mide 248 px (260 con el margen) y el cajón lo mismo", () => {
  assert.match(leer("src/components/nav/shell.tsx"), /w-\[260px\] shrink-0/);
  assert.match(leer("src/components/nav/mobile-nav.tsx"), /w-\[248px\]/);
});

test("la fila vacía de una tabla no lleva la píldora gris de las celdas", () => {
  assert.match(leer("src/components/patrones/pie-tabla.tsx"), /<TableCell colSpan=\{columnas\} className="bg-transparent group-hover\/fila:bg-transparent">/);
});

// 0.5.4: cinco pestañas subrayadas miden más que un teléfono; la fila tiene que desplazarse ella y no empujar la página.
test("la fila de pestañas subrayadas se desplaza a lo ancho y su indicador no queda recortado", () => {
  const tabs = leer("src/components/navegacion/tabs.tsx");
  assert.match(tabs, /const PESTANAS_LINEA =\s*"flex items-center gap-4 overflow-x-auto/);
  assert.match(tabs, /linea: cn\(INDICADOR_BASE, "bottom-0 h-0\.5/);
  assert.doesNotMatch(tabs, /"flex items-center gap-4 border-b border-border"/);
});

test("el panel lateral ocupa el ancho del teléfono y las filas de muestras encogen", () => {
  assert.match(leer("src/components/navegacion/panel-lateral.tsx"), /data-\[side=right\]:w-\[calc\(100%-1\.5rem\)\]/);
  assert.match(leer("src/components/nav/selector-apariencia.tsx"), /gridTemplateColumns: `repeat\(\$\{opciones\.length\}, minmax\(0, 1fr\)\)`/);
});

test("ya no existe el diseño «papel»", () => {
  assert.doesNotMatch(leer("src/components/disenos.ts"), /papel/);
  assert.doesNotMatch(leer("src/styles/tokens.css"), /papel/);
  assert.doesNotMatch(leer("src/styles/theme.css"), /papel/);
});

// 0.5.5: lo que pidió el dueño desde el iPhone.
test("EntradaFecha se puede limpiar, se envía en un formulario y tiene el aspecto de la barra de filtros", () => {
  const fecha = leer("src/components/formularios/entrada-fecha.tsx");
  assert.match(fecha, /const conLimpiar = limpiable && conValor && !disabled;/);
  assert.match(fecha, /onClick=\{\(\) => onCambio\?\.\(""\)\}/);
  assert.match(fecha, /<input type="hidden" name=\{nombre\} value=\{valor \?\? ""\} \/>/);
  assert.match(fecha, /enBarra \? cn\(CONTROL_FILTRO, "px-3"\) : CAMPO/);
});

test("el menú de un Select mide al menos lo que su texto, sin pasarse de la pantalla", () => {
  assert.match(leer("src/components/ui/select.tsx"), /w-max min-w-\[max\(9rem,var\(--anchor-width\)\)\] max-w-\[calc\(100vw-1\.5rem\)\]/);
});

test("en el teléfono la miga muestra solo la página", () => {
  const barra = leer("src/components/nav/top-bar.tsx");
  assert.match(barra, /<span className="hidden text-texto-terciario sm:inline">\{miga\.seccion\}<\/span>/);
});
