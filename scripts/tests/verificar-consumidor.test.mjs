import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { analizarTexto, comparar, agrupar } from "../../cli/verificar.mjs";
import { revisarRecetas } from "../verificar-alturas.mjs";
import { revisarTexto } from "../verificar-tipografia.mjs";

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
const libres = (texto, opciones) => analizarTexto(texto, opciones).filter((h) => !h.exenta).map((h) => h.regla);

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
  assert.deepEqual(libres('"text-sm" // tipografia-ok'), []);
  assert.deepEqual(libres('"bg-white" // estilos-ok'), []);
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
  assert.match(r.stdout, /Verificados 1 archivos/);
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

// ---------- revisión de la PR (H1–H11) ----------

const leerJson = (raiz, ruta) => JSON.parse(readFileSync(join(raiz, ruta), "utf8"));

test("H1: las exenciones solo valen como comentario, se cuentan y la baseline no las deja crecer", () => {
  assert.deepEqual(libres('<i className="bg-white estilos-ok" />'), ["estilos/paleta"]); // en un string no vale
  assert.deepEqual(libres('<i className="bg-white z-10" /> {/* estilos-ok */}'), []);
  assert.deepEqual(libres('<i className="bg-white z-10" /> // estilos-ok: paleta'), ["estilos/z-index"]); // por regla
  assert.deepEqual(libres('<i className="bg-white z-10" /> // estilos-ok: estilos/paleta, z-index'), []);
  assert.deepEqual(libres('<i className="bg-white" /> // tipografia-ok'), ["estilos/paleta"]); // otro grupo no exime
  assert.equal(analizarTexto('<i className="bg-white" /> // estilos-ok')[0].exenta, true);

  const raiz = app({ "src/a.tsx": 'export const a = <i className="bg-white" />; // estilos-ok\n' });
  const vacia = join(raiz, "b.json");
  writeFileSync(vacia, JSON.stringify({ version: 1, violaciones: {} }));
  const r = correr(raiz, "--dir", "src", "--baseline", "b.json");
  assert.equal(r.status, 1); // con baseline vacía, la exención nueva falla
  assert.match(r.stderr, /exenta/);
  assert.equal(correr(raiz, "--dir", "src", "--baseline", "b.json", "--inicializar").status, 2);
  writeFileSync(vacia, JSON.stringify({ version: 1, violaciones: { "src/a.tsx": { "estilos/paleta (exenta)": { "bg-white": 1 } } } }));
  const ok = correr(raiz, "--dir", "src", "--baseline", "b.json");
  assert.equal(ok.status, 0, ok.stderr);
  assert.match(ok.stdout, /1 con exención/);
  // sin baseline no hay dónde registrarla: se informa pero no falla
  const sin = correr(raiz, "--dir", "src");
  assert.equal(sin.status, 0);
  assert.match(sin.stdout, /1 con exención/);
});

test("H2: --podar y --estricto solo miran los grupos, reglas y carpetas de la corrida", () => {
  const raiz = app({ "src/a/x.tsx": 'export const a = <i className="bg-white text-sm" />;\n', "src/b/y.tsx": 'export const b = <i className="bg-white text-sm" />;\n' });
  const base = (extra = {}) => ({
    version: 1,
    violaciones: {
      "src/a/x.tsx": { "estilos/paleta": { "bg-white": 1 }, "tipografia/tamano-tailwind": { "text-sm": 1 }, "estilos/font-mono-monto": { "font-mono": 2 } },
      "src/b/y.tsx": { "estilos/paleta": { "bg-white": 1 }, "tipografia/tamano-tailwind": { "text-sm": 1 } },
      ...extra,
    },
  });
  writeFileSync(join(raiz, "b.json"), JSON.stringify(base()));
  // otros grupos y font-mono-monto (sin --monto) no son «sobrantes»
  assert.equal(correr(raiz, "tipografia", "--dir", "src", "--baseline", "b.json", "--estricto").status, 0);
  assert.equal(correr(raiz, "--dir", "src", "--baseline", "b.json", "--estricto").status, 0);
  // otra carpeta tampoco
  assert.equal(correr(raiz, "--dir", "src/a", "--baseline", "b.json", "--estricto").status, 0);
  // podar con alcance parcial conserva lo demás
  const antes = readFileSync(join(raiz, "b.json"), "utf8");
  assert.equal(correr(raiz, "tipografia", "--dir", "src/a", "--baseline", "b.json", "--podar").status, 0);
  assert.deepEqual(leerJson(raiz, "b.json"), JSON.parse(antes));
  // y sí quita lo que ya no está dentro del alcance visto: arreglo text-sm en a/x.tsx
  writeFileSync(join(raiz, "src/a/x.tsx"), 'export const a = <i className="bg-white" />;\n');
  assert.equal(correr(raiz, "tipografia", "--dir", "src/a", "--baseline", "b.json", "--podar").status, 0);
  const podada = leerJson(raiz, "b.json").violaciones;
  assert.equal(podada["src/a/x.tsx"]["tipografia/tamano-tailwind"], undefined);
  assert.deepEqual(podada["src/a/x.tsx"]["estilos/paleta"], { "bg-white": 1 });
  assert.deepEqual(podada["src/a/x.tsx"]["estilos/font-mono-monto"], { "font-mono": 2 });
  assert.deepEqual(podada["src/b/y.tsx"]["tipografia/tamano-tailwind"], { "text-sm": 1 });
  // un archivo borrado dentro de --dir sí cuenta como arreglado
  writeFileSync(join(raiz, "b.json"), JSON.stringify(base({ "src/a/borrado.tsx": { "estilos/paleta": { "bg-white": 1 } } })));
  assert.equal(correr(raiz, "estilos", "--dir", "src/a", "--baseline", "b.json", "--estricto").status, 1);
  // con --monto la regla font-mono-monto vuelve a estar activa
  writeFileSync(join(raiz, "b.json"), JSON.stringify(base()));
  assert.equal(correr(raiz, "estilos", "--dir", "src/a", "--baseline", "b.json", "--monto", "x", "--estricto").status, 1);
});

test("H3: la CLI y los scripts del kit usan las mismas reglas", () => {
  const fixture = [
    'a "text-[11px] uppercase tracking-wider"',
    'b "text-3xl md:text-lg hover:text-sm"',
    'c "text-control tracking-tight" x.toUpperCase()',
    'd "text-4xl"',
  ].join("\n");
  const kit = new Set(revisarTexto(fixture).map((h) => `${h.linea}|${h.mensaje}`));
  const cli = new Set(analizarTexto(fixture, { grupos: ["tipografia"] }).map((h) => `${h.linea}|${h.mensaje}`));
  assert.deepEqual([...cli].sort(), [...kit].sort());
  assert.ok(kit.size >= 5);
  const recetas = ['x(cn(CAMPO, "h-9"))', 'y(cn(BOTON_PRIMARIO, "size-14 rounded"))', 'z(cn(CAMPO, "h-auto h-control h-(--alto)"))', 'w(cn(ACCION_X, "[&_svg]:size-4"))'].join("\n");
  const kitAlturas = revisarRecetas(recetas).map((h) => h.linea);
  const cliAlturas = [...new Set(analizarTexto(recetas, { grupos: ["alturas"] }).filter((h) => h.regla === "alturas/receta").map((h) => h.linea))];
  assert.deepEqual(cliAlturas, kitAlturas);
  assert.deepEqual(kitAlturas, [1, 2, 3]);
});

test("H4: la sintaxis v4 prefijo-(--var) se trata como prefijo-[var(--var)]", () => {
  const r = analizarTexto('<i style={{ "--w": "340px", "--z": 60 }} className="w-(--w) z-(--z) bg-(--mi-color)" />').map((h) => h.regla);
  assert.equal(r.filter((x) => x === "estilos/valor-arbitrario").length, 3);
  assert.deepEqual(reglas('<i className="w-(--anchor-width) h-(length:--available-height)" />'), []);
  assert.deepEqual(reglas('<i className="w-[var(--w)]" />'), ["estilos/valor-arbitrario"]);
});

test("H6: la baseline cuenta por coincidencia y las reglas discriminan", () => {
  const raiz = app({ "src/a.tsx": 'export const a = <i className="text-sm" />;\n' });
  assert.equal(correr(raiz, "--dir", "src", "--baseline", "b.json", "--inicializar").status, 0);
  writeFileSync(join(raiz, "src/a.tsx"), 'export const a = <i className="text-base" />;\n'); // misma cantidad, otra coincidencia
  const r = correr(raiz, "--dir", "src", "--baseline", "b.json");
  assert.equal(r.status, 1);
  assert.match(r.stderr, /text-base/);
  assert.deepEqual(reglas('<a href="#add">Pedido #123</a>'), []);
  assert.deepEqual(reglas('<i className="text-3xl" />'), ["tipografia/tamano-tailwind"]);
  assert.deepEqual(libres('<i className="bg-white text-sm" /> // tipografia-ok'), ["estilos/paleta"]);
});

test("H7: menos falsos positivos", () => {
  assert.deepEqual(reglas("<p>Pedido #123</p>"), []);
  assert.deepEqual(reglas('<a href="#add">x</a><b id="#abcdef" />'), []);
  assert.deepEqual(reglas('<i className="[&_[stroke=\'#ccc\']]:stroke-border [&_[stroke=\'#cccccc\']]:x" />'), []);
  assert.deepEqual(reglas('<Card shadow /> const shadow = 1; const rounded = 2;'), []);
  assert.deepEqual(reglas('<Button className="[&_svg]:size-4 md:[&_svg]:size-5">x</Button>', { grupos: ["alturas"] }), []);
  assert.deepEqual(reglas("{/* text-sm bg-white */}\n{/* otra\n z-10 */}"), []);
  assert.deepEqual(reglas('<i className="rounded shadow" />'), ["estilos/sombra", "estilos/radio"]);
  assert.deepEqual(reglas('<Bar fill="#0f6" color={"#ab12"} />'), ["estilos/color-literal", "estilos/color-literal"]);
});

test("H7: menos falsos negativos", () => {
  assert.deepEqual(reglas('"md:text-lg hover:text-sm"', { grupos: ["tipografia"] }), ["tipografia/tamano-tailwind", "tipografia/tamano-tailwind"]);
  for (const clase of ["leading-[1.7]", "grid-cols-[1fr_2fr]", "font-[500]", "opacity-[.35]", "scale-[1.02]", "[animation-duration:1.6s]"]) {
    assert.deepEqual(reglas(`<i className="${clase}" />`), ["estilos/valor-arbitrario"], clase);
  }
  assert.deepEqual(reglas('<i className="[&_svg]:size-4 [--x:1] data-[state=open]:flex" />'), []);
  assert.deepEqual(reglas("const k: Record<string, number> = {}; arr[a:b]"), []);
  assert.deepEqual(reglas("<i style={estilos} /> <j style={style} /> <k style={props.style} />"), ["estilos/style-inline"]);
});

test("H8: font-mono-monto por elemento, una por aparición", () => {
  const monto = /formatCurrency\(/;
  const dos = '<p><span className="font-mono">{r.sku}</span> <b>{formatCurrency(x)}</b></p>';
  assert.deepEqual(reglas(dos, { monto }), []); // el monto está en otro elemento
  assert.deepEqual(reglas('<span className="font-mono">{formatCurrency(x)}</span> <i className="font-mono">{formatCurrency(y)}</i>', { monto }), ["estilos/font-mono-monto", "estilos/font-mono-monto"]);
  const multi = analizarTexto('<span\n  className="font-mono"\n>\n  {formatCurrency(x)}\n</span>', { monto });
  assert.equal(multi.length, 1);
  assert.equal(multi[0].linea, 2);
  assert.deepEqual(reglas('<Input className="font-mono" value={formatCurrency(x)} />', { monto }), ["estilos/font-mono-monto"]);
  assert.deepEqual(reglas('<StatCard value={formatCurrency(x)} />', { monto }), []); // límite documentado: monto pasado por prop
});

test("H9: las rutas de la baseline son relativas a su archivo; --mover renombra", () => {
  const raiz = app({ "apps/web/src/a.tsx": 'export const a = <i className="bg-white" />;\n' });
  assert.equal(correr(join(raiz, "apps/web"), "--dir", "src", "--baseline", "ds.json", "--inicializar").status, 0);
  assert.deepEqual(Object.keys(leerJson(raiz, "apps/web/ds.json").violaciones), ["src/a.tsx"]);
  const desdeRaiz = correr(raiz, "--dir", "apps/web/src", "--baseline", "apps/web/ds.json");
  assert.equal(desdeRaiz.status, 0, desdeRaiz.stderr);
  // renombrar el archivo: --mover (rutas desde donde se corre)
  writeFileSync(join(raiz, "apps/web/src/b.tsx"), readFileSync(join(raiz, "apps/web/src/a.tsx")));
  rmSync(join(raiz, "apps/web/src/a.tsx"));
  assert.equal(correr(raiz, "--dir", "apps/web/src", "--baseline", "apps/web/ds.json").status, 1);
  assert.equal(correr(raiz, "--baseline", "apps/web/ds.json", "--mover", "apps/web/src/a.tsx", "apps/web/src/b.tsx").status, 0);
  assert.equal(correr(raiz, "--dir", "apps/web/src", "--baseline", "apps/web/ds.json", "--estricto").status, 0);
  assert.equal(correr(raiz, "--baseline", "apps/web/ds.json", "--mover", "x.tsx", "y.tsx").status, 2);
});

test("H10: robustez y mensajes", () => {
  const raiz = app({ "src/a.tsx": "export const a = 1;\n" });
  for (const malo of ['{"version":1,"violaciones":null}', '{"version":1,"violaciones":[]}', '{"version":1,"violaciones":{"a":{"r":{"m":"x"}}}}', "[]"]) {
    writeFileSync(join(raiz, "b.json"), malo);
    assert.equal(correr(raiz, "--dir", "src", "--baseline", "b.json").status, 2, malo);
  }
  const ayuda = correr(raiz, "--help");
  assert.equal(ayuda.status, 0);
  assert.match(ayuda.stdout, /--base\b/);
  const r = correr(raiz, "--dir", "src");
  assert.match(r.stdout, /Verificados 1 archivos/);
  mkdirSync(join(raiz, "src/a"));
  writeFileSync(join(raiz, "b.json"), JSON.stringify({ version: 1, violaciones: { "src/a.tsx": { "estilos/paleta": { "bg-white": 3 } } } }));
  assert.match(correr(raiz, "--dir", "src", "--baseline", "b.json", "--podar").stdout, /3 violaciones quitadas/);
  assert.equal(correr(raiz, "--dir", "./estilos").status, 2); // una carpeta llamada como un grupo se pasa como ./estilos
});

// ---------- re-revisión (H12–H16) ----------

test("H12: las variables del kit y de base-ui están permitidas; las de la app no", () => {
  assert.deepEqual(reglas('<i className="duration-(--duracion-rapida) h-(--active-tab-height) w-(--spacing-control) shadow-(--sombra-md)" />'), []);
  assert.deepEqual(reglas('<i className="w-[var(--spacing-control)] ease-(--ease-x)" />'), ["estilos/valor-arbitrario"]); // --ease-x no es del kit
  assert.deepEqual(reglas('<i className="w-(--w) bg-(--mi-color) z-(--z)" />'), ["estilos/valor-arbitrario", "estilos/valor-arbitrario", "estilos/valor-arbitrario"]);
  assert.deepEqual(reglas('<i className="w-(--anchor-width) h-(length:--available-height)" />'), []);
});

test("H13: /* y // dentro de un string no son comentarios", () => {
  assert.deepEqual(reglas('<input accept="image/*" /> <i className="bg-white" />\n/** doc */'), ["estilos/paleta"]);
  assert.deepEqual(reglas('const u = "http://x.pe // comentario"; const c = "bg-white";'), ["estilos/paleta"]);
  const archivo = [
    "export const a = (",
    '  <input accept="image/*" className="w-[340px]" />',
    ");",
    'const b = <i className="bg-[#123456] z-50 text-[13px]" />;',
    "/** doc */",
    "// bg-white en un comentario",
    "const t = `a // b ${x}`; const q = <i className=\"shadow-2xl\" />;",
  ].join("\n");
  const r = analizarTexto(archivo).map((h) => `${h.linea}:${h.regla}`);
  assert.deepEqual(r, ["2:estilos/valor-arbitrario", "4:tipografia/tamano-suelto", "4:estilos/valor-arbitrario", "4:estilos/z-index", "7:estilos/sombra"]);
  assert.deepEqual(libres('const s = "x // estilos-ok"; const c = "bg-white";'), ["estilos/paleta"]); // la exención de un string no vale
  assert.deepEqual(libres('<i className="bg-white" /> {/* estilos-ok */}'), []);
});

test("H14: las variantes arbitrarias no son propiedades arbitrarias", () => {
  assert.deepEqual(reglas('<i className="*:[img:first-child]:rounded-t-xl [&_svg]:size-4 [svg:not([class*=\'size-\'])]:hidden" />'), []);
  assert.deepEqual(reglas('<i className="[animation-duration:1.6s]" />'), ["estilos/valor-arbitrario"]);
});

test("H15: font-mono-monto mira la etiqueta entera, antes y después de className", () => {
  const monto = /formatCurrency\(|S\//;
  assert.deepEqual(reglas('<Input value={formatCurrency(x)} className="font-mono" />', { monto }), ["estilos/font-mono-monto"]);
  assert.deepEqual(reglas('<Input placeholder="S/ 0.00" className="font-mono" />', { monto }), ["estilos/font-mono-monto"]);
  assert.deepEqual(reglas('<b>{formatCurrency(x)}</b><span className="font-mono">{r.sku}</span>', { monto }), []);
  assert.deepEqual(reglas('const c = cn("font-mono"); <i>{formatCurrency(x)}</i>', { monto }), []);
});

test("H16: la coincidencia de h-(--alto) conserva el paréntesis", () => {
  assert.equal(analizarTexto('<Button className="h-(--alto)">x</Button>', { grupos: ["alturas"] })[0].coincidencia, "h-(--alto)");
  assert.equal(analizarTexto('cn(CAMPO, "h-(--alto) md:size-(length:--x)")', { grupos: ["alturas"] }).length, 2);
});

test("--mover acepta carpetas (renombra el prefijo)", () => {
  const raiz = app({ "src/viejo/a.tsx": '<i className="bg-white" />\n', "src/viejo/sub/b.tsx": '<i className="z-10" />\n', "src/viejo2/c.tsx": "x" });
  assert.equal(correr(raiz, "--dir", "src", "--baseline", "b.json", "--inicializar").status, 0);
  renameSync(join(raiz, "src/viejo"), join(raiz, "src/nuevo"));
  assert.equal(correr(raiz, "--dir", "src", "--baseline", "b.json").status, 1);
  const r = correr(raiz, "--baseline", "b.json", "--mover", "src/viejo", "src/nuevo");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(Object.keys(leerJson(raiz, "b.json").violaciones), ["src/nuevo/a.tsx", "src/nuevo/sub/b.tsx"]);
  assert.equal(correr(raiz, "--dir", "src", "--baseline", "b.json", "--estricto").status, 0);
});
