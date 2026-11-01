#!/usr/bin/env node
// Codemod de 0.5: (1) iconos de lucide-react → @phosphor-icons/react (mismo componente, otro nombre) y el tipo
// `LucideIcon` → `IconoComponente`; (2) la altura de control h-9 / size-9 / min-h-9 → h-control (34 px).
// Idempotente. Uso: node scripts/codemod-05.mjs [carpetas…]   (por defecto: src)

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Nombre en lucide-react → nombre en @phosphor-icons/react 2.1 (sufijo Icon). */
export const MAPA_ICONOS = {
  ArrowDownIcon: "ArrowDownIcon",
  ArrowDownRightIcon: "ArrowDownRightIcon",
  ArrowUpDownIcon: "ArrowsDownUpIcon",
  ArrowUpIcon: "ArrowUpIcon",
  ArrowUpRightIcon: "ArrowUpRightIcon",
  BanIcon: "ProhibitIcon",
  BellIcon: "BellIcon",
  BoldIcon: "TextBIcon",
  BookOpenIcon: "BookOpenIcon",
  CalendarIcon: "CalendarBlankIcon",
  CheckCircle2Icon: "CheckCircleIcon",
  CheckIcon: "CheckIcon",
  ChevronDownIcon: "CaretDownIcon",
  ChevronLeftIcon: "CaretLeftIcon",
  ChevronRightIcon: "CaretRightIcon",
  ChevronUpIcon: "CaretUpIcon",
  ChevronsUpDownIcon: "CaretUpDownIcon",
  CircleAlertIcon: "WarningCircleIcon",
  CopyIcon: "CopyIcon",
  DownloadIcon: "DownloadSimpleIcon",
  EyeIcon: "EyeIcon",
  EyeOffIcon: "EyeSlashIcon",
  FileIcon: "FileIcon",
  FileTextIcon: "FileTextIcon",
  InboxIcon: "TrayIcon",
  InfoIcon: "InfoIcon",
  ItalicIcon: "TextItalicIcon",
  KeyRoundIcon: "KeyIcon",
  ListOrderedIcon: "ListNumbersIcon",
  LoaderCircleIcon: "CircleNotchIcon",
  LogOutIcon: "SignOutIcon",
  Menu: "ListIcon",
  MinusIcon: "MinusIcon",
  MonitorIcon: "MonitorIcon",
  MoonIcon: "MoonIcon",
  MoreHorizontalIcon: "DotsThreeIcon",
  PackageIcon: "PackageIcon",
  PaletteIcon: "PaletteIcon",
  PencilIcon: "PencilSimpleIcon",
  PlusIcon: "PlusIcon",
  ReceiptTextIcon: "ReceiptIcon",
  RefreshCwIcon: "ArrowClockwiseIcon",
  RocketIcon: "RocketLaunchIcon",
  SearchIcon: "MagnifyingGlassIcon",
  SendIcon: "PaperPlaneTiltIcon",
  ShieldCheckIcon: "ShieldCheckIcon",
  SparklesIcon: "SparkleIcon",
  SunIcon: "SunIcon",
  Trash2Icon: "TrashIcon",
  TriangleAlertIcon: "WarningIcon",
  UnderlineIcon: "TextUnderlineIcon",
  UploadCloudIcon: "CloudArrowUpIcon",
  XIcon: "XIcon",
};

const IMPORT_LUCIDE = /^import\s+(type\s+)?\{([^}]*)\}\s+from\s+"lucide-react";?[ \t]*\r?\n?/gm;

/** Reescribe los imports y usos de lucide-react de un archivo. Un nombre que no está en el mapa es un error. */
export function migrarIconos(texto) {
  const imports = [...texto.matchAll(IMPORT_LUCIDE)];
  if (imports.length === 0) return texto;
  const valores = new Set();
  let usaTipo = false;
  for (const m of imports) {
    for (const crudo of m[2].split(",").map((x) => x.trim()).filter(Boolean)) {
      const nombre = crudo.replace(/^type\s+/, "");
      if (nombre === "LucideIcon") {
        usaTipo = true;
        continue;
      }
      if (!(nombre in MAPA_ICONOS)) throw new Error(`Icono sin equivalencia en MAPA_ICONOS: ${nombre}`);
      valores.add(nombre);
    }
  }
  // El primer import de lucide se cambia por un marcador (ahí van los imports nuevos); los demás se quitan.
  const MARCADOR = "\u0000IMPORTS_KHIPU\u0000\n";
  let primero = true;
  let cuerpo = texto.replace(IMPORT_LUCIDE, () => {
    if (!primero) return "";
    primero = false;
    return MARCADOR;
  });
  for (const viejo of [...valores].sort((a, b) => b.length - a.length)) {
    const nuevo = MAPA_ICONOS[viejo];
    if (viejo !== nuevo) cuerpo = cuerpo.replace(new RegExp(`\\b${viejo}\\b`, "g"), nuevo);
  }
  if (usaTipo) cuerpo = cuerpo.replace(/\bLucideIcon\b/g, "IconoComponente");
  // lucide engrosaba el check con strokeWidth={3}; en Phosphor es el peso bold.
  cuerpo = cuerpo.replace(/strokeWidth=\{3\}/g, 'weight="bold"');
  const lineas = [];
  if (valores.size > 0) lineas.push(`import { ${[...valores].map((v) => MAPA_ICONOS[v]).sort().join(", ")} } from "@phosphor-icons/react";`);
  if (usaTipo) lineas.push('import type { IconoComponente } from "@/lib/iconos";');
  // Los imports nuevos van donde estaba el primero de lucide (después de un eventual "use client").
  return cuerpo.replace(MARCADOR, lineas.length > 0 ? `${lineas.join("\n")}\n` : "");
}

/** La altura única de control pasa de 36 px (h-9) a 34 px (h-control). */
export function migrarAlturas(texto) {
  return texto.replace(/(?<![\w-])(min-h|h|size)-9(?![\w./-])/g, "$1-control");
}

function listarArchivos(dir) {
  return readdirSync(dir).flatMap((entrada) => {
    const ruta = join(dir, entrada);
    if (statSync(ruta).isDirectory()) return listarArchivos(ruta);
    return /\.(tsx?)$/.test(entrada) ? [ruta] : [];
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  let cambiados = 0;
  for (const dir of dirs.length > 0 ? dirs : ["src"]) {
    for (const archivo of listarArchivos(resolve(ROOT, dir))) {
      const antes = readFileSync(archivo, "utf8");
      const despues = migrarAlturas(migrarIconos(antes));
      if (despues !== antes) {
        writeFileSync(archivo, despues);
        cambiados++;
        console.log(relative(ROOT, archivo).replaceAll("\\", "/"));
      }
    }
  }
  console.log(`codemod-05: ${cambiados} archivos.`);
}
