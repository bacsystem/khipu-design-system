"use client";

import { type ReactNode, useMemo, useState } from "react";

import {
  type Columna,
  ordenarFilas,
  type OrdenTabla,
  TablaDatos,
} from "@/components/datos/tabla-datos";
import { Buscador } from "@/components/formularios/buscador";
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuTrigger,
} from "@/components/ui/menu";
import { ACCION_SECUNDARIA } from "@/lib/estilos";
import {
  type ColumnaExportable,
  descargarCsv,
  imprimirTabla,
} from "@/lib/exportar";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ColumnsIcon,
  DownloadSimpleIcon,
  FileCsvIcon,
  PrinterIcon,
} from "@phosphor-icons/react";

/**
 * Columna de un listado: la de `TablaDatos` más cómo se busca y exporta. `texto` es el valor plano de la celda
 * (búsqueda, CSV e impresión); por defecto `valor` o `fila[id]`. `exportable: false` la saca del CSV (p. ej. acciones).
 */
export type ColumnaListado<T> = Columna<T> & {
  texto?: (fila: T) => string | number | null | undefined;
  exportable?: boolean;
  /** `false`: no aparece en el selector de columnas (siempre visible). */
  ocultable?: boolean;
  /** Oculta la columna al inicio (el usuario puede mostrarla). */
  ocultaInicial?: boolean;
};

function textoDe<T>(
  c: ColumnaListado<T>,
  f: T,
): string | number | null | undefined {
  if (c.texto) return c.texto(f);
  if (c.valor) return c.valor(f);
  const v = (f as Record<string, unknown>)[c.id];
  return typeof v === "string" || typeof v === "number"
    ? v
    : v == null
      ? ""
      : String(v);
}

/** Textos de la barra del listado, para traducirlos (por defecto en castellano). */
export type TextosTablaListado = {
  buscar: string;
  columnas: string;
  columnasVisibles: string;
  exportar: string;
  exportarCsv: string;
  imprimir: string;
};

const TEXTOS_ES: TextosTablaListado = {
  buscar: "Buscar…",
  columnas: "Columnas",
  columnasVisibles: "Columnas visibles",
  exportar: "Exportar",
  exportarCsv: "Exportar CSV",
  imprimir: "Imprimir",
};

/**
 * Listado completo en cliente sobre `TablaDatos`: buscador, selector de columnas, exportar CSV e imprimir,
 * con orden y paginación de la tabla. `filtros` va debajo del buscador (tabs, selects); `acciones` a la derecha.
 * La barra y los filtros llevan `data-sin-imprimir`, para ocultarlos con `@media print` si se imprime la página entera.
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
  textos?: Partial<TextosTablaListado>;
} & Omit<
  React.ComponentProps<typeof TablaDatos<T>>,
  "columnas" | "filas" | "clave"
>) {
  const textos = { ...TEXTOS_ES, ...textosParciales };
  const textoBusqueda = placeholderBusqueda ?? textos.buscar;
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenTabla>(resto.ordenInicial ?? null);
  const [ocultas, setOcultas] = useState<string[]>(() =>
    columnas.filter((c) => c.ocultaInicial).map((c) => c.id),
  );

  const visibles = useMemo(
    () => columnas.filter((c) => !ocultas.includes(c.id)),
    [columnas, ocultas],
  );

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLocaleLowerCase("es");
    if (!q) return filas;
    return filas.filter((f) =>
      columnas.some((c) =>
        String(textoDe(c, f) ?? "")
          .toLocaleLowerCase("es")
          .includes(q),
      ),
    );
  }, [filas, columnas, busqueda]);

  // Exportar e imprimir respetan el orden elegido en pantalla, no el de la API.
  const paraExportar = useMemo(
    () => ordenarFilas(filtradas, columnas, orden),
    [filtradas, columnas, orden],
  );

  const exportables: ColumnaExportable<T>[] = visibles
    .filter((c) => c.exportable !== false && typeof c.titulo === "string")
    .map((c) => ({
      titulo: c.titulo as string,
      valor: (f: T) => textoDe(c, f),
    }));

  const ocultables = columnas.filter(
    (c) =>
      c.ocultable !== false && typeof c.titulo === "string" && c.titulo !== "",
  );

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {buscar || exportar || acciones || ocultables.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" data-sin-imprimir>
          {buscar ? (
            <div className="min-w-56 flex-1">
              <Buscador
                etiqueta={textoBusqueda}
                placeholder={textoBusqueda}
                valor={busqueda}
                onCambio={setBusqueda}
              />
            </div>
          ) : (
            <div className="flex-1" />
          )}
          {ocultables.length > 0 ? (
            <Menu>
              <MenuTrigger
                className={ACCION_SECUNDARIA}
                aria-label={textos.columnas}
                title={textos.columnas}
              >
                <ColumnsIcon className="size-4" />
                <span className="max-sm:sr-only">{textos.columnas}</span>
              </MenuTrigger>
              <MenuContent align="end" className="min-w-48">
                <MenuGroup>
                  <MenuGroupLabel>{textos.columnasVisibles}</MenuGroupLabel>
                  {ocultables.map((c) => {
                    const visible = !ocultas.includes(c.id);
                    return (
                      <MenuItem
                        key={c.id}
                        closeOnClick={false}
                        onClick={() =>
                          setOcultas((o) =>
                            visible
                              ? [...o, c.id]
                              : o.filter((x) => x !== c.id),
                          )
                        }
                      >
                        <CheckIcon
                          weight="bold"
                          className={cn("size-3.5", !visible && "invisible")}
                        />
                        {c.titulo}
                      </MenuItem>
                    );
                  })}
                </MenuGroup>
              </MenuContent>
            </Menu>
          ) : null}
          {exportar ? (
            <Menu>
              <MenuTrigger
                className={ACCION_SECUNDARIA}
                aria-label={textos.exportar}
                title={textos.exportar}
              >
                <DownloadSimpleIcon className="size-4" />
                <span className="max-sm:sr-only">{textos.exportar}</span>
              </MenuTrigger>
              <MenuContent align="end" className="min-w-44">
                <MenuItem
                  onClick={() =>
                    descargarCsv(titulo, exportables, paraExportar)
                  }
                >
                  <FileCsvIcon className="size-4" />
                  {textos.exportarCsv}
                </MenuItem>
                <MenuItem
                  onClick={() =>
                    imprimirTabla(titulo, exportables, paraExportar)
                  }
                >
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
        {...resto}
        onOrdenCambio={(o) => {
          setOrden(o);
          resto.onOrdenCambio?.(o);
        }}
      />
    </div>
  );
}
