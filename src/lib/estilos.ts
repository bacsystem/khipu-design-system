/**
 * Recetas de clases compartidas (evita copiar la misma cadena en cada componente).
 *
 * Todos los controles miden lo mismo: `h-control` (34 px), la altura única de docs/design-system.md §4. Un botón, un input,
 * un select, un filtro o una acción de fila puestos lado a lado quedan alineados sin pensarlo. Nunca `cn(RECETA, "h-N")`:
 * sobrescribir la altura a mano es justo lo que hace que dos controles de la misma fila terminen midiendo distinto.
 *
 * Texto solo de la escala con nombre (§3): `text-etiqueta` 11.5, `text-control` 13, `text-cuerpo` 13, `text-titulo` 14.5, `text-titulo-pagina` 21, `text-metrica` 26.
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

/**
 * Objetivo táctil: con puntero grueso (dedo) amplía el área que acepta el toque a 44×44 px (`--spacing-objetivo-tactil`) con un
 * `::after` invisible centrado, sin cambiar el tamaño que se ve. Con mouse no hace nada. Va en botones de icono **sueltos** (cerrar,
 * «⋯», hamburguesa): en un grupo apretado el halo taparía al vecino. Trae `relative`; ponla primera en `cn` para que un `absolute`
 * propio la pise.
 */
export const OBJETIVO_TACTIL =
  "relative pointer-coarse:after:absolute pointer-coarse:after:top-1/2 pointer-coarse:after:left-1/2 pointer-coarse:after:size-full pointer-coarse:after:min-h-objetivo-tactil pointer-coarse:after:min-w-objetivo-tactil pointer-coarse:after:-translate-x-1/2 pointer-coarse:after:-translate-y-1/2";

const TRANSICION_CONTROL = "transition-[color,background-color,border-color,box-shadow,transform] duration-(--duracion-rapida) ease-salida";
const DESHABILITADO = "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

// ── Acciones de página: top bar, barra de filtros, acciones sueltas en tarjetas, alertas o estados vacíos ──
// La principal es casi negra (primary) en claro y casi blanca en oscuro: el color de la paleta vive en superficies, no en botones.
export const ACCION_PRINCIPAL = `inline-flex h-control items-center gap-1.5 rounded-full bg-primary px-4 text-control font-semibold whitespace-nowrap text-primary-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-primary/85 ${FOCO} ${PRESION} ${DESHABILITADO}`;
/**
 * Acción flotante redonda (la de `BarraInferior`): 56 px, un solo icono. Es la única receta de acción **sin** `h-control` a propósito (no forma fila con
 * otros controles): con `ACCION_PRINCIPAL` + `size-14`, en Tailwind v4 gana `h-control` y el botón mide 56×34 en vez de un círculo.
 */
export const ACCION_FLOTANTE = `inline-flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ${TRANSICION_CONTROL} hover:bg-primary/85 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const ACCION_SECUNDARIA = `inline-flex h-control items-center gap-1.5 rounded-full bg-card px-3.5 text-control font-medium whitespace-nowrap text-foreground ring-1 ring-border ${TRANSICION_CONTROL} hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
// Select, buscador y refrescar de una barra de filtros: la misma altura que las acciones de arriba.
export const CONTROL_FILTRO = "h-control rounded-full border border-border bg-card text-control font-medium text-foreground";
/**
 * Fila que se desplaza en horizontal cuando su contenido no entra, sin barra a la vista (pestañas, segmentos): `Tabs` (línea y segmentado) y `TabsRuta`.
 * `overscroll-x-contain` evita que el desplazamiento al llegar al borde arrastre la página; `scroll-px-1` deja un margen al llevar el foco a la pestaña
 * de un extremo (sin él, el anillo de la última queda a ras del borde).
 */
export const DESPLAZABLE_X = "max-w-full overflow-x-auto overscroll-x-contain scroll-px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
// Control segmentado de una barra de filtros (Tabs `estilo="segmentado"`, `TabsRuta`, o vistas que son enlaces): una sola fila de 34 px (segmentos de h-7 + 3 px de
// relleno arriba y abajo; `min-h-control` es el suelo, 32 px). Nunca se parte en filas: si los segmentos no entran, la caja se desplaza en horizontal (`DESPLAZABLE_X`).
export const SEGMENTADO = `inline-flex min-h-control w-fit flex-nowrap items-center gap-0.5 rounded-full bg-secondary p-[3px] ${DESPLAZABLE_X}`;
/**
 * Segmento sin fondo de activo: para `Tabs`, que pinta el activo con un indicador que se desliza. El anillo de foco es **hacia dentro** (`ring-inset`):
 * la caja segmentada de `Tabs` y `TabsRuta` se desplaza en horizontal (`overflow-x-auto`) y recorta también en vertical.
 */
export const SEGMENTO_BASE =
  "relative inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-control font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-active:text-foreground aria-[current=page]:text-foreground [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
// El segmento activo se marca con `data-active` (base-ui) o con `aria-current="page"` (un enlace a la vista actual).
// En oscuro el activo usa `input` (blanco translúcido): `card` es más oscuro que `secondary` y el activo se hundiría.
export const SEGMENTO = `${SEGMENTO_BASE} data-active:bg-card data-active:shadow-sm dark:data-active:bg-input aria-[current=page]:bg-card aria-[current=page]:shadow-sm dark:aria-[current=page]:bg-input`;

/**
 * Pestaña subrayada (`Tabs estilo="linea"` y `TabsRuta`): base común, sin el estado activo ni el subrayado, que añade cada uno (`data-active:` o
 * `aria-[current=page]:`). `h-10` fijo para que un contador no cambie la altura de la fila. El anillo de foco es **hacia dentro** (`ring-inset`):
 * la fila es `overflow-x-auto` y recorta también en vertical, y un anillo con separación se cortaría.
 */
export const PESTANA_LINEA_BASE =
  "inline-flex h-10 items-center gap-1.5 px-1 text-control font-medium whitespace-nowrap text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4";
/** Contador de una pestaña (`Tabs`, `TabsRuta`): cada una le añade su estado activo. */
export const CONTADOR_PESTANA = "rounded-full bg-secondary px-1.5 py-px text-etiqueta font-semibold text-muted-foreground tabular-nums";

// ── Formularios: el campo y su CTA ──
/** Foco de un campo: borde y anillo del acento de la paleta (en claro, el texto del acento para que el borde llegue a 3:1). `CAMPO` y `SELECT_NATIVO` lo llevan escrito (las recetas de control van en texto plano: las revisa verificar-alturas). */
export const FOCO_CAMPO =
  "focus:border-acento-texto focus:ring-3 focus:ring-acento/55 dark:focus:border-acento dark:focus:ring-acento/25";
/** Lo mismo con `focus-visible` (controles que reciben foco al hacer clic, como el disparador de un select). */
export const FOCO_CAMPO_VISIBLE =
  "focus-visible:border-acento-texto focus-visible:ring-3 focus-visible:ring-acento/55 dark:focus-visible:border-acento dark:focus-visible:ring-acento/25";
/** Campo con error (`aria-invalid`): borde y anillo rojo tenue. */
export const ERROR_CAMPO = "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15";
// `text-campo` (16 px) hasta `md`: con menos, iOS Safari amplía la página al enfocar el campo.
export const CAMPO =
  "h-control w-full rounded-lg border border-input bg-card px-3 text-campo md:text-control text-foreground transition-[border-color,box-shadow] duration-(--duracion-rapida) ease-salida outline-none placeholder:text-texto-terciario focus:border-acento-texto focus:ring-3 focus:ring-acento/55 dark:focus:border-acento dark:focus:ring-acento/25 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-60";
/** @deprecated Desde 0.2.0 todos los campos miden lo mismo: usa `CAMPO`. Se conserva para no romper imports. */
export const CAMPO_FILTRO = CAMPO;
export const ETIQUETA_CAMPO = "text-etiqueta font-medium text-foreground";
export const AYUDA_CAMPO = "text-etiqueta text-muted-foreground";
/** @deprecated Desde 0.5.7 usa `SelectCampo` (`formularios/select-campo`): el `<select>` nativo lo dibuja el sistema operativo y no sigue la plantilla. Se conserva para no romper imports. */
export const SELECT_NATIVO =
  "h-control rounded-lg border border-input bg-card px-2.5 text-campo md:text-control text-foreground transition-[border-color,box-shadow] duration-(--duracion-rapida) ease-salida outline-none focus:border-acento-texto focus:ring-3 focus:ring-acento/55 dark:focus:border-acento dark:focus:ring-acento/25 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 disabled:cursor-not-allowed disabled:opacity-60";

// disabled:pointer-events-none (igual que ui/button.tsx) es lo que de verdad evita que el :hover del mouse
// que se quedó sobre el botón le gane a disabled:opacity-60 en la cascada; cursor-not-allowed solo no basta.
export const BOTON_PRIMARIO = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-control font-semibold text-primary-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-primary/85 ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_SECUNDARIO = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-card px-4 text-control font-medium text-foreground ring-1 ring-border ${TRANSICION_CONTROL} hover:bg-secondary ${FOCO} ${PRESION} ${DESHABILITADO}`;
export const BOTON_DESTRUCTIVO = `inline-flex h-control items-center justify-center gap-1.5 rounded-full bg-destructive px-4 text-control font-semibold text-destructive-foreground shadow-xs ${TRANSICION_CONTROL} hover:bg-destructive/90 ${FOCO} ${PRESION} ${DESHABILITADO}`;

// El pie de diálogo, PanelLateral, TarjetaPaso y Drawer ya no tiene una altura propia: usa los mismos botones.
/** @deprecated Desde 0.2.0 es igual a `BOTON_PRIMARIO`. Se conserva para no romper imports. */
export const BOTON_PRIMARIO_PIE = BOTON_PRIMARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_SECUNDARIO`. Se conserva para no romper imports. */
export const BOTON_SECUNDARIO_PIE = BOTON_SECUNDARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_DESTRUCTIVO`. Se conserva para no romper imports. */
export const BOTON_DESTRUCTIVO_PIE = BOTON_DESTRUCTIVO;

// ── Rótulos: encabezados de tabla y de grupo del menú. Las únicas mayúsculas del kit (verificar-tipografia lo permite solo aquí). ──
export const ROTULO = "text-etiqueta font-semibold uppercase tracking-[0.04em] text-texto-terciario";

// ── Tablas ──
// Acciones de la barra que aparece al seleccionar filas en `TablaDatos` (barra oscura: `foreground` de fondo).
/** Botón de acción masiva: píldora clara sobre la barra oscura de selección. */
export const ACCION_MASIVA = `inline-flex h-control items-center gap-1.5 rounded-full px-3 text-control font-medium whitespace-nowrap text-background/90 ${TRANSICION_CONTROL} hover:bg-background/12 hover:text-background focus-visible:ring-2 focus-visible:ring-acento focus-visible:outline-none ${DESHABILITADO}`;
/** Acción masiva destructiva (anular, eliminar). La barra invierte el tema (oscura en claro, clara en oscuro), así que el rojo
 * también: rosa claro sobre la barra oscura (9.2:1) y rojo oscuro sobre la clara (6.2:1). Hex a propósito: no hay token invertido. */
export const ACCION_MASIVA_PELIGRO = `inline-flex h-control items-center gap-1.5 rounded-full px-3 text-control font-medium whitespace-nowrap text-[#ff9fb0] ${TRANSICION_CONTROL} hover:bg-[#ff9fb0]/15 focus-visible:ring-2 focus-visible:ring-acento focus-visible:outline-none dark:text-[#a3263c] dark:hover:bg-[#a3263c]/10 ${DESHABILITADO}`;

// Celda de cabecera de la tabla estándar (`TableHead`). `patrones/pie-tabla` la re-exporta para no romper a quien la importa desde allí.
export const CABECERA_TABLA = `h-auto px-3 pt-2.5 pb-1 ${ROTULO}`;

// ── Tarjetas y secciones ──
// Sin borde ni sombra en claro (la separación la da el lienzo gris); en oscuro, borde fino, brillo arriba y un degradado leve.
export const TARJETA =
  "rounded-xl border border-borde-tarjeta bg-card shadow-tarjeta dark:bg-[linear-gradient(180deg,color-mix(in_srgb,#fff_2.5%,var(--card)),var(--card)_120px)]";
/** Tarjeta que se eleva 2 px al pasar el mouse (métricas). Con «reducir movimiento» solo cambia la sombra. */
export const TARJETA_ELEVABLE = `${TARJETA} transition-[transform,box-shadow,border-color] duration-(--duracion-media) ease-salida hover:shadow-elevada motion-safe:hover:-translate-y-0.5`;
/** Contenedor de una página (lista o detalle): el ancho máximo del contenido y la separación entre bloques del §4. Todas las páginas lo usan, así ningún detalle queda más angosto o más suelto que otro. */
export const CONTENEDOR_PAGINA = "mx-auto flex w-full max-w-[1520px] min-w-0 flex-col gap-3";
export const TITULO_SECCION = "flex items-center gap-1.5 text-etiqueta font-medium text-muted-foreground";
export const ETIQUETA_DATO = "block text-etiqueta font-medium text-muted-foreground";

// Entrada/salida de cualquier popup posicionado contra un disparador (Select, Combobox, Popover, HoverCard…).
export const ANIMACION_POPUP =
  "origin-(--transform-origin) duration-(--duracion-rapida) ease-salida data-[side=bottom]:slide-in-from-top-1 data-[side=inline-end]:slide-in-from-left-1 data-[side=inline-start]:slide-in-from-right-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

// Panel de sugerencias/opciones de un combobox de búsqueda (Combobox, Autocomplete).
export const POPUP_LISTA =
  "max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto rounded-xl bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-border outline-none";
/**
 * Tono del contador de una pestaña, con el vocabulario de estado del kit (`PillEstado`, `Chip`): `ok`, `aviso`, `error` (rojo), `info` (azul informativo),
 * `acento` (el acento de la paleta del usuario) o `neutro` (por defecto: gris, y con el acento en la pestaña activa).
 */
export type TonoContadorTab = "ok" | "aviso" | "error" | "info" | "acento" | "neutro";
const CONTADOR_TONO_ESTADO = {
  ok: "bg-success text-success-foreground",
  aviso: "bg-warning text-warning-foreground",
  error: "bg-destructive-suave text-destructive-texto",
  info: "bg-info text-info-foreground",
  acento: "bg-accent text-accent-foreground",
} as const;
/**
 * Clases de color del contador de una pestaña (`Tabs`, `TabsRuta`): el tono de estado pedido, o, sin tono / `neutro`, `neutroActivo` (cada componente
 * indica cómo detecta su pestaña activa: `in-data-active:` en `Tabs`, `group-aria-[current=page]:` en `TabsRuta`). Se añade a `CONTADOR_PESTANA`.
 */
export const colorContadorPestana = (tono: TonoContadorTab | undefined, neutroActivo: string): string =>
  tono === undefined || tono === "neutro" ? neutroActivo : CONTADOR_TONO_ESTADO[tono];
