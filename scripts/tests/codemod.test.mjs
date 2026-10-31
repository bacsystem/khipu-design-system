import assert from "node:assert/strict";
import { test } from "node:test";
import { transformar } from "../codemod-estilo.mjs";

test("mapea tamaños sueltos a la escala", () => {
  assert.equal(transformar('"text-[10px] text-[11px] text-[11.5px]"'), '"text-etiqueta text-etiqueta text-etiqueta"');
  assert.equal(transformar('"text-[12px] text-[0.8rem]"'), '"text-control text-control"');
  assert.equal(transformar('"text-[13px] font-semibold"'), '"text-cuerpo font-semibold"');
  assert.equal(transformar('"text-[13px] text-foreground"'), '"text-control text-foreground"');
  assert.equal(transformar('"text-[14px] text-[15px]"'), '"text-cuerpo text-base"');
});

test("quita mayúsculas y tracking ancho, salvo tipografia-ok", () => {
  assert.equal(transformar('"text-[11px] font-medium tracking-wider text-muted-foreground uppercase"'), '"text-etiqueta font-medium text-muted-foreground"');
  assert.equal(transformar('"px-1 tracking-wide uppercase"'), '"px-1"');
  assert.equal(transformar('"uppercase" // tipografia-ok'), '"uppercase" // tipografia-ok');
  assert.equal(transformar('"tracking-tight"'), '"tracking-tight"');
});

test("sombras, anillos, curva y rojo suave", () => {
  assert.equal(transformar('"shadow-2xs data-active:shadow-2xs shadow-xl"'), '"shadow-xs data-active:shadow-xs shadow-lg"');
  assert.equal(transformar('"ring-1 ring-foreground/10 ring-foreground/5"'), '"ring-1 ring-border ring-border"');
  assert.equal(transformar('"focus-visible:ring-ring/40"'), '"focus-visible:ring-ring/50"');
  assert.equal(transformar('"duration-150 ease-out"'), '"duration-150 ease-salida"');
  assert.equal(transformar('"bg-destructive/10 hover:bg-destructive/10"'), '"bg-destructive-suave hover:bg-destructive-suave"');
});

test("rojo legible sobre el fondo suave", () => {
  assert.equal(transformar('"bg-destructive/10 text-destructive dark:bg-destructive/20"'), '"bg-destructive-suave text-destructive-texto"');
  assert.equal(transformar('"text-destructive hover:bg-muted"'), '"text-destructive hover:bg-muted"');
});

test("es idempotente", () => {
  const una = transformar('"text-[11px] uppercase shadow-2xs ease-out"');
  assert.equal(transformar(una), una);
});
