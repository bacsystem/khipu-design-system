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
  assert.match(fuente, /<title>\{`\$\{c\}: \$\{formato\(v\)\}`\}<\/title>\s*<\/m\.path>/);
});

test("las tarjetas de gráfico usan TARJETA y la escala tipográfica", () => {
  assert.equal(fuente.match(/cn\(TARJETA, "relative px-4 py-3\.5", className\)/g)?.length, 2);
  // El título va en la cabecera compartida, con la leyenda en píldoras a la derecha.
  assert.match(fuente, /function Cabecera\(/);
  assert.equal(fuente.match(/<Cabecera titulo=\{titulo\}/g)?.length, 2);
  assert.match(fuente, /<div className="text-titulo text-foreground">\{titulo\}<\/div>/);
});

test("ejes sin monoespaciada, rejilla continua y esquinas de 9 px", () => {
  assert.doesNotMatch(fuente, /font-mono|--font-mono/);
  assert.doesNotMatch(fuente, /strokeDasharray/);
  assert.doesNotMatch(fuente, /fill="var\(--muted-foreground\)"/);
  assert.match(fuente, /const r = Math\.min\(9, barra \/ 2\);/);
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
