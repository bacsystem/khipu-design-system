/** Recetas de clases compartidas por formularios y tarjetas del portal (evita copiar la misma cadena en cada componente). */

export const CAMPO =
  "h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:bg-card focus:ring-3 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60";
export const ETIQUETA_CAMPO = "text-[12px] font-medium text-foreground";
export const AYUDA_CAMPO = "font-mono text-[11px] text-muted-foreground";

export const TARJETA = "rounded-xl border border-border bg-card shadow-2xs";
export const TITULO_SECCION = "flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase";
export const ETIQUETA_DATO = "block text-[11px] font-medium tracking-wider text-muted-foreground/80 uppercase";

// disabled:pointer-events-none (igual que ui/button.tsx) es lo que de verdad evita que el :hover del mouse
// que se quedó sobre el botón le gane a disabled:opacity-60 en la cascada; cursor-not-allowed solo no basta.
export const BOTON_PRIMARIO =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:opacity-95 active:scale-[0.99] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";
export const BOTON_SECUNDARIO =
  "inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground/80 shadow-2xs transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60";

// Entrada/salida de cualquier popup posicionado contra un disparador (Select, Combobox, Popover, HoverCard…).
// Antes se copiaba este mismo string en cada archivo; un ajuste de timing/lado obligaba a tocarlos todos.
export const ANIMACION_POPUP =
  "origin-(--transform-origin) duration-100 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95";

// Panel de sugerencias/opciones de un combobox de búsqueda (Combobox, Autocomplete). Antes se copiaba este
// mismo string en cada archivo; un ajuste de radio/sombra/tamaño máximo obligaba a tocarlos todos.
export const POPUP_LISTA =
  "max-h-72 w-(--anchor-width) min-w-56 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none";
