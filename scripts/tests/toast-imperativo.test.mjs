import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { cargarTsx } from "./cargar-tsx.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

const { crearCola, crearToast, esServidor, tonoDe } = await cargarTsx("lib/cola-toast");
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
  assert.match(leer("src/lib/cola-toast.ts"), /priority: type === "error" \? "high" : "low"/);
});

// ── H1: tipos que base-ui pone al resolver una promesa ──────────────────────────────────────────────────────────────
test("tonoDe: loading → info, success → ok, error → error y lo desconocido → info (nunca undefined)", () => {
  assert.equal(tonoDe("loading"), "info");
  assert.equal(tonoDe("success"), "ok");
  assert.equal(tonoDe("error"), "error");
  for (const t of ["ok", "aviso", "info"]) assert.equal(tonoDe(t), t);
  assert.equal(tonoDe(undefined), "info");
  assert.equal(tonoDe("raro"), "info");
});

test("el visor pinta el icono con tonoDe y un spinner mientras carga", () => {
  const fuente = leer("src/components/feedback/toast.tsx");
  assert.match(fuente, /const tono = tonoDe\(t\.type\)/);
  assert.match(fuente, /t\.type === "loading" \? <Spinner/);
  assert.doesNotMatch(fuente, /as Tono/);
});

// ── Camino del navegador: fábrica con una cola conectada y un manager falso ─────────────────────────────────────────
function fabrica({ conectada = true } = {}) {
  const llamadas = [];
  const cola = crearCola({ servidor: () => false });
  if (conectada) cola.conectar();
  const manager = {
    add: (o) => llamadas.push(["add", o]),
    close: (id) => llamadas.push(["close", id]),
    promise: (p, o) => {
      llamadas.push(["promise", o]);
      return p.then((v) => v, (e) => Promise.reject(e)); // como base-ui: la encadenada se vuelve a rechazar
    },
  };
  return { llamadas, cola, toast: crearToast(cola, manager) };
}

test("ok/aviso/error/info llegan al manager con su tono, prioridad, id y acción", () => {
  const { toast, llamadas } = fabrica();
  const id = toast.error("Falló", "Detalle", { etiqueta: "Reintentar", onClick() {} });
  toast.ok("Hecho");
  const [, e] = llamadas[0];
  assert.equal(e.id, id);
  assert.equal(e.type, "error");
  assert.equal(e.priority, "high");
  assert.equal(e.actionProps.children, "Reintentar");
  assert.equal(llamadas[1][1].priority, "low");
  assert.equal(llamadas[1][1].type, "ok");
});

test("promise: devuelve la promesa de quien llama y no deja un rechazo sin capturar", async () => {
  const { toast } = fabrica();
  const sinCapturar = [];
  const oyente = (razon) => sinCapturar.push(razon);
  process.on("unhandledRejection", oyente);
  const rechazada = Promise.reject(new Error("boom"));
  const devuelta = toast.promise(rechazada, { cargando: "…", ok: "Listo", error: "Falló" });
  assert.equal(devuelta, rechazada);
  await devuelta.catch(() => {});
  await new Promise((r) => setTimeout(r, 20));
  process.off("unhandledRejection", oyente);
  assert.deepEqual(sinCapturar, []);
});

test("promise: los textos y tonos que pide a base-ui son loading info, success ok y error error alto", () => {
  const { toast, llamadas } = fabrica();
  toast.promise(Promise.resolve(2), { cargando: "Cargando", ok: (v) => `Listo ${v}`, error: (e) => `Falló ${e}` });
  const [, o] = llamadas[0];
  assert.deepEqual(o.loading, { title: "Cargando", type: "info" });
  assert.deepEqual(o.success(2), { title: "Listo 2", type: "ok" });
  assert.deepEqual(o.error("x"), { title: "Falló x", type: "error", priority: "high" });
});

// ── M8/M9/M10: conexión del proveedor, cerrar antes de montar y detección del servidor ──────────────────────────────
test("sin proveedor conectado, ok y cerrar esperan y salen en orden al conectarse", () => {
  const { toast, llamadas, cola } = fabrica({ conectada: false });
  toast.ok("Uno");
  toast.cerrar("khipu-toast-1");
  assert.equal(llamadas.length, 0);
  cola.conectar();
  assert.deepEqual(llamadas.map(([a]) => a), ["add", "close"]);
});

test("el proveedor conecta la cola al montarse y avisa si hay más de uno", () => {
  const fuente = leer("src/components/feedback/toast.tsx");
  assert.match(fuente, /useEffect\(\(\) => \{\s*const desconectar = cola\.conectar\(\);/);
  assert.match(fuente, /return desconectar;/);
  assert.match(fuente, /cola\.conectados\(\) > 1/);
  assert.match(fuente, /toastManager=\{manager\}/);
  assert.match(fuente, /export const toast = crearToast\(cola, manager\)/);
});

test("esServidor: sin window es servidor, con window es navegador, y es la detección por defecto de la cola", () => {
  assert.equal(esServidor({}), true);
  assert.equal(esServidor({ window: {} }), false);
  assert.match(leer("src/lib/cola-toast.ts"), /servidor = esServidor/);
});

test("la documentación dice que `toast` es solo de cliente", () => {
  for (const ruta of ["CHANGELOG.md", "docs/design-system.md", "src/components/feedback/toast.tsx"]) {
    assert.match(leer(ruta), /Server Component/, ruta);
  }
});
