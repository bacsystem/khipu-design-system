import assert from "node:assert/strict";
import { test } from "node:test";
import { cn } from "../../src/lib/utils.ts";

// La escala tipográfica con nombre (src/styles/theme.css @theme) es de tamaño, no de color: cn no debe tratarla como color.
test("cn conserva el tamaño de la escala junto a un color de texto", () => {
  assert.equal(cn("text-etiqueta text-muted-foreground"), "text-etiqueta text-muted-foreground");
  assert.equal(cn("bg-codigo text-codigo-foreground text-control"), "bg-codigo text-codigo-foreground text-control");
  assert.equal(cn("text-metrica text-destructive-texto"), "text-metrica text-destructive-texto");
  // El tamaño de un campo en pantallas táctiles (16 px) y el de escritorio van juntos con el color del texto.
  assert.equal(cn("text-campo md:text-control text-foreground"), "text-campo md:text-control text-foreground");
});

test("cn sigue resolviendo conflictos dentro de cada grupo", () => {
  assert.equal(cn("text-control text-cuerpo"), "text-cuerpo");
  assert.equal(cn("text-foreground text-muted-foreground"), "text-muted-foreground");
});

test("cn trata text-titulo y text-titulo-pagina como tamaño, no como color", () => {
  assert.equal(cn("text-titulo text-muted-foreground"), "text-titulo text-muted-foreground");
  assert.equal(cn("text-titulo-pagina text-foreground"), "text-titulo-pagina text-foreground");
  assert.equal(cn("text-cuerpo", "text-titulo"), "text-titulo");
});

// OBJETIVO_TACTIL trae `relative`: puesta primera en `cn`, el `absolute` de la X de un diálogo la pisa y el halo `::after` se conserva.
test("cn con OBJETIVO_TACTIL conserva un absolute propio y las clases del halo", async () => {
  const { OBJETIVO_TACTIL } = await import("../../src/lib/estilos.ts");
  const clases = cn(OBJETIVO_TACTIL, "absolute top-4 right-4 size-8").split(" ");
  assert.ok(clases.includes("absolute"));
  assert.ok(!clases.includes("relative"));
  for (const c of OBJETIVO_TACTIL.split(" ").filter((c) => c.startsWith("pointer-coarse:after:"))) assert.ok(clases.includes(c), `falta ${c}`);
  assert.ok(clases.includes("size-8"));
});
