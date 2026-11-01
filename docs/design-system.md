---
name: khipu · Design System del portal
version: 2026-11-01
colors:
  background: '#eceef1'
  foreground: '#16181d'
  card: '#ffffff'
  popover: '#ffffff'
  primary: '#16181d'
  on-primary: '#ffffff'
  secondary: '#f4f5f7'
  muted: '#f4f5f7'
  muted-foreground: '#5d6170'
  texto-terciario: '#666a76'
  acento: '#d4f06b'
  acento-texto: '#2f3a07'
  acento-2: '#cfe2fb'
  acento-2-texto: '#1d4f91'
  acento-3: '#f8ec84'
  accent: 'color-mix(acento 30%, #ffffff)'
  accent-foreground: '#2f3a07'
  border: 'rgba(16, 17, 20, 0.08)'
  input: '#dcdee4'
  ring: '#2f3a07'
  success: '#e5f5c4'
  success-foreground: '#2f6b12'
  warning: '#fdf0c2'
  warning-foreground: '#8a5a00'
  info: '#dcebfd'
  info-foreground: '#1d4f91'
  destructive: '#dc2547'
  destructive-suave: '#fde3e7'
  destructive-texto: '#a3263c'
  codigo: '#16181d'
  codigo-foreground: '#e4e4e9'
  sidebar: '#ffffff'
  sidebar-foreground: '#5d6170'
  overlay: 'rgba(16, 17, 20, 0.32)'
typography:
  sans: Inter
  mono: JetBrains Mono
rounded:
  base: 0.75rem
  lg: 0.75rem
  xl: 1.125rem
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

Claro y oscuro **Medianoche** (el tono oscuro por defecto) con la paleta **Lima** (la paleta por defecto). Las otras paletas y tonos oscuros redefinen solo unos pocos tokens (más abajo); los demás se derivan de ellos.

| Token | Claro | Oscuro (Medianoche) | Uso |
|---|---|---|---|
| `background` | `#eceef1` | `#0a0f1c` | Lienzo de la app (en oscuro con dos resplandores radiales del acento) |
| `foreground` | `#16181d` | `#e9eef8` | Texto principal |
| `card` | `#ffffff` | `#111a2c` | Tarjetas, tablas, campos |
| `popover` | `#ffffff` | `#16203a` | Popups, menús |
| `primary` / `-foreground` | `#16181d` / `#ffffff` | `#f4f5f7` / `#0a0b0e` | Acción principal (casi negra; casi blanca en oscuro). El color de la paleta no va en botones |
| `secondary` / `muted` («soft») | `#f4f5f7` | `#19233a` | Bandas de tabla, segmentados, hover de controles |
| `muted-foreground` | `#5d6170` | `#a3afc7` | Texto secundario, iconos neutros |
| `texto-terciario` | `#666a76` | `#8794ad` | Rótulos, pies de tarjeta, ejes, placeholder |
| `acento` / `acento-texto` | `#d4f06b` / `#2f3a07` | igual | Relleno de la paleta y su texto (métrica destacada, ítem activo, barra destacada) |
| `acento-2` / `acento-2-texto` | `#cfe2fb` / `#1d4f91` | igual | Segundo acento: barras base, categorías |
| `acento-3` | `#f8ec84` | igual | Tercer acento (decorativo) |
| `acento-suave`, `acento-2-suave`, `acento-3-suave` | el acento al 30 % sobre blanco | el acento al 14 % sobre `card` | Fondos tenues de acento |
| `acento-superficie` / `-texto` | `acento` / `acento-texto` | acento al 14 % sobre `card` / `acento` | Superficie destacada: en oscuro el acento es luz (superficie teñida + texto pastel) |
| `acento-borde` | `transparent` | acento al 26 % | Borde de la superficie destacada en oscuro |
| `accent` / `-foreground` | `acento-suave` / `acento-texto` | `acento-suave` / `acento` | Fila seleccionada, ítem resaltado de menú, `Button variant="suave"` |
| `ring` | `acento-texto` | `acento` | Anillo de foco (≥ 8:1 sobre tarjeta: el pastel no sirve como anillo) |
| `border` | `rgba(16,17,20,.08)` | `rgba(233,238,248,.07)` | Bordes de controles y divisores |
| `input` | `#dcdee4` | `rgba(233,238,248,.12)` | Borde de campos |
| `success` / `-foreground` | `#e5f5c4` / `#2f6b12` | `#b9e45a` al 13 % / `#b9e45a` | OK, aceptado, activo |
| `warning` / `-foreground` | `#fdf0c2` / `#8a5a00` | `#f3cf5a` al 13 % / `#f3cf5a` | Provisional, BETA, por vencer |
| `destructive-suave` / `destructive-texto` | `#fde3e7` / `#a3263c` | `#f7899b` al 13 % / `#f7899b` | Pills, chips y alertas de error |
| `destructive` / `-foreground` | `#dc2547` / `#ffffff` | `#fb7189` / `#0a0b0e` | Botón destructivo |
| `info` / `-foreground` | `#dcebfd` / `#1d4f91` | `#8fc0f7` al 14 % / `#8fc0f7` | Avisos informativos |
| `codigo` / `-foreground` | `#16181d` / `#e4e4e9` | `#0b1222` / `#e4e4e9` | Fondo de `BloqueCodigo` |
| `chart-1` | `acento-2-texto` | `acento-2` | Serie principal (líneas, sparklines) |
| `chart-base` / `chart-destacado` | `acento-2` / `acento` | `acento-2` al 38 % / `acento` | Barras de una serie y la barra destacada |
| `chart-2..5` | `#10b981 #f59e0b #e11d48 #0ea5e9` | `#27a070 #bf8a26 #dc4a68 #3a88c6` | Series secundarias (semánticas, no cambian con la paleta) |
| `sidebar` / `-foreground` | `#ffffff` / `#5d6170` | `#0f1626` / `#a3afc7` | Sidebar flotante |
| `sidebar-primary` / `-foreground` | `acento-superficie` / `-texto` | `acento-superficie` / `-texto` | Ítem activo del sidebar |
| `borde-tarjeta` / `brillo-tarjeta` | `transparent` / ninguno | `foreground` al 7 % / brillo interior arriba | Tarjeta sin borde en claro; borde fino y brillo en oscuro |
| `sombra-elevada` | `0 10px 24px -10px rgba(16,17,20,.14)` | sombra profunda | Hover de `TARJETA_ELEVABLE` |
| `overlay` | `rgba(16,17,20,.32)` | `rgba(0,0,0,.6)` | Fondo de diálogos/sheets |

### Paletas

Cada paleta (`html[data-paleta="…"]`, elegida por el usuario: ver «Apariencia» en §20) redefine solo los cinco acentos. Lima no tiene bloque: es `:root`.

| Paleta | `acento` / `acento-texto` | `acento-2` / `acento-2-texto` | `acento-3` | Contraste texto/relleno |
|---|---|---|---|---|
| `lima` (por defecto) | `#d4f06b` / `#2f3a07` | `#cfe2fb` / `#1d4f91` | `#f8ec84` | 9.53 · 6.17 |
| `indigo` | `#c9c8ff` / `#23215e` | `#cdeee9` / `#0f5a52` | `#ffdcc2` | 9.09 · 6.53 |
| `oceano` | `#9fe3dc` / `#0b3d3a` | `#d3e4fd` / `#1d4f91` | `#ffe7a0` | 8.32 · 6.31 |
| `coral` | `#ffc6b3` / `#5a1d0c` | `#e3dafb` / `#4a2b8c` | `#fbe39b` | 8.65 · 7.78 |
| `violeta` | `#dacbff` / `#34146b` | `#c6efdf` / `#0f5b40` | `#ffd3e6` | 9.58 · 6.49 |

### Tonos del modo oscuro

Cada tono (`.dark[data-oscuro="…"]`) redefine superficies y textos; Medianoche no tiene bloque: es `.dark`. Contraste sobre tarjeta.

| Tono | Lienzo | Tarjeta | `soft` | Principal | Secundario | Terciario (tarjeta / soft) |
|---|---|---|---|---|---|---|
| `medianoche` (por defecto) | `#0a0f1c` | `#111a2c` | `#19233a` | `#e9eef8` (14.94) | `#a3afc7` | `#8794ad` (5.69 / 5.12) |
| `grafito` | `#111214` | `#1a1b1f` | `#232529` | `#eceef2` (14.81) | `#a9abb3` | `#8e9099` (5.41 / 4.82) |
| `tintado` | acento 5 % sobre `#0b0c10` | acento 6 % sobre `#15171b` | acento 8 % sobre `#1d2025` | `#eceef2` (13.53–13.73) | `#a2a6b2` | `#979ba7` (5.66–5.74 / 4.81–4.92) |

Tintado depende de la paleta: sus superficies se tiñen con el acento, y el verificador lo calcula para las cinco.

### Contraste

Texto ≥ 4.5:1 y anillo de foco ≥ 3:1 en las **20 combinaciones** (5 paletas × claro + 3 tonos oscuros). `npm run check:contraste` (`scripts/verificar-contraste.mjs`, dentro de `npm run lint`) lee cada bloque de `src/styles/tokens.css`, resuelve los `color-mix` y mide 26 pares por combinación (520 en total): `fg/bg`, `fg/card`, `muted/bg|card|popover|soft`, `terciario/bg|card|soft|popover`, `primary-foreground/primary`, `accent-foreground/accent`, `acento-texto/acento`, `acento-2-texto/acento-2`, `acento-superficie-texto/acento-superficie`, los estados, el sidebar, `codigo` y el anillo `ring/card`. Falla con la combinación, el par y la razón si alguno baja del mínimo.

| Combinación | Par más bajo | Razón | Anillo de foco |
|---|---|---|---|
| Claro (las 5 paletas) | `texto-terciario` / lienzo | 4.65 | 12.05–14.48 |
| Medianoche (las 5) | `texto-terciario` / `soft` | 5.12 | 10.92–13.64 |
| Grafito (las 5) | `texto-terciario` / `soft` | 4.82 | 10.81–13.50 |
| Tintado | `texto-terciario` / `soft` | 4.81 (Lima) – 4.92 (Índigo) | 10.02–12.33 |

Los rellenos pastel de superficie (1.3–1.6 sobre blanco) son decorativos: todo estado que transmiten también va en texto o icono con color AA.

Regla de tonos para estado: **verde** = aceptado/activo, **ámbar** = provisional/BETA/observado, **rojo** = error/rechazo/acción destructiva, **neutro** (`secondary` + `muted-foreground`) = en proceso, inactivo, revocado. El rojo de pills, chips y avisos usa `bg-destructive-suave` + `text-destructive-texto`: `text-destructive` sobre un rojo tenue no llega a 4.5.

---

## 3. Tipografía

- **Inter** (`--font-sans`) para toda la interfaz, con los rasgos `font-feature-settings: "cv11", "ss01", "ss03"` en `body`. **JetBrains Mono** (`--font-mono`, pesos 400/500/600) **solo** para correlativos (`F001-00000136`), ids, llaves y código. Fechas, montos, RUC y cantidades van en Inter con `tabular-nums`. Las dos se cargan con `next/font/google` en `<html>` (`src/app/layout.tsx`).
- Tamaños con nombre en `@theme` (utilidades de Tailwind v4 que traen su interlineado, y las nuevas también su peso y tracking):

| Utilidad | Tamaño / interlineado | Peso | Tracking | Uso |
|---|---|---|---|---|
| `text-etiqueta` | 11.5 / 16 px | 500 | 0 | Ayudas, pies de tarjeta, ejes, pills, rótulos |
| `text-control` | 13 / 20 px | 500 | −0.005em | Botones, campos, menús, segmentos, celdas |
| `text-cuerpo` | 13 / 20 px | 400 | 0 | Texto base (`body`), cuerpo de diálogo |
| `text-titulo` | 14.5 / 20 px | 620 | −0.014em | Títulos de tarjeta, diálogo y panel |
| `text-titulo-pagina` | 21 / 24 px | 650 | −0.028em | `h1` de página |
| `text-metrica` | 22 / 26 px | 650 | −0.035em | Valor de métrica y KPI (`tabular-nums`) |
| `text-metrica-texto` | 18 / 26 px | 620 | −0.02em | Valor de métrica que es una palabra: un estado, un entorno, un código (`Metrica texto`) |

Reglas:

- **Rótulos en mayúsculas solo con `ROTULO`** (`lib/estilos.ts`): `text-etiqueta font-semibold uppercase tracking-[0.04em] text-texto-terciario`, para encabezados de tabla (`CABECERA_TABLA`) y de grupo del menú. Las etiquetas de dato y de sección (`TITULO_SECCION`, `ETIQUETA_DATO`) siguen en tipo oración.
- **Mono solo para identificadores.** Ni las ayudas de campo ni los montos van en mono.
- **Números:** `tabular-nums` en todo dato numérico; montos en 650.
- El texto terciario nunca baja de 4.5:1 (§2 «Contraste»).
- `npm run check:tipografia` prohíbe en `src/components`, `src/app/ejemplo` y `src/lib` los tamaños sueltos (`text-[Npx]`), los de Tailwind (`text-sm`, `text-base`…, también en los primitivos de `components/ui/`) y `uppercase` o el tracking ancho fuera de `src/lib/estilos.ts`. Una línea que necesite un literal en mayúsculas lleva el comentario de exención `tipografia-ok`. `cn` (`src/lib/utils.ts`) conoce la escala, `titulo` y `titulo-pagina` incluidos, así que no confunde un tamaño con un color al combinar clases.

---

## 4. Espaciado, radios y elevación

- **Base 4 px.** Paddings habituales: `p-1` (popups), `px-2 py-1.5` (ítems), `px-3/px-4 py-2` (celdas), `px-4 py-3` (cabeceras de tarjeta), `px-5 py-4` (cabecera/cuerpo de diálogo), `p-4 md:p-6` (main).
- **Separación entre bloques de página:** `gap-3` (12 px); padding de tarjeta 13–15 px. Ancho máximo del contenido: `max-w-[1520px] mx-auto`.
- **Radios:** `--radius: 0.75rem`. `rounded-lg` = 12 px en campos, selects, textareas y bandas de tabla; `rounded-xl` = `calc(var(--radius) * 1.5)` = 18 px en tarjetas, tablas, popovers, menús, diálogos y toasts. Botones, chips, pills de estado, segmentados, ítems de menú, ítems del sidebar y paginación son **píldora** (`rounded-full`), igual que avatares y puntos.
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

**Altura única de control: `h-control` (32 px; 34 px hasta 0.5.2).** El token es `--spacing-control: 2rem` en `@theme` (`src/styles/theme.css`), así que Tailwind genera `h-control`, `min-h-control` y `size-control`. Todo control interactivo —botón, input, select, buscador, filtro, control segmentado, stepper, acción de fila de tabla, paginación, pie de diálogo, menú «⋯» de fila— mide `h-control` (o `size-control` si es solo un icono). Así cualquier par de controles puesto lado a lado queda alineado, en una barra, en un formulario o en una fila de tabla, sin elegir entre escalas.

| Pieza | Altura | Recetas / componentes |
|---|---|---|
| Control | **`h-control`** (32 px) | `ACCION_PRINCIPAL/SECUNDARIA`, `CONTROL_FILTRO`, `CAMPO` (`Entrada`, `Combobox`, `Autocomplete`, `EntradaFecha`, `EntradaMonto`, `<select>` nativo con `SELECT_NATIVO`), `BOTON_PRIMARIO/SECUNDARIO/DESTRUCTIVO`, `Button` (todos los tamaños salvo `xs`), `ui/Input`, `SelectTrigger` (todos los `size`), `StepperNumerico`, `PieTabla`, `SelectorPorPagina`, `ConfirmacionEnLinea`, `MenuAcciones`, `Toolbar`, `ThemeToggle`, `GrupoBotones` |
| Contenedor segmentado | píldora `min-h-control` con ítems `h-7` | `SEGMENTADO`/`SEGMENTO`, `Toolbar`, `GrupoBotones`, `SelectorPorPagina`, `ThemeToggle`, `Segmentado` de `BloqueCodigo`: por fuera miden lo mismo que cualquier control |
| Dentro de otro control | `h-6`/`h-7` | `Button` `size="xs"`/`"icon-xs"` y el selector de moneda de `EntradaMonto`: solo van dentro de un control de `h-control`, nunca sueltos en una fila |

**Nunca se sobrescribe la altura de una receta con `cn(RECETA, "h-N")`**, y toda receta de control de `lib/estilos.ts` mide `h-control`. `npm run lint` lo verifica (`scripts/verificar-alturas.mjs`) y falla con el archivo y la línea. La única sobrescritura permitida es `h-auto` (el textarea de `Entrada`, que crece con su contenido). Un control escrito a mano junto a uno del kit usa `h-control`, nunca `h-9` (los 36 px de 0.4).

**Compatibilidad (0.2.0):** las variantes de altura anteriores se conservan para no romper imports, pero ya no cambian la altura: `CAMPO_FILTRO` es `CAMPO`, `BOTON_*_PIE` son `BOTON_*`, `variante="filtro"`/`"campo"` de `StepperNumerico`/`EntradaFecha`/`EntradaMonto` y `size="sm"`/`"lg"` de `Button`/`SelectTrigger` miden `h-control`. En código nuevo usa las recetas sin sufijo.

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

- **Desktop (md ≥ 768):** sidebar flotante de **248 px** (216 px hasta 0.5.2: cortaba el nombre de la empresa y el correo): tarjeta (`bg-sidebar`) con radio 18 px y 12 px de margen sobre el lienzo, `overflow-y-auto`.
- **Móvil:** el sidebar se oculta; la top bar muestra un botón hamburguesa que abre el mismo `SidebarContent` en un `Sheet` lateral (`nav/mobile-nav.tsx`).
- **Contenido:** `grid grid-cols-1 gap-3 max-w-[1520px] mx-auto min-w-0`. Las tablas pueden desbordar horizontalmente dentro de su contenedor (`overflow-hidden rounded-xl` + `Table` con scroll), la página nunca.

---

## 6. Sidebar (`nav/sidebar-content.tsx`)

De arriba abajo:

1. **Cabecera (h-14, `border-b`)**: `LogoMarca` (icono 32 px con gradiente `from-primary to-primary-light`, tres nudos de khipu, texto "khipu" + ".pe" en primary) y chip `UBL 2.1` (`font-mono text-etiqueta`, `bg-secondary`).
2. **Selector de empresa** (`nav/empresa-selector.tsx`): tarjeta `rounded-lg border-border/60 bg-muted/80 p-2`, avatar cuadrado 24 px `bg-primary` con inicial, razón social `text-control font-medium` + `RUC …` `font-mono text-etiqueta`, `ChevronsUpDown`. Popup del **mismo ancho que el disparador** (`w-(--anchor-width)`), etiqueta "Cambiar de empresa" (tipo oración), filas con `data-highlighted:bg-accent/70`, check en primary a la derecha.
3. **Navegación** (`nav/sidebar-nav.tsx`): grupos con etiqueta `text-etiqueta font-medium text-muted-foreground` en tipo oración ("Emisión & SUNAT", "Configuración"). Ítem: píldora `rounded-full px-3 py-[7px] text-control`, icono Phosphor 18 px duotono. Estados: activo → píldora `bg-sidebar-primary text-sidebar-primary-foreground` (el acento de la paleta; en oscuro, superficie teñida con borde `acento-borde`) que se desliza entre ítems, icono relleno (`fill`); hover → `bg-sidebar-accent`; **pendiente** → texto `muted-foreground/50`, `cursor-not-allowed`, chip «Pronto» (`text-etiqueta font-medium`, `bg-secondary`, en tipo oración).
4. **Pie (`border-t p-3`)**: tarjeta "Plan y consumo" deshabilitada (barra de progreso vacía, `— / —`, `opacity-60`, `title` próximamente) y el **menú de usuario** (§7).

## 7. Menú de usuario (`nav/menu-usuario.tsx` + `ui/menu.tsx`)

- **Disparador**: tarjeta `rounded-xl bg-secondary` con avatar redondo en el acento (`bg-acento text-acento-texto`), nombre y correo, y `CaretUpDown` en bold.
- **Popup** (`side="top"`, **ancho = disparador**, nunca más ancho que el sidebar): cuenta (fila `bg-accent` con avatar, nombre, correo, rol y `ShieldCheck`), **Tema** en la misma fila que su rótulo con `ThemeToggle` **solo iconos** (sol, luna, monitor; nombre en `title` y `aria-label`), **«Apariencia…»** (abre `PanelApariencia`), acciones propias y `Cerrar sesión` en `destructive`.
- **`PanelApariencia`** (`nav/panel-apariencia.tsx`): panel derecho de 384 px con Tema (con texto), Paleta, Tono oscuro, Tipografía (con una frase de ejemplo) y Diseño, en muestras grandes. Cada cambio se aplica al instante; la página de atrás cambia en vivo. Ver «Apariencia» en §20.
- **`ui/menu.tsx`** (base-ui `Menu`): `MenuContent` radio 18 (`rounded-xl p-1.5`), `MenuItem` radio 12 con icono duotono, `MenuSeparator` fino. Es el menú de «⋯» de tablas.

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

Regla de espacio: máximo **dos secundarias + una principal**; lo que no cabe va dentro de un diálogo (p. ej. "Documentación API" vive en el pie de los diálogos de API keys). Breakpoints de ocultación: `hidden lg:inline-flex` según prioridad (no `sm`/`md`: el sidebar flotante de 216 px (más su margen) aparece en `md`, así que entre 768–1023 px el ancho real disponible es angosto y cualquier cosa que se revele antes de `lg` compite con la miga y puede solaparse con las acciones).

Recetas (en `lib/estilos.ts`, re-exportadas desde `top-bar.tsx`; también son las de cualquier acción suelta fuera de la top bar):
- `ACCION_PRINCIPAL`: `h-control rounded-full bg-primary text-primary-foreground px-4 text-control font-semibold shadow-xs hover:bg-primary/85`. `--primary` es casi negro (`#16181d`) en claro y casi blanco (`#f4f5f7`) en oscuro: la acción principal no lleva el color de la paleta, que vive en superficies.
- `ACCION_SECUNDARIA`: `h-control rounded-full bg-card px-3.5 text-control font-medium text-foreground ring-1 ring-border hover:bg-secondary`.

El selector de tema **no** está en la top bar: vive en el menú de usuario.

---

## 9. Botones

### `ui/button.tsx` (cva)
Base: `inline-flex items-center rounded-full text-control font-medium transition-all focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:opacity-50`.

| Variante | Estilo | Uso |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/80` | CTA en formularios públicos/onboarding |
| `suave` | `bg-accent text-accent-foreground`; hover mezcla `accent` con 8 % de `accent-foreground` | Acción secundaria con presencia, junto a una principal; contraste del texto 7.07 claro / 8.23 oscuro |
| `outline` | `border-border bg-background hover:bg-muted` | Acciones secundarias en formularios |
| `secondary` | `bg-secondary` | Neutro |
| `ghost` | solo hover `bg-muted` | Iconos (hamburguesa, refrescar) |
| `destructive` | `bg-destructive-suave text-destructive-texto`; hover mezcla `destructive-suave` con 12 % de `destructive` | Acciones irreversibles |
| `link` | `text-primary hover:underline` | Enlaces inline |

Tamaños: `default`, `sm` y `lg` miden `h-control` (cambian padding y texto); iconos `icon`, `icon-sm` e `icon-lg` miden `size-control`. `xs` (h-6) e `icon-xs` (24) solo van dentro de otro control (§4).

### Recetas de `lib/estilos.ts` (formularios y diálogos)
- `BOTON_PRIMARIO`: `h-control rounded-full bg-primary text-primary-foreground px-4 text-control font-semibold shadow-xs hover:bg-primary/85` + `PRESION`.
- `BOTON_SECUNDARIO`: `h-control rounded-full bg-card px-4 text-control font-medium text-foreground ring-1 ring-border hover:bg-secondary` + `PRESION`.
- `BOTON_DESTRUCTIVO`: `h-control rounded-full bg-destructive text-destructive-foreground px-4 text-control font-semibold shadow-xs hover:bg-destructive/90` + `PRESION` (el texto va con su token, no `text-white`: en oscuro el rojo es claro y el texto oscuro).
- `ACCION_PRINCIPAL` y `ACCION_SECUNDARIA` (top bar, filtros) también llevan `PRESION`. `PRESION` es `motion-safe:active:scale-[0.98]` (§Movimiento).
- Pie de diálogo, `PanelLateral`, `TarjetaPaso` y `Drawer` usan las mismas; `BOTON_*_PIE` quedan como alias obsoletos (§4).
- Cierre de diálogos informativos: botón `bg-foreground text-background` ("Entendido").

### Acciones dentro de tablas
`inline-flex h-control rounded-lg px-2.5 text-control font-medium` + icono 14 px: neutras en `text-muted-foreground`, destructivas en `text-destructive-texto hover:bg-destructive-suave`, separadas por `|` (`text-border`). Iconos-botón de fila y menú «⋯»: `size-control`, visibles al 80 % y al 100 % en hover de la fila (`group-hover`). La fila crece hasta la altura del control: una acción de fila mide lo mismo que el botón o el filtro de arriba de la tabla.

### Botón copiar (`comprobantes/boton-copiar.tsx`)
Icono `Copy` → `Check` 1,5 s, `p-0.5 rounded text-muted-foreground/70 hover:bg-secondary`; en filas aparece con `opacity-0 group-hover:opacity-100`. Con `etiqueta` (barras de acciones) muestra además el texto «Copiar» → «Copiado», `inline-flex gap-1.5 rounded-md text-muted-foreground`, y el check pasa a `text-success-foreground` (`patrones/boton-copiar.tsx`).

### Botón deshabilitado + hover (regla obligatoria)
Toda receta que combine un `hover:` con `disabled:opacity-*` **debe** incluir también `disabled:pointer-events-none` (como ya hace `ui/button.tsx`). Sin eso, si el mouse queda sobre el botón cuando pasa a deshabilitado (el caso típico: usuario hace click y el botón se deshabilita bajo el cursor), el `:hover` y el `:disabled` empatan en especificidad y cuál gana depende del orden de generación del CSS — a veces el botón se ve casi sin atenuar aunque esté deshabilitado. `pointer-events-none` corta el `:hover` de raíz. Ya aplicado en `BOTON_PRIMARIO`/`BOTON_SECUNDARIO`, `ACCION_PRINCIPAL`/`ACCION_SECUNDARIA`, tabs, `ConfirmacionEnLinea`, `DialogoConfirmacion` y `SelectorContexto`.

### `BotonAsync` (`patrones/boton-async.tsx`)
Envoltorio de un `<button>` nativo para acciones que llaman a un backend: `pendiente` cambia el icono por `Spinner`, cambia el texto a `textoPendiente` y deshabilita. Agnóstico de receta — la clase (`BOTON_PRIMARIO`, `ACCION_PRINCIPAL`…) se pasa igual que a un botón normal.

---

## 10. Formularios

- **Campo** (`CAMPO`): `h-control rounded-lg border border-input bg-card px-3 text-control` (radio 12 px), placeholder en `texto-terciario`; foco `border-ring ring-3 ring-ring/20`; deshabilitado `opacity-60 cursor-not-allowed`.
- **Etiqueta** (`ETIQUETA_CAMPO`, y `ui/Label`): `text-etiqueta font-medium` (13 px hasta 0.5.2). **Ayuda** (`AYUDA_CAMPO`): `text-etiqueta text-muted-foreground` (mono solo si muestra un dato técnico). Error: `text-sm text-destructive` bajo el campo.
- **Dato de solo lectura** (`Dato` en `/empresa`): etiqueta en tipo oración (`ETIQUETA_DATO`) + caja `h-control rounded-lg border bg-muted px-3 font-mono text-control`; si el dato no existe todavía, caja con `—` y `cursor-not-allowed` + `title` explicando.
- **Select** (`ui/select.tsx`, base-ui): disparador `h-control rounded-lg border-border bg-card text-control font-medium shadow-xs` (todos los `size` miden `h-control`; `size="campo"` solo agrega el padding de `CAMPO`) con `ChevronDown`; popup alineado al disparador, ítems con check.
- **Selector de filas** (`ui/selector-por-pagina.tsx`): grupo `h-control rounded-lg border bg-card p-0.5` con `10 · 20 · 50`, activo `bg-foreground text-background`.
- Validación con zod + react-hook-form; mensajes de error desde `lib/messages.ts` (`mensajeError(codigo)`).
- **Archivo (.p12/.pfx)** en `/empresa`: input de archivo + clave, feedback con vigencia del certificado (pill verde/ámbar/rojo según días restantes).

---

## 11. Tarjetas y secciones

- **Tarjeta** (`TARJETA`): `rounded-xl` (18 px) `bg-card`, sin borde ni sombra en reposo en claro (`--borde-tarjeta` transparente): la separa el lienzo gris. En oscuro lleva borde `color-mix(fg 7 %)`, brillo interior arriba (`--brillo-tarjeta`) y un degradado de +2.5 % blanco en los primeros 120 px. `TARJETA_ELEVABLE` (métricas) sube 2 px y toma `--sombra-elevada` al pasar el mouse; con «reducir movimiento» solo cambia la sombra.
- **Cabecera de sección**: `flex items-center gap-2.5 px-4 py-3 border-b border-border/60` → icono Phosphor 16 px sin caja ni fondo, en `muted-foreground` o el color de su tono + título `text-titulo` + subtítulo `text-etiqueta`; a la derecha, chips/contadores (`rounded-md bg-secondary px-2 py-0.5 font-mono text-etiqueta`).
- **Pie de tarjeta**: `border-t border-border/60 bg-muted/60 px-4 py-2 text-etiqueta text-muted-foreground`, con iconos 12 px (`Lock`, `KeyRound`).
- **Fila de métricas** (cabecera de cada página): `FilaMetricas` es una grilla de tarjetas separadas (`gap-3`; 1 columna en móvil, 2 en tablet y `columnas`, por defecto 4, en `lg`); cada `Metrica` es su propia tarjeta con la anatomía de «Tarjetas de métrica» (§20).
- **Tarjeta destacada** (`patrones/tarjeta-destacada.tsx`): panel de color plano `rounded-xl p-6`, sin borde ni sombra, para destacar un bloque (bienvenida, función nueva, plan, siguiente paso). Tonos `neutro | info | ok | aviso | invertido` con los tokens de siempre; el título y la descripción llevan el color del tono, sin opacidad, así el contraste calculado vale para ambos. No es un aviso (no anuncia nada al lector de pantalla): para eso, `Alerta`.
- **Tarjeta deshabilitada / próximamente**: `opacity-60`/`70`, `cursor-not-allowed`, chip `Próximamente` (`text-etiqueta`) y `title`.

---

## 12. Tablas (`ui/table.tsx` + patrón de página)

Todas las listas (comprobantes, series, API keys) siguen el mismo esqueleto:

1. **Barra de filtros** (`flex flex-wrap justify-between gap-3`): a la izquierda pestañas segmentadas (`SEGMENTADO` + `SEGMENTO`: caja `min-h-control p-0.5`, segmentos `h-7`, activo `bg-card shadow-sm` por `data-active` o `aria-current="page"`) o cabecera con icono; a la derecha `Select`s de filtro (`CONTROL_FILTRO`: `h-control rounded-lg border bg-card text-control font-medium shadow-xs`), filtros aún no soportados como botones deshabilitados, y botón **refrescar** (`size-control`, icono gira mientras `useTransition` está pendiente) — todo a `h-control` para alinear con el `Select` de la misma barra.
2. **Contenedor** (`CONTENEDOR_TABLA`): tarjeta `rounded-xl bg-card` sin borde; `opacity-60` mientras refresca.
3. **Cabecera** (`CABECERA_TABLA`): sin fondo, celdas con `ROTULO` (`text-etiqueta` 600 en mayúsculas, `tracking-[0.04em]`, `texto-terciario`); primera columna checkbox deshabilitado (selección múltiple próximamente).
4. **Filas**: bandas redondeadas de 12 px sobre `soft` (`secondary`), separadas por 3 px, sin línea separadora; la fila seleccionada toma `accent`. `text-control`; celda principal con dos líneas (valor fuerte + subtítulo `text-etiqueta`, mono si es un dato); identificadores en `ChipCodigo` (`rounded-md px-2 py-0.5 font-mono text-control font-medium bg-accent text-accent-foreground`; inactivos: `bg-secondary text-muted-foreground line-through`); numéricos a la derecha con `tabular-nums`; estado con pill (§13); acciones a la derecha.
5. **Vacío** (`FilaVacia columnas={n} icon={…}`): fila única `py-14 text-center` con icono 24 px y mensaje ("Todavía no tienes… Crea la primera con «…»" / "No hay … con los filtros seleccionados"), **sin** la banda `soft` de las celdas (un mensaje de 14 líneas de alto en banda gris se ve como un bloque suelto). Sin `icon` sirve para «Cargando…».
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
- **Tipo de comprobante**: icono Phosphor 19 px sin fondo, en `acento-2-texto`, con el código (`01`, `03`, `07`, `08`) al lado.
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

Estructura fija: `DialogContent className="gap-0 p-0"` (radio 22, velo `--overlay` con 2 px de desenfoque, cerrar en botón redondo) →
- **Cabecera** `CabeceraDialogo` (`px-5 pt-5 pb-3`, **sin línea debajo**): icono de 22 px en un círculo de 40 px del `tono` (`neutro` acento suave, `peligro`, `aviso`, `ok`; la única excepción a «icono sin fondo»: es la cara del diálogo) + `DialogTitle` (`text-titulo`) + `DialogDescription` (`text-control`).
- **Cuerpo** `px-5 pb-2` (formularios: `grid gap-4`).
- **Pie** `PieDialogo` (`px-5 pt-3 pb-5`, **sin línea encima**, `justify-end gap-2`, o `justify-between` con un enlace a la izquierda). `DialogoConfirmacion` usa `tono="peligro"` cuando la acción es destructiva.

Tres familias:
1. **Formulario** (Nueva serie, Nueva empresa): campos con las recetas de §10; `Cancelar` secundario + primario `h-control`.
2. **Secreto de un solo uso** (Nueva API key): paso 1 explicación + "Generar llave"; paso 2 `code` con `select-all`, botón Copiar (pasa a verde "Copiada") y aviso ámbar (`border-warning-border bg-warning`) "no volverá a mostrarse"; al cerrar `router.refresh()`.
3. **Referencia técnica / ejemplo** (Series, Empresa, API keys, Prueba de emisión): ancho `min(1200px, 100vw - 3rem)`, dos tarjetas (modelo de datos en tabla de campos `campo · tipo · descripción` con icono `KeyRound` ámbar en claves; reglas/formatos en filas `rounded-lg border-border/60 bg-muted/40`), pie con enlace a `/developers` y botón "Entendido".

Confirmaciones irreversibles **no** usan diálogo: se confirman **en línea** dentro de la fila ("¿Revocar de forma permanente? [Sí, revocar] [Cancelar]").

---

## 16. Código y datos técnicos

- **Barra de endpoint**: `bg-muted border-b px-4 py-2` con chip de método (`rounded-md bg-accent px-1.5 py-0.5 font-mono text-etiqueta font-semibold text-accent-foreground`; el verbo es un literal, se escribe con `toUpperCase()`), URL `font-mono text-control` truncada, pestañas de lenguaje (`cURL · Node.js / TS · Python`, control segmentado `h-control` con segmentos `h-7`) y botón copiar.
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
- **Apariencia**: «Apariencia…» en el menú de usuario abre `PanelApariencia` (paleta, tono oscuro, tipografía, diseño). Ver «Apariencia» en §20.
- **Iconos**: Phosphor; semánticos en duotono, funcionales en bold, nunca con fondo. Ver «Iconos» en §20.
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

Los gráficos usan `--chart-1..5` (ver «Gráficos» más abajo); en oscuro los pasos semánticos son `#27a070 #bf8a26 #dc4a68 #3a88c6`, validados para daltonismo y contraste, y `--chart-1` es el `acento-2` de la paleta.

`components/ui` sumó `Avatar` + `AvatarGroup` (sobre `base-ui/avatar`; `rounded-full`, ver §4) y `Popover` + `PopoverHeader` (sobre `base-ui/popover`, misma familia visual que `SelectContent` — úsalo para contenido rico que no cabe en un `Tooltip`, como filtros avanzados o una ficha de usuario).

Quinto lote: `Separator` (sobre `base-ui/separator`; en vertical necesita una altura explícita en `className`, no tiene tamaño propio en ese eje — reemplaza el `<div className="h-4 w-px bg-border">` que se armaba a mano en `TopBar`), `Kbd` (extraído del mismo patrón ad hoc que ya usaban `TopBar` y `Paleta`), `GrupoBotones` (sobre `base-ui/toggle-group` + `toggle`; la versión con teclado — flechas entre opciones — del control segmentado que hoy se repite a mano en `SelectorPorPagina`, `ThemeToggle` y `Tabs estilo="segmentado"`; úsalo controlado para que no se pueda "apagar" la única opción activa) y `Contrasena` (en `formularios/`: mostrar/ocultar + medidor de fuerza opcional sobre `base-ui/meter`, heurística de longitud/variedad de caracteres — no reemplaza validación real de backend).

`formularios/` sumó también `StepperNumerico` (sobre `base-ui/number-field`; para cantidades con decimales, `paso="any"`: con el paso entero por defecto un valor como 2.5 bloquea el envío del formulario) y `EntradaRangoFechas` (dos `EntradaFecha` con atajos Hoy/7 días/30 días/Este mes).

`datos/TablaDatos<T>` ya no tiene la selección múltiple "próximamente" que describe §12 para el portal de origen: acepta una prop `seleccion` (`{ seleccionados, onCambio, acciones }`) que activa la columna de checkboxes, el estado indeterminado de "seleccionar todo" (solo la página visible) y una barra de acciones masivas sobre la tabla. Nótese además que `ListaDatos` **es** el patrón "lista de definición" (`dt`/`dd` etiqueta/valor) — no hace falta un componente aparte para eso.

Sexto lote: `HoverCard` (sobre `base-ui/preview-card`; su disparador es un `<a>` por defecto — pensado para previsualizar un enlace —, pero con `render` toma la forma de lo que le pases, igual que `Tooltip`; solo con hover/foco, sin clic, para fichas de vista previa que no necesitan la acción inmediata de un `Popover`), `ScrollArea` (sobre `base-ui/scroll-area`; scrollbar propio del kit en vez del nativo, `alto` obligatorio), `Deslizador` (en `formularios/`, sobre `base-ui/slider`; un valor o un rango de dos manijas con `valor` como tupla) y `Banner` (en `feedback/`; aviso de ancho completo para el `Shell`, sobre `TopBar` y no dentro de `main` — a diferencia de `Alerta`, que es una banda con esquinas dentro de una página).

Séptimo lote: `Autocomplete` (en `formularios/`, sobre `base-ui/autocomplete`; a diferencia de `Combobox`, no fuerza a elegir un valor de la lista — `value`/`onValueChange` son el texto libre, y clic en una sugerencia solo lo rellena), `Toolbar` (sobre `base-ui/toolbar`; barra de controles agrupados con foco por flechas entre ellos — contenedor `h-control`/`p-0.5` con botones internos `size-7`, el mismo patrón de `GrupoBotones` y `Tabs estilo="segmentado"`) y `Drawer` (sobre `base-ui/drawer`; hoja inferior para móvil con arrastre nativo para cerrar, a diferencia de `Sheet` que solo anima entrada/salida sin gesto de arrastre).

Octavo lote (estilo Notion de Refero): `TarjetaDestacada` (en `patrones/`; panel de color plano de cinco tonos, a diferencia de `Alerta` es contenido estático y no un aviso; a diferencia de `Card` trae tono y estructura fija de icono, título, descripción y acción), la variante `suave` de `Button` (relleno `accent`; entre `ghost`/`outline` y `default`) y el mecanismo de **diseños** descrito abajo.

### Diseños

Un diseño es un conjunto de tokens que cambia el aspecto de toda la interfaz sin tocar los componentes. Se elige en el menú de usuario, bajo Tema, y se guarda en `localStorage` (`khipu-diseno`).

| Pieza | Qué hace |
|---|---|
| `components/disenos.ts` | La lista `DISENOS` (`valor` + `etiqueta`), `DISENO_POR_DEFECTO` (`"khipu"`) y la clave de localStorage |
| `components/diseno.tsx` | `DisenoProvider` (guarda el diseño y lo pone en `<html data-diseno>`) y `useDiseno()` (sin proveedor devuelve una lista vacía y no falla) |
| `components/script-diseno.tsx` | `ScriptDiseno`, script en línea para el `<head>` del layout raíz: aplica el diseño guardado antes del primer pintado, sin parpadeo |
| `components/nav/selector-diseno.tsx` | `SelectorDiseno`: un `Select` de `h-control`; no pinta nada con un solo diseño o sin proveedor |
| `MenuUsuario` | Muestra el selector bajo Tema; `mostrarDiseno={false}` lo oculta |

Para adoptarlo en una app: envuelve con `DisenoProvider` (dentro de `ThemeProvider`) y pon `<ScriptDiseno />` dentro de `<head>` en `app/layout.tsx`. Sin eso, `MenuUsuario` se ve exactamente como antes.

**Agregar un diseño:** (1) un bloque en `src/styles/tokens.css` que sobrescriba solo los tokens que cambian; (2) su entrada en `DISENOS`; (3) el contraste de cada par de texto afectado, calculado y no estimado.

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

Excepciones de `papel`: el azul `#0075de` sobre el lienzo da 4.19 (sobre card, 4.57), así que un enlace `text-primary` directamente sobre el fondo queda bajo 4.5; el texto sobre fondo de acento usa `#005bab`. `--chart-1` no cambia para que no se confunda con `--chart-5`. Hereda de khipu la tipografía (Inter + JetBrains Mono), los iconos, los radios y la escala; no usa paletas ni tonos oscuros (los bloques `html:not([data-diseno="papel"])[data-paleta]` no aplican) y el selector de apariencia no se muestra.

### Movimiento

El movimiento confirma una acción, muestra un cambio de estado o introduce contenido; nunca decora. Tiene dos capas que comparten valores: CSS para lo que debe funcionar en Server Components y en los primitivos de base-ui, y [Motion](https://motion.dev) para lo que CSS no hace bien (layout, trazos, contadores, entradas y salidas de React).

| Valor | CSS (`src/styles/`) | Motion (`lib/movimiento.ts`) |
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
- Con «reducir movimiento» nada se desplaza, escala ni se dibuja: `MotionConfig reducedMotion="user"` anula transformaciones y layout, los efectos que no lo son (trazos, contador, altura, anillo) consultan `useReducedMotion()`, y el CSS va bajo `motion-safe:`/`motion-reduce:`. Las transiciones de los primitivos de base-ui (diálogo, sheet, drawer, popover, menú, select, tooltip, toast, acordeón, indicador de `Tabs`) las acorta a 1 ms la regla `@media (prefers-reduced-motion: reduce)` de `src/styles/theme.css`; los spinners y el progreso indeterminado siguen girando porque indican carga. Solo quedan fundidos de opacidad.
- Toasts: siguen con la transición CSS de base-ui; `AnimatePresence` competiría con su cierre por tiempo y por gesto.
- El diseño `papel` fija las transiciones por defecto en 200 ms (`--default-transition-duration`, §Diseños).

### Apariencia

La **paleta** (los tres acentos), el **tono del modo oscuro** y la **tipografía** son preferencias de cada usuario, independientes del tema (claro/oscuro/sistema, de next-themes) y del diseño. Se eligen en `PanelApariencia` («Apariencia…» del menú de usuario) y se guardan en `localStorage` (`khipu-paleta`, `khipu-oscuro`, `khipu-fuente`). Mismo patrón que los diseños, con un solo proveedor para las tres preferencias:

| Pieza | Qué hace |
|---|---|
| `components/apariencia-opciones.ts` | `PALETAS` (`lima` por defecto, `indigo`, `oceano`, `coral`, `violeta`; cada una con `valor`, `etiqueta` y `muestra` de 3 colores), `TONOS_OSCURO` (`medianoche` por defecto, `grafito`, `tintado`; `muestra` y `lienzo`), `FUENTES` (`inter` por defecto, `jakarta`, `manrope`, `dmsans`, `figtree`; cada una con su `familia` CSS), `PALETA_POR_DEFECTO`, `TONO_OSCURO_POR_DEFECTO`, `CLAVE_PALETA`, `CLAVE_TONO_OSCURO`. No importa nada: lo usan el servidor, el cliente y los tests |
| `components/apariencia.tsx` | `AparienciaProvider({ paletas?, tonosOscuro?, fuentes?, inicial?, onCambio? })` escribe `data-paleta`, `data-oscuro` y `data-fuente` en `<html>` y en `localStorage`. `useApariencia()` devuelve `{ paleta, setPaleta, paletas, tonoOscuro, setTonoOscuro, tonosOscuro, fuente, setFuente, fuentes }`; sin proveedor, listas vacías y no falla |
| `components/script-diseno.tsx` | `ScriptDiseno` acepta `paletas`, `tonosOscuro`, `fuentes` e `inicial` y aplica `data-paleta`, `data-oscuro` y `data-fuente` antes del primer pintado, sin parpadeo. Un valor guardado que no está en la lista se ignora |
| `components/nav/selector-apariencia.tsx` | `SelectorPaleta` (círculos con la muestra de 3 colores), `SelectorTonoOscuro` (mini pantalla: lienzo, tarjeta y acento, con el nombre), `SelectorTipografia` («Aa» dibujado en cada fuente) y `SelectorApariencia` (los tres juntos). Cada grupo es un `role="radiogroup"` con flechas, `aria-label` y tooltip; `grande` agranda las muestras |
| `components/nav/panel-apariencia.tsx` | `PanelApariencia({ open, onOpenChange })`: panel derecho con Tema, Paleta, Tono oscuro, Tipografía y Diseño. Lo abre «Apariencia…» de `MenuUsuario` (`mostrarApariencia={false}` lo quita). No muestra las preferencias con el diseño «papel» |
| `Providers` | Ya incluye `AparienciaProvider`; la prop `apariencia` le pasa `inicial`, `onCambio` y las listas |

El tono oscuro se aplica siempre al atributo, pero solo tiene efecto con `.dark`: se puede elegir estando en claro. Los bloques de paleta y tono van acotados con `html:not([data-diseno="papel"])`, así que «papel» no los usa.

**Guardarlo por usuario.** `inicial` (p. ej. leído del perfil en el servidor) gana sobre `localStorage`; `onCambio` recibe `{ paleta, tonoOscuro, fuente }` en cada cambio. Pasa el mismo `inicial` a `ScriptDiseno` para que el primer pintado ya sea el del usuario:

```tsx
// app/layout.tsx — Server Component
import { Providers } from "@/components/providers";
import { ScriptDiseno } from "@/components/script-diseno";
import { guardarApariencia, leerApariencia } from "./apariencia-acciones"; // "use server": lee y guarda en tu backend

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const inicial = await leerApariencia(); // { paleta?: string; tonoOscuro?: string; fuente?: string }
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <ScriptDiseno inicial={inicial} />
      </head>
      <body>
        <Providers apariencia={{ inicial, onCambio: guardarApariencia }}>{children}</Providers>
      </body>
    </html>
  );
}
```

**Tipografía.** Inter es la fuente de la app (`--font-sans`). Las otras las carga la app con `next/font` en `--fuente-<valor>` y `preload: false` (solo se descargan si alguien las elige), y `html[data-fuente="<valor>"]` las pone en `--font-sans`. Los datos (correlativos, ids, código) siguen en JetBrains Mono. Inter se carga una sola vez: Turbopack rechaza dos llamadas a la misma fuente de `next/font/google`.

**Agregar una paleta:** (1) un bloque `html:not([data-diseno="papel"])[data-paleta="…"]` en `src/styles/tokens.css` que redefina solo `--acento`, `--acento-texto`, `--acento-2`, `--acento-2-texto` y `--acento-3`; (2) su entrada en `PALETAS` (la `muestra` con los mismos hex); (3) su nombre en `PALETAS` de `scripts/verificar-contraste.mjs`, para que `npm run check:contraste` la mida en claro y en los tres tonos oscuros.

### Iconos

- **Phosphor** (`@phosphor-icons/react`, dependencia del paquete). Dos reglas por tipo. **Funcionales** (caret, check, cerrar, más/menos, flechas, ⋯, lupa, copiar, refrescar, spinner, hamburguesa): **bold** siempre (`PESO_ICONO_FUNCIONAL`); en un glifo de un trazo el relleno suave se veía como un triángulo o una mancha, y `scripts/iconos-funcionales.mjs` agrega `weight="bold"` a los que falten.
- **Semánticos** (menú, encabezados, tarjetas, estados, avisos): **duotono** (`PESO_ICONO`); el estado activo o destacado (ítem del sidebar, métrica destacada, tab activa) va en **relleno** (`PESO_ICONO_ACTIVO`, `fill`). En cliente, el `IconContext` de `Providers` fija el duotono; en un Server Component se importa de `@phosphor-icons/react/dist/ssr` con `weight` explícito.
- **Nunca con fondo ni contenedor**: nada de cajas teñidas detrás de un icono. El color dice el significado: `success-foreground` / `warning-foreground` / `destructive-texto` para estados, `muted-foreground` para lo neutro, `acento-2-texto` para categorías.
- **Tamaños:** 18 px en el menú y el sidebar, 16 px en encabezados de tarjeta y controles, 19 px para el tipo de documento en tablas, 18 px en actividad, 15 px dentro de botones.
- **Tipo de prop:** las props `icon`/`icono` del kit son `IconoComponente` (`lib/iconos.ts`), que acepta componentes de Phosphor y de Lucide (Lucide ignora `weight`). Quien ya pasaba iconos de `lucide-react` no tiene que cambiar nada; `lucide-react` es peer opcional. `scripts/tests/iconos-tipo.test.mjs` verifica que ambos sigan siendo asignables.

### Fechas

`EntradaFecha` abre un **calendario propio** en un popover (`formularios/calendario.tsx`), no el selector nativo del navegador, que no se puede estilizar y cambiaba con cada sistema. El disparador es un `CAMPO` con icono de calendario, la fecha como «15 Set 2026» (o el `placeholder`) y un caret que gira. El valor sigue siendo ISO `YYYY-MM-DD`, con las mismas props; `conVistaPrevia` queda sin efecto.

- **Calendario:** mes en español («Setiembre 2026»), semana de lunes a domingo, días de 36 px en círculo. Hoy va en el acento suave; el elegido, en `primary`. Los días fuera de `min`/`max` quedan deshabilitados. Botón «Hoy» al pie.
- **Teclado** (patrón de grilla de fechas de WAI-ARIA): al abrir, el foco va al día elegido o a hoy. Flechas por día o semana, RePág/AvPág por mes (con Shift, por año), Inicio/Fin al comienzo o fin de la semana, Enter o Espacio para elegir. Al elegir, el foco vuelve al disparador.
- **Fechas sin zona horaria:** `lib/calendario.ts` arma todo en hora local al mediodía. `new Date("2026-09-01")` es UTC y en Lima mostraba el día anterior.

### Tarjetas de métrica

`Kpi` y `Metrica` comparten la anatomía de `TarjetaMetrica` (`patrones/metricas.tsx`), una tarjeta `TARJETA_ELEVABLE` por métrica:

1. **Encabezado:** icono 16 px en el color del `tono` (sin fondo) + etiqueta `text-control` + `acciones` a la derecha (típicamente un `MenuAcciones`, que pone su «⋯»).
2. **Valor:** `text-metrica tabular-nums`; el sufijo («/ 136») en `text-control` terciario.
3. **Visual** (`visual`): `{ tipo: "barra", valor }` (progreso 0–100 de 6 px) o `{ tipo: "puntos", total, marcados }` (segmentos, los marcados en el color del tono); en `Kpi`, `serie` dibuja un sparkline con área.
4. **Pie:** en `Kpi`, `ChipVariacion` (flecha + `12.0%`: verde si es buena, rojo si es mala, neutro si es cero; `invertir` cuando bajar es bueno) + `periodo` en texto terciario; en `Metrica`, la `ayuda`.
5. **Destacada** (`destacada`): la superficie de acento (`acento-superficie`): el acento pleno en claro, superficie teñida con borde de acento y texto pastel en oscuro. El icono pasa a relleno.

Props nuevas, todas opcionales: `icono`, `tono` (`ok | aviso | error | neutro | acento`), `visual`, `destacada`, `acciones`. `serie`, `variacion`, `periodo` e `invertir` no cambian. `FilaMetricas` es una grilla de tarjetas separadas con `gap-3` (mismo export, mismas props). `VisualDeMetrica` y `ChipVariacion` se exportan sueltos.

### Gráficos

- Con una serie, `GraficoBarras` pinta las barras en `--chart-base` (el `acento-2` de la paleta; en oscuro al 38 %) y la barra `destacado` (índice) en `--chart-destacado`, el `acento` pleno. Con varias series usa `--chart-1..5` en orden fijo. `GraficoLineas` y `Sparkline` usan `--chart-1`.
- **Accesibilidad (WCAG 1.4.11):** el relleno pastel no llega a 3:1 sobre la tarjeta en claro, así que cada barra (y cada muestra de la leyenda) lleva un borde de 1 px en `--chart-trazo-*` (`base`, `destacado`, `3`, `4`, `5`), que sí supera 3:1 en las 5 paletas y los 3 tonos oscuros; `npm run check:contraste` lo comprueba. `GraficoLineas` con varias series usa esos mismos colores de trazo. Además, el valor de cada barra va en su `<title>` y en el tooltip: ningún dato se comunica solo por el color.
- Rejilla recesiva, etiquetas de eje en texto terciario, leyenda solo con ≥ 2 series, máximo 5 series.

### Pendientes

- Adoptar en el portal los componentes del kit que reemplazan código ad hoc (tooltip real, toasts, menú ⋯ de filas, `TablaDatos`).
- Rail colapsado de 64 px para tablet (hoy: sidebar completo en `md+`, sheet en móvil).
- Gráficos del dashboard del portal (etapa 2) con `GraficoBarras`/`GraficoLineas`.
- El registro tiene dos items llamados `movimiento` (`components/movimiento` y `lib/movimiento`): `add movimiento` en la CLI elige uno por nombre. Las dependencias internas usan la clave completa y no se ven afectadas.
- `NumeroAnimado` muestra el valor del servidor, salta a 0 al hidratar y vuelve a contar desde 0 si `valor` cambia; debería contar desde el valor anterior.
