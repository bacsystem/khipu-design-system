---
name: khipu · Design System del portal
version: 2026-09-16
colors:
  background: '#fafafc'
  foreground: '#0f172a'
  card: '#ffffff'
  popover: '#ffffff'
  primary: '#4f46e5'
  primary-light: '#6366f1'
  on-primary: '#ffffff'
  secondary: '#f1f5f9'
  muted: '#f8fafc'
  muted-foreground: '#64748b'
  accent: '#eef2ff'
  accent-foreground: '#4338ca'
  accent-border: 'rgba(199, 210, 254, 0.7)'
  border: '#e2e8f0'
  ring: '#4f46e5'
  success: '#ecfdf5'
  success-foreground: '#047857'
  success-solid: '#10b981'
  warning: '#fffbeb'
  warning-foreground: '#b45309'
  warning-solid: '#f59e0b'
  destructive: '#e11d48'
  destructive-border: 'rgba(254, 205, 211, 0.7)'
  sidebar: '#ffffff'
  sidebar-foreground: '#334155'
  sidebar-accent: '#f8fafc'
  sidebar-border: '#e2e8f0'
  overlay: 'rgba(15, 23, 42, 0.2)'
typography:
  sans: Inter
  mono: JetBrains Mono
rounded:
  base: 0.5rem
  sm: 0.3rem
  md: 0.4rem
  lg: 0.5rem
  xl: 0.7rem
  full: 9999px
---

# khipu · Design System del portal

Catálogo de lo que **realmente está implementado** en `portal/` (Next.js 15 + Tailwind v4 + base-ui). Referencia visual: proyecto Stitch "Next.js UI Redesign", estilo Linear/Stripe (`docs/design/*.html`). Cuando el diseño de Stitch y este documento difieran, manda este documento: es lo que está en el código.

Fuente de verdad de tokens: `portal/src/app/globals.css`. Recetas de clases: `portal/src/lib/estilos.ts`. Componentes base: `portal/src/components/ui/`. Navegación: `portal/src/components/nav/`.

---

## 1. Principios

- **Precisión funcional.** Bordes de 1 px, rellenos tenues, nada decorativo. Cada línea, pill o borde tiene una función operativa.
- **Densidad legible.** RUCs de 11 dígitos, series `F001-00000126`, montos PEN/USD, hashes y UUIDs conviven en tablas sin ruido: monospace y `tabular-nums` para todo lo numérico/identificador.
- **Estados táctiles.** Hover y foco visibles pero sutiles (`hover:bg-muted`, `focus-visible:ring-3 ring-ring/30`). Sin sombras pesadas; profundidad por capas y bordes.
- **Honestidad con el backend.** Lo que la API aún no soporta se muestra **deshabilitado con `title="…: próximamente"`**, nunca como funcionalidad fingida (ver §14).
- **Español peruano.** Textos en español; fechas en zona `America/Lima`; "Set" para septiembre.

---

## 2. Tokens de color

Definidos como variables CSS en `:root` (claro) y `.dark` (oscuro) y expuestos a Tailwind vía `@theme inline` (`bg-card`, `text-muted-foreground`, `border-success-border`, …). **Nunca** usar hex directo en componentes: usar el token.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `background` | `#fafafc` | `#0a0e1a` | Fondo de la app |
| `foreground` | `#0f172a` | `#e2e8f0` | Texto principal |
| `card` / `popover` | `#ffffff` | `#111827` | Tarjetas, tablas, popups |
| `primary` | `#4f46e5` | `#8b83ff` | Acción principal, enlaces, activo |
| `primary-light` | `#6366f1` | `#a29dff` | Gradiente del logo |
| `primary-foreground` | `#ffffff` | `#0a0e1a` | Texto sobre primary |
| `secondary` | `#f1f5f9` | `#1e293b` | Chips neutros, fondos de código serie |
| `muted` | `#f8fafc` | `#161f30` | Cabeceras de tabla, inputs, pie de tabla |
| `muted-foreground` | `#64748b` | `#94a3b8` | Texto secundario, iconos |
| `accent` | `#eef2ff` | `#23294d` | Fila/ítem activo, icono de sección |
| `accent-foreground` | `#4338ca` | `#c3c0ff` | Texto sobre accent |
| `accent-border` | `rgba(199,210,254,.7)` | `rgba(195,192,255,.3)` | Borde de pills primarias |
| `border` / `input` | `#e2e8f0` | `rgba(226,232,240,.12/.16)` | Todos los bordes |
| `ring` | `#4f46e5` | `#8b83ff` | Anillo de foco |
| `success` / `-foreground` / `-border` / `-solid` | `#ecfdf5` / `#047857` / `rgba(167,243,208,.7)` / `#10b981` | `#0f2e24` / `#5fd0a5` / … / `#34d399` | Aceptado, activo, OK |
| `warning` / `-foreground` / `-border` / `-solid` | `#fffbeb` / `#b45309` / `rgba(253,230,138,.7)` / `#f59e0b` | `#33270c` / `#f0c05a` / … / `#fbbf24` | BETA, observaciones, vence pronto |
| `destructive` / `-border` | `#e11d48` / `rgba(254,205,211,.7)` | `#fb7185` / `rgba(251,113,133,.35)` | Rechazado, error, revocar |
| `sidebar*` | blanco / `#334155` / accent `#f8fafc` | `#0d1424` / `#c7d2e0` / accent `#1e293b` | Sidebar y AuthShell |
| `overlay` | `rgba(15,23,42,.2)` | `rgba(0,0,0,.5)` | Fondo de diálogos/sheets |
| `chart-1..5` | indigo, esmeralda, ámbar, rosa, cielo | variantes claras | Gráficos (futuro dashboard) |

Regla de tonos para estado: **verde** = aceptado/activo, **ámbar** = provisional/BETA/observado, **rojo** = error/rechazo/acción destructiva, **neutro** (`secondary` + `muted-foreground`) = en proceso, inactivo, revocado.

---

## 3. Tipografía

- **Inter** (`--font-sans`, también `font-heading`) para UI y títulos. **JetBrains Mono** (`--font-mono`) para todo identificador y número: series, RUC, montos, fechas en tablas, hashes, ids, prefijos de API key, rutas y código.
- Tamaños reales en uso (no hay escala tipográfica abstracta; se usan tamaños fijos):

| Rol | Clases | Dónde |
|---|---|---|
| Título de página (miga) | `font-heading font-semibold text-[13px]` | Top bar (`h1`) |
| Título de diálogo | `text-base font-semibold tracking-tight` | `DialogTitle` |
| Título de sección/tarjeta | `text-[13px] font-semibold text-foreground` | Cabecera de tarjeta |
| Subtítulo de sección | `font-mono text-[11px] text-muted-foreground` | Bajo el título |
| Etiqueta de sección | `text-[10px]/[11px] font-medium tracking-wider uppercase text-muted-foreground` | "TU CUENTA", "TEMA", grupos del sidebar, cabeceras de tabla, métricas (`TITULO_SECCION`, `ETIQUETA_DATO`) |
| Valor de métrica | `font-mono text-lg font-semibold tracking-tight` | Fila de métricas |
| Cuerpo de tabla | `text-[13px]`; celdas mono `text-[12px] tabular-nums` | Tablas |
| Ítems de menú / selector / controles | `text-[12px] font-medium` | `ui/menu`, selector de empresa, botones de barra |
| Texto de ayuda | `text-[11px] text-muted-foreground` (mono si es técnico) | Pies de tarjeta, ayudas de campo |
| Código | `font-mono text-[12px] leading-relaxed` | Bloques `pre` |

Tracking negativo (`tracking-tight`) solo en títulos y valores grandes; `tracking-wider` en etiquetas uppercase.

---

## 4. Espaciado, radios y elevación

- **Base 4 px.** Paddings habituales: `p-1` (popups), `px-2 py-1.5` (ítems), `px-3/px-4 py-2` (celdas), `px-4 py-3` (cabeceras de tarjeta), `px-5 py-4` (cabecera/cuerpo de diálogo), `p-4 md:p-6` (main).
- **Separación entre bloques de página:** `gap-4`. Ancho máximo del contenido: `max-w-[1520px] mx-auto`.
- **Radios** (`--radius: 0.5rem`): `rounded-md` (ítems de menú/selector, chips de serie), `rounded-lg` (botones, inputs, disparadores, iconos de sección), `rounded-xl` (tarjetas, tablas, diálogos), `rounded-full` (pills de estado, avatares de usuario, puntos).
- **Elevación:** `shadow-2xs` en tarjetas y controles; `shadow-xs` en botón primario y avatar; `shadow-md` + `ring-1 ring-foreground/10` en popups; diálogos sobre `bg-overlay` con `backdrop-blur`. Nada más alto que eso.
- **Bordes:** `border-border`; suavizados con `/60`–`/90` para separadores internos (`border-b border-border/60`).

### Escala de alturas

Toda pieza interactiva de una fila (input, botón, disparador, control de tabla) usa una de estas tres alturas — nunca un valor suelto:

| Altura | Uso | Ejemplos |
|---|---|---|
| **`h-7`** (28 px) | Denso: paginación, filas de tabla, controles secundarios pequeños | `PieTabla` (Anterior/Siguiente/números), `SelectorPorPagina`, `MenuAcciones`, `Select` `size="sm"` |
| **`h-8`** (32 px) | Chrome de página: barra de filtros, top bar, botón por defecto | `Button` `default`, `ui/Input`, `SelectTrigger` `default`, `ACCION_PRINCIPAL/SECUNDARIA`, `CONTROL_FILTRO`, tabs `estilo="segmentado"`, `Toolbar` |
| **`h-10`** (40 px) | Campos de formulario y su CTA | `CAMPO` (`Entrada`, `Combobox`, `Autocomplete`, `EntradaFecha`, `EntradaMonto`), `BOTON_PRIMARIO/SECUNDARIO`, `Button` `size="lg"` |

**Excepción documentada:** el **pie de diálogo, de `PanelLateral` y de `TarjetaPaso`** — el footer con `border-t border-border/60 px-5 py-3` que comparten los tres — usa `h-9` (36 px) con texto `text-[13px]`, una densidad intermedia reservada a ese contexto aislado (nunca aparece junto a controles de `h-8`/`h-10` en la misma fila). Un botón o disparador que **no** vive dentro de ese footer (un CTA de estado vacío, un botón suelto en una tarjeta de galería) usa `h-8` si es una acción secundaria/compacta o `h-10` si es la acción principal de un formulario — nunca `h-9` fuera de esos tres footers. Fuera de esa excepción, si dos controles conviven en una misma fila deben compartir la misma altura de la tabla de arriba; nunca mezclar `h-8` con `h-9`/`h-10` en una barra de filtros o toolbar.

---

## 5. Layout (shell privado)

`src/app/(privado)/layout.tsx`:

```
┌──────────────┬────────────────────────────────────────────┐
│ Sidebar      │ Top bar (h-14, sticky, bg-card/80 blur)    │
│ w-60 sticky  ├────────────────────────────────────────────┤
│ h-screen     │ main  p-4 md:p-6  overflow-x-auto           │
│ (md+)        │   ┌ fila de métricas ─────────────────┐    │
│              │   ├ tabla / tarjetas (gap-4) ─────────┤    │
│              │   └───────────────────────────────────┘    │
└──────────────┴────────────────────────────────────────────┘
```

- **Desktop (md ≥ 768):** sidebar fijo de **240 px** (`w-60`), `border-r border-sidebar-border`, `overflow-y-auto`.
- **Móvil:** el sidebar se oculta; la top bar muestra un botón hamburguesa que abre el mismo `SidebarContent` en un `Sheet` lateral (`nav/mobile-nav.tsx`).
- **Contenido:** `grid grid-cols-1 gap-4 max-w-[1520px] mx-auto min-w-0`. Las tablas pueden desbordar horizontalmente dentro de su contenedor (`overflow-hidden rounded-xl` + `Table` con scroll), la página nunca.

---

## 6. Sidebar (`nav/sidebar-content.tsx`)

De arriba abajo:

1. **Cabecera (h-14, `border-b`)**: `LogoMarca` (icono 32 px con gradiente `from-primary to-primary-light`, tres nudos de khipu, texto "khipu" + ".pe" en primary) y chip `UBL 2.1` (mono 10 px, `bg-secondary`).
2. **Selector de empresa** (`nav/empresa-selector.tsx`): tarjeta `rounded-lg border-border/60 bg-muted/80 p-2`, avatar cuadrado 24 px `bg-primary` con inicial, razón social 12 px + `RUC …` mono 10 px, `ChevronsUpDown`. Popup del **mismo ancho que el disparador** (`w-(--anchor-width)`), etiqueta "CAMBIAR DE EMPRESA", filas con `data-highlighted:bg-accent/70`, check en primary a la derecha.
3. **Navegación** (`nav/sidebar-nav.tsx`): grupos con etiqueta uppercase 10 px ("EMISIÓN & SUNAT", "CONFIGURACIÓN"). Ítem: `rounded-md px-2.5 py-1.5 text-[13px]`, icono lucide 18 px. Estados: activo → `bg-sidebar-primary text-sidebar-primary-foreground`, icono en primary y punto `size-1.5 bg-primary` a la derecha; hover → `bg-sidebar-accent`; **pendiente** → texto `muted-foreground/50`, `cursor-not-allowed`, chip `PRONTO` (9 px uppercase, `bg-secondary`).
4. **Pie (`border-t p-3`)**: tarjeta "Plan y consumo" deshabilitada (barra de progreso vacía, `— / —`, `opacity-60`, `title` próximamente) y el **menú de usuario** (§7).

## 7. Menú de usuario (`nav/perfil-usuario.tsx` + `ui/menu.tsx`)

- **Disparador**: misma tarjeta que el selector de empresa (avatar 24 px `bg-primary` con iniciales del correo, nombre 12 px, correo mono 10 px, `ChevronsUpDown`; `data-popup-open:bg-secondary`).
- **Popup** (`side="top"`, ancho = disparador, `min-w-0`): 
  - "TU CUENTA" + fila resaltada `bg-accent/70` con avatar, nombre, correo completo (mono, `break-all`) y rol en su propia línea (`Administrador` / `Emisor` / `Solo lectura`), icono `ShieldCheck` en primary.
  - "TEMA" + `ThemeToggle conTexto`: control segmentado a todo el ancho, tres opciones con icono 12 px + etiqueta 12 px (**Claro · Oscuro · Sistema**), activa con `bg-card shadow-2xs`.
  - Ítems: `Cambiar contraseña` (abre diálogo que envía el enlace de restablecimiento al correo de la sesión), `Documentación API` (`/developers`, pestaña nueva).
  - `Cerrar sesión` en variante `destructive` (rojo, hover `bg-destructive/10`).
- **`ui/menu.tsx`** (wrapper de base-ui `Menu`): `MenuContent` (`rounded-lg bg-popover p-1 shadow-md ring-1 ring-foreground/10`, animación scale/opacity 150 ms), `MenuItem` (`rounded-md px-2 py-1.5 text-[12px] font-medium`, iconos `size-3.5 text-muted-foreground`, highlight `bg-accent/70`), `MenuLinkItem`, `MenuRadioGroup`/`MenuRadioItem` (check a la derecha), `MenuGroupLabel` (uppercase 10 px), `MenuSeparator` (`-mx-1 my-1 h-px bg-border/70`). Es el menú a reutilizar para "más acciones" (⋯) de tablas.

---

## 8. Top bar (`nav/top-bar.tsx`)

`sticky top-0 z-20 h-14 border-b border-border/80 bg-card/80 backdrop-blur px-4 md:px-6`, dos zonas:

**Izquierda** (`min-w-0`, nunca se desborda sobre el resto): hamburguesa (solo móvil) → **miga** `Sección / Página` (`text-[13px]`, sección en `muted-foreground/80`, página en `font-heading font-semibold`; `overflow-hidden` para que no pise los pills) → separador vertical `h-4 w-px bg-border` → pill **OSE** (deshabilitada, "sin monitoreo", `opacity-60`, próximamente) → pill de **entorno**: `BETA Sunat` (`border-warning-border bg-warning text-warning-foreground`, punto ámbar) o `Producción` (`bg-foreground text-background`, punto verde).

**Derecha** (`shrink-0`): buscador deshabilitado (`w-64`, `⌘K`, solo `lg+`) → separador → `Exportar` deshabilitado (`sm+`) → **acciones contextuales por ruta**:

| Ruta | Secundarias (`ACCION_SECUNDARIA`) | Principal (`ACCION_PRINCIPAL`) |
|---|---|---|
| `/comprobantes` | — | `Nueva factura` (deshabilitada: se emite por API) |
| `/series` | `Referencia técnica` | `Nueva serie` |
| `/empresa` | `Referencia técnica`, `Probar conexión SUNAT` (deshab.) | `Nueva empresa` |
| `/api-keys` | `Referencia técnica`, `Prueba de emisión` | `Crear API key` |

Regla de espacio: máximo **dos secundarias + una principal**; lo que no cabe va dentro de un diálogo (p. ej. "Documentación API" vive en el pie de los diálogos de API keys). Breakpoints de ocultación: `hidden lg:inline-flex` según prioridad (no `sm`/`md`: el sidebar fijo de 240 px aparece en `md`, así que entre 768–1023 px el ancho real disponible es angosto y cualquier cosa que se revele antes de `lg` compite con la miga y puede solaparse con las acciones).

Recetas (en `top-bar.tsx`):
- `ACCION_PRINCIPAL`: `h-8 rounded-lg bg-foreground text-background px-3 text-[12px] font-medium shadow-xs hover:bg-foreground/90` (negro/blanco según tema; **no** primary, para no competir con los estados).
- `ACCION_SECUNDARIA`: `h-8 rounded-lg border border-border bg-card px-2.5 text-[12px] font-medium text-foreground/80 shadow-2xs hover:bg-muted hover:text-foreground`.

El selector de tema **no** está en la top bar: vive en el menú de usuario.

---

## 9. Botones

### `ui/button.tsx` (cva)
Base: `inline-flex items-center rounded-lg text-sm font-medium transition-all focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:opacity-50`.

| Variante | Estilo | Uso |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` | CTA en formularios públicos/onboarding |
| `outline` | `border-border bg-background hover:bg-muted` | Acciones secundarias en formularios |
| `secondary` | `bg-secondary` | Neutro |
| `ghost` | solo hover `bg-muted` | Iconos (hamburguesa, refrescar) |
| `destructive` | `bg-destructive/10 text-destructive hover:bg-destructive/20` | Acciones irreversibles |
| `link` | `text-primary hover:underline` | Enlaces inline |

Tamaños: `xs` (h-6), `sm` (h-7), `default` (h-8), `lg` (h-10, misma altura que `BOTON_PRIMARIO`); iconos `icon-xs` (24), `icon-sm` (28), `icon` (32), `icon-lg` (40).

### Recetas de `lib/estilos.ts` (formularios y diálogos)
- `BOTON_PRIMARIO`: `h-10 rounded-lg bg-primary text-primary-foreground px-3.5 text-sm font-semibold shadow-xs hover:opacity-95 active:scale-[0.99]`. En diálogos se usa `h-9 text-[13px]`.
- `BOTON_SECUNDARIO`: `h-10 rounded-lg border border-border bg-card px-3.5 text-sm font-medium text-foreground/80 shadow-2xs hover:bg-muted`.
- Cierre de diálogos informativos: botón `bg-foreground text-background` ("Entendido").

### Acciones dentro de tablas
`inline-flex h-7 rounded-md px-2 text-[12px] font-medium` + icono 14 px: neutras en `text-muted-foreground`, destructivas en `text-destructive hover:bg-destructive/10`, separadas por `|` (`text-border`). Iconos-botón de fila: `size-6` (`ACCION` en series/comprobantes), visibles al 80 % y al 100 % en hover de la fila (`group-hover`).

### Botón copiar (`comprobantes/boton-copiar.tsx`)
Icono `Copy` → `Check` 1,5 s, `p-0.5 rounded text-muted-foreground/70 hover:bg-secondary`; en filas aparece con `opacity-0 group-hover:opacity-100`.

### Botón deshabilitado + hover (regla obligatoria)
Toda receta que combine un `hover:` con `disabled:opacity-*` **debe** incluir también `disabled:pointer-events-none` (como ya hace `ui/button.tsx`). Sin eso, si el mouse queda sobre el botón cuando pasa a deshabilitado (el caso típico: usuario hace click y el botón se deshabilita bajo el cursor), el `:hover` y el `:disabled` empatan en especificidad y cuál gana depende del orden de generación del CSS — a veces el botón se ve casi sin atenuar aunque esté deshabilitado. `pointer-events-none` corta el `:hover` de raíz. Ya aplicado en `BOTON_PRIMARIO`/`BOTON_SECUNDARIO`, `ACCION_PRINCIPAL`/`ACCION_SECUNDARIA`, tabs, `ConfirmacionEnLinea`, `DialogoConfirmacion` y `SelectorContexto`.

### `BotonAsync` (`patrones/boton-async.tsx`)
Envoltorio de un `<button>` nativo para acciones que llaman a un backend: `pendiente` cambia el icono por `Spinner`, cambia el texto a `textoPendiente` y deshabilita. Agnóstico de receta — la clase (`BOTON_PRIMARIO`, `ACCION_PRINCIPAL`…) se pasa igual que a un botón normal.

---

## 10. Formularios

- **Campo** (`CAMPO`): `h-10 rounded-lg border border-border bg-muted px-3 text-sm`; foco `border-ring bg-card ring-3 ring-ring/30`; deshabilitado `opacity-60 cursor-not-allowed`.
- **Etiqueta** (`ETIQUETA_CAMPO`): `text-[12px] font-medium`. **Ayuda** (`AYUDA_CAMPO`): `font-mono text-[11px] text-muted-foreground`. Error: `text-sm text-destructive` bajo el campo.
- **Dato de solo lectura** (`Dato` en `/empresa`): etiqueta uppercase (`ETIQUETA_DATO`) + caja `h-9 rounded-lg border bg-muted px-3 font-mono text-[13px]`; si el dato no existe todavía, caja con `—` y `cursor-not-allowed` + `title` explicando.
- **Select** (`ui/select.tsx`, base-ui): disparador `h-8 rounded-lg border-border bg-card text-[12px] font-medium shadow-2xs` (`size="sm"` → `h-7`) con `ChevronDown`; popup alineado al disparador, ítems con check.
- **Selector de filas** (`ui/selector-por-pagina.tsx`): grupo `h-7 rounded-md border bg-card p-0.5` con `10 · 20 · 50`, activo `bg-foreground text-background`.
- Validación con zod + react-hook-form; mensajes de error desde `lib/messages.ts` (`mensajeError(codigo)`).
- **Archivo (.p12/.pfx)** en `/empresa`: input de archivo + clave, feedback con vigencia del certificado (pill verde/ámbar/rojo según días restantes).

---

## 11. Tarjetas y secciones

- **Tarjeta** (`TARJETA`): `rounded-xl border border-border bg-card shadow-2xs`. Variante suave en diálogos: `border-border/80`.
- **Cabecera de sección**: `flex items-center gap-2.5 px-4 py-3 border-b border-border/60` → icono en caja `size-8 rounded-lg bg-accent text-primary` (lucide 16 px) + título 13 px semibold + subtítulo mono 11 px; a la derecha, chips/contadores (`rounded border bg-muted px-2 py-0.5 font-mono text-[11px]`).
- **Pie de tarjeta**: `border-t border-border/60 bg-muted/60 px-4 py-2 font-mono text-[11px] text-muted-foreground`, con iconos 12 px (`Lock`, `KeyRound`).
- **Fila de métricas** (cabecera de cada página): una tarjeta `px-5 py-3 shadow-xs` con `grid grid-cols-2 lg:grid-cols-4 lg:divide-x`; cada `Metrica` = etiqueta uppercase 11 px → valor mono `text-lg font-semibold` (con sufijo `text-[12px] font-normal text-muted-foreground`, p. ej. `/ 5 creadas`) → ayuda 11 px con punto de estado (`size-1.5 rounded-full bg-success-solid|warning-solid|destructive`).
- **Tarjeta deshabilitada / próximamente**: `opacity-60`/`70`, `cursor-not-allowed`, chip `PRÓXIMAMENTE` (mono 10 px uppercase) y `title`.

---

## 12. Tablas (`ui/table.tsx` + patrón de página)

Todas las listas (comprobantes, series, API keys) siguen el mismo esqueleto:

1. **Barra de filtros** (`flex flex-wrap justify-between gap-3`): a la izquierda pestañas segmentadas (`h-8 rounded-lg border-border/60 bg-secondary/80 p-1`, activa `bg-card shadow-2xs`) o cabecera con icono; a la derecha `Select`s de filtro (`CONTROL_FILTRO`: `h-8 rounded-lg border bg-card text-[12px] font-medium shadow-2xs`), filtros aún no soportados como botones deshabilitados, y botón **refrescar** (`size-8`, icono gira mientras `useTransition` está pendiente) — todo a `h-8` para alinear con el `Select` de la misma barra.
2. **Contenedor**: `overflow-hidden rounded-xl border border-border/90 bg-card shadow-2xs`; `opacity-60` mientras refresca.
3. **Cabecera**: `bg-muted border-b border-border/80`, celdas `px-3 py-2 text-[11px] font-semibold tracking-wider uppercase text-muted-foreground/80`; primera columna checkbox deshabilitado (selección múltiple próximamente).
4. **Filas**: `group border-b border-border/60 hover:bg-muted/80`, `text-[13px]`; celda principal con dos líneas (valor fuerte + subtítulo mono 11 px); identificadores en chip `rounded bg-secondary px-2 py-0.5 font-mono font-semibold text-primary` (inactivos: `bg-muted text-muted-foreground line-through`); numéricos a la derecha con `tabular-nums`; estado con pill (§13); acciones a la derecha.
5. **Vacío**: fila única `py-14 text-center` con icono 24 px y mensaje ("Todavía no tienes… Crea la primera con «…»" / "No hay … con los filtros seleccionados").
6. **Pie**: `border-t border-border/60 bg-muted px-4 py-2 text-[12px]` → "Mostrando **x–y** de **N** …" · selector de filas · nota contextual (`hidden xl:inline`) | paginación (`Anterior` / números `size-7` con actual `bg-foreground text-background` / `Siguiente`), con `paginasVisibles()` de `lib/paginacion.ts` (1, 2, …, actual±1, …, últimas 2).

Filtrado/paginación en cliente cuando la API devuelve todo (series, API keys); en servidor con `?pagina=&por_pagina=` y `x-total-count` para comprobantes.

---

## 13. Pills, badges y estados

- **Pill de estado** (`comprobantes/estado-badge.tsx` y equivalentes): `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap` + punto `size-1.5 rounded-full`.

| Tono | Clases | Estados SUNAT / entidades |
|---|---|---|
| Verde | `border-success-border bg-success text-success-foreground`, punto `bg-success-solid` | `ACEPTADO` ("Aceptado con CDR" si trae CDR), serie/llave **Activa**, credenciales OK |
| Ámbar | `border-warning-border bg-warning text-warning-foreground`, punto `bg-warning-solid` | `ACEPTADO_CON_OBS`, BETA, certificado por vencer |
| Rojo | `border-destructive-border bg-destructive/10 text-destructive`, punto `bg-destructive` | `RECHAZADO`, `INVALIDO`, `ERROR_ENVIO`, vencido |
| Neutro | `border-border bg-secondary text-muted-foreground`, punto `bg-muted-foreground/50` | `RECIBIDO`, `FIRMADO`, `ENVIADO`, `PENDIENTE_AGRUPACION`, `ANULADO`, **Inactiva**, **Revocada** |

- **Chips informativos**: `rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground` (contadores, "id: 193f4b35", `UBL 2.1`).
- **Chip de tipo de comprobante**: caja `size-7 rounded bg-accent font-mono text-[11px] font-semibold text-primary` con el código (`01`, `03`, `07`, `08`).
- **Etiqueta PRONTO / PRÓXIMAMENTE**: `rounded bg-secondary px-1 py-0.5 text-[9px]/[10px] font-medium tracking-wide uppercase`.
- **Entorno**: ver §8. **Rol**: texto plano bajo el correo en el menú de usuario.
- `ui/badge.tsx` (cva: `default | secondary | destructive | outline | ghost | link`) es la base; las pills anteriores lo extienden con `gap-1.5 border px-2.5 py-1 text-[11px]`.

---

## 14. Patrón "próximamente"

Toda función visible en el diseño de Stitch que el backend aún no soporta se deja **presente pero deshabilitada**, para que el layout ya sea el definitivo:

- `disabled` + `title="<Función>: próximamente"` (y, si aplica, la razón: "requiere filtro por serie en la API").
- Estilo: `text-muted-foreground`, `opacity-60`, `cursor-not-allowed`; nunca ocultar el control.
- Ejemplos: búsqueda global ⌘K, Exportar, monitoreo OSE, pestañas por tipo, filtro por período/serie, selección múltiple, PDF, "Regenerar" llave, webhooks, plan y consumo, emisión manual, catálogo.

---

## 15. Diálogos (`ui/dialog.tsx`, base-ui)

Estructura fija: `DialogContent className="gap-0 p-0"` →
- **Cabecera** `border-b border-border/60 px-5 py-4 pr-14`: icono en caja `size-8 rounded-lg bg-accent text-primary` + `DialogTitle` (16 px semibold) + `DialogDescription` (13 px).
- **Cuerpo** `px-5 py-4` (formularios: `grid gap-4`; referencias: `@container bg-muted/40` con `grid @3xl:grid-cols-2`).
- **Pie** `border-t border-border/60 px-5 py-3 flex justify-end gap-2` (o `justify-between` si lleva un enlace a la izquierda).

Tres familias:
1. **Formulario** (Nueva serie, Nueva empresa): campos con las recetas de §10; `Cancelar` secundario + primario `h-9`.
2. **Secreto de un solo uso** (Nueva API key): paso 1 explicación + "Generar llave"; paso 2 `code` con `select-all`, botón Copiar (pasa a verde "Copiada") y aviso ámbar (`border-warning-border bg-warning`) "no volverá a mostrarse"; al cerrar `router.refresh()`.
3. **Referencia técnica / ejemplo** (Series, Empresa, API keys, Prueba de emisión): ancho `min(1200px, 100vw - 3rem)`, dos tarjetas (modelo de datos en tabla de campos `campo · tipo · descripción` con icono `KeyRound` ámbar en claves; reglas/formatos en filas `rounded-lg border-border/60 bg-muted/40`), pie con enlace a `/developers` y botón "Entendido".

Confirmaciones irreversibles **no** usan diálogo: se confirman **en línea** dentro de la fila ("¿Revocar de forma permanente? [Sí, revocar] [Cancelar]").

---

## 16. Código y datos técnicos

- **Barra de endpoint**: `bg-muted border-b px-4 py-2` con chip de método (`rounded bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary-foreground`), URL mono 12 px truncada, pestañas de lenguaje (`cURL · Node.js / TS · Python`, control segmentado `h-7`) y botón copiar.
- **Bloque de código**: `pre` con `bg-[oklch(0.18_0.02_265)] text-[oklch(0.9_0.01_265)] p-4 font-mono text-[12px] leading-relaxed max-h-[52vh] overflow-auto` (siempre oscuro, en ambos temas). Respuestas JSON: `bg-muted/40 text-foreground`.
- **Vista previa XML/CDR** (`comprobantes/vista-previa.tsx`): pestañas XML/CDR, `formatearXml()`, botón "Descargar XML/ZIP".
- **Hash / UUID**: mono, `truncate` con `title` completo; ids acortados a 8 caracteres en listados.

---

## 17. Navegación pública y auth

- **AuthShell** (`auth/auth-shell.tsx`): `grid md:grid-cols-2`; panel izquierdo `bg-sidebar text-sidebar-foreground px-12 py-12` con marca, titular `font-heading text-3xl text-balance`, subtítulo al 70 % y pie al 50 %; panel derecho con el formulario (login, registro, recuperar, restablecer) usando las recetas de §10 y `Button default`.
- **Landing** (`/`): hero con la secuencia real de emisión (validar → firmar → SUNAT → CDR) como SVG; header público con logo, Precios, Iniciar sesión / Ir al panel.
- **Developers** (`/developers`): referencia Scalar temada con los tokens (sin marca de Scalar), header propio (Logo → inicio, Precios, Iniciar sesión / Ir al panel; abren en pestaña nueva) y botón "Generar API key de prueba" con sesión.
- **Onboarding** (3 pasos): empresa → certificado → credenciales SOL, mismos componentes que `/empresa`.

---

## 18. Tema, iconografía y formato

- **Tema**: `next-themes` con `class` en `<html>`; opciones Claro / Oscuro / Sistema en el menú de usuario. Componentes que dependen del tema en cliente (`ThemeToggle`) pintan sin selección hasta montar para no romper la hidratación.
- **Iconos**: lucide-react. 18 px en el sidebar, 16 px en botones y cabeceras, 14 px en acciones de fila y menús, 12 px en pies/ayudas. Color por defecto `text-muted-foreground`; primary solo para el activo o el icono de sección.
- **Fechas**: `formatearFecha("2026-09-15") → "15 Set 2026"`; `formatearFechaHora(iso) → "15 Set 2026, 10:32"` en zona Lima (`lib/formato.ts`). **Montos**: `S/ 2,000.00` / `$ 5.00` (`formatearMonto`). **Correlativos**: 8 dígitos con ceros (`F001-00000126`).
- **Accesibilidad**: todo disparador de menú/diálogo con `aria-label`; controles segmentados como `radiogroup`; `sr-only` para etiquetas de iconos; foco visible con `ring-ring`.

---

## 19. Inventario de componentes

| Carpeta | Componentes |
|---|---|
| `components/ui` | `avatar`, `badge`, `button`, `card`, `dialog`, `drawer`, `grupo-botones`, `hover-card`, `input`, `kbd`, `label`, `menu`, `pagination`, `popover`, `scroll-area`, `select`, `selector-por-pagina`, `separator`, `sheet`, `table`, `toolbar` |
| `components/nav` | `logo`, `sidebar-content`, `sidebar-nav`, `empresa-selector`, `perfil-usuario`, `theme-toggle`, `top-bar`, `mobile-nav` |
| `components/comprobantes` | `comprobantes-table`, `estado-badge`, `boton-copiar`, `vista-previa`, `reenviar-button` |
| `components/series` | `series-table`, `nueva-serie-dialog`, `nueva-serie-form`, `referencia-series` |
| `components/empresa` | `certificado-form`, `credenciales-sol-form`, `nueva-empresa-dialog`, `nueva-empresa-form`, `referencia-empresa` |
| `components/api-keys` | `api-keys-table`, `nueva-api-key-dialog`, `referencia-api-keys`, `ejemplo-integracion` |
| `components/auth` | `auth-shell`, `login-form`, `registro-form`, `recuperar-form`, `restablecer-form` |
| `components/developers` | `developers-view`, `api-reference` |
| `lib` | `estilos.ts` (recetas), `formato.ts`, `paginacion.ts`, `messages.ts` |

## 20. Kit reutilizable

Todo lo anterior es este mismo repo (`khipu-design-system`), pensado para copiarse a otro proyecto Next.js 15 + Tailwind v4, sin rutas ni textos de khipu, y ampliado con cuatro grupos que el portal de origen todavía no usa pero que cualquier app necesita. Se instala componente por componente con la CLI (`cli/khipu.mjs list` / `add`, ver README §Usarlo en tu proyecto) en vez de copiar la carpeta entera a mano:

| Grupo | Componentes |
|---|---|
| `feedback/` | `ToastProvider` + `useToast()`, `Tooltip`, `Alerta`, `Banner`, `Skeleton*`, `EstadoVacio`, `Spinner`, `ProgresoLineal`, `ProgresoCircular` |
| `formularios/` | `Campo`, `Entrada`, `AreaTexto`, `Formulario`, `Casilla`, `Interruptor`, `GrupoOpciones`, `Combobox`, `Autocomplete`, `Contrasena`, `Deslizador`, `EntradaFecha`, `EntradaRangoFechas`, `EntradaMonto`, `ZonaArchivos`, `Buscador`, `StepperNumerico` |
| `navegacion/` | `Tabs`, `Pasos` + `TarjetaPaso`, `PanelLateral`, `Acordeon`, `MenuAcciones` (⋯), `DialogoConfirmacion`, `Paleta` (⌘K) |
| `datos/` | `TablaDatos<T>`, `Timeline`, `ListaDatos`, `Kpi` + `Sparkline`, `GraficoBarras`, `GraficoLineas` |

Los gráficos usan `--chart-1..5`; en oscuro los pasos son `#7b72f0 #27a070 #bf8a26 #dc4a68 #3a88c6` (validados para daltonismo y contraste sobre `#111827`).

`components/ui` sumó `Avatar` + `AvatarGroup` (sobre `base-ui/avatar`; `rounded-full`, ver §4) y `Popover` + `PopoverHeader` (sobre `base-ui/popover`, misma familia visual que `SelectContent` — úsalo para contenido rico que no cabe en un `Tooltip`, como filtros avanzados o una ficha de usuario).

Quinto lote: `Separator` (sobre `base-ui/separator`; en vertical necesita una altura explícita en `className`, no tiene tamaño propio en ese eje — reemplaza el `<div className="h-4 w-px bg-border">` que se armaba a mano en `TopBar`), `Kbd` (extraído del mismo patrón ad hoc que ya usaban `TopBar` y `Paleta`), `GrupoBotones` (sobre `base-ui/toggle-group` + `toggle`; la versión con teclado — flechas entre opciones — del control segmentado que hoy se repite a mano en `SelectorPorPagina`, `ThemeToggle` y `Tabs estilo="segmentado"`; úsalo controlado para que no se pueda "apagar" la única opción activa) y `Contrasena` (en `formularios/`: mostrar/ocultar + medidor de fuerza opcional sobre `base-ui/meter`, heurística de longitud/variedad de caracteres — no reemplaza validación real de backend).

`formularios/` sumó también `StepperNumerico` (sobre `base-ui/number-field`) y `EntradaRangoFechas` (dos `EntradaFecha` con atajos Hoy/7 días/30 días/Este mes).

`datos/TablaDatos<T>` ya no tiene la selección múltiple "próximamente" que describe §12 para el portal de origen: acepta una prop `seleccion` (`{ seleccionados, onCambio, acciones }`) que activa la columna de checkboxes, el estado indeterminado de "seleccionar todo" (solo la página visible) y una barra de acciones masivas sobre la tabla. Nótese además que `ListaDatos` **es** el patrón "lista de definición" (`dt`/`dd` etiqueta/valor) — no hace falta un componente aparte para eso.

Sexto lote: `HoverCard` (sobre `base-ui/preview-card`; su disparador es un `<a>` por defecto — pensado para previsualizar un enlace —, pero con `render` toma la forma de lo que le pases, igual que `Tooltip`; solo con hover/foco, sin clic, para fichas de vista previa que no necesitan la acción inmediata de un `Popover`), `ScrollArea` (sobre `base-ui/scroll-area`; scrollbar propio del kit en vez del nativo, `alto` obligatorio), `Deslizador` (en `formularios/`, sobre `base-ui/slider`; un valor o un rango de dos manijas con `valor` como tupla) y `Banner` (en `feedback/`; aviso de ancho completo para el `Shell`, sobre `TopBar` y no dentro de `main` — a diferencia de `Alerta`, que es una banda con esquinas dentro de una página).

Séptimo lote: `Autocomplete` (en `formularios/`, sobre `base-ui/autocomplete`; a diferencia de `Combobox`, no fuerza a elegir un valor de la lista — `value`/`onValueChange` son el texto libre, y clic en una sugerencia solo lo rellena), `Toolbar` (sobre `base-ui/toolbar`; barra de controles agrupados con foco por flechas entre ellos — contenedor `h-8`/`p-1` con botones internos `size-6`, el mismo patrón de `GrupoBotones` y `Tabs estilo="segmentado"`) y `Drawer` (sobre `base-ui/drawer`; hoja inferior para móvil con arrastre nativo para cerrar, a diferencia de `Sheet` que solo anima entrada/salida sin gesto de arrastre).

### Pendientes

- Adoptar en el portal los componentes del kit que reemplazan código ad hoc (tooltip real, toasts, menú ⋯ de filas, `TablaDatos`).
- Rail colapsado de 64 px para tablet (hoy: sidebar completo en `md+`, sheet en móvil).
- Gráficos del dashboard del portal (etapa 2) con `GraficoBarras`/`GraficoLineas`.
