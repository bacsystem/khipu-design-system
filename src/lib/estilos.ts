/**
 * Recetas de clases compartidas (evita copiar la misma cadena en cada componente).
 *
 * Las recetas de controles siguen la escala de alturas de docs/design-system.md §4, una receta por altura y contexto.
 * Si un control necesita otra altura, se usa la receta de esa altura: nunca `cn(RECETA, "h-N")`. Sobrescribir la altura
 * a mano es justo lo que hace que dos controles de la misma fila terminen midiendo distinto.
 */

// ── h-8 · chrome de página: top bar, barra de filtros, acciones sueltas en tarjetas, alertas o estados vacíos ──
// La principal es negra (foreground) para no competir con los colores de estado; el índigo queda para confirmar formularios.
export const ACCION_PRINCIPAL =
  "inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3 text-[12px] font-medium whitespace-nowrap text-background shadow-xs transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const ACCION_SECUNDARIA =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[12px] font-medium whitespace-nowrap text-foreground/80 shadow-2xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
// Select, buscador y refrescar de una barra de filtros: la misma altura que las acciones de arriba.
export const CONTROL_FILTRO = "h-8 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground shadow-2xs";
// El aspecto de CAMPO a h-8: `variante="filtro"` de EntradaFecha/EntradaMonto (barras de filtros y formularios densos).
export const CAMPO_FILTRO =
  "h-8 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:bg-card focus:ring-3 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60";

// ── h-10 · formularios: el campo y su CTA ──
export const CAMPO =
  "h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:bg-card focus:ring-3 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60";
export const ETIQUETA_CAMPO = "text-[12px] font-medium text-foreground";
export const AYUDA_CAMPO = "font-mono text-[11px] text-muted-foreground";

// disabled:pointer-events-none (igual que ui/button.tsx) es lo que de verdad evita que el :hover del mouse
// que se quedó sobre el botón le gane a disabled:opacity-60 en la cascada; cursor-not-allowed solo no basta.
export const BOTON_PRIMARIO =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:opacity-95 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_SECUNDARIO =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground/80 shadow-2xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_DESTRUCTIVO =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3.5 text-sm font-semibold text-destructive-foreground shadow-xs transition-all hover:bg-destructive/90 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

// ── h-9 · solo el pie de diálogo, PanelLateral, TarjetaPaso y Drawer (la excepción documentada de §4) ──
// Los BOTON_* de arriba con la densidad de ese pie (h-9, 13 px); fuera de él no se usan.
export const BOTON_PRIMARIO_PIE =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-[13px] font-semibold text-primary-foreground shadow-xs transition-all hover:opacity-95 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_SECUNDARIO_PIE =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-[13px] font-medium text-foreground/80 shadow-2xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_DESTRUCTIVO_PIE =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-destructive px-3.5 text-[13px] font-semibold text-destructive-foreground shadow-xs transition-all hover:bg-destructive/90 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

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
