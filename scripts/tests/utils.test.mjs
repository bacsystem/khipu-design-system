import assert from "node:assert/strict";
import { test } from "node:test";
import { cn } from "../../src/lib/utils.ts";

// La escala tipográfica con nombre (globals.css @theme) es de tamaño, no de color: cn no debe tratarla como color.
test("cn conserva el tamaño de la escala junto a un color de texto", () => {
  assert.equal(cn("text-etiqueta text-muted-foreground"), "text-etiqueta text-muted-foreground");
  assert.equal(cn("bg-codigo text-codigo-foreground text-control"), "bg-codigo text-codigo-foreground text-control");
  assert.equal(cn("text-metrica text-destructive-texto"), "text-metrica text-destructive-texto");
});

test("cn sigue resolviendo conflictos dentro de cada grupo", () => {
  assert.equal(cn("text-control text-cuerpo"), "text-cuerpo");
  assert.equal(cn("text-foreground text-muted-foreground"), "text-muted-foreground");
});
