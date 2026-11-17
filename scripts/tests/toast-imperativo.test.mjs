import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

const { crearCola } = await cargarTsx("lib/cola-toast");
const { toast, useToast } = await cargarTsx("components/feedback/toast");

test("cola: sin proveedor las llamadas esperan y salen en orden al conectarse", () => {
  const cola = crearCola({ servidor: () => false });
  const salida = [];
  cola.despachar(() => salida.push(1));
  cola.despachar(() => salida.push(2));
  assert.deepEqual(salida, []);
  cola.conectar();
  assert.deepEqual(salida, [1, 2]);
  cola.despachar(() => salida.push(3));
  assert.deepEqual(salida, [1, 2, 3], "ya conectada, ejecuta al instante");
});

test("cola: guarda como máximo 5 y descarta las más antiguas", () => {
  const cola = crearCola({ servidor: () => false });
  const salida = [];
  for (let i = 1; i <= 8; i++) cola.despachar(() => salida.push(i));
  cola.conectar();
  assert.deepEqual(salida, [4, 5, 6, 7, 8]);
});

test("cola: al desconectar el último proveedor vuelve a esperar", () => {
  const cola = crearCola({ servidor: () => false });
  const salida = [];
  const a = cola.conectar();
  const b = cola.conectar();
  a();
  cola.despachar(() => salida.push("sigue"));
  assert.deepEqual(salida, ["sigue"]);
  b();
  cola.despachar(() => salida.push("espera"));
  assert.deepEqual(salida, ["sigue"]);
  cola.conectar();
  assert.deepEqual(salida, ["sigue", "espera"]);
});

test("cola: en el servidor no hace nada (no filtra avisos entre peticiones)", () => {
  const cola = crearCola({ servidor: () => true });
  const salida = [];
  cola.despachar(() => salida.push(1));
  cola.conectar();
  assert.deepEqual(salida, []);
});

test("toast se puede llamar fuera de un componente y useToast() devuelve ese mismo objeto", () => {
  assert.equal(useToast(), toast);
  for (const nombre of ["ok", "aviso", "error", "info", "promise", "cerrar"]) assert.equal(typeof toast[nombre], "function", nombre);
  // En Node no hay `window`: es el camino del servidor, no lanza y no devuelve nada que cerrar.
  assert.doesNotThrow(() => toast.ok("Guardado"));
  assert.doesNotThrow(() => toast.error("No se pudo", "Detalle", { etiqueta: "Reintentar", onClick() {} }));
  const p = Promise.resolve(1);
  assert.equal(toast.promise(p, { cargando: "…", ok: "Listo", error: "Falló" }), p);
});

test("el visor sigue sobre la barra inferior, centrado en móvil y abajo a la derecha desde md", () => {
  const fuente = leer("src/components/feedback/toast.tsx");
  assert.match(fuente, /bottom-\[calc\(1rem\+var\(--khipu-reserva-inferior,0px\)\)\]/);
  assert.match(fuente, /inset-x-0 mx-auto md:inset-x-auto md:right-4 md:mx-0/);
  assert.match(fuente, /limit=\{3\}/);
});

test("error es assertive (priority high) y el resto polite", () => {
  const fuente = leer("src/components/feedback/toast.tsx");
  assert.match(fuente, /priority: type === "error" \? "high" : "low"/);
});
