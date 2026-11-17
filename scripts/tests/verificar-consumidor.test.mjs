import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { analizarTexto, comparar, agrupar } from "../../cli/verificar.mjs";

const CLI = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "cli", "khipu.mjs");
const raices = [];
after(() => raices.forEach((r) => rmSync(r, { recursive: true, force: true })));

/** Crea una app consumidora mínima en un directorio temporal. */
function app(archivos) {
  const raiz = mkdtempSync(join(tmpdir(), "khipu-verificar-"));
  raices.push(raiz);
  for (const [ruta, texto] of Object.entries(archivos)) {
    mkdirSync(dirname(join(raiz, ruta)), { recursive: true });
    writeFileSync(join(raiz, ruta), texto);
  }
  return raiz;
}
const correr = (raiz, ...args) => spawnSync(process.execPath, [CLI, "verificar", ...args], { cwd: raiz, encoding: "utf8" });
const reglas = (texto, opciones) => analizarTexto(texto, opciones).map((h) => h.regla);

const SUCIO = `export const A = () => (
  <div className="w-[340px] bg-[#fff] text-white bg-blue-500 z-10 shadow-xl rounded-sm duration-300" data-c="#0f766e" style={{ width: 10, color: "red" }}>x</div>
);
`;
const LIMPIO = `import { Boton } from "khipu-design-system/ui/button";
export const A = () => (
  <div className="bg-card text-foreground rounded-xl shadow-sm text-cuerpo" style={{ "--ancho": "10px" }}>
    <Boton className="w-full">ok</Boton> <p className="w-(--anchor-width) rounded-md">{items[0]}</p>
  </div>
);
`;

test("estilos: detecta cada familia de violación", () => {
  const r = reglas(SUCIO);
  for (const esperado of ["valor-arbitrario", "color-literal", "paleta", "z-index", "sombra", "radio", "duracion", "style-inline"]) {
    assert.ok(r.includes(`estilos/${esperado}`), `falta ${esperado}: ${r}`);
  }
});

test("estilos: el hex dentro de un valor arbitrario cuenta una vez", () => {
  const r = reglas('<i className="bg-[#fff]" />');
  assert.deepEqual(r, ["estilos/valor-arbitrario"]);
});

test("estilos: colores literales en props y funciones de color", () => {
  assert.equal(reglas('<Bar fill="#0f766e" stroke="rgb(1,2,3)" color="oklch(0.5 0.1 200)" href="#main" />').filter((x) => x === "estilos/color-literal").length, 3);
});

test("estilos: archivo limpio, variables de componente y escala permitida", () => {
  assert.deepEqual(analizarTexto(LIMPIO), []);
  assert.deepEqual(analizarTexto('<i className="w-[var(--anchor-width)] rounded-md rounded-t-xl rounded-full shadow-none z-auto" />').map((h) => h.regla), ["estilos/z-index"]);
});

test("estilos: style con solo variables CSS no se marca; las claves visuales sí, también en varias líneas", () => {
  assert.deepEqual(reglas('<i style={{ "--x": 1 }} />'), []);
  const multi = analizarTexto('<i\n  style={{\n    width: `${p}%`,\n    height,\n  }}\n/>');
  assert.equal(multi.length, 1);
  assert.equal(multi[0].linea, 2);
  assert.equal(multi[0].coincidencia, "style={{height,width}}");
});

test("estilos: font-mono en montos solo con --monto", () => {
  const linea = '<span className="font-mono">{formatCurrency(total)}</span>';
  assert.deepEqual(reglas(linea), []);
  assert.deepEqual(reglas(linea, { monto: /formatCurrency\(/ }), ["estilos/font-mono-monto"]);
  assert.deepEqual(reglas('<span className="font-mono">{sku}</span>', { monto: /formatCurrency\(/ }), []);
});

test("tipografia y exenciones", () => {
  assert.deepEqual(reglas('"text-[11px] text-sm uppercase tracking-wider"', { grupos: ["tipografia"] }).sort(), ["tipografia/mayusculas", "tipografia/tamano-suelto", "tipografia/tamano-tailwind", "tipografia/tracking-ancho"]);
  assert.deepEqual(reglas('"text-sm" // tipografia-ok'), []);
  assert.deepEqual(reglas('"bg-white" // estilos-ok'), []);
  assert.deepEqual(reglas('// no uses bg-white ni text-sm'), []);
  assert.deepEqual(reglas('"text-[11px]"', { grupos: ["estilos"] }), []); // lo cubre tipografia
});

test("alturas: receta con h-N y control JSX con className", () => {
  assert.deepEqual(reglas('cn(BOTON_PRIMARIO, "h-9 px-2")', { grupos: ["alturas"] }), ["alturas/receta"]);
  assert.deepEqual(reglas('cn(CAMPO, "h-auto")', { grupos: ["alturas"] }), []);
  assert.deepEqual(reglas('<Button variant="x" onClick={() => go()} className="h-8 w-8">a</Button>', { grupos: ["alturas"] }), ["alturas/componente"]);
  assert.deepEqual(reglas('<Button className="h-control">a</Button>', { grupos: ["alturas"] }), []);
});

test("iconos: otras librerías", () => {
  assert.deepEqual(reglas('import { X } from "lucide-react";', { grupos: ["iconos"] }), ["iconos/paquete"]);
  assert.deepEqual(reglas('import { X } from "@phosphor-icons/react";', { grupos: ["iconos"] }), []);
});

test("comparar: solo los nuevos fallan y la poda nunca crece", () => {
  const h = (linea) => ({ linea, regla: "estilos/paleta", coincidencia: "bg-white" });
  const encontrado = agrupar({ "a.tsx": [h(1), h(5)], "b.tsx": [h(2)] });
  const baseline = { "a.tsx": { "estilos/paleta": { "bg-white": 1 } }, "c.tsx": { "estilos/paleta": { "bg-white": 2 } } };
  const r = comparar(encontrado, baseline);
  assert.deepEqual(r.nuevos.map((x) => `${x.archivo}:${x.linea}`), ["a.tsx:5", "b.tsx:2"]);
  assert.deepEqual(r.sobrantes, [{ archivo: "c.tsx", regla: "estilos/paleta", coincidencia: "bg-white", sobran: 2 }]);
  assert.deepEqual(r.podada, { "a.tsx": { "estilos/paleta": { "bg-white": 1 } } });
});

test("CLI: app limpia sale 0; ignora node_modules, tests, mocks y .next", () => {
  const raiz = app({
    "src/ok.tsx": LIMPIO,
    "src/node_modules/x.tsx": SUCIO,
    "src/a.test.tsx": SUCIO,
    "src/mocks/m.tsx": SUCIO,
    ".next/x.tsx": SUCIO,
    "src/features/__tests__/t.tsx": SUCIO,
  });
  const r = correr(raiz, "--dir", "src");
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Verificadas 1 archivos/);
});

test("CLI: sin baseline falla con file:line; --incluir y --ignorar configuran", () => {
  const raiz = app({ "src/bad.tsx": SUCIO, "src/mocks/m.tsx": SUCIO, "src/legacy/l.tsx": SUCIO });
  const r = correr(raiz, "estilos", "--dir", "src", "--ignorar", "legacy");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /src\/bad\.tsx:2 {2}\[estilos\/valor-arbitrario\] w-\[340px\]/);
  assert.doesNotMatch(r.stderr, /legacy|mocks/);
  const con = correr(raiz, "estilos", "--dir", "src", "--ignorar", "legacy", "--incluir", "mocks");
  assert.match(con.stderr, /src\/mocks\/m\.tsx/);
});

test("CLI: baseline — inicializar, nuevos fallan, sobrantes avisan, --estricto falla, --podar reescribe", () => {
  const raiz = app({ "src/a.tsx": 'export const a = <i className="bg-white z-10" />;\n' });
  const base = "ds-baseline.json";
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base).status, 2); // no existe
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base, "--inicializar").status, 0);
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base, "--inicializar").status, 2); // ya existe
  const inicial = JSON.parse(readFileSync(join(raiz, base), "utf8"));
  assert.deepEqual(inicial.violaciones["src/a.tsx"]["estilos/paleta"], { "bg-white": 1 });
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base).status, 0);

  // el número de línea no importa: mover código no es una violación nueva
  writeFileSync(join(raiz, "src/a.tsx"), '\n\nexport const a = <i className="bg-white z-10" />;\n');
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base).status, 0);

  // una violación más del mismo tipo y una de otro tipo fallan
  writeFileSync(join(raiz, "src/a.tsx"), 'export const a = <i className="bg-white z-10" />;\nexport const b = <i className="bg-white w-[3px]" />;\n');
  const nueva = correr(raiz, "--dir", "src", "--baseline", base);
  assert.equal(nueva.status, 1);
  assert.match(nueva.stderr, /src\/a\.tsx:2 {2}\[estilos\/paleta\]/);
  assert.match(nueva.stderr, /src\/a\.tsx:2 {2}\[estilos\/valor-arbitrario\]/);
  assert.doesNotMatch(nueva.stderr, /a\.tsx:1/);

  // se arregla todo: entradas sin uso → aviso, y con --estricto falla
  writeFileSync(join(raiz, "src/a.tsx"), "export const a = <i className=\"bg-card\" />;\n");
  const aviso = correr(raiz, "--dir", "src", "--baseline", base);
  assert.equal(aviso.status, 0);
  assert.match(aviso.stdout, /ya no hacen falta/);
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base, "--estricto").status, 1);
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base, "--podar").status, 0);
  assert.deepEqual(JSON.parse(readFileSync(join(raiz, base), "utf8")).violaciones, {});
  assert.equal(correr(raiz, "--dir", "src", "--baseline", base, "--estricto").status, 0);
});

test("CLI: --podar nunca añade violaciones nuevas a la baseline", () => {
  const raiz = app({ "src/a.tsx": '<i className="bg-white" />\n' });
  writeFileSync(join(raiz, "b.json"), JSON.stringify({ version: 1, violaciones: {} }));
  const r = correr(raiz, "--dir", "src", "--baseline", "b.json", "--podar");
  assert.equal(r.status, 1);
  assert.deepEqual(JSON.parse(readFileSync(join(raiz, "b.json"), "utf8")).violaciones, {});
});

test("CLI: errores de uso salen con 2", () => {
  const raiz = app({ "src/a.tsx": "x" });
  assert.equal(correr(raiz, "--nada").status, 2);
  assert.equal(correr(raiz, "--podar").status, 2);
  assert.equal(correr(raiz, "--dir", "no-existe").status, 2);
  assert.equal(correr(raiz, "--monto", "(").status, 2);
});

test("CLI: rápido en una app de ~400 archivos", () => {
  const archivos = {};
  for (let i = 0; i < 400; i++) archivos[`src/f${i}.tsx`] = LIMPIO.repeat(40);
  const raiz = app(archivos);
  const t = Date.now();
  const r = correr(raiz, "--dir", "src");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(Date.now() - t < 5000, `tardó ${Date.now() - t} ms`);
});

test("khipu-ds sin comando lista verificar en la ayuda", () => {
  const salida = execFileSync(process.execPath, [CLI], { encoding: "utf8" });
  assert.match(salida, /verificar/);
});
