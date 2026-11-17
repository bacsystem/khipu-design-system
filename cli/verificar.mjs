// `khipu-ds verificar`: guardas de diseño para apps CONSUMIDORAS (no para este repo, que usa los scripts/verificar-*).
// Reglas (grupos): tipografia · alturas · estilos · iconos. Sin dependencias: solo node:*.
// La lógica de tipografía y alturas replica la de scripts/verificar-tipografia.mjs y verificar-alturas.mjs adaptada a
// un consumidor (los scripts no viajan en el paquete; esta CLI sí). `contraste` verifica los tokens del propio kit y no aplica.
//
// Uso:
//   khipu-ds verificar [tipografia|alturas|estilos|iconos ...] [--dir <ruta>...] [--baseline <json>] [--podar]
//                      [--inicializar] [--estricto] [--monto <regex>] [--ignorar <seg>...] [--incluir <seg>...]
//
// Una línea con `<grupo>-ok` (p. ej. `// estilos-ok`) queda exenta de ese grupo.

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

export const GRUPOS = ["tipografia", "alturas", "estilos", "iconos"];
const EXTENSIONES = /\.(tsx?|jsx?|mjs|cjs)$/;
export const IGNORADOS_POR_DEFECTO = ["node_modules", ".next", ".git", "dist", "build", "coverage", "out", "__tests__", "__mocks__", "mocks", "tests", "test", "e2e", "*.test.*", "*.spec.*", "*.d.ts", "*.stories.*"];

// ---------- reglas ----------

const COLORES = "(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";
const PREFIJOS_COLOR = "(?:bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|placeholder|shadow)";
const PREFIJOS_ARBITRARIOS = [
  "bg", "text", "border(?:-[xytrblse])?", "ring(?:-offset)?", "outline", "fill", "stroke", "from", "via", "to", "divide", "decoration", "accent", "caret", "placeholder",
  "w", "h", "min-w", "min-h", "max-w", "max-h", "size",
  "p[xytrblse]?", "m[xytrblse]?", "gap(?:-[xy])?", "space-[xy]", "inset(?:-[xy])?", "top", "right", "bottom", "left", "start", "end", "translate-[xy]",
  "rounded(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?", "shadow", "z", "duration", "delay",
].join("|");
const ARBITRARIO = new RegExp(`(?<![\\w-])(-?(?:${PREFIJOS_ARBITRARIOS})-\\[([^\\]\\s]+)\\])`, "g");
// Variables que inyecta el propio componente (base-ui/radix): no son un valor de la app.
const VARIABLE_DE_COMPONENTE = /^var\(--(?:anchor|available|positioner|transform-origin|radix|base-ui)/;
const PALETA = new RegExp(`(?<![\\w-])${PREFIJOS_COLOR}-(?:${COLORES}-\\d{2,3}|white|black)(?:/\\d+)?(?![\\w-])`, "g");
const HEX = /(?<![\w&#/.-])#(?:[\da-fA-F]{8}|[\da-fA-F]{6}|[\da-fA-F]{4}|[\da-fA-F]{3})(?![\w-])/g;
const FUNCION_COLOR = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/g;
const Z = /(?<![\w-])-?z-(?:\d+|auto)(?![\w-])/g;
const SOMBRA = /(?<![\w-])shadow(?:-(?:2xs|xl|2xl|inner))?(?![\w-])/g;
const RADIO = /(?<![\w-])rounded(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?(?:-(?:xs|sm|2xl|3xl|4xl))?(?![\w-])/g;
const DURACION = /(?<![\w-])duration-\d+(?![\w-])/g;

const TIPOGRAFIA = [
  { id: "tamano-suelto", patron: /(?<![\w-])text-\[\d+(?:\.\d+)?(?:px|rem|em)\]/g, mensaje: "tamaño suelto: usa la escala con nombre (text-etiqueta … text-metrica)" },
  { id: "tamano-tailwind", patron: /(?<![\w:-])text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl)(?![\w-])/g, mensaje: "tamaño de Tailwind: usa la escala con nombre" },
  { id: "mayusculas", patron: /(?<![\w-])uppercase(?![\w-])/g, mensaje: "mayúsculas: solo con la receta ROTULO / CABECERA_TABLA" },
  { id: "tracking-ancho", patron: /(?<![\w-])tracking-(?:wide|wider|widest|\[0\.\d+em\])(?![\w-])/g, mensaje: "tracking ancho: solo con las recetas del kit" },
];

const RECETAS = /\bcn\(\s*(CAMPO\w*|BOTON_\w+|ACCION_\w+|CONTROL_FILTRO)\s*,([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
const CONTROLES = "Button|Boton|Input|Entrada|SelectTrigger|SelectCampo|Toggle|Buscador";
const ETIQUETA_CONTROL = new RegExp(`<(?:${CONTROLES})\\b(?:[^<>{}]|\\{[^{}]*\\})*?className=(?:"([^"]*)"|\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\})`, "g");
const ALTURA = /(?<![\w-])((?:[a-z-]+:)*(?:h|size)-(?!auto\b|control\b)[^\s"'`,)}]+)/g;

const PAQUETES_ICONOS = /\bfrom\s+["'](lucide-react(?:\/[\w-]+)?|@heroicons\/react[\w/-]*|react-icons[\w/-]*|@radix-ui\/react-icons|@tabler\/icons-react|@mui\/icons-material[\w/-]*)["']/g;

const PROPIEDADES_NO_VISUALES = new Set(["viewTransitionName", "willChange", "pointerEvents", "contain"]);

// ---------- análisis de un archivo ----------

const lineaDe = (texto, indice) => texto.slice(0, indice).split("\n").length;

/** Parte `a: 1, b: fn(x, y), c` en sus claves de primer nivel. */
function clavesDeObjeto(cuerpo) {
  const claves = [];
  let profundidad = 0;
  let comilla = "";
  let inicio = 0;
  const cerrar = (fin) => {
    const trozo = cuerpo.slice(inicio, fin).trim();
    if (!trozo || trozo.startsWith("...")) return;
    const m = trozo.match(/^["']?([\w-]+)["']?\s*(?::|$)/);
    if (m) claves.push(m[1]);
  };
  for (let i = 0; i < cuerpo.length; i++) {
    const c = cuerpo[i];
    if (comilla) {
      if (c === "\\") i++;
      else if (c === comilla) comilla = "";
    } else if (c === '"' || c === "'" || c === "`") comilla = c;
    else if ("([{".includes(c)) profundidad++;
    else if (")]}".includes(c)) profundidad--;
    else if (c === "," && profundidad === 0) {
      cerrar(i);
      inicio = i + 1;
    }
  }
  cerrar(cuerpo.length);
  return claves;
}

/** Posiciones de cada `style={{ … }}` con las claves del objeto. */
function estilosEnLinea(texto) {
  const salida = [];
  const inicio = /style=\{\{/g;
  let m;
  while ((m = inicio.exec(texto))) {
    let profundidad = 2;
    let i = m.index + m[0].length;
    let comilla = "";
    const desde = i;
    for (; i < texto.length && profundidad > 0; i++) {
      const c = texto[i];
      if (comilla) {
        if (c === "\\") i++;
        else if (c === comilla) comilla = "";
      } else if (c === '"' || c === "'" || c === "`") comilla = c;
      else if (c === "{") profundidad++;
      else if (c === "}") profundidad--;
    }
    // `i` queda tras la segunda `}`; el cuerpo del objeto termina antes de la primera.
    const cuerpo = texto.slice(desde, Math.max(desde, i - 2));
    salida.push({ indice: m.index, claves: clavesDeObjeto(cuerpo) });
  }
  return salida;
}

/**
 * Hallazgos de un texto: `{ linea, grupo, regla, mensaje, coincidencia }`.
 * `opciones.grupos` (por defecto todos) y `opciones.monto` (RegExp opcional para `font-mono` en líneas de dinero).
 */
export function analizarTexto(texto, { grupos = GRUPOS, monto = null } = {}) {
  const activos = new Set(grupos);
  const hallazgos = [];
  const lineas = texto.split("\n");
  const exenta = (n, grupo) => lineas[n - 1]?.includes(`${grupo}-ok`);
  const esComentario = (n) => /^\s*(\/\/|\/\*|\*)/.test(lineas[n - 1] ?? "");
  const agregar = (linea, grupo, regla, mensaje, coincidencia) => {
    if (exenta(linea, grupo) || esComentario(linea)) return;
    hallazgos.push({ linea, grupo, regla: `${grupo}/${regla}`, mensaje, coincidencia });
  };

  lineas.forEach((original, i) => {
    const n = i + 1;
    if (activos.has("tipografia")) {
      for (const { id, patron, mensaje } of TIPOGRAFIA) {
        for (const m of original.matchAll(patron)) agregar(n, "tipografia", id, mensaje, m[0]);
      }
    }
    if (activos.has("estilos")) {
      let linea = original;
      for (const m of original.matchAll(ARBITRARIO)) {
        linea = linea.replace(m[1], " ".repeat(m[1].length)); // que el hex de `bg-[#fff]` no cuente dos veces
        if (/^text-\[\d+(?:\.\d+)?(?:px|rem|em)\]$/.test(m[1])) continue; // tamaños de texto: los cubre `tipografia`
        if (VARIABLE_DE_COMPONENTE.test(m[2])) continue;
        agregar(n, "estilos", "valor-arbitrario", "valor arbitrario [...]: usa un token, la escala o una receta del kit", m[1]);
      }
      for (const m of linea.matchAll(HEX)) agregar(n, "estilos", "color-literal", "color hexadecimal: usa los tokens de color del kit", m[0]);
      for (const m of linea.matchAll(FUNCION_COLOR)) agregar(n, "estilos", "color-literal", "color rgb/hsl/oklch literal: usa los tokens de color del kit", m[0]);
      for (const m of linea.matchAll(PALETA)) agregar(n, "estilos", "paleta", "color de la paleta de Tailwind o blanco/negro: usa tokens (bg-card, text-foreground…)", m[0]);
      for (const m of linea.matchAll(Z)) agregar(n, "estilos", "z-index", "z-*: la capa la decide el componente del kit", m[0]);
      for (const m of linea.matchAll(SOMBRA)) agregar(n, "estilos", "sombra", "sombra fuera de la escala (shadow-xs|sm|md|lg|tarjeta|elevada)", m[0]);
      for (const m of linea.matchAll(RADIO)) agregar(n, "estilos", "radio", "radio fuera de la escala (rounded-md|lg|xl|full)", m[0]);
      for (const m of linea.matchAll(DURACION)) agregar(n, "estilos", "duracion", "duration-*: usa los tokens de movimiento del kit", m[0]);
      if (monto && /(?<![\w-])font-mono(?![\w-])/.test(linea) && monto.test(linea)) {
        agregar(n, "estilos", "font-mono-monto", "font-mono en un monto: los montos van en Inter con tabular-nums", "font-mono");
      }
    }
    if (activos.has("iconos")) {
      for (const m of original.matchAll(PAQUETES_ICONOS)) agregar(n, "iconos", "paquete", "librería de iconos distinta de @phosphor-icons/react", m[1]);
    }
  });

  if (activos.has("estilos")) {
    for (const { indice, claves } of estilosEnLinea(texto)) {
      const visuales = claves.filter((k) => !k.startsWith("--") && !PROPIEDADES_NO_VISUALES.has(k));
      if (visuales.length === 0) continue;
      agregar(lineaDe(texto, indice), "estilos", "style-inline", "style={{}} con propiedades visuales: usa clases con tokens", `style={{${[...new Set(visuales)].sort().join(",")}}}`);
    }
  }

  if (activos.has("alturas")) {
    const mensaje = "altura/size sobre un control: todos miden h-control (34 px), sin sobrescribir";
    for (const m of texto.matchAll(RECETAS)) {
      for (const h of m[2].matchAll(ALTURA)) agregar(lineaDe(texto, m.index), "alturas", "receta", mensaje, h[1]);
    }
    for (const m of texto.matchAll(ETIQUETA_CONTROL)) {
      for (const h of (m[1] ?? m[2] ?? "").matchAll(ALTURA)) agregar(lineaDe(texto, m.index), "alturas", "componente", mensaje, h[1]);
    }
  }
  return hallazgos.sort((a, b) => a.linea - b.linea);
}

// ---------- archivos ----------

function coincideIgnorado(segmento, patron) {
  if (!patron.includes("*")) return segmento === patron;
  const re = new RegExp(`^${patron.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*")}$`);
  return re.test(segmento);
}

export function listarArchivos(dir, ignorados, raiz = dir) {
  const salida = [];
  const recorrer = (actual) => {
    for (const entrada of readdirSync(actual, { withFileTypes: true })) {
      if (ignorados.some((p) => coincideIgnorado(entrada.name, p))) continue;
      const ruta = join(actual, entrada.name);
      if (entrada.isDirectory()) recorrer(ruta);
      else if (EXTENSIONES.test(entrada.name)) salida.push(ruta);
    }
  };
  recorrer(raiz);
  return salida;
}

// ---------- baseline ----------

/** Agrupa hallazgos en { archivo: { regla: { coincidencia: [líneas] } } }. */
export function agrupar(hallazgosPorArchivo) {
  const mapa = {};
  for (const [archivo, hallazgos] of Object.entries(hallazgosPorArchivo)) {
    for (const h of hallazgos) {
      (((mapa[archivo] ??= {})[h.regla] ??= {})[h.coincidencia] ??= []).push(h);
    }
  }
  return mapa;
}

/**
 * Compara lo encontrado con la baseline (`{ archivo: { regla: { coincidencia: cantidad } } }`).
 * `nuevos`: hallazgos por encima de lo permitido (los últimos n−b de cada clave). `sobrantes`: entradas de baseline que ya no se alcanzan.
 * `podada`: la baseline reducida a lo que sigue existiendo (nunca crece).
 */
export function comparar(encontrado, baseline) {
  const nuevos = [];
  const sobrantes = [];
  const podada = {};
  const claves = new Set([...Object.keys(encontrado), ...Object.keys(baseline)]);
  for (const archivo of claves) {
    const reglas = new Set([...Object.keys(encontrado[archivo] ?? {}), ...Object.keys(baseline[archivo] ?? {})]);
    for (const regla of reglas) {
      const matches = new Set([...Object.keys(encontrado[archivo]?.[regla] ?? {}), ...Object.keys(baseline[archivo]?.[regla] ?? {})]);
      for (const coincidencia of matches) {
        const lista = encontrado[archivo]?.[regla]?.[coincidencia] ?? [];
        const permitido = baseline[archivo]?.[regla]?.[coincidencia] ?? 0;
        if (lista.length > permitido) nuevos.push(...lista.slice(permitido).map((h) => ({ ...h, archivo })));
        if (permitido > lista.length) sobrantes.push({ archivo, regla, coincidencia, sobran: permitido - lista.length });
        const conservado = Math.min(permitido, lista.length);
        if (conservado > 0) (((podada[archivo] ??= {})[regla] ??= {})[coincidencia] = conservado);
      }
    }
  }
  nuevos.sort((a, b) => a.archivo.localeCompare(b.archivo) || a.linea - b.linea);
  return { nuevos, sobrantes, podada };
}

const aConteos = (agrupado) =>
  Object.fromEntries(Object.entries(agrupado).map(([a, rs]) => [a, Object.fromEntries(Object.entries(rs).map(([r, ms]) => [r, Object.fromEntries(Object.entries(ms).map(([m, l]) => [m, l.length]))]))]));

function ordenado(obj) {
  if (Array.isArray(obj) || obj === null || typeof obj !== "object") return obj;
  return Object.fromEntries(Object.keys(obj).sort().map((k) => [k, ordenado(obj[k])]));
}
const serializar = (violaciones) => `${JSON.stringify({ version: 1, violaciones: ordenado(violaciones) }, null, 2)}\n`;

export function leerBaseline(ruta) {
  const datos = JSON.parse(readFileSync(ruta, "utf8"));
  if (datos?.version !== 1 || typeof datos.violaciones !== "object") throw new Error(`${ruta}: formato de baseline desconocido (se espera { "version": 1, "violaciones": {…} })`);
  return datos.violaciones;
}

// ---------- CLI ----------

export function parsearArgumentos(argv) {
  const opciones = { grupos: [], dirs: [], ignorar: [], incluir: [], baseline: null, podar: false, inicializar: false, estricto: false, monto: null };
  const conValor = new Set(["--baseline", "--base", "--monto"]);
  const conLista = { "--dir": "dirs", "--ignorar": "ignorar", "--incluir": "incluir" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (conValor.has(a)) {
      const valor = argv[++i];
      if (!valor || valor.startsWith("--")) throw new Error(`${a} necesita un valor`);
      if (a === "--monto") opciones.monto = valor;
      else opciones.baseline = valor;
    } else if (conLista[a]) {
      const destino = opciones[conLista[a]];
      const antes = destino.length;
      while (argv[i + 1] && !argv[i + 1].startsWith("--") && !GRUPOS.includes(argv[i + 1])) destino.push(...argv[++i].split(",").filter(Boolean));
      if (destino.length === antes) throw new Error(`${a} necesita al menos un valor`);
    } else if (a === "--podar") opciones.podar = true;
    else if (a === "--inicializar") opciones.inicializar = true;
    else if (a === "--estricto") opciones.estricto = true;
    else if (GRUPOS.includes(a)) opciones.grupos.push(a);
    else throw new Error(`Argumento desconocido: ${a}`);
  }
  if (opciones.grupos.length === 0) opciones.grupos = GRUPOS.filter((g) => g !== "iconos");
  if (opciones.podar && opciones.inicializar) throw new Error("--podar e --inicializar son excluyentes");
  if ((opciones.podar || opciones.inicializar || opciones.estricto) && !opciones.baseline) throw new Error("--podar, --inicializar y --estricto necesitan --baseline <archivo>");
  return opciones;
}

export function ayudaVerificar() {
  return (
    "  khipu-ds verificar [tipografia|alturas|estilos|iconos ...] [opciones]   Guardas de diseño para tu app\n" +
    "      --dir <ruta...>        carpetas a revisar (por defecto src, o . si no existe)\n" +
    "      --baseline <json>      deuda permitida por archivo+regla+coincidencia; solo puede bajar\n" +
    "      --podar                reescribe la baseline sin lo que ya se arregló\n" +
    "      --inicializar          crea la baseline con lo que hay hoy (solo si no existe)\n" +
    "      --estricto             falla también con entradas de baseline que ya no hacen falta\n" +
    "      --monto <regex>        marca font-mono en líneas que casen (p. ej. 'formatCurrency\\(|S/')\n" +
    "      --ignorar <seg...>     ignora además carpetas/archivos por nombre (admite *)\n" +
    "      --incluir <seg...>     revisa algo que se ignora por defecto (p. ej. mocks)\n" +
    "      sin grupos: tipografia, alturas y estilos (iconos es opt-in)\n"
  );
}

/** Ejecuta la verificación; devuelve el código de salida. `cwd` es la raíz del consumidor. */
export function ejecutarVerificar(argv, { cwd = process.cwd(), salida = console.log, error = console.error } = {}) {
  let o;
  try {
    o = parsearArgumentos(argv);
  } catch (e) {
    error(`khipu-ds verificar: ${e.message}\n\n${ayudaVerificar()}`);
    return 2;
  }
  const dirs = (o.dirs.length ? o.dirs : [existsSync(join(cwd, "src")) ? "src" : "."]).map((d) => resolve(cwd, d));
  for (const d of dirs) {
    if (!existsSync(d) || !statSync(d).isDirectory()) {
      error(`khipu-ds verificar: no existe la carpeta ${d}`);
      return 2;
    }
  }
  let monto = null;
  if (o.monto) {
    try {
      monto = new RegExp(o.monto);
    } catch {
      error(`khipu-ds verificar: --monto no es una expresión regular válida: ${o.monto}`);
      return 2;
    }
  }
  const ignorados = [...IGNORADOS_POR_DEFECTO.filter((p) => !o.incluir.includes(p)), ...o.ignorar];
  const rutaBaseline = o.baseline ? resolve(cwd, o.baseline) : null;
  let baseline = {};
  if (rutaBaseline) {
    if (existsSync(rutaBaseline)) {
      if (o.inicializar) {
        error(`khipu-ds verificar: ${o.baseline} ya existe; la baseline solo puede bajar (usa --podar).`);
        return 2;
      }
      try {
        baseline = leerBaseline(rutaBaseline);
      } catch (e) {
        error(`khipu-ds verificar: ${e.message}`);
        return 2;
      }
    } else if (!o.inicializar) {
      error(`khipu-ds verificar: no existe la baseline ${o.baseline}. Créala con --inicializar.`);
      return 2;
    }
  }

  const porArchivo = {};
  const vistos = new Set();
  let archivos = 0;
  for (const dir of dirs) {
    for (const ruta of listarArchivos(dir, ignorados)) {
      if (vistos.has(ruta)) continue;
      vistos.add(ruta);
      archivos++;
      const hallazgos = analizarTexto(readFileSync(ruta, "utf8"), { grupos: o.grupos, monto });
      if (hallazgos.length) porArchivo[relative(cwd, ruta).split(sep).join("/")] = hallazgos;
    }
  }
  const encontrado = agrupar(porArchivo);

  if (o.inicializar) {
    writeFileSync(rutaBaseline, serializar(aConteos(encontrado)));
    const total = Object.values(porArchivo).reduce((s, l) => s + l.length, 0);
    salida(`Baseline creada: ${o.baseline} (${total} violaciones en ${Object.keys(porArchivo).length} archivos).`);
    return 0;
  }

  const { nuevos, sobrantes, podada } = comparar(encontrado, baseline);
  const porRegla = {};
  for (const hs of Object.values(porArchivo)) for (const h of hs) porRegla[h.regla] = (porRegla[h.regla] ?? 0) + 1;
  const total = Object.values(porRegla).reduce((s, n) => s + n, 0);

  if (o.podar) {
    writeFileSync(rutaBaseline, serializar(podada));
    const quitadas = sobrantes.reduce((s, x) => s + x.sobran, 0);
    salida(`Baseline podada: ${o.baseline} (−${quitadas} entradas).`);
  }

  let codigo = 0;
  if (nuevos.length) {
    error(`Violaciones nuevas (${nuevos.length}), fuera de la baseline:\n${nuevos.map((h) => `${h.archivo}:${h.linea}  [${h.regla}] ${h.coincidencia}  ${h.mensaje}`).join("\n")}`);
    codigo = 1;
  }
  if (sobrantes.length && !o.podar) {
    const detalle = sobrantes.map((s) => `${s.archivo}  [${s.regla}] ${s.coincidencia}  (−${s.sobran})`).join("\n");
    if (o.estricto) {
      error(`Entradas de baseline sin uso (${sobrantes.length}); ejecuta con --podar:\n${detalle}`);
      codigo = 1;
    } else {
      salida(`Aviso: ${sobrantes.length} entradas de baseline ya no hacen falta (--podar las quita).`);
    }
  }
  const resumen = Object.entries(porRegla).sort(([a], [b]) => a.localeCompare(b)).map(([r, n]) => `${r}: ${n}`).join(" · ");
  salida(`Verificadas ${archivos} archivos (${o.grupos.join(", ")}): ${total} violaciones, ${nuevos.length} nuevas.${resumen ? `\n  ${resumen}` : ""}`);
  return codigo;
}
