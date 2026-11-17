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
import { dirname, join, relative, resolve, sep } from "node:path";
import { ALTURA as ALTURA_COMPARTIDA, RECETAS, TIPOGRAFIA as TIPOGRAFIA_COMPARTIDA } from "./reglas.mjs";

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
  "rounded(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?", "shadow", "z", "duration", "delay", "ease",
  "leading", "tracking", "grid-cols", "grid-rows", "col-span", "row-span", "basis", "aspect", "font", "opacity", "scale", "rotate", "blur", "backdrop-blur", "transition", "animate",
].join("|");
// `prefijo-[valor]` y la sintaxis de Tailwind v4 `prefijo-(--var)` / `prefijo-(tipo:--var)`, que es lo mismo que `prefijo-[var(--var)]`.
const ARBITRARIO = new RegExp(`(?<![\\w-])(-?(?:${PREFIJOS_ARBITRARIOS})-(?:\\[([^\\]\\s]+)\\]|\\(((?:[\\w-]+:)?--[\\w-]+)\\)))`, "g");
// Propiedad arbitraria `[animation-duration:1.6s]` (no los selectores `[&_svg]` ni `[stroke='#ccc']`, ni las variables `[--x:1]`).
const PROPIEDAD_ARBITRARIA = /(?<![\w-])(\[(?!--)[a-z][a-z-]*:[^\]\s]+\])/g;
// Variables que inyecta el propio componente (base-ui/radix): no son un valor de la app.
const VARIABLE_DE_COMPONENTE = /^var\(--(?:anchor|available|positioner|transform-origin|radix|base-ui)/;
const PALETA = new RegExp(`(?<![\\w-])${PREFIJOS_COLOR}-(?:${COLORES}-\\d{2,3}|white|black)(?:/\\d+)?(?![\\w-])`, "g");
// Hex de 6/8 dígitos en cualquier parte; de 3/4 solo como valor de una prop/propiedad de color (así `Pedido #123` o `href="#add"` no cuentan).
const HEX_LARGO = /(?<![\w&#/.[-])#(?:[\da-fA-F]{8}|[\da-fA-F]{6})(?![\w-])/g;
const HEX_CORTO = /(?<![[\w.-])(?:fill|stroke|color|stopColor|floodColor|lightingColor|background\w*|border\w*|outline\w*|bg)\s*[=:]\s*\{?["'`](#(?:[\da-fA-F]{4}|[\da-fA-F]{3}))(?![\w-])/g;
const ENLACE_O_SELECTOR = /(?:\b(?:href|id|to|htmlFor|from|src)\s*=\s*\{?["'`]|\[[\w-]+=["']?)$/;
const FUNCION_COLOR = /(?<![\w-])(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/g;
const Z = /(?<![\w-])-?z-(?:\d+|auto)(?![\w-])/g;
const SOMBRA = /(?<![\w-])shadow(?:-(?:2xs|xl|2xl|inner))?(?![\w-])/g;
const RADIO = /(?<![\w-])rounded(?:-(?:t|r|b|l|s|e|tl|tr|bl|br|ss|se|es|ee))?(?:-(?:xs|sm|2xl|3xl|4xl))?(?![\w-])/g;
const DURACION = /(?<![\w-])duration-\d+(?![\w-])/g;
const STYLE_VARIABLE = /style=\{([A-Za-z_$][\w$.]*)\}/g;

const TIPOGRAFIA = TIPOGRAFIA_COMPARTIDA.map((r) => ({ ...r, patron: new RegExp(r.patron.source, "g") }));
const ALTURA = new RegExp(ALTURA_COMPARTIDA.source, "g");
const CONTROLES = "Button|Boton|Input|Entrada|SelectTrigger|SelectCampo|Toggle|Buscador";
const ETIQUETA_CONTROL = new RegExp(`<(?:${CONTROLES})\\b(?:[^<>{}]|\\{[^{}]*\\})*?className=(?:"([^"]*)"|\\{([^{}]*(?:\\{[^{}]*\\}[^{}]*)*)\\})`, "g");
const PAQUETES_ICONOS = /\bfrom\s+["'](lucide-react(?:\/[\w-]+)?|@heroicons\/react[\w/-]*|react-icons[\w/-]*|@radix-ui\/react-icons|@tabler\/icons-react|@mui\/icons-material[\w/-]*)["']/g;
const PROPIEDADES_NO_VISUALES = new Set(["viewTransitionName", "willChange", "pointerEvents", "contain"]);

/** ¿La regla corre con estas opciones? `font-mono-monto` solo existe con `--monto`. */
export function reglaActiva(regla, { grupos = GRUPOS, monto = null } = {}) {
  const base = regla.replace(/ \(exenta\)$/, "");
  return grupos.includes(base.split("/")[0]) && (base !== "estilos/font-mono-monto" || Boolean(monto));
}

// ---------- análisis de un archivo ----------

const lineaDe = (texto, indice) => texto.slice(0, indice).split("\n").length;

/** Texto sin comentarios (de línea y de bloque, también los JSX), con la misma longitud y saltos de línea para que índices y líneas no cambien. */
export function sinComentarios(texto) {
  const blanquear = (m) => m.replace(/[^\n]/g, " ");
  return texto.replace(/\/\*[\s\S]*?\*\//g, blanquear).replace(/(^|[\s;,{}()])\/\/[^\n]*/g, (m, previo) => previo + blanquear(m.slice(previo.length)));
}

// Exenciones por línea, solo en forma de comentario: `// estilos-ok`, un comentario JSX de bloque con estilos-ok, o `// estilos-ok: paleta, z-index`.
export function leerExenciones(texto) {
  const porLinea = new Map();
  const patron = /(?:\/\/|\/\*)\s*(tipografia|alturas|estilos|iconos)-ok\b(?:\s*:\s*([\w/-]+(?:\s*,\s*[\w/-]+)*))?/g;
  texto.split("\n").forEach((linea, i) => {
    for (const m of linea.matchAll(patron)) {
      const reglas = m[2] ? m[2].split(",").map((r) => r.trim()).map((r) => (r.includes("/") ? r : `${m[1]}/${r}`)) : null;
      (porLinea.get(i + 1) ?? porLinea.set(i + 1, []).get(i + 1)).push({ grupo: m[1], reglas });
    }
  });
  return porLinea;
}

/** ¿`indice` cae dentro de un string de la línea? (cuenta comillas sin escapar). */
function dentroDeString(linea, indice) {
  for (const q of ['"', "'", "`"]) {
    let n = 0;
    for (let i = 0; i < indice; i++) {
      if (linea[i] === "\\") i++;
      else if (linea[i] === q) n++;
    }
    if (n % 2 === 1) return true;
  }
  return false;
}

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
    salida.push({ indice: m.index, claves: clavesDeObjeto(texto.slice(desde, Math.max(desde, i - 2))) });
  }
  return salida;
}

/** Trozo de código que pertenece al elemento cuyo `className` contiene `font-mono`: resto de la etiqueta de apertura y su contenido hasta el siguiente `<`. */
function segmentoDelElemento(texto, desde) {
  const resto = texto.slice(desde, desde + 600);
  const cierre = resto.search(/(?<!=)>/);
  if (cierre === -1) return resto.split("\n")[0];
  const siguiente = resto.indexOf("<", cierre);
  return resto.slice(0, siguiente === -1 ? undefined : siguiente);
}

/**
 * Hallazgos de un texto: `{ linea, grupo, regla, mensaje, coincidencia, exenta }`.
 * Una línea con comentario `<grupo>-ok` (o `<grupo>-ok: regla, …`) marca el hallazgo como `exenta`: no desaparece, se cuenta aparte.
 * `opciones.grupos` (por defecto todos) y `opciones.monto` (RegExp opcional para `font-mono` junto a un monto).
 */
export function analizarTexto(original, { grupos = GRUPOS, monto = null } = {}) {
  const activos = new Set(grupos);
  const exenciones = leerExenciones(original);
  const texto = sinComentarios(original);
  const lineas = texto.split("\n");
  const hallazgos = [];
  const agregar = (linea, grupo, regla, mensaje, coincidencia) => {
    const id = `${grupo}/${regla}`;
    const exenta = (exenciones.get(linea) ?? []).some((e) => e.grupo === grupo && (e.reglas === null || e.reglas.includes(id)));
    hallazgos.push({ linea, grupo, regla: id, mensaje, coincidencia, exenta });
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
      const tokens = [...original.matchAll(ARBITRARIO)].map((m) => ({ token: m[1], valor: m[2] ?? `var(${m[3].replace(/^[\w-]+:/, "")})` }));
      for (const m of original.matchAll(PROPIEDAD_ARBITRARIA)) if (dentroDeString(original, m.index)) tokens.push({ token: m[1], valor: m[1] });
      for (const { token, valor } of tokens) {
        linea = linea.replace(token, " ".repeat(token.length)); // que el hex de `bg-[#fff]` no cuente dos veces
        if (/^text-\[\d+(?:\.\d+)?(?:px|rem|em)\]$/.test(token)) continue; // tamaños de texto: los cubre `tipografia`
        if (/^tracking-\[0\.\d+em\]$/.test(token)) continue; // ídem
        if (VARIABLE_DE_COMPONENTE.test(valor)) continue;
        agregar(n, "estilos", "valor-arbitrario", "valor arbitrario [...]: usa un token, la escala o una receta del kit", token);
      }
      for (const m of linea.matchAll(HEX_LARGO)) {
        if (!ENLACE_O_SELECTOR.test(linea.slice(0, m.index))) agregar(n, "estilos", "color-literal", "color hexadecimal: usa los tokens de color del kit", m[0]);
      }
      for (const m of linea.matchAll(HEX_CORTO)) agregar(n, "estilos", "color-literal", "color hexadecimal: usa los tokens de color del kit", m[1]);
      for (const m of linea.matchAll(FUNCION_COLOR)) agregar(n, "estilos", "color-literal", "color rgb/hsl/oklch literal: usa los tokens de color del kit", m[0]);
      for (const m of linea.matchAll(PALETA)) agregar(n, "estilos", "paleta", "color de la paleta de Tailwind o blanco/negro: usa tokens (bg-card, text-foreground…)", m[0]);
      for (const m of linea.matchAll(Z)) agregar(n, "estilos", "z-index", "z-*: la capa la decide el componente del kit", m[0]);
      // `shadow` y `rounded` a secas también son identificadores habituales: solo cuentan dentro de un string.
      for (const m of linea.matchAll(SOMBRA)) if (m[0] !== "shadow" || dentroDeString(linea, m.index)) agregar(n, "estilos", "sombra", "sombra fuera de la escala (shadow-xs|sm|md|lg|tarjeta|elevada)", m[0]);
      for (const m of linea.matchAll(RADIO)) if (m[0] !== "rounded" || dentroDeString(linea, m.index)) agregar(n, "estilos", "radio", "radio fuera de la escala (rounded-md|lg|xl|full)", m[0]);
      for (const m of linea.matchAll(DURACION)) agregar(n, "estilos", "duracion", "duration-*: usa los tokens de movimiento del kit", m[0]);
      for (const m of linea.matchAll(STYLE_VARIABLE)) {
        if (m[1] !== "style" && !m[1].endsWith(".style")) agregar(n, "estilos", "style-inline", "style={objeto}: los estilos visuales van en clases con tokens", `style={${m[1]}}`);
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
    if (monto) {
      // Cada `font-mono` se evalúa con su propio elemento (su etiqueta y su contenido), no con toda la línea.
      for (const m of texto.matchAll(/(?<![\w-])font-mono(?![\w-])/g)) {
        if (monto.test(segmentoDelElemento(texto, m.index))) agregar(lineaDe(texto, m.index), "estilos", "font-mono-monto", "font-mono en un monto: los montos van en Inter con tabular-nums", "font-mono");
      }
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

export function listarArchivos(raiz, ignorados) {
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

const SUFIJO_EXENTA = " (exenta)";

/** Agrupa hallazgos en { archivo: { regla: { coincidencia: [hallazgos] } } }. Las exenciones van en su propia regla `… (exenta)`. */
export function agrupar(hallazgosPorArchivo) {
  const mapa = {};
  for (const [archivo, hallazgos] of Object.entries(hallazgosPorArchivo)) {
    for (const h of hallazgos) {
      const regla = h.exenta ? `${h.regla}${SUFIJO_EXENTA}` : h.regla;
      (((mapa[archivo] ??= {})[regla] ??= {})[h.coincidencia] ??= []).push(h);
    }
  }
  return mapa;
}

/**
 * Compara lo encontrado con la baseline (`{ archivo: { regla: { coincidencia: cantidad } } }`).
 * `nuevos`: hallazgos por encima de lo permitido (los últimos n−b de cada clave). `sobrantes`: entradas de baseline que ya no se alcanzan.
 * `podada`: la baseline reducida a lo que sigue existiendo (nunca crece).
 * `enAlcance(archivo, regla)`: solo lo que esta corrida pudo ver cuenta como sobrante o se poda; lo demás (otros grupos, otras carpetas) se conserva intacto.
 */
export function comparar(encontrado, baseline, enAlcance = () => true) {
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
        const visible = enAlcance(archivo, regla);
        if (visible && permitido > lista.length) sobrantes.push({ archivo, regla, coincidencia, sobran: permitido - lista.length });
        const conservado = visible ? Math.min(permitido, lista.length) : permitido;
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

const esObjeto = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

export function leerBaseline(ruta) {
  const datos = JSON.parse(readFileSync(ruta, "utf8"));
  const formato = new Error(`${ruta}: formato de baseline desconocido (se espera { "version": 1, "violaciones": { archivo: { regla: { coincidencia: cantidad } } } })`);
  if (!esObjeto(datos) || datos.version !== 1 || !esObjeto(datos.violaciones)) throw formato;
  for (const reglas of Object.values(datos.violaciones)) {
    if (!esObjeto(reglas)) throw formato;
    for (const matches of Object.values(reglas)) {
      if (!esObjeto(matches) || !Object.values(matches).every((n) => Number.isInteger(n) && n > 0)) throw formato;
    }
  }
  return datos.violaciones;
}

// ---------- CLI ----------

export function parsearArgumentos(argv) {
  const opciones = { grupos: [], dirs: [], ignorar: [], incluir: [], baseline: null, podar: false, inicializar: false, estricto: false, monto: null, mover: null, ayuda: false };
  const conValor = new Set(["--baseline", "--base", "--monto"]);
  const conLista = { "--dir": "dirs", "--ignorar": "ignorar", "--incluir": "incluir" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (conValor.has(a)) {
      const valor = argv[++i];
      if (!valor || valor.startsWith("--")) throw new Error(`${a} necesita un valor`);
      if (a === "--monto") opciones.monto = valor;
      else opciones.baseline = valor;
    } else if (a === "--mover") {
      const [de, a2] = [argv[++i], argv[++i]];
      if (!de || !a2 || de.startsWith("--") || a2.startsWith("--")) throw new Error("--mover necesita <de> y <a>");
      opciones.mover = [de, a2];
    } else if (conLista[a]) {
      const destino = opciones[conLista[a]];
      const antes = destino.length;
      while (argv[i + 1] && !argv[i + 1].startsWith("--") && !GRUPOS.includes(argv[i + 1])) destino.push(...argv[++i].split(",").filter(Boolean));
      if (destino.length === antes) throw new Error(`${a} necesita al menos un valor`);
    } else if (a === "--podar") opciones.podar = true;
    else if (a === "--inicializar") opciones.inicializar = true;
    else if (a === "--estricto") opciones.estricto = true;
    else if (a === "--help" || a === "-h") opciones.ayuda = true;
    else if (GRUPOS.includes(a)) opciones.grupos.push(a);
    else throw new Error(`Argumento desconocido: ${a}`);
  }
  if (opciones.grupos.length === 0) opciones.grupos = GRUPOS.filter((g) => g !== "iconos");
  if ([opciones.podar, opciones.inicializar, Boolean(opciones.mover)].filter(Boolean).length > 1) throw new Error("--podar, --inicializar y --mover son excluyentes");
  if ((opciones.podar || opciones.inicializar || opciones.estricto || opciones.mover) && !opciones.baseline) throw new Error("--podar, --inicializar, --estricto y --mover necesitan --baseline <archivo>");
  return opciones;
}

export function ayudaVerificar() {
  return (
    "  khipu-ds verificar [tipografia|alturas|estilos|iconos ...] [opciones]   Guardas de diseño para tu app\n" +
    "      --dir <ruta...>        carpetas a revisar (por defecto src, o . si no existe; una carpeta llamada como un grupo: ./estilos)\n" +
    "      --baseline <json>      deuda permitida por archivo+regla+coincidencia; solo puede bajar (alias: --base). Las rutas\n" +
    "                             de la baseline son relativas a ese archivo\n" +
    "      --podar                reescribe la baseline sin lo que ya se arregló (solo lo que esta corrida puede ver)\n" +
    "      --inicializar          crea la baseline con lo que hay hoy (solo si no existe)\n" +
    "      --mover <de> <a>       renombra un archivo en la baseline (tras renombrarlo en el repo)\n" +
    "      --estricto             falla también con entradas de baseline que ya no hacen falta\n" +
    "      --monto <regex>        marca font-mono en elementos cuyo contenido case (p. ej. 'formatCurrency\\(|S/')\n" +
    "      --ignorar <seg...>     ignora además carpetas/archivos por nombre (admite *)\n" +
    "      --incluir <seg...>     revisa algo que se ignora por defecto (p. ej. mocks)\n" +
    "      sin grupos: tipografia, alturas y estilos (iconos es opt-in). Exención: comentario `// estilos-ok` o `// estilos-ok: paleta`\n"
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
  if (o.ayuda) {
    salida(ayudaVerificar());
    return 0;
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
  // Las claves de la baseline son rutas relativas al archivo de baseline (no al cwd): la misma baseline vale desde la raíz del monorepo o desde la app.
  const base = rutaBaseline ? dirname(rutaBaseline) : cwd;
  const clave = (abs) => relative(base, abs).split(sep).join("/");
  const mostrar = (k) => relative(cwd, resolve(base, k)).split(sep).join("/");
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

  if (o.mover) {
    const [de, a] = o.mover.map((r) => clave(resolve(cwd, r)));
    if (!baseline[de]) {
      error(`khipu-ds verificar: ${de} no está en la baseline.`);
      return 2;
    }
    if (baseline[a]) {
      error(`khipu-ds verificar: ${a} ya está en la baseline.`);
      return 2;
    }
    baseline[a] = baseline[de];
    delete baseline[de];
    writeFileSync(rutaBaseline, serializar(baseline));
    salida(`Baseline: ${de} → ${a}.`);
    return 0;
  }

  const porArchivo = {};
  const escaneados = new Set();
  let archivos = 0;
  for (const dir of dirs) {
    for (const ruta of listarArchivos(dir, ignorados)) {
      const k = clave(ruta);
      if (escaneados.has(k)) continue;
      escaneados.add(k);
      archivos++;
      const hallazgos = analizarTexto(readFileSync(ruta, "utf8"), { grupos: o.grupos, monto });
      if (hallazgos.length) porArchivo[k] = hallazgos;
    }
  }
  const encontrado = agrupar(porArchivo);

  if (o.inicializar) {
    writeFileSync(rutaBaseline, serializar(aConteos(encontrado)));
    const total = Object.values(porArchivo).reduce((s, l) => s + l.length, 0);
    salida(`Baseline creada: ${o.baseline} (${total} violaciones en ${Object.keys(porArchivo).length} archivos).`);
    return 0;
  }

  // Alcance de la corrida: solo lo que se pudo ver (archivos recorridos o borrados dentro de --dir, grupos y reglas activos).
  const enAlcance = (k, regla) => {
    if (!reglaActiva(regla, { grupos: o.grupos, monto })) return false;
    const abs = resolve(base, k);
    return dirs.some((d) => abs.startsWith(d + sep)) && (escaneados.has(k) || !existsSync(abs));
  };
  const { nuevos: todosNuevos, sobrantes, podada } = comparar(encontrado, baseline, enAlcance);
  // Sin baseline no hay forma de registrar una exención: se informan en el resumen pero no fallan.
  const nuevos = rutaBaseline ? todosNuevos : todosNuevos.filter((h) => !h.exenta);
  const porRegla = {};
  let exentas = 0;
  for (const hs of Object.values(porArchivo)) {
    for (const h of hs) {
      porRegla[h.regla] = (porRegla[h.regla] ?? 0) + 1;
      if (h.exenta) exentas++;
    }
  }
  const total = Object.values(porRegla).reduce((s, n) => s + n, 0);

  if (o.podar) {
    writeFileSync(rutaBaseline, serializar(podada));
    const quitadas = sobrantes.reduce((s, x) => s + x.sobran, 0);
    salida(`Baseline podada: ${o.baseline} (${quitadas} violaciones quitadas).`);
  }

  let codigo = 0;
  if (nuevos.length) {
    error(`Violaciones nuevas (${nuevos.length}), fuera de la baseline:\n${nuevos.map((h) => `${mostrar(h.archivo)}:${h.linea}  [${h.regla}${h.exenta ? ", exenta" : ""}] ${h.coincidencia}  ${h.mensaje}`).join("\n")}`);
    codigo = 1;
  }
  if (sobrantes.length && !o.podar) {
    const detalle = sobrantes.map((s) => `${mostrar(s.archivo)}  [${s.regla}] ${s.coincidencia}  (−${s.sobran})`).join("\n");
    if (o.estricto) {
      error(`Entradas de baseline sin uso (${sobrantes.length}); ejecuta con --podar:\n${detalle}`);
      codigo = 1;
    } else {
      salida(`Aviso: ${sobrantes.length} entradas de baseline ya no hacen falta (--podar las quita).`);
    }
  }
  const resumen = Object.entries(porRegla).sort(([a], [b]) => a.localeCompare(b)).map(([r, n]) => `${r}: ${n}`).join(" · ");
  salida(`Verificados ${archivos} archivos (${o.grupos.join(", ")}): ${total} violaciones, ${nuevos.length} nuevas, ${exentas} con exención (<grupo>-ok).${resumen ? `\n  ${resumen}` : ""}`);
  return codigo;
}
