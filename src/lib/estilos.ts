/**
 * Recetas de clases compartidas (evita copiar la misma cadena en cada componente).
 *
 * Todos los controles miden lo mismo: `h-9` (36 px), la altura única de docs/design-system.md §4. Un botón, un input,
 * un select, un filtro o una acción de fila puestos lado a lado quedan alineados sin pensarlo. Nunca `cn(RECETA, "h-N")`:
 * sobrescribir la altura a mano es justo lo que hace que dos controles de la misma fila terminen midiendo distinto.
 */

// ── Acciones de página: top bar, barra de filtros, acciones sueltas en tarjetas, alertas o estados vacíos ──
// La principal es negra (foreground) para no competir con los colores de estado; el índigo queda para confirmar formularios.
export const ACCION_PRINCIPAL =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-[12px] font-medium whitespace-nowrap text-background shadow-xs transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const ACCION_SECUNDARIA =
  "inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[12px] font-medium whitespace-nowrap text-foreground/80 shadow-2xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
// Select, buscador y refrescar de una barra de filtros: la misma altura que las acciones de arriba.
export const CONTROL_FILTRO = "h-9 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground shadow-2xs";
// Control segmentado de una barra de filtros (Tabs `estilo="segmentado"`, o vistas que son enlaces): caja de h-9 con segmentos de h-7.
// `min-h-9` y no `h-9`: con muchas opciones la caja se parte en filas en vez de desbordarse, y con una sola fila mide igual.
// El segmento activo se marca con `data-active` (Tabs de base-ui) o con `aria-current="page"` (un enlace a la vista actual).
export const SEGMENTADO = "inline-flex min-h-9 w-fit flex-wrap items-center gap-1 rounded-lg border border-border/60 bg-secondary/80 p-0.5";
export const SEGMENTO =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[12px] font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-active:bg-card data-active:text-foreground data-active:shadow-2xs aria-[current=page]:bg-card aria-[current=page]:text-foreground aria-[current=page]:shadow-2xs";

// ── Formularios: el campo y su CTA ──
export const CAMPO =
  "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:bg-card focus:ring-3 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60";
/** @deprecated Desde 0.2.0 todos los campos miden lo mismo: usa `CAMPO`. Se conserva para no romper imports. */
export const CAMPO_FILTRO = CAMPO;
export const ETIQUETA_CAMPO = "text-[12px] font-medium text-foreground";
export const AYUDA_CAMPO = "font-mono text-[11px] text-muted-foreground";

// disabled:pointer-events-none (igual que ui/button.tsx) es lo que de verdad evita que el :hover del mouse
// que se quedó sobre el botón le gane a disabled:opacity-60 en la cascada; cursor-not-allowed solo no basta.
export const BOTON_PRIMARIO =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-xs transition-all hover:opacity-95 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_SECUNDARIO =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground/80 shadow-2xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_DESTRUCTIVO =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3.5 text-[13px] font-semibold text-destructive-foreground shadow-xs transition-all hover:bg-destructive/90 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

// El pie de diálogo, PanelLateral, TarjetaPaso y Drawer ya no tiene una altura propia: usa los mismos botones.
/** @deprecated Desde 0.2.0 es igual a `BOTON_PRIMARIO`. Se conserva para no romper imports. */
export const BOTON_PRIMARIO_PIE = BOTON_PRIMARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_SECUNDARIO`. Se conserva para no romper imports. */
export const BOTON_SECUNDARIO_PIE = BOTON_SECUNDARIO;
/** @deprecated Desde 0.2.0 es igual a `BOTON_DESTRUCTIVO`. Se conserva para no romper imports. */
export const BOTON_DESTRUCTIVO_PIE = BOTON_DESTRUCTIVO;

// ── Tarjetas y secciones ──
export const TARJETA = "rounded-xl border border-border bg-card shadow-2xs";
export const TITULO_SECCION = "flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase";
export const ETIQUETA_DATO = "block text-[11px] font-medium tracking-wider text-muted-foreground/80 uppercase";

// Entrada/salida de cualquier popup posicionado contra un disparador (Select, Combobox, Popover, HoverCard…).
// Antes se copiaba este mismo string en cada archivo; un ajuste de timing/lado obligaba a tocarlos todos.
export const ANIMACION_POPUP =
  "origin-(--transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

// Panel de sugerencias/opciones de un combobox de búsqueda (Combobox, Autocomplete). Antes se copiaba este
// mismo string en cada archivo; un ajuste de radio/sombra/tamaño máximo obligaba a tocarlos todos.
export const POPUP_LISTA =
  "max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none";
