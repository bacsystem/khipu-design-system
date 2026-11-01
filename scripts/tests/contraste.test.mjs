import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { combinaciones, contraste, resolverColor } from "../verificar-contraste.mjs";

const vars = new Map([
  ["--a", "#ffffff"],
  ["--b", "#000000"],
  ["--c", "var(--a)"],
  ["--d", "color-mix(in srgb, var(--a) 50%, var(--b))"],
  ["--e", "color-mix(in srgb, #ff0000 50%, transparent)"],
  ["--f", "rgba(0, 0, 0, 0.5)"],
]);

test("resuelve var() y color-mix() en srgb", () => {
  assert.deepEqual(resolverColor("--c", vars), { r: 255, g: 255, b: 255, a: 1 });
  const d = resolverColor("--d", vars);
  assert.equal(Math.round(d.r), 128);
  assert.equal(d.a, 1);
  const e = resolverColor("--e", vars);
  assert.equal(e.r, 255);
  assert.equal(e.a, 0.5);
  assert.equal(resolverColor("--f", vars).a, 0.5);
});

test("contraste sigue aceptando #rrggbb", () => {
  assert.equal(contraste("#ffffff", "#000000").toFixed(2), "21.00");
});

test("tokens.css da 20 combinaciones: 5 paletas × (claro + 3 tonos)", () => {
  const css = readFileSync(new URL("../../src/styles/tokens.css", import.meta.url), "utf8");
  const nombres = combinaciones(css).map((c) => c.nombre);
  assert.equal(nombres.length, 20);
  assert.ok(nombres.includes("claro/lima"));
  assert.ok(nombres.includes("oscuro-tintado/violeta"));
});
