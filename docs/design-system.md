---
name: khipu · Design System del portal
version: 2026-10-31
colors:
  background: '#fbfbfc'
  foreground: '#18181b'
  card: '#ffffff'
  popover: '#ffffff'
  primary: '#5b5bd6'
  primary-light: '#7373e0'
  on-primary: '#ffffff'
  secondary: '#f4f4f5'
  muted: '#f7f7f8'
  muted-foreground: '#6b6b76'
  accent: '#f0f0fd'
  accent-foreground: '#4747c2'
  accent-border: 'rgba(91, 91, 214, 0.22)'
  border: '#e8e8ec'
  ring: '#5b5bd6'
  success: '#edfaf3'
  success-foreground: '#0f7b4f'
  success-solid: '#16a34a'
  warning: '#fef8ec'
  warning-foreground: '#a15c07'
  warning-solid: '#f59e0b'
  destructive: '#dc2547'
  destructive-border: 'rgba(220, 37, 71, 0.2)'
  destructive-suave: '#fdeef1'
  destructive-texto: '#b91c3c'
  codigo: '#0f0f14'
  codigo-foreground: '#e4e4e9'
  sidebar: '#fbfbfc'
  sidebar-foreground: '#3f3f46'
  sidebar-accent: '#f2f2f4'
  sidebar-border: '#e8e8ec'
  overlay: 'rgba(10, 10, 15, 0.32)'
typography:
  sans: Geist
  mono: Geist Mono
rounded:
  base: 0.5rem
  sm: 0.3rem
  md: 0.4rem
  lg: 0.5rem
  xl: 0.75rem
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
| `background` | `#fbfbfc` | `#0b0b0f` | Fondo de la app |
| `foreground` | `#18181b` | `#ededf0` | Texto principal; acción principal de página (`bg-foreground`) |
| `card` | `#ffffff` | `#131318` | Tarjetas, tablas |
| `popover` | `#ffffff` | `#18181e` | Popups, menús |
| `primary` | `#5b5bd6` | `#8585f2` | Enlaces, activo, confirmar formularios |
| `primary-foreground` | `#ffffff` | `#0b0b0f` | Texto sobre primary |
| `primary-light` | `#7373e0` | `#a3a3f7` | Solo decorativo (logo) |
| `secondary` / `-foreground` | `#f4f4f5` / `#18181b` | `#1c1c22` / `#ededf0` | Chips neutros, hover de controles |
| `muted` | `#f7f7f8` | `#16161b` | Cabeceras de tabla, inputs, pie de tabla |
| `muted-foreground` | `#6b6b76` | `#9b9ba6` | Texto secundario, iconos |
| `accent` / `-foreground` | `#f0f0fd` / `#4747c2` | `#1e1e33` / `#b4b4fa` | Fila/ítem activo, icono de sección |
| `accent-border` | `rgba(91,91,214,.22)` | `rgba(133,133,242,.28)` | Borde de pills primarias |
| `destructive` / `-foreground` | `#dc2547` / `#ffffff` | `#fb6f8a` / `#0b0b0f` | Botón destructivo, texto de error sobre card |
| `destructive-border` | `rgba(220,37,71,.2)` | `rgba(251,111,138,.3)` | Borde de avisos de error |
| `destructive-suave` / `destructive-texto` | `#fdeef1` / `#b91c3c` | `#2a1a20` / `#fb6f8a` | Fondo y texto de pills, chips y alertas de error |
| `success` / `-foreground` / `-border` / `-solid` | `#edfaf3` / `#0f7b4f` / `rgba(15,123,79,.18)` / `#16a34a` | `#0f2a1f` / `#4fd19a` / `rgba(79,209,154,.25)` / `#34d399` | Aceptado, activo, OK |
| `warning` / `-foreground` / `-border` / `-solid` | `#fef8ec` / `#a15c07` / `rgba(161,92,7,.18)` / `#f59e0b` | `#2e2410` / `#f2c25c` / `rgba(242,194,92,.25)` / `#fbbf24` | BETA, observaciones, vence pronto |
| `border` | `#e8e8ec` | `rgba(255,255,255,.08)` | Todos los bordes |
| `input` | `#dedee3` | `rgba(255,255,255,.12)` | Borde de inputs, hover de controles secundarios |
| `ring` | `#5b5bd6` | `#8585f2` | Anillo de foco |
| `overlay` | `rgba(10,10,15,.32)` | `rgba(0,0,0,.6)` | Fondo de diálogos/sheets |
| `brand` / `-foreground` | `#5b5bd6` / `#ffffff` | `#8585f2` / `#0b0b0f` | Logo y marca |
| `codigo` / `-foreground` | `#0f0f14` / `#e4e4e9` | `#0f0f14` / `#e4e4e9` | Fondo de `BloqueCodigo` en ambos modos |
| `chart-1` | `#5b5bd6` | `#7b72f0` | Serie principal de gráficos |
| `chart-2..5` | sin cambio | sin cambio | Series secundarias |
| `sidebar` | `#fbfbfc` (igual al fondo) | `#0b0b0f` | Sidebar y AuthShell |
| `sidebar-foreground` | `#3f3f46` | `#c4c4cc` | Texto del sidebar |
| `sidebar-primary` / `-foreground` | `#ededf5` / `#3c3cb0` | `#1e1e33` / `#b4b4fa` | Ítem activo del sidebar |
| `sidebar-accent` / `-foreground` | `#f2f2f4` / `#18181b` | `#16161b` / `#ededf0` | Hover del sidebar |
| `sidebar-border` / `-ring` | `#e8e8ec` / `#5b5bd6` | `rgba(255,255,255,.08)` / `#8585f2` | Borde y foco del sidebar |

El sidebar comparte el color del fondo, como en Linear: lo separa el borde y no un bloque blanco.

Contraste WCAG calculado en el comentario de `:root` de globals.css; `npm run check:contraste` falla si un par baja de 4.5.

Regla de tonos para estado: **verde** = aceptado/activo, **ámbar** = provisional/BETA/observado, **rojo** = error/rechazo/acción destructiva, **neutro** (`secondary` + `muted-foreground`) = en proceso, inactivo, revocado. El rojo de pills, chips y avisos usa `bg-destructive-suave` + `text-destructive-texto`: `text-destructive` sobre un rojo tenue no llega a 4.5.

---

## 3. Tipografía

- **Geist** (`--font-sans`, también `font-heading`) para UI y títulos. **Geist Mono** (`--font-mono`) solo para datos: ids, series, RUC, montos, fechas en celdas, hashes y código. Geist se usa sin conjuntos estilísticos alternativos: su diseño por defecto ya es el de Vercel.
- Tamaños con nombre en `@theme` (utilidades de Tailwind v4 con su interlineado):

| Utilidad | Tamaño / interlineado | Rol |
|---|---|---|
| `text-etiqueta` | 12 / 16 px | Ayudas, etiquetas de dato y sección, cabeceras de tabla, pills, subtítulos |
| `text-control` | 13 / 20 px | Botones, inputs, menús, segmentos, celdas, miga del top bar |
| `text-cuerpo` | 14 / 20 px | Texto corrido, títulos de tarjeta y sección (`font-semibold`), cuerpo de diálogo |
| `text-base` | 16 px (de Tailwind) | Título de diálogo |
| `text-metrica` | 24 / 28 px, `tracking-tight` | Valor de métrica y KPI |

Reglas:

- **Sin mayúsculas en etiquetas.** `TITULO_SECCION` y `ETIQUETA_DATO` son `text-etiqueta font-medium text-muted-foreground` en tipo oración. Única excepción: el verbo HTTP de `BloqueCodigo` (`POST`), que es un literal.
- **Mono solo para datos.** Los subtítulos de sección y las ayudas de campo no son mono salvo que muestren un dato técnico.
- **Números:** `tabular-nums` en todo dato numérico.
- Tracking negativo solo en `text-metrica`, que ya lo trae.
- `npm run check:tipografia` prohíbe `text-[Npx]`, `uppercase` y `tracking-wide(r)` en `src/components`, `src/app/ejemplo` y `src/lib`. Una línea que necesite un literal en mayúsculas lleva el comentario de exención `tipografia-ok`.

---

## 4. Espaciado, radios y elevación

- **Base 4 px.** Paddings habituales: `p-1` (popups), `px-2 py-1.5` (ítems), `px-3/px-4 py-2` (celdas), `px-4 py-3` (cabeceras de tarjeta), `px-5 py-4` (cabecera/cuerpo de diálogo), `p-4 md:p-6` (main).
- **Separación entre bloques de página:** `gap-4`. Ancho máximo del contenido: `max-w-[1520px] mx-auto`.
- **Radios:** `--radius` sigue en `0.5rem`; `--radius-xl` es `calc(var(--radius) * 1.5)` = 12 px. Resultado: controles `rounded-lg` 8 px, ítems `rounded-md` 6.4 px, tarjetas, tablas, diálogos y popups `rounded-xl` 12 px; `rounded-full` en pills de estado, avatares y puntos.
- **Elevación:** variables de tema (`--sombra-*` en `:root` y `.dark`) expuestas en `@theme inline` como `--shadow-xs/sm/md/lg`, para que `shadow-sm` etc. cambien con el modo:

| Nivel | Claro | Oscuro | Uso |
|---|---|---|---|
| `xs` | `0 1px 2px rgba(16,16,24,.05)` | `inset 0 1px 0 rgba(255,255,255,.04), 0 1px 2px rgba(0,0,0,.4)` | Controles, botones |
| `sm` | `0 1px 2px rgba(16,16,24,.06), 0 1px 3px rgba(16,16,24,.04)` | `inset 0 1px 0 rgba(255,255,255,.04), 0 1px 3px rgba(0,0,0,.45)` | Tarjetas, tablas |
| `md` | `0 4px 12px -2px rgba(16,16,24,.08), 0 2px 4px -2px rgba(16,16,24,.05)` | `inset 0 1px 0 rgba(255,255,255,.05), 0 8px 24px -4px rgba(0,0,0,.6)` | Popups, menús |
| `lg` | `0 16px 40px -8px rgba(16,16,24,.16), 0 4px 12px -4px rgba(16,16,24,.08)` | `inset 0 1px 0 rgba(255,255,255,.06), 0 24px 48px -12px rgba(0,0,0,.7)` | Diálogos, sheets, toasts |

  `shadow-xs` en controles, `shadow-sm` en tarjetas, `shadow-md` + `ring-1 ring-border` en popups, `shadow-lg` en diálogos, sheets y toasts; diálogos sobre `bg-overlay`. Nada más alto que eso.
- **Bordes:** `border-border` en contenedores y controles; solo dos opacidades, `border-border/80` en cabeceras de tabla, línea de tiempo y top bar, y `border-border/60` en divisores internos (filas, cabecera y pie de diálogo, tarjetas del sidebar). Ninguna otra.
- **Foco:** un único anillo, la receta `FOCO` de `lib/estilos.ts` (`focus-visible:ring-2 ring-ring/50 ring-offset-2 ring-offset-background`).

### Escala de alturas

**Altura única de control: `h-9` (36 px).** Todo control interactivo —botón, input, select, buscador, filtro, control segmentado, stepper, acción de fila de tabla, paginación, pie de diálogo, menú «⋯» de fila— mide `h-9` (o `size-9` si es solo un icono). Así cualquier par de controles puesto lado a lado queda alineado, en una barra, en un formulario o en una fila de tabla, sin elegir entre escalas.

| Pieza | Altura | Recetas / componentes |
|---|---|---|
| Control | **`h-9`** (36 px) | `ACCION_PRINCIPAL/SECUNDARIA`, `CONTROL_FILTRO`, `CAMPO` (`Entrada`, `Combobox`, `Autocomplete`, `EntradaFecha`, `EntradaMonto`, `<select>` nativo), `BOTON_PRIMARIO/SECUNDARIO/DESTRUCTIVO`, `Button` (todos los tamaños salvo `xs`), `ui/Input`, `SelectTrigger` (todos los `size`), `StepperNumerico`, `PieTabla`, `SelectorPorPagina`, `ConfirmacionEnLinea`, `MenuAcciones`, `Toolbar`, `ThemeToggle`, `GrupoBotones` |
| Contenedor segmentado | caja `h-9`/`min-h-9` con ítems `h-7` | `SEGMENTADO`/`SEGMENTO`, `Toolbar`, `GrupoBotones`, `SelectorPorPagina`, `ThemeToggle`, `Segmentado` de `BloqueCodigo`: por fuera miden lo mismo que cualquier control |
| Dentro de otro control | `h-6`/`h-7` | `Button` `size="xs"`/`"icon-xs"` y el selector de moneda de `EntradaMonto`: solo van dentro de un control de `h-9`, nunca sueltos en una fila |

**Nunca se sobrescribe la altura de una receta con `cn(RECETA, "h-N")`**, y toda receta de control de `lib/estilos.ts` mide `h-9`. `npm run lint` lo verifica (`scripts/verificar-alturas.mjs`) y falla con el archivo y la línea. La única sobrescritura permitida es `h-auto` (el textarea de `Entrada`, que crece con su contenido).

**Compatibilidad (0.2.0):** las variantes de altura anteriores se conservan para no romper imports, pero ya no cambian la altura: `CAMPO_FILTRO` es `CAMPO`, `BOTON_*_PIE` son `BOTON_*`, `variante="filtro"`/`"campo"` de `StepperNumerico`/`EntradaFecha`/`EntradaMonto` y `size="sm"`/`"lg"` de `Button`/`SelectTrigger` miden `h-9`. En código nuevo usa las recetas sin sufijo.

No son controles y conservan su altura: las pestañas subrayadas de `Tabs` (`h-10`, una franja de navegación), la cabecera de `Table` (`h-10`), la entrada de la `Paleta` (`h-11`) y las piezas decorativas (avatares, iconos de sección, logo).

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

1. **Cabecera (h-14, `border-b`)**: `LogoMarca` (icono 32 px con gradiente `from-primary to-primary-light`, tres nudos de khipu, texto "khipu" + ".pe" en primary) y chip `UBL 2.1` (`font-mono text-etiqueta`, `bg-secondary`).
2. **Selector de empresa** (`nav/empresa-selector.tsx`): tarjeta `rounded-lg border-border/60 bg-muted/80 p-2`, avatar cuadrado 24 px `bg-primary` con inicial, razón social `text-control font-medium` + `RUC …` `font-mono text-etiqueta`, `ChevronsUpDown`. Popup del **mismo ancho que el disparador** (`w-(--anchor-width)`), etiqueta "Cambiar de empresa" (tipo oración), filas con `data-highlighted:bg-accent/70`, check en primary a la derecha.
3. **Navegación** (`nav/sidebar-nav.tsx`): grupos con etiqueta `text-etiqueta font-medium text-muted-foreground` en tipo oración ("Emisión & SUNAT", "Configuración"). Ítem: `rounded-md px-2.5 py-1.5 text-control`, icono lucide 18 px. Estados: activo → `bg-sidebar-primary text-sidebar-primary-foreground`, icono en primary y punto `size-1.5 bg-primary` a la derecha; hover → `bg-sidebar-accent`; **pendiente** → texto `muted-foreground/50`, `cursor-not-allowed`, chip «Pronto» (`text-etiqueta font-medium`, `bg-secondary`, en tipo oración).
4. **Pie (`border-t p-3`)**: tarjeta "Plan y consumo" deshabilitada (barra de progreso vacía, `— / —`, `opacity-60`, `title` próximamente) y el **menú de usuario** (§7).

## 7. Menú de usuario (`nav/perfil-usuario.tsx` + `ui/menu.tsx`)

- **Disparador**: misma tarjeta que el selector de empresa (avatar 24 px `bg-primary` con iniciales del correo, nombre `text-control`, correo `font-mono text-etiqueta`, `ChevronsUpDown`; `data-popup-open:bg-secondary`).
- **Popup** (`side="top"`, ancho = disparador, `min-w-0`): 
  - "Tu cuenta" + fila resaltada `bg-accent/70` con avatar, nombre, correo completo (mono, `break-all`) y rol en su propia línea (`Administrador` / `Emisor` / `Solo lectura`), icono `ShieldCheck` en primary.
  - "Tema" + `ThemeToggle conTexto`: control segmentado a todo el ancho, tres opciones con icono 12 px + etiqueta `text-etiqueta` (**Claro · Oscuro · Sistema**), activa con `bg-card shadow-xs`.
  - Ítems: `Cambiar contraseña` (abre diálogo que envía el enlace de restablecimiento al correo de la sesión), `Documentación API` (`/developers`, pestaña nueva).
  - `Cerrar sesión` en variante `destructive` (`text-destructive-texto`, resaltado `bg-destructive-suave`).
- **`ui/menu.tsx`** (wrapper de base-ui `Menu`): `MenuContent` (`rounded-lg bg-popover p-1 shadow-md ring-1 ring-border`, animación scale/opacity 150 ms), `MenuItem` (`rounded-md px-2 py-1.5 text-control font-medium`, iconos `size-3.5 text-muted-foreground`, highlight `bg-accent/70`), `MenuLinkItem`, `MenuRadioGroup`/`MenuRadioItem` (check a la derecha), `MenuGroupLabel` (`text-etiqueta font-medium text-muted-foreground`), `MenuSeparator` (`-mx-1 my-1 h-px bg-border/70`). Es el menú a reutilizar para "más acciones" (⋯) de tablas.

---

## 8. Top bar (`nav/top-bar.tsx`)

`sticky top-0 z-20 h-14 border-b border-border/80 bg-card/80 backdrop-blur px-4 md:px-6`, dos zonas:

**Izquierda** (`min-w-0`, nunca se desborda sobre el resto): hamburguesa (solo móvil) → **miga** `Sección / Página` (`text-control`, sección en `muted-foreground/80`, página en `font-heading font-semibold`; `overflow-hidden` para que no pise los pills) → separador vertical `h-4 w-px bg-border` → pill **OSE** (deshabilitada, "sin monitoreo", `opacity-60`, próximamente) → pill de **entorno**: `BETA Sunat` (`border-warning-border bg-warning text-warning-foreground`, punto ámbar) o `Producción` (`bg-foreground text-background`, punto verde).

**Derecha** (`shrink-0`): buscador deshabilitado (`w-64`, `⌘K`, solo `lg+`) → separador → `Exportar` deshabilitado (`sm+`) → **acciones contextuales por ruta**:

| Ruta | Secundarias (`ACCION_SECUNDARIA`) | Principal (`ACCION_PRINCIPAL`) |
|---|---|---|
| `/comprobantes` | — | `Nueva factura` (deshabilitada: se emite por API) |
| `/series` | `Referencia técnica` | `Nueva serie` |
| `/empresa` | `Referencia técnica`, `Probar conexión SUNAT` (deshab.) | `Nueva empresa` |
| `/api-keys` | `Referencia técnica`, `Prueba de emisión` | `Crear API key` |

Regla de espacio: máximo **dos secundarias + una principal**; lo que no cabe va dentro de un diálogo (p. ej. "Documentación API" vive en el pie de los diálogos de API keys). Breakpoints de ocultación: `hidden lg:inline-flex` según prioridad (no `sm`/`md`: el sidebar fijo de 240 px aparece en `md`, así que entre 768–1023 px el ancho real disponible es angosto y cualquier cosa que se revele antes de `lg` compite con la miga y puede solaparse con las acciones).

Recetas (en `lib/estilos.ts`, re-exportadas desde `top-bar.tsx`; también son las de cualquier acción suelta fuera de la top bar):
- `ACCION_PRINCIPAL`: `h-9 rounded-lg bg-foreground text-background px-3 text-control font-medium shadow-xs hover:bg-foreground/85` (negro/blanco según tema; **no** primary, para no competir con los estados).
- `ACCION_SECUNDARIA`: `h-9 rounded-lg border border-border bg-card px-2.5 text-control font-medium text-foreground shadow-xs hover:border-input hover:bg-secondary`.

El selector de tema **no** está en la top bar: vive en el menú de usuario.

---

## 9. Botones

### `ui/button.tsx` (cva)
Base: `inline-flex items-center rounded-lg text-sm font-medium transition-all focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:opacity-50`.

| Variante | Estilo | Uso |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` | CTA en formularios públicos/onboarding |
| `suave` | `bg-accent text-accent-foreground`; hover mezcla `accent` con 8 % de `accent-foreground` | Acción secundaria con presencia, junto a una principal; contraste del texto 7.07 claro / 8.23 oscuro |
| `outline` | `border-border bg-background hover:bg-muted` | Acciones secundarias en formularios |
| `secondary` | `bg-secondary` | Neutro |
| `ghost` | solo hover `bg-muted` | Iconos (hamburguesa, refrescar) |
| `destructive` | `bg-destructive-suave text-destructive-texto`; hover mezcla `destructive-suave` con 12 % de `destructive` | Acciones irreversibles |
| `link` | `text-primary hover:underline` | Enlaces inline |

Tamaños: `default`, `sm` y `lg` miden `h-9` (cambian padding y texto); iconos `icon`, `icon-sm` e `icon-lg` miden `size-9`. `xs` (h-6) e `icon-xs` (24) solo van dentro de otro control (§4).

### Recetas de `lib/estilos.ts` (formularios y diálogos)
- `BOTON_PRIMARIO`: `h-9 rounded-lg bg-primary text-primary-foreground px-3.5 text-control font-medium shadow-xs hover:bg-primary/90` + `PRESION`.
- `BOTON_SECUNDARIO`: `h-9 rounded-lg border border-border bg-card px-3.5 text-control font-medium text-foreground shadow-xs hover:border-input hover:bg-secondary` + `PRESION`.
- `BOTON_DESTRUCTIVO`: `h-9 rounded-lg bg-destructive text-destructive-foreground px-3.5 text-control font-medium shadow-xs hover:bg-destructive/90` + `PRESION` (el texto va con su token, no `text-white`: en oscuro el rojo es claro y el texto oscuro).
- `ACCION_PRINCIPAL` y `ACCION_SECUNDARIA` (top bar, filtros) también llevan `PRESION`. `PRESION` es `motion-safe:active:scale-[0.98]` (§Movimiento).
- Pie de diálogo, `PanelLateral`, `TarjetaPaso` y `Drawer` usan las mismas; `BOTON_*_PIE` quedan como alias obsoletos (§4).
- Cierre de diálogos informativos: botón `bg-foreground text-background` ("Entendido").

### Acciones dentro de tablas
`inline-flex h-9 rounded-lg px-2.5 text-control font-medium` + icono 14 px: neutras en `text-muted-foreground`, destructivas en `text-destructive-texto hover:bg-destructive-suave`, separadas por `|` (`text-border`). Iconos-botón de fila y menú «⋯»: `size-9`, visibles al 80 % y al 100 % en hover de la fila (`group-hover`). La fila crece hasta la altura del control: una acción de fila mide lo mismo que el botón o el filtro de arriba de la tabla.

### Botón copiar (`comprobantes/boton-copiar.tsx`)
Icono `Copy` → `Check` 1,5 s, `p-0.5 rounded text-muted-foreground/70 hover:bg-secondary`; en filas aparece con `opacity-0 group-hover:opacity-100`.

### Botón deshabilitado + hover (regla obligatoria)
Toda receta que combine un `hover:` con `disabled:opacity-*` **debe** incluir también `disabled:pointer-events-none` (como ya hace `ui/button.tsx`). Sin eso, si el mouse queda sobre el botón cuando pasa a deshabilitado (el caso típico: usuario hace click y el botón se deshabilita bajo el cursor), el `:hover` y el `:disabled` empatan en especificidad y cuál gana depende del orden de generación del CSS — a veces el botón se ve casi sin atenuar aunque esté deshabilitado. `pointer-events-none` corta el `:hover` de raíz. Ya aplicado en `BOTON_PRIMARIO`/`BOTON_SECUNDARIO`, `ACCION_PRINCIPAL`/`ACCION_SECUNDARIA`, tabs, `ConfirmacionEnLinea`, `DialogoConfirmacion` y `SelectorContexto`.

### `BotonAsync` (`patrones/boton-async.tsx`)
Envoltorio de un `<button>` nativo para acciones que llaman a un backend: `pendiente` cambia el icono por `Spinner`, cambia el texto a `textoPendiente` y deshabilita. Agnóstico de receta — la clase (`BOTON_PRIMARIO`, `ACCION_PRINCIPAL`…) se pasa igual que a un botón normal.

---

## 10. Formularios

- **Campo** (`CAMPO`): `h-9 rounded-lg border border-border bg-muted px-3 text-sm`; foco `border-ring bg-card ring-3 ring-ring/30`; deshabilitado `opacity-60 cursor-not-allowed`.
- **Etiqueta** (`ETIQUETA_CAMPO`): `text-control font-medium`. **Ayuda** (`AYUDA_CAMPO`): `text-etiqueta text-muted-foreground` (mono solo si muestra un dato técnico). Error: `text-sm text-destructive` bajo el campo.
- **Dato de solo lectura** (`Dato` en `/empresa`): etiqueta en tipo oración (`ETIQUETA_DATO`) + caja `h-9 rounded-lg border bg-muted px-3 font-mono text-control`; si el dato no existe todavía, caja con `—` y `cursor-not-allowed` + `title` explicando.
- **Select** (`ui/select.tsx`, base-ui): disparador `h-9 rounded-lg border-border bg-card text-control font-medium shadow-xs` (todos los `size` miden `h-9`; `size="campo"` solo agrega el padding de `CAMPO`) con `ChevronDown`; popup alineado al disparador, ítems con check.
- **Selector de filas** (`ui/selector-por-pagina.tsx`): grupo `h-9 rounded-lg border bg-card p-0.5` con `10 · 20 · 50`, activo `bg-foreground text-background`.
- Validación con zod + react-hook-form; mensajes de error desde `lib/messages.ts` (`mensajeError(codigo)`).
- **Archivo (.p12/.pfx)** en `/empresa`: input de archivo + clave, feedback con vigencia del certificado (pill verde/ámbar/rojo según días restantes).

---

## 11. Tarjetas y secciones

- **Tarjeta** (`TARJETA`): `rounded-xl border border-border bg-card shadow-sm`.
- **Cabecera de sección**: `flex items-center gap-2.5 px-4 py-3 border-b border-border/60` → icono en caja `size-8 rounded-lg bg-accent text-primary` (lucide 16 px) + título `text-cuerpo font-semibold` + subtítulo `text-etiqueta`; a la derecha, chips/contadores (`rounded-md bg-secondary px-2 py-0.5 font-mono text-etiqueta`).
- **Pie de tarjeta**: `border-t border-border/60 bg-muted/60 px-4 py-2 text-etiqueta text-muted-foreground`, con iconos 12 px (`Lock`, `KeyRound`).
- **Fila de métricas** (cabecera de cada página): una tarjeta `px-5 py-3 shadow-xs` con `grid grid-cols-2 lg:grid-cols-4 lg:divide-x`; cada `Metrica` = etiqueta `text-etiqueta` en tipo oración → valor `text-metrica tabular-nums` (con sufijo `text-control font-normal text-muted-foreground`, p. ej. `/ 5 creadas`) → ayuda `text-etiqueta` con punto de estado (`size-1.5 rounded-full bg-success-solid|warning-solid|destructive`).
- **Tarjeta destacada** (`patrones/tarjeta-destacada.tsx`): panel de color plano `rounded-xl p-6`, sin borde ni sombra, para destacar un bloque (bienvenida, función nueva, plan, siguiente paso). Tonos `neutro | info | ok | aviso | invertido` con los tokens de siempre; el título y la descripción llevan el color del tono, sin opacidad, así el contraste calculado vale para ambos. No es un aviso (no anuncia nada al lector de pantalla): para eso, `Alerta`.
- **Tarjeta deshabilitada / próximamente**: `opacity-60`/`70`, `cursor-not-allowed`, chip `Próximamente` (`text-etiqueta`) y `title`.

---

## 12. Tablas (`ui/table.tsx` + patrón de página)

Todas las listas (comprobantes, series, API keys) siguen el mismo esqueleto:

1. **Barra de filtros** (`flex flex-wrap justify-between gap-3`): a la izquierda pestañas segmentadas (`SEGMENTADO` + `SEGMENTO`: caja `min-h-9 p-0.5`, segmentos `h-7`, activo `bg-card shadow-sm` por `data-active` o `aria-current="page"`) o cabecera con icono; a la derecha `Select`s de filtro (`CONTROL_FILTRO`: `h-9 rounded-lg border bg-card text-control font-medium shadow-xs`), filtros aún no soportados como botones deshabilitados, y botón **refrescar** (`size-9`, icono gira mientras `useTransition` está pendiente) — todo a `h-9` para alinear con el `Select` de la misma barra.
2. **Contenedor**: `overflow-hidden rounded-xl border border-border bg-card shadow-sm`; `opacity-60` mientras refresca.
3. **Cabecera**: `bg-muted border-b border-border/80`, celdas `px-3 py-2 text-etiqueta font-medium text-muted-foreground` en tipo oración; primera columna checkbox deshabilitado (selección múltiple próximamente).
4. **Filas**: `group border-b border-border/60 hover:bg-muted/80`, `text-control`; celda principal con dos líneas (valor fuerte + subtítulo `text-etiqueta`, mono si es un dato); identificadores en `ChipCodigo` (`rounded-md px-2 py-0.5 font-mono text-control font-medium bg-accent text-accent-foreground`; inactivos: `bg-secondary text-muted-foreground line-through`); numéricos a la derecha con `tabular-nums`; estado con pill (§13); acciones a la derecha.
5. **Vacío**: fila única `py-14 text-center` con icono 24 px y mensaje ("Todavía no tienes… Crea la primera con «…»" / "No hay … con los filtros seleccionados").
6. **Pie**: `border-t border-border/60 bg-muted px-4 py-2 text-control` → "Mostrando **x–y** de **N** …" · selector de filas · nota contextual (`hidden xl:inline`) | paginación (`Anterior` / números `size-7` con actual `bg-foreground text-background` / `Siguiente`), con `paginasVisibles()` de `lib/paginacion.ts` (1, 2, …, actual±1, …, últimas 2).

Filtrado/paginación en cliente cuando la API devuelve todo (series, API keys); en servidor con `?pagina=&por_pagina=` y `x-total-count` para comprobantes.

---

## 13. Pills, badges y estados

- **Pill de estado** (`comprobantes/estado-badge.tsx` y equivalentes): `PillEstado` (`patrones/pill-estado.tsx`): `inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-etiqueta font-medium whitespace-nowrap`, sin borde: relleno `bg-*` + punto `size-1.5 rounded-full bg-*-solid`.

| Tono | Clases | Estados SUNAT / entidades |
|---|---|---|
| Verde | `bg-success text-success-foreground`, punto `bg-success-solid` | `ACEPTADO` ("Aceptado con CDR" si trae CDR), serie/llave **Activa**, credenciales OK |
| Ámbar | `bg-warning text-warning-foreground`, punto `bg-warning-solid` | `ACEPTADO_CON_OBS`, BETA, certificado por vencer |
| Rojo | `bg-destructive-suave text-destructive-texto`, punto `bg-destructive` | `RECHAZADO`, `INVALIDO`, `ERROR_ENVIO`, vencido |
| Neutro | `bg-secondary text-muted-foreground`, punto `bg-muted-foreground/50` | `RECIBIDO`, `FIRMADO`, `ENVIADO`, `PENDIENTE_AGRUPACION`, `ANULADO`, **Inactiva**, **Revocada** |

- **Chips informativos**: `Chip`: `rounded-md bg-secondary px-2 py-0.5 font-mono text-etiqueta text-muted-foreground` (contadores, "id: 193f4b35", `UBL 2.1`).
- **Chip de tipo de comprobante**: caja `size-7 rounded bg-accent font-mono text-etiqueta font-semibold text-primary` con el código (`01`, `03`, `07`, `08`).
- **Etiqueta «Pronto» / «Próximamente»**: `rounded-md bg-secondary px-1.5 py-0.5 text-etiqueta font-medium text-muted-foreground`, en tipo oración.
- **Entorno**: ver §8. **Rol**: texto plano bajo el correo en el menú de usuario.
- `ui/badge.tsx` (cva: `default | secondary | destructive | outline | ghost | link`) es la base; las pills anteriores lo extienden con `gap-1.5 px-2.5 py-1 text-etiqueta`, sin borde.

---

## 14. Patrón "próximamente"

Toda función visible en el diseño de Stitch que el backend aún no soporta se deja **presente pero deshabilitada**, para que el layout ya sea el definitivo:

- `disabled` + `title="<Función>: próximamente"` (y, si aplica, la razón: "requiere filtro por serie en la API").
- Estilo: `text-muted-foreground`, `opacity-60`, `cursor-not-allowed`; nunca ocultar el control.
- Ejemplos: búsqueda global ⌘K, Exportar, monitoreo OSE, pestañas por tipo, filtro por período/serie, selección múltiple, PDF, "Regenerar" llave, webhooks, plan y consumo, emisión manual, catálogo.

---

## 15. Diálogos (`ui/dialog.tsx`, base-ui)

**Un clic fuera no cierra un diálogo** (`Dialog` trae `disablePointerDismissal` por defecto): un clic perdido no debe tirar lo escrito ni lo que se muestra una sola vez. Se cierra con la X, Escape o los botones del pie. Vale para todo lo que se arma sobre `Dialog` (`DialogoConfirmacion`, `Paleta`); los paneles laterales (`Sheet`, `PanelLateral`, `Drawer`) sí se cierran con un clic fuera.

Estructura fija: `DialogContent className="gap-0 p-0"` →
- **Cabecera** `border-b border-border/60 px-5 py-4 pr-14`: icono en caja `size-8 rounded-lg bg-accent text-primary` + `DialogTitle` (`text-base font-medium`) + `DialogDescription` (`text-sm text-muted-foreground`).
- **Cuerpo** `px-5 py-4` (formularios: `grid gap-4`; referencias: `@container bg-muted/40` con `grid @3xl:grid-cols-2`).
- **Pie** `border-t border-border/60 px-5 py-3 flex justify-end gap-2` (o `justify-between` si lleva un enlace a la izquierda).

Tres familias:
1. **Formulario** (Nueva serie, Nueva empresa): campos con las recetas de §10; `Cancelar` secundario + primario `h-9`.
2. **Secreto de un solo uso** (Nueva API key): paso 1 explicación + "Generar llave"; paso 2 `code` con `select-all`, botón Copiar (pasa a verde "Copiada") y aviso ámbar (`border-warning-border bg-warning`) "no volverá a mostrarse"; al cerrar `router.refresh()`.
3. **Referencia técnica / ejemplo** (Series, Empresa, API keys, Prueba de emisión): ancho `min(1200px, 100vw - 3rem)`, dos tarjetas (modelo de datos en tabla de campos `campo · tipo · descripción` con icono `KeyRound` ámbar en claves; reglas/formatos en filas `rounded-lg border-border/60 bg-muted/40`), pie con enlace a `/developers` y botón "Entendido".

Confirmaciones irreversibles **no** usan diálogo: se confirman **en línea** dentro de la fila ("¿Revocar de forma permanente? [Sí, revocar] [Cancelar]").

---

## 16. Código y datos técnicos

- **Barra de endpoint**: `bg-muted border-b px-4 py-2` con chip de método (`rounded-md bg-accent px-1.5 py-0.5 font-mono text-etiqueta font-semibold text-accent-foreground`; el verbo es un literal, se escribe con `toUpperCase()`), URL `font-mono text-control` truncada, pestañas de lenguaje (`cURL · Node.js / TS · Python`, control segmentado `h-9` con segmentos `h-7`) y botón copiar.
- **Bloque de código**: `pre` con `bg-codigo text-codigo-foreground p-4 font-mono text-control leading-relaxed overflow-auto` dentro de una tarjeta `border-border` (siempre casi negro, en ambos temas). Respuestas JSON: `bg-muted/40 text-foreground`.
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
- **Diseño**: select «Diseño» en el menú de usuario, justo debajo de Tema (`nav/selector-diseno.tsx`). Es independiente del tema: el diseño va en `<html data-diseno>` y claro/oscuro en la clase `.dark`, así que cada diseño existe en los dos modos. Ver «Diseños» en §20.
- **Iconos**: lucide-react. 18 px en el sidebar, 16 px en botones y cabeceras, 14 px en acciones de fila y menús, 12 px en pies/ayudas. Color por defecto `text-muted-foreground`; primary solo para el activo o el icono de sección.
- **Fechas**: `formatearFecha("2026-09-15") → "15 Set 2026"`; `formatearFechaHora(iso) → "15 Set 2026, 10:32"` en zona Lima (`lib/formato.ts`). **Montos**: `S/ 2,000.00` / `$ 5.00` (`formatearMonto`). **Correlativos**: 8 dígitos con ceros (`F001-00000126`).
- **Accesibilidad**: todo disparador de menú/diálogo con `aria-label`; controles segmentados como `radiogroup`; `sr-only` para etiquetas de iconos; foco visible con `ring-ring`.

---

## 19. Inventario de componentes

| Carpeta | Componentes |
|---|---|
| `components/ui` | `avatar`, `badge`, `button`, `card`, `dialog`, `drawer`, `grupo-botones`, `hover-card`, `input`, `kbd`, `label`, `menu`, `pagination`, `popover`, `scroll-area`, `select`, `selector-por-pagina`, `separator`, `sheet`, `table`, `toolbar` |
| `components/nav` | `logo`, `sidebar-content`, `sidebar-nav`, `empresa-selector`, `perfil-usuario`, `theme-toggle`, `selector-diseno`, `top-bar`, `mobile-nav` |
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

`formularios/` sumó también `StepperNumerico` (sobre `base-ui/number-field`; para cantidades con decimales, `paso="any"`: con el paso entero por defecto un valor como 2.5 bloquea el envío del formulario) y `EntradaRangoFechas` (dos `EntradaFecha` con atajos Hoy/7 días/30 días/Este mes).

`datos/TablaDatos<T>` ya no tiene la selección múltiple "próximamente" que describe §12 para el portal de origen: acepta una prop `seleccion` (`{ seleccionados, onCambio, acciones }`) que activa la columna de checkboxes, el estado indeterminado de "seleccionar todo" (solo la página visible) y una barra de acciones masivas sobre la tabla. Nótese además que `ListaDatos` **es** el patrón "lista de definición" (`dt`/`dd` etiqueta/valor) — no hace falta un componente aparte para eso.

Sexto lote: `HoverCard` (sobre `base-ui/preview-card`; su disparador es un `<a>` por defecto — pensado para previsualizar un enlace —, pero con `render` toma la forma de lo que le pases, igual que `Tooltip`; solo con hover/foco, sin clic, para fichas de vista previa que no necesitan la acción inmediata de un `Popover`), `ScrollArea` (sobre `base-ui/scroll-area`; scrollbar propio del kit en vez del nativo, `alto` obligatorio), `Deslizador` (en `formularios/`, sobre `base-ui/slider`; un valor o un rango de dos manijas con `valor` como tupla) y `Banner` (en `feedback/`; aviso de ancho completo para el `Shell`, sobre `TopBar` y no dentro de `main` — a diferencia de `Alerta`, que es una banda con esquinas dentro de una página).

Séptimo lote: `Autocomplete` (en `formularios/`, sobre `base-ui/autocomplete`; a diferencia de `Combobox`, no fuerza a elegir un valor de la lista — `value`/`onValueChange` son el texto libre, y clic en una sugerencia solo lo rellena), `Toolbar` (sobre `base-ui/toolbar`; barra de controles agrupados con foco por flechas entre ellos — contenedor `h-9`/`p-0.5` con botones internos `size-7`, el mismo patrón de `GrupoBotones` y `Tabs estilo="segmentado"`) y `Drawer` (sobre `base-ui/drawer`; hoja inferior para móvil con arrastre nativo para cerrar, a diferencia de `Sheet` que solo anima entrada/salida sin gesto de arrastre).

Octavo lote (estilo Notion de Refero): `TarjetaDestacada` (en `patrones/`; panel de color plano de cinco tonos, a diferencia de `Alerta` es contenido estático y no un aviso; a diferencia de `Card` trae tono y estructura fija de icono, título, descripción y acción), la variante `suave` de `Button` (relleno `accent`; entre `ghost`/`outline` y `default`) y el mecanismo de **diseños** descrito abajo.

### Diseños

Un diseño es un conjunto de tokens que cambia el aspecto de toda la interfaz sin tocar los componentes. Se elige en el menú de usuario, bajo Tema, y se guarda en `localStorage` (`khipu-diseno`).

| Pieza | Qué hace |
|---|---|
| `components/disenos.ts` | La lista `DISENOS` (`valor` + `etiqueta`), `DISENO_POR_DEFECTO` (`"khipu"`) y la clave de localStorage |
| `components/diseno.tsx` | `DisenoProvider` (guarda el diseño y lo pone en `<html data-diseno>`) y `useDiseno()` (sin proveedor devuelve una lista vacía y no falla) |
| `components/script-diseno.tsx` | `ScriptDiseno`, script en línea para el `<head>` del layout raíz: aplica el diseño guardado antes del primer pintado, sin parpadeo |
| `components/nav/selector-diseno.tsx` | `SelectorDiseno`: un `Select` de `h-9`; no pinta nada con un solo diseño o sin proveedor |
| `MenuUsuario` | Muestra el selector bajo Tema; `mostrarDiseno={false}` lo oculta |

Para adoptarlo en una app: envuelve con `DisenoProvider` (dentro de `ThemeProvider`) y pon `<ScriptDiseno />` dentro de `<head>` en `app/layout.tsx`. Sin eso, `MenuUsuario` se ve exactamente como antes.

**Agregar un diseño:** (1) un bloque en `globals.css` que sobrescriba solo los tokens que cambian; (2) su entrada en `DISENOS`; (3) el contraste de cada par de texto afectado, calculado y no estimado.

```css
html[data-diseno="papel"]:not(.dark) { --background: #f6f5f4; --primary: #0075de; /* … */ }
html[data-diseno="papel"].dark { --background: #191817; --primary: #62aef0; /* … */ }
```

El selector lleva `:not(.dark)` (o `.dark` para un bloque oscuro) a propósito: sin eso, los valores claros del diseño le ganarían por especificidad al modo oscuro. El diseño base `khipu` no tiene bloque: son los tokens de `:root` y `.dark`.

**Diseños disponibles:**

| Valor | Origen | Cambia (claro) | Oscuro |
|---|---|---|---|
| `khipu` | Diseño base | — | — |
| `papel` | Estilo Notion de Refero | Lienzo `--background` `#f6f5f4` con tarjetas blancas; un solo azul de acción (`--primary` `#0075de`, `--ring`, `--brand`) y su fondo suave `--accent` `#e6f3fe` con texto `#005bab` (6.04); bordes de 1 px `rgba(0,0,0,0.08)` en vez de sombras; texto `--foreground` `#111111` (17.34) y `--muted-foreground` `#615d59` (5.99 sobre el fondo, 6.53 sobre card, 5.63 sobre secondary); `secondary`, `muted` y sidebar en tonos cálidos; transiciones de 200 ms con `ease` (`--default-transition-*`, en ambos temas) | Derivado, no de la referencia (Notion no define oscuro): superficies cálidas (`#191817`, card `#211f1e`) y el mismo azul aclarado (`--primary` `#62aef0` con texto `#111111`, 7.94) |

Excepciones de `papel`: el azul `#0075de` sobre el lienzo da 4.19 (sobre card, 4.57), así que un enlace `text-primary` directamente sobre el fondo queda bajo 4.5; el texto sobre fondo de acento usa `#005bab`. `--chart-1` no cambia para que no se confunda con `--chart-5`. Los radios (12 px tarjetas, 8 px botones) ya son los de khipu; la fuente es la de khipu (Geist).

### Movimiento

El movimiento confirma una acción, muestra un cambio de estado o introduce contenido; nunca decora. Tiene dos capas que comparten valores: CSS para lo que debe funcionar en Server Components y en los primitivos de base-ui, y [Motion](https://motion.dev) para lo que CSS no hace bien (layout, trazos, contadores, entradas y salidas de React).

| Valor | CSS (`globals.css`) | Motion (`lib/movimiento.ts`) |
|---|---|---|
| Curva | `ease-salida` = `cubic-bezier(0.16, 1, 0.3, 1)` | `CURVA_SALIDA` |
| Duraciones | `duration-(--duracion-rapida)` 120 ms · `media` 200 ms · `lenta` 320 ms | `DURACION.rapida/media/lenta` (+ `trazo` 0.6 s, `contador` 0.8 s) |
| Resortes | — | `RESORTE` (indicadores) y `RESORTE_SUAVE` (valores), ambos con ζ ≥ 1: sin rebote |

**CSS:** `PRESION` (al pulsar, `scale-[0.98]`), `ENTRADA` + `pasoEntrada(i)` (fundido + 8 px, 240 ms, 40 ms por posición), `ANIMACION_POPUP` y las transiciones de diálogo, sheet, drawer, popover, menú, select, combobox, hover-card, tooltip, acordeón y toasts. El indicador de `Tabs` lo posiciona base-ui (`Tabs.Indicator`, variables `--active-tab-*`) y lo desliza una transición CSS.

**Motion** (`ProveedorMovimiento`, ya incluido en `Providers`, aporta `layoutId` y «reducir movimiento». Cada componente animado se envuelve además en `MovimientoLocal`, que carga las animaciones básicas: sin él, un `m.*` fuera de un `LazyMotion` se quedaría congelado en su estado inicial, con gráficos en blanco o una barra masiva que no aparece):

| Componente | Efecto |
|---|---|
| `SidebarNav` | El fondo del ítem activo se desliza (`layoutId`) |
| `TablaDatos` | La barra de acciones masivas entra y sale |
| `NumeroAnimado` | Cuenta desde 0; úsalo como hijo de `Metrica` o `valor` de `Kpi` |
| `Sparkline`, `GraficoLineas` (`TrazoAnimado`) | La línea se dibuja |
| `GraficoBarras` | Las barras crecen desde la base, escalonadas |
| `ProgresoCircular` | El anillo avanza con resorte |
| `ConfirmacionEnLinea`, `BotonCopiar` | Cambio animado de acción a confirmación; el icono gira a un check |

**Reglas:**
- Solo valores de la tabla de arriba; nunca duraciones ni curvas sueltas: en CSS, `duration-(--duracion-*)` y `ease-salida`.
- Los componentes importan `m` (no `motion`) de `motion/react`: `LazyMotion strict` falla en desarrollo si se cuela un `motion.*`.
- Con «reducir movimiento» nada se desplaza, escala ni se dibuja: `MotionConfig reducedMotion="user"` anula transformaciones y layout, los efectos que no lo son (trazos, contador, altura, anillo) consultan `useReducedMotion()`, y el CSS va bajo `motion-safe:`/`motion-reduce:`. Las transiciones de los primitivos de base-ui (diálogo, sheet, drawer, popover, menú, select, tooltip, toast, acordeón, indicador de `Tabs`) las acorta a 1 ms la regla `@media (prefers-reduced-motion: reduce)` de `globals.css`; los spinners y el progreso indeterminado siguen girando porque indican carga. Solo quedan fundidos de opacidad.
- Toasts: siguen con la transición CSS de base-ui; `AnimatePresence` competiría con su cierre por tiempo y por gesto.
- El diseño `papel` fija las transiciones por defecto en 200 ms (`--default-transition-duration`, §Diseños).

### Pendientes

- Adoptar en el portal los componentes del kit que reemplazan código ad hoc (tooltip real, toasts, menú ⋯ de filas, `TablaDatos`).
- Rail colapsado de 64 px para tablet (hoy: sidebar completo en `md+`, sheet en móvil).
- Gráficos del dashboard del portal (etapa 2) con `GraficoBarras`/`GraficoLineas`.
- El registro tiene dos items llamados `movimiento` (`components/movimiento` y `lib/movimiento`): `add movimiento` en la CLI elige uno por nombre. Las dependencias internas usan la clave completa y no se ven afectadas.
- `NumeroAnimado` muestra el valor del servidor, salta a 0 al hidratar y vuelve a contar desde 0 si `valor` cambia; debería contar desde el valor anterior.
