"use client";

import { ArrowCounterClockwiseIcon, ColumnsIcon, DownloadSimpleIcon, FileCsvIcon, PrinterIcon } from "@phosphor-icons/react";
import { useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { TablaDatos, type Columna, type TextosTablaDatos } from "@/components/datos/tabla-datos";
import { Buscador } from "@/components/formularios/buscador";
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import { calcularOcultas, guardarColumnasOcultas, interpretarColumnasOcultas, restablecerColumnasOcultas } from "@/lib/columnas-visibles";
import { ACCION_SECUNDARIA } from "@/lib/estilos";
import { descargarCsv, imprimirTabla, type ColumnaExportable } from "@/lib/exportar";
import { ordenarFilas, type OrdenTabla } from "@/lib/ordenar";

/**
 * Columna de un listado: la de `TablaDatos` más cómo se busca y se exporta.
 * - `texto`: el valor plano de la celda para buscar, exportar e imprimir. Sin él se usa `valor` o `fila[id]`, **no** lo
 *   que dibuja `render`: una columna con `render` (un estado como píldora, un monto con formato) debe dar su `texto`
 *   para que se busque y se exporte lo mismo que se ve.
 * - `tituloTexto`: el nombre de la columna en el CSV, la impresión y el selector cuando `titulo` no es un texto (un
 *   icono, un nodo). Sin un nombre de texto, la columna no se exporta ni se puede ocultar.
 * - `exportable: false` la saca del CSV y de la impresión (p. ej. acciones); `ocultable: false` la deja siempre visible.
 */
export type ColumnaListado<T> = Columna<T> & {
  texto?: (fila: T) => string | number | null | undefined;
  tituloTexto?: string;
  exportable?: boolean;
  /** `false`: siempre visible; en el selector de columnas aparece marcada y bloqueada con «Fijo» (`textos.fijo`). */
  ocultable?: boolean;
  /** Oculta la columna al inicio (el usuario puede mostrarla). Solo vale para columnas que se pueden ocultar. */
  ocultaInicial?: boolean;
};

function textoDe<T>(c: ColumnaListado<T>, f: T): string | number | null | undefined {
  if (c.texto) return c.texto(f);
  if (c.valor) return c.valor(f);
  const v = (f as Record<string, unknown>)[c.id];
  return typeof v === "string" || typeof v === "number" ? v : v == null ? "" : String(v);
}

function leerCrudo(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}

/** Otra pestaña cambió lo recordado: el store externo se vuelve a leer. */
function suscribirAlmacen(avisar: () => void): () => void {
  window.addEventListener("storage", avisar);
  return () => window.removeEventListener("storage", avisar);
}

function nombreDe<T>(c: ColumnaListado<T>): string | null {
  if (c.tituloTexto) return c.tituloTexto;
  return typeof c.titulo === "string" && c.titulo !== "" ? c.titulo : null;
}

/** Minúsculas y sin marcas diacríticas (tildes, diéresis; la ñ queda n): «jose» encuentra «José». */
function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("es");
}

/** Textos de la barra del listado, para traducirlos (por defecto en castellano). */
export type TextosTablaListado = {
  buscar: string;
  /** Nombre accesible del botón de limpiar la búsqueda. */
  limpiar: string;
  columnas: string;
  columnasVisibles: string;
  exportar: string;
  exportarCsv: string;
  imprimir: string;
  /** Rótulo de una columna que no se puede ocultar (`ocultable: false`) en el selector de columnas. */
  fijo: string;
  /** Acción del selector que devuelve las columnas a su estado inicial (`ocultaInicial`). */
  restablecer: string;
};

const TEXTOS_ES: TextosTablaListado = {
  buscar: "Buscar…",
  limpiar: "Limpiar búsqueda",
  columnas: "Columnas",
  columnasVisibles: "Columnas visibles",
  exportar: "Exportar",
  exportarCsv: "Exportar CSV",
  imprimir: "Imprimir",
  fijo: "Fijo",
  restablecer: "Restablecer",
};

/**
 * Listado completo en cliente sobre `TablaDatos`: buscador (sin distinguir mayúsculas ni tildes), selector de columnas
 * visibles, exportar CSV e imprimir —en el orden que se ve en pantalla y con las columnas visibles—, más el orden y la
 * paginación de la tabla (que vuelve a la página 1 al buscar). `filtros` va debajo del buscador (tabs, selects);
 * `acciones` a la derecha. La barra y los filtros llevan `data-sin-imprimir`, para ocultarlos con `@media print` si se
 * imprime la página entera. Si el navegador bloquea la ventana de impresión se llama a `onImpresionBloqueada` (p. ej.
 * para avisar con un toast).
 */
export function TablaListado<T>({
  columnas,
  filas,
  clave,
  titulo,
  buscar = true,
  placeholderBusqueda,
  exportar = true,
  filtros,
  acciones,
  textos: textosParciales,
  onImpresionBloqueada,
  claveAlmacenamiento,
  ...resto
}: {
  columnas: ColumnaListado<T>[];
  filas: T[];
  clave: (fila: T) => string;
  /** Nombre del archivo CSV y del título impreso. */
  titulo: string;
  buscar?: boolean;
  placeholderBusqueda?: string;
  exportar?: boolean;
  filtros?: ReactNode;
  acciones?: ReactNode;
  /** Textos de la barra y, además, los de la tabla (`TextosTablaDatos`), que se pasan a `TablaDatos`. */
  textos?: Partial<TextosTablaListado & TextosTablaDatos>;
  onImpresionBloqueada?: () => void;
  /**
   * Recuerda las columnas visibles en `localStorage` bajo esta clave (una por listado: `"app:clientes:columnas"`). Sin ella
   * (o sin almacenamiento) se parte siempre de `ocultaInicial`. Lo guardado se aplica tras hidratar, sin desajuste con el servidor.
   * Se guardan las columnas **ocultas**, no las visibles: una columna que la app añada después con `ocultaInicial: true` la verá
   * quien ya tenía algo guardado (no figura en su lista). Cambia la clave si necesitas que todos partan de cero.
   */
  claveAlmacenamiento?: string;
} & Omit<React.ComponentProps<typeof TablaDatos<T>>, "columnas" | "filas" | "clave" | "textos">) {
  const textos = { ...TEXTOS_ES, ...textosParciales };
  const textoBusqueda = placeholderBusqueda ?? textos.buscar;
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenTabla>(resto.ordenInicial ?? null);

  // Con título de texto (las demás no se pueden nombrar en el selector). Las `ocultables` son las que el usuario puede ocultar.
  const todas = columnas.filter((c) => nombreDe(c) !== null);
  const ocultables = todas.filter((c) => c.ocultable !== false);
  // Lo recordado se lee como un store externo: en el servidor y al hidratar vale `null` (sin desajuste) y luego el valor real.
  const recordado = useSyncExternalStore(
    suscribirAlmacen,
    () => (claveAlmacenamiento ? leerCrudo(claveAlmacenamiento) : null),
    () => null,
  );
  const [elegidas, setElegidas] = useState<string[] | null>(null);
  const ocultas = useMemo(
    () => calcularOcultas(columnas.filter((c) => nombreDe(c) !== null), elegidas, interpretarColumnasOcultas(recordado)),
    [columnas, elegidas, recordado],
  );

  function elegirOcultas(nuevas: string[]) {
    setElegidas(nuevas);
    if (claveAlmacenamiento) guardarColumnasOcultas(claveAlmacenamiento, nuevas);
  }

  function restablecer() {
    setElegidas(calcularOcultas(todas, null, null));
    if (claveAlmacenamiento) restablecerColumnasOcultas(claveAlmacenamiento);
  }

  const visibles = useMemo(() => columnas.filter((c) => !ocultas.includes(c.id)), [columnas, ocultas]);

  const filtradas = useMemo(() => {
    const q = normalizar(busqueda.trim());
    if (!q) return filas;
    // Solo en lo que el usuario ve: una fila no debe aparecer por un dato de una columna oculta.
    return filas.filter((f) => visibles.some((c) => normalizar(String(textoDe(c, f) ?? "")).includes(q)));
  }, [filas, visibles, busqueda]);

  // Volver a la página 1 al buscar, y también cuando cambia el `reinicioPagina` propio de quien llama (sus filtros).
  const reinicioPropio = resto.reinicioPagina;
  const reinicio = useMemo(() => [busqueda, reinicioPropio], [busqueda, reinicioPropio]);

  // Con las columnas visibles, como la tabla: si se ocultó la columna del orden, en pantalla ya no se ordena por ella.
  const paraExportar = useMemo(() => ordenarFilas(filtradas, visibles, orden), [filtradas, visibles, orden]);

  const exportables: ColumnaExportable<T>[] = visibles.flatMap((c) => {
    const nombre = nombreDe(c);
    return c.exportable !== false && nombre !== null ? [{ titulo: nombre, valor: (f: T) => textoDe(c, f) }] : [];
  });

  function imprimir() {
    if (!imprimirTabla(titulo, exportables, paraExportar)) onImpresionBloqueada?.();
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {buscar || exportar || acciones || ocultables.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" data-sin-imprimir>
          {buscar ? (
            <div className="min-w-56 flex-1">
              <Buscador
                etiqueta={textoBusqueda}
                placeholder={textoBusqueda}
                etiquetaLimpiar={textos.limpiar}
                valor={busqueda}
                onCambio={setBusqueda}
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {ocultables.length > 0 ? (
            <Menu>
              <MenuTrigger className={ACCION_SECUNDARIA} aria-label={textos.columnas} title={textos.columnas}>
                <ColumnsIcon className="size-4" />
                <span className="max-sm:sr-only">{textos.columnas}</span>
              </MenuTrigger>
              <MenuContent align="end" className="min-w-48">
                <MenuGroup>
                  <MenuGroupLabel>{textos.columnasVisibles}</MenuGroupLabel>
                  {todas.map((c) =>
                    c.ocultable === false ? (
                      <MenuCheckboxItem key={c.id} checked disabled>
                        {nombreDe(c)}
                        <span className="ml-auto pl-3 text-etiqueta text-muted-foreground">{textos.fijo}</span>
                      </MenuCheckboxItem>
                    ) : (
                      <MenuCheckboxItem
                        key={c.id}
                        checked={!ocultas.includes(c.id)}
                        onCheckedChange={(visible) =>
                          elegirOcultas(visible ? ocultas.filter((x) => x !== c.id) : [...ocultas, c.id])
                        }
                      >
                        {nombreDe(c)}
                      </MenuCheckboxItem>
                    ),
                  )}
                </MenuGroup>
                <MenuSeparator />
                <MenuItem onClick={restablecer}>
                  <ArrowCounterClockwiseIcon className="size-4" />
                  {textos.restablecer}
                </MenuItem>
              </MenuContent>
            </Menu>
          ) : null}
          {exportar ? (
            <Menu>
              <MenuTrigger className={ACCION_SECUNDARIA} aria-label={textos.exportar} title={textos.exportar}>
                <DownloadSimpleIcon className="size-4" />
                <span className="max-sm:sr-only">{textos.exportar}</span>
              </MenuTrigger>
              <MenuContent align="end" className="min-w-44">
                <MenuItem onClick={() => descargarCsv(titulo, exportables, paraExportar)}>
                  <FileCsvIcon className="size-4" />
                  {textos.exportarCsv}
                </MenuItem>
                <MenuItem onClick={imprimir}>
                  <PrinterIcon className="size-4" />
                  {textos.imprimir}
                </MenuItem>
              </MenuContent>
            </Menu>
          ) : null}
          {acciones}
        </div>
      ) : null}
      {filtros ? (
        <div className="flex flex-wrap items-center gap-2" data-sin-imprimir>
          {filtros}
        </div>
      ) : null}
      <TablaDatos
        columnas={visibles}
        filas={filtradas}
        clave={clave}
        titulo={titulo}
        {...resto}
        reinicioPagina={reinicio}
        textos={textosParciales}
        onOrdenCambio={(o) => {
          setOrden(o);
          resto.onOrdenCambio?.(o);
        }}
      />
    </div>
  );
}
