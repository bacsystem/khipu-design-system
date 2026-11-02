import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Sin entorno de render para componentes: se verifica el contrato de la fuente de `datos/grafico.tsx`.
const fuente = readFileSync(new URL("../../src/components/datos/grafico.tsx", import.meta.url), "utf8");

test("las barras de una serie usan los colores de la paleta y resaltan `destacado`", () => {
  assert.match(fuente, /destacado\?: number/);
  assert.match(fuente, /i === destacado \? "var\(--chart-destacado\)" : "var\(--chart-base\)"/);
  assert.match(fuente, /hover === destacado \? "var\(--chart-destacado\)" : "var\(--chart-base\)"/);
});

test("cada barra expone su valor a lectores de pantalla", () => {
  assert.match(fuente, /\{tituloDeCategoria \? null : <title>\{`\$\{c\}: \$\{formato\(v\)\}`\}<\/title>\}\s*<\/m\.path>/);
  // Con `tituloDeCategoria` el texto es de la categoría entera (la franja de alto completo) y es el mismo del tooltip.
  assert.match(fuente, /\{tituloDeCategoria \? <title>\{nombreDe\(i\)\}<\/title> : null\}/);
  assert.match(fuente, /titulo=\{nombreDe\(hover\)\}/);
});

test("el gráfico de barras se nombra y se describe sin texto fijo cuando quien lo usa lo da", () => {
  assert.match(fuente, /const nombrado = etiquetadoPor \?\? `\$\{id\}-t`;/);
  assert.match(fuente, /aria-labelledby=\{nombrado\}/);
  assert.match(fuente, /\{etiquetadoPor \? null : <title id=\{`\$\{id\}-t`\}>\{titulo \?\? etiqueta \?\? "Gráfico de barras"\}<\/title>\}/);
  assert.match(fuente, /\{descripcion \? <desc id=\{`\$\{id\}-d`\}>\{descripcion\}<\/desc> : null\}/);
});

test("un valor 0 no dibuja barra y una barra baja no asoma por encima de su valor", () => {
  assert.match(fuente, /if \(v <= 0\) return null;/);
  assert.match(fuente, /const r = Math\.min\(9, barra \/ 2, bh\);/);
});

test("rotuloVisible decide qué categorías llevan rótulo, y propiedadesDeCategoria llega al grupo", () => {
  assert.match(fuente, /\{rotuloVisible && !rotuloVisible\(i\) \? null : \(/);
  assert.match(fuente, /onMouseLeave=\{\(\) => setHover\(null\)\} \{\.\.\.propiedadesDeCategoria\?\.\(i\)\}>/);
});

test("las tarjetas de gráfico usan TARJETA y la escala tipográfica", () => {
  assert.equal(fuente.match(/cn\(TARJETA, "relative px-4 py-3\.5", className\)/g)?.length, 1);
  // Las barras, salvo con `plano` (dentro de otra tarjeta), donde no llevan tarjeta ni relleno propios.
  assert.match(fuente, /cn\(!plano && cn\(TARJETA, "px-4 py-3\.5"\), "relative", className\)/);
  // El título va en la cabecera compartida, con la leyenda en píldoras a la derecha.
  assert.match(fuente, /function Cabecera\(/);
  assert.equal(fuente.match(/<Cabecera titulo=\{titulo\}/g)?.length, 2);
  assert.match(fuente, /<div className="text-titulo text-foreground">\{titulo\}<\/div>/);
});

test("ejes sin monoespaciada, rejilla continua y esquinas de 9 px", () => {
  assert.doesNotMatch(fuente, /font-mono|--font-mono/);
  assert.doesNotMatch(fuente, /strokeDasharray/);
  assert.doesNotMatch(fuente, /fill="var\(--muted-foreground\)"/);
  assert.match(fuente, /const r = Math\.min\(9, barra \/ 2, bh\);/);
});

test("GraficoAnillos: un anillo por serie, valores en texto y como <title>", () => {
  assert.match(fuente, /export function GraficoAnillos\(/);
  assert.match(fuente, /<title id=\{`\$\{id\}-t`\}>\{anillos\.map\(\(a\) => `\$\{a\.nombre\}: \$\{a\.valor\}%`\)/);
  assert.match(fuente, /series\.slice\(0, 5\)/);
});

test("cada barra lleva un borde de 1 px con el color de trazo (contraste no textual ≥ 3:1)", () => {
  assert.match(fuente, /stroke=\{series\.length === 1 \? \(i === destacado \? "var\(--chart-trazo-destacado\)" : "var\(--chart-trazo-base\)"\) : TRAZOS\[j % TRAZOS\.length\]\}/);
  assert.match(fuente, /strokeWidth=\{1\}/);
  assert.doesNotMatch(fuente, /"var\(--chart-2\)"|"var\(--chart-3\)"/);
});
