/**
 * Recetas de clases compartidas (evita copiar la misma cadena en cada componente).
 *
 * Todos los controles miden lo mismo: `h-9` (36 px), la altura única de docs/design-system.md §4. Un botón, un input,
 * un select, un filtro o una acción de fila puestos lado a lado quedan alineados sin pensarlo. Nunca `cn(RECETA, "h-N")`:
 * sobrescribir la altura a mano es justo lo que hace que dos controles de la misma fila terminen midiendo distinto.
 *
 * Texto solo de la escala con nombre (§3): `text-etiqueta` 12, `text-control` 13, `text-cuerpo` 14, `text-metrica` 24.
 * Movimiento: `ease-salida` y `duration-(--duracion-*)`, los mismos valores que src/lib/movimiento.ts usa en Motion.
 */
import type { CSSProperties } from "react";

// ── Movimiento: una sola respuesta al pulsar y una sola entrada de contenido (docs/design-system.md «Movimiento») ──
// Todo va bajo `motion-safe:`: con «reducir movimiento» activado en el sistema no se anima nada.
/** Respuesta al pulsar un control: se hunde unos 0.7 px. */
export const PRESION = "motion-safe:active:scale-[0.98]";
/** Entrada de un bloque al aparecer (fundido + 8 px hacia arriba). Escalona con `style={{ "--i": n }}`: 40 ms por posición (el retraso vive en `--animate-entrada`). */
export const ENTRADA = "motion-safe:animate-entrada";
/** La posición `i` del bloque en la cascada de `ENTRADA`: `style={pasoEntrada(2)}`. */
export const pasoEntrada = (i: number) => ({ "--i": i }) as CSSProperties;

/** Anillo de foco de teclado: 2 px de acento con 2 px de separación del control. */
export const FOCO = "outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const TRANSICION_CONTROL = "transition-[color,background-color,border-color,box-shadow,transform] duration-(--duracion-rapida) ease-salida";
const DESHABILITADO = "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

// ── Acciones de página: top bar, barra de filtros, acciones sueltas en tarjetas, alertas o estados vacíos ──
// La principal es casi negra (foreground) para no competir con los colores de estado; el índigo queda para confirmar formularios.
export const ACCION_PRINCIPAL = `inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-control font-medium whitespace-nowrap text-background shadow-xs ${TRANSICION_CONTROL} hover:bg-foreground/85 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const ACCION_SECUNDARIA = `inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-control font-medium whitespace-nowrap text-foreground shadow-xs ${TRANSICION_CONTROL} hover:border-input hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
// Select, buscador y refrescar de una barra de filtros: la misma altura que las acciones de arriba.
export const CONTROL_FILTRO = "h-9 rounded-lg border border-border bg-card text-control font-medium text-foreground shadow-xs";
// Control segmentado de una barra de filtros (Tabs `estilo="segmentado"`, o vistas que son enlaces): caja de h-9 con segmentos de h-7.
// `min-h-9` y no `h-9`: con muchas opciones la caja se parte en filas en vez de desbordarse, y con una sola fila mide igual.
export const SEGMENTADO = "inline-flex min-h-9 w-fit flex-wrap items-center gap-0.5 rounded-lg bg-secondary p-0.5";
/** Segmento sin fondo de activo: para `Tabs`, que pinta el activo con un indicador que se desliza. */
export const SEGMENTO_BASE =
  "relative inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-control font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-active:text-foreground aria-[current=page]:text-foreground";
// El segmento activo se marca con `data-active` (base-ui) o con `aria-current="page"` (un enlace a la vista actual).
// En oscuro el activo usa `input` (blanco translúcido): `card` es más oscuro que `secondary` y el activo se hundiría.
export const SEGMENTO = `${SEGMENTO_BASE} data-active:bg-card data-active:shadow-sm dark:data-active:bg-input aria-[current=page]:bg-card aria-[current=page]:shadow-sm dark:aria-[current=page]:bg-input`;

// ── Formularios: el campo y su CTA ──
export const CAMPO =
  "h-9 w-full rounded-lg border border-input bg-card px-3 text-control text-foreground shadow-xs transition-[border-color,box-shadow] duration-(--duracion-rapida) ease-salida outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-3 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60";
/** @deprecated Desde 0.2.0 todos los campos miden lo mismo: usa `CAMPO`. Se conserva para no romper imports. */
export const CAMPO_FILTRO = CAMPO;
export const ETIQUETA_CAMPO = "text-control font-medium text-foreground";
export const AYUDA_CAMPO = "text-etiqueta text-muted-foreground";

// disabled:pointer-events-none (igual que ui/button.tsx) es lo que de verdad evita que el :hover del mouse
// que se quedó sobre el botón le gane a disabled:opacity-60 en la cascada; cursor-not-allowed solo no basta.
export const BOTON_PRIMARIO = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-control font-medium text-primary-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-primary/90 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_SECUNDARIO = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-control font-medium text-foreground shadow-xs ${TRANSICION_CONTROL} hover:border-input hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_DESTRUCTIVO = `inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3.5 text-control font-medium text-destructive-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-destructive/90 ${FOCO} ${PRESION} ${DESHABILITADO}`;

// El pie de diálogo, PanelLateral, TarjetaPaso y Drawer ya no tiene una altura propia: usa los mismos botones.
/** @deprecated Desde 0.2.0 es igual a `BOTON_PRIMARIO`. Se conserva para no romper imports. */
export const BOTON_PRIMARIO_PIE = BOTON_PRIMARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_SECUNDARIO`. Se conserva para no romper imports. */
export const BOTON_SECUNDARIO_PIE = BOTON_SECUNDARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_DESTRUCTIVO`. Se conserva para no romper imports. */
export const BOTON_DESTRUCTIVO_PIE = BOTON_DESTRUCTIVO;

// ── Tarjetas y secciones ──
export const TARJETA = "rounded-xl border border-border bg-card shadow-sm";
export const TITULO_SECCION = "flex items-center gap-1.5 text-etiqueta font-medium text-muted-foreground";
export const ETIQUETA_DATO = "block text-etiqueta font-medium text-muted-foreground";

// Entrada/salida de cualquier popup posicionado contra un disparador (Select, Combobox, Popover, HoverCard…).
export const ANIMACION_POPUP =
  "origin-(--transform-origin) duration-(--duracion-rapida) ease-salida data-[side=bottom]:slide-in-from-top-1 data-[side=inline-end]:slide-in-from-left-1 data-[side=inline-start]:slide-in-from-right-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

// Panel de sugerencias/opciones de un combobox de búsqueda (Combobox, Autocomplete).
export const POPUP_LISTA =
  "max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto rounded-xl bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-border outline-none";
