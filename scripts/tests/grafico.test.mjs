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
  assert.equal(fuente.match(/"px-1 pb-2 text-titulo text-foreground"/g)?.length, 2);
});

test("ejes sin monoespaciada, rejilla continua y esquinas de 8 px", () => {
  assert.doesNotMatch(fuente, /font-mono|--font-mono/);
  assert.doesNotMatch(fuente, /strokeDasharray/);
  assert.doesNotMatch(fuente, /fill="var\(--muted-foreground\)"/);
  assert.match(fuente, /const r = Math\.min\(8, barra \/ 2\);/);
});
