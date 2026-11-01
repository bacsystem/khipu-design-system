import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

// iOS Safari amplía la página al enfocar un campo de texto de menos de 16 px y la deja ampliada: en pantallas táctiles la letra de un campo es `text-campo` (16 px).
test("el tamaño de un campo en pantallas táctiles son 16 px", () => {
  assert.match(leer("src/styles/theme.css"), /--text-campo:\s*1rem;/);
});

test("los campos de texto usan text-campo hasta md y text-control desde md", () => {
  const estilos = leer("src/lib/estilos.ts");
  for (const receta of ["CAMPO", "SELECT_NATIVO"]) {
    const linea = estilos.split("\n").find((_, i, todas) => todas[i - 1]?.startsWith(`export const ${receta} =`)) ?? "";
    assert.match(linea, /text-campo md:text-control/, `${receta} debe llevar text-campo md:text-control`);
  }
  assert.match(leer("src/components/ui/input.tsx"), /text-campo md:text-control/);
});

// El kit fijaba en castellano los nombres de sus landmarks: ahora son propiedades con ese mismo valor por defecto.
test("los nombres accesibles del menú, la miga y el cajón son propiedades", () => {
  assert.match(leer("src/components/nav/sidebar-nav.tsx"), /aria-label=\{etiqueta\}/);
  assert.match(leer("src/components/nav/sidebar.tsx"), /etiquetaMenu/);
  assert.match(leer("src/components/nav/top-bar.tsx"), /etiquetaUbicacion = "Ubicación"/);
  assert.match(leer("src/components/nav/top-bar.tsx"), /aria-label=\{etiquetaUbicacion\}/);
  assert.match(leer("src/components/nav/mobile-nav.tsx"), /etiqueta = "Abrir menú"/);
});

test("un ítem del menú puede comparar su ruta de forma exacta", () => {
  const nav = leer("src/components/nav/sidebar-nav.tsx");
  assert.match(nav, /exacto\?: boolean/);
  assert.match(nav, /item\.exacto \? pathname === item\.href : pathname\.startsWith\(item\.href\)/);
});

test("el cajón del teléfono se desplaza", () => {
  assert.match(leer("src/components/nav/mobile-nav.tsx"), /overflow-y-auto/);
});

test("el panel lateral tiene nombre accesible: su título es el del diálogo", () => {
  const panel = leer("src/components/navegacion/panel-lateral.tsx");
  assert.match(panel, /<SheetTitle/);
  assert.doesNotMatch(panel, /<h2 className="text-titulo text-foreground">/);
});

test("FilaMetricas admite cinco columnas", () => {
  const metricas = leer("src/components/patrones/metricas.tsx");
  assert.match(metricas, /columnas\?: 2 \| 3 \| 4 \| 5/);
  assert.match(metricas, /lg:grid-cols-5/);
});
