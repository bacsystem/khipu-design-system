# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] - 2026-11-01

### Fixed
- Chart contrast (WCAG 1.4.11): every bar and legend swatch gets a 1 px border in the new `--chart-trazo-*` tokens, ≥ 3:1 against the card in all 5 palettes and 3 dark tones. Multi-series lines use the same stroke colors. `verificar-contraste` now checks these pairs (620 pairs, 20 combinations).
- `components/ui/*` primitives (`Badge`, `Avatar`, `Button` xs, `Drawer`, `Input`, `Label`, `Table` caption) use the named type scale (`text-etiqueta`, `text-control`, `text-cuerpo`, `text-titulo`) instead of Tailwind sizes; `verificar-tipografia` no longer exempts `ui/`.

## [0.5.0] - 2026-11-01

### Changed
- Diseño base «khipu» pastel y compacto: lienzo gris claro `#eceef1`, tarjetas blancas sin borde ni sombra en reposo, el color de la paleta en superficies (ítem activo, métrica destacada, gráficos) y no en botones. Oscuro por defecto «Medianoche» (`#0a0f1c`, tarjeta `#111a2c`) con los acentos como superficie teñida + texto pastel.
- Tipografía Inter (interfaz, con `cv11`, `ss01`, `ss03`) + JetBrains Mono (solo correlativos, ids, llaves y código). Escala: `text-etiqueta` 11.5, `text-control` 13, `text-cuerpo` 13, `text-metrica` 26; nuevas `text-titulo` 14.5 y `text-titulo-pagina` 21.
- Iconos de Phosphor (`@phosphor-icons/react`) en todos los componentes, peso duotono y relleno (`fill`) en el estado activo o destacado, siempre sin fondo ni contenedor: el color dice el significado.
- Altura única de control: 34 px (`h-control`, `--spacing-control: 2.125rem`) en lugar de `h-9`.
- Botones, chips, pills de estado, segmentados, ítems de menú y paginación en píldora (`rounded-full`). Radios 12 px en campos (`rounded-lg`) y 18 px en tarjetas, popovers y diálogos (`rounded-xl`), con `--radius: 0.75rem`.
- Filas de tabla como bandas redondeadas de 12 px sobre `soft`, separadas por 3 px; cabeceras de tabla y de grupo con `ROTULO` (11.5 px, 600, mayúsculas).
- Sidebar flotante de 216 px: tarjeta con radio 18 y margen 12, ítem activo en píldora con el acento y su icono relleno.
- Acción principal casi negra (`#16181d`) en claro y casi blanca (`#f4f5f7`) en oscuro (`--primary`); el anillo de foco es `--acento-texto` (≥ 8:1 sobre tarjeta).
- `FilaMetricas` pasa de una tarjeta dividida a una grilla de tarjetas separadas con gap 12 (mismo export, mismas props).
- `lucide-react` deja de usarse en los componentes y pasa a peer **opcional**; las props de icono aceptan Phosphor y Lucide.
- Iconos funcionales (caret, check, cerrar, ±, flechas, ⋯, lupa, copiar, refrescar, spinner) en **bold**; el duotono queda para los semánticos (`PESO_ICONO_FUNCIONAL`).
- `EntradaFecha` usa un calendario propio en un popover (`Calendario`) en lugar del selector nativo del navegador: mismo valor ISO y mismas props (`conVistaPrevia` queda sin efecto). Teclado: flechas, RePág/AvPág (Shift: año), Inicio/Fin, Enter.
- Select: lista de radio 16 con hover suave, check en círculo de acento y caret que gira. Campos: foco con el anillo del acento (`FOCO_CAMPO`), error con anillo rojo tenue. Checks de 18 px (radio 6), switch más fino, opciones en tarjeta teñidas con el acento. Stepper en píldora, slider más fino.
- Diálogos de radio 22 sin líneas entre cabecera y pie, con el icono en un círculo del tono (`CabeceraDialogo` `tono`) y velo más suave (2 px de desenfoque). Panel lateral flotante (12 px de margen, radio 20). Avisos sin borde. Tabs con contador en píldora; acordeón sobre superficie suave.
- Gráficos: barras de radio 9, leyenda en píldoras junto al título, el viewBox sigue el ancho real (las etiquetas quedan en 10 px a cualquier tamaño).
- `TablaDatos`: la barra de selección pasa a ser una barra flotante en píldora que invierte el tema, con el contador en un círculo de acento, acciones en píldora (recetas `ACCION_MASIVA` y `ACCION_MASIVA_PELIGRO`) y «Quitar selección» redondo. Antes eran enlaces de texto sobre una franja tenue.
- `MenuUsuario` es compacto: cuenta, tema solo con iconos, «Apariencia…» y cerrar sesión. Las preferencias (paleta, tono oscuro, tipografía, diseño) van en `PanelApariencia`, un panel a la derecha con vista previa en vivo.
- Ninguna prop ni export se quitó ni cambió de nombre.

### Added
- **Apariencia elegible por el usuario**: `AparienciaProvider`, `useApariencia`, `PanelApariencia`, `SelectorApariencia`, `SelectorPaleta`, `SelectorTonoOscuro` y `SelectorTipografia` (`nav/selector-apariencia`), `PALETAS`, `TONOS_OSCURO` y `FUENTES` (`apariencia-opciones`). Cinco paletas (Lima por defecto, Índigo, Océano, Coral, Violeta) en `html[data-paleta]`, tres tonos oscuros (Medianoche por defecto, Grafito, Tintado) en `.dark[data-oscuro]` y cinco tipografías (Inter por defecto, Plus Jakarta Sans, Manrope, DM Sans, Figtree) en `html[data-fuente]`, guardados en `localStorage` (`khipu-paleta`, `khipu-oscuro`, `khipu-fuente`). No aplican con el diseño «papel».
- `ScriptDiseno` acepta `paletas`, `tonosOscuro`, `fuentes` e `inicial` y aplica `data-paleta`, `data-oscuro` y `data-fuente` antes del primer pintado. `Providers` acepta `apariencia` (`inicial`, `onCambio`…), que pasa a `AparienciaProvider`.
- `Metrica` y `Kpi`: `icono`, `tono` (`ok | aviso | error | neutro | acento`), `visual` (`barra` o `puntos`), `destacada` y `acciones`. Piezas sueltas: `TarjetaMetrica`, `VisualDeMetrica`, `ChipVariacion`.
- `GraficoBarras` `destacado`: índice de la barra que va en el acento de la paleta (con una serie). `GraficoAnillos`: anillos concéntricos con la paleta y su leyenda.
- `Calendario` (`formularios/calendario`) y `lib/calendario` (fechas ISO sin desfase de zona horaria).
- `IconoComponente`, `PESO_ICONO`, `PESO_ICONO_ACTIVO` y `PESO_ICONO_FUNCIONAL` (`lib/iconos`); recetas `ROTULO`, `TARJETA_ELEVABLE`, `FOCO_CAMPO`, `FOCO_CAMPO_VISIBLE` y `ERROR_CAMPO` (`lib/estilos`). `TonoOscuro` acepta `lienzo` (muestra de dos tonos).
- Tokens `--acento`, `--acento-texto`, `--acento-2`, `--acento-2-texto`, `--acento-3`, `--acento-suave`, `--acento-2-suave`, `--acento-3-suave`, `--acento-superficie`, `--acento-superficie-texto`, `--acento-borde`, `--texto-terciario`, `--info` / `--info-foreground`, `--chart-base`, `--chart-destacado`, `--borde-tarjeta`, `--brillo-tarjeta`, `--sombra-elevada`; utilidades `text-titulo`, `text-titulo-pagina` y `h-control`.
- Subrutas del paquete `khipu-design-system/apariencia` y `khipu-design-system/apariencia-opciones`.
- `npm run check:contraste` mide las 20 combinaciones (5 paletas × claro + 3 tonos oscuros).

### Upgrading from 0.4.x
1. Vuelve a pegar `src/styles/tokens.css` y `src/styles/theme.css` (o sube el tag del paquete a `#v0.5.0`, cuyo `styles.css` ya los trae): hay tokens nuevos obligatorios (`--acento*`, `--texto-terciario`, `--info*`, `--chart-base`, `--chart-destacado`, `--borde-tarjeta`, `--brillo-tarjeta`, `--sombra-elevada`, `--spacing-control`, `--text-titulo*`) y los bloques de paleta y de tono oscuro.
2. Instala `@phosphor-icons/react`. `lucide-react` es opcional: si ya pasas iconos de Lucide a `icon`/`icono`, siguen funcionando (ignoran `weight`).
3. Cambia `next/font` a `Inter` + `JetBrains_Mono` en `--font-sans` / `--font-mono`, como en `src/app/layout.tsx`. Para ofrecer las otras tipografías, cárgalas en `--fuente-jakarta`, `--fuente-manrope`, `--fuente-dmsans` y `--fuente-figtree` con `preload: false`.
4. Los controles miden 34 px: cualquier `h-9` escrito a mano junto a un control del kit pasa a `h-control` (y `size-9` a `size-control`).
5. Para guardar la paleta, el tono oscuro y la tipografía por usuario, pasa `inicial` (leído del perfil en el servidor) y `onCambio` a `Providers` (`apariencia`) y el mismo `inicial` a `ScriptDiseno`.

## [0.4.0] - 2026-10-31

### Changed
- Diseño base «khipu» al estilo Linear/Vercel: neutros zinc, acento índigo `#5b5bd6` / `#8585f2`, sombras en capas (en oscuro con brillo interior), tarjetas de 12 px, sidebar del color del fondo.
- Tipografía Geist + Geist Mono. Escala con nombre: `text-etiqueta` 12, `text-control` 13, `text-cuerpo` 14, `text-metrica` 24. Sin etiquetas en mayúsculas; mono solo para datos.
- Pills sin borde; bloque de código sobre el token `codigo`; anillo de foco único (`FOCO`).
- Transiciones con una curva (`ease-salida`) y tres duraciones (`--duracion-rapida/media/lenta`); con «reducir movimiento» los diálogos, popups, sheets y drawers dejan de desplazarse y escalar.
- `cn` se importa siempre desde `@/lib/utils`, que lo configura con la escala tipográfica: el paquete `cn` solo trataba `text-etiqueta` y compañía como colores y borraba el tamaño o el color al combinarlos.
- `BotonCopiar`, `PieTabla`, `CABECERA_TABLA` y `SELECT_NATIVO` (de 0.3.1) pasan a la escala con nombre y a las sombras nuevas; `BotonCopiar` anima el cambio a check también con `etiqueta`.
- Ninguna prop ni export se quitó ni cambió de nombre. Sí cambian los valores de todos los tokens.

### Added
- **Diseños seleccionables**: `DisenoProvider`, `useDiseno`, `ScriptDiseno` (sin parpadeo al cargar) y `SelectorDiseno`, con el diseño alternativo «papel» (estilo Notion, cálido y azul). `MenuUsuario` muestra el selector debajo del tema (`mostrarDiseno`, por defecto `true`).
- `Button` `variant="suave"` (relleno de acento) y el patrón `TarjetaDestacada`.
- Motion (`motion` ^14) con `ProveedorMovimiento`, `MovimientoLocal` y `lib/movimiento.ts`. Sidebar, `TablaDatos`, gráficos, `Sparkline`, `ProgresoCircular`, `ConfirmacionEnLinea` y `BotonCopiar` animados; `Tabs` con indicador que se desliza.
- `NumeroAnimado`, `TrazoAnimado`, recetas `FOCO` y `SEGMENTO_BASE`, tokens `destructive-suave` / `destructive-texto` (el rojo sobre rojo tenue no llegaba a 4.5), `codigo` / `codigo-foreground`, `--sombra-*` y `--duracion-*`.
- `npm run check:tipografia` y `npm run check:contraste` (en `npm run lint`), `npm test`.

### Upgrading from 0.3.x
**Como paquete:** sube el tag (`#v0.4.0`). `motion` llega como dependencia; `styles.css` ya trae los tokens nuevos. Carga Geist y Geist Mono en `--font-sans` / `--font-mono` y, si no usas `Providers` tal cual, agrega `ProveedorMovimiento` y `DisenoProvider`, y `ScriptDiseno` en el `<head>` (ver `src/app/layout.tsx`).

**Copiando archivos:**
1. Vuelve a pegar `src/styles/tokens.css` y `src/styles/theme.css`: hay tokens nuevos obligatorios (`--destructive-suave`, `--destructive-texto`, `--codigo*`, `--sombra-*`, `--duracion-*`, la escala `--text-*` y `--ease-salida` en `@theme`, los diseños `html[data-diseno]` y la regla de «reducir movimiento»).
2. Instala `motion`. Si no usas `Providers` tal cual, agrega `ProveedorMovimiento` y `DisenoProvider`, y `ScriptDiseno` en el `<head>` (ver `src/app/layout.tsx`).
3. Carga Geist y Geist Mono en lugar de Inter y JetBrains Mono (`src/app/layout.tsx`).
4. Copia también `src/lib/utils.ts` y cambia cualquier `import { cn } from "cn"` por `@/lib/utils`.

## [0.3.1] - 2026-10-20

### Added
- `BotonCopiar` (`patrones/boton-copiar`) accepts `etiqueta`: with it the button shows the text «Copiar» / «Copiado» next to the icon, and the check turns `text-success-foreground`, for action bars. Without it the button is the icon alone, as before (table cells). Brought up from the khipu portal, which had grown it in its own copy.
- `PieTabla` (`patrones/pie-tabla`) accepts `hrefPagina(p)`: with it, Anterior / Siguiente and the page numbers are `next/link` links, so the page lives in the URL and ⌘/Ctrl/Shift/middle-click opens it in another tab; a plain click still calls `onPagina`. A link with no page to go to gets `aria-disabled` and leaves the tab order. Without `hrefPagina` they stay buttons with the same markup and classes as before. Also from the khipu portal.
- `lib/navegacion` with `esClickSimple(e)`: true for a left click with no modifier, the check `PieTabla` uses to tell a client-side navigation from «open in a new tab».
- `SELECT_NATIVO` in `lib/estilos`: a native `<select>` with the look of `ui/Input` (`h-9`), for forms that do not use `ui/select`.

### Changed
- `CABECERA_TABLA` moved to `lib/estilos` with the rest of the recipes. `patrones/pie-tabla` re-exports it (as it already did with `CONTROL_FILTRO`), so existing imports keep working; `TablaVacia` and `CONTENEDOR_TABLA` stay in `patrones/pie-tabla`.

## [0.3.0] - 2026-10-20

### Added
- **Installable package.** `npm install github:bacsystem/khipu-design-system#v0.3.0` builds the design system (`prepare`) into ESM + `.d.ts`, with one subpath per component (`khipu-design-system/ui/button`, `/feedback/alerta`, `/formularios/*`, `/navegacion/*`, `/datos/*`, `/patrones/*`, `/lib/*`, `/utils`, `/providers`) and the CSS in `khipu-design-system/styles.css` (also `tokens.css` and `theme.css`). Every `"use client"` directive is kept, so Server Components can render the components that do not need one. The router-bound shell components are a separate `nav/*` export. No `transpilePackages` needed. See README §Instalarlo como paquete and `docs/adopcion-en-el-portal.md`.
- `npm run build:paquete` and `npm run verify:paquete` (fails if a component has no public subpath, a subpath does not resolve to its `.js` and `.d.ts`, a module does not load or the CSS points at a missing file).

### Changed
- Tokens and the Tailwind theme moved from `src/app/globals.css` to `src/styles/tokens.css` and `src/styles/theme.css`, which `globals.css` imports. The compiled CSS of the demo is the same.
- `react`, `react-dom`, `next`, `next-themes`, `@base-ui/react` and `lucide-react` are now peerDependencies (and devDependencies for the demo), so a consumer never gets a second copy of a React context. The CLI reads their versions from `peerDependencies`; `cli add` works as before.

## [0.2.0] - 2026-10-08

### Changed
- **One control height: `h-9` (36 px).** Every interactive control now has the same height: buttons, inputs, selects, the search box, filters, segmented controls, steppers, table-row actions, pagination, dialog footers and the row "⋯" menu. Before, the scale had four heights (28 px for table rows and pagination, 32 px for page chrome and filters, 36 px for dialog footers, 40 px for forms), so a button and an input next to each other on the same page did not match. Segmented boxes (`SEGMENTADO`, `Toolbar`, `GrupoBotones`, `SelectorPorPagina`, `ThemeToggle`) are `h-9` outside with `h-7` items inside.
- `npm run lint` (`scripts/verificar-alturas.mjs`) now also fails if any control recipe in `lib/estilos.ts` stops being `h-9`.

### Added
- `Tabs` accepts its panels already built in `paneles` (one per id), as an alternative to the `children` render function. A Next.js Server Component cannot pass a function to a client component, so a detail page rendered on the server could not use `Tabs` at all. Only the active panel is mounted in both cases.

### Deprecated
- `CAMPO_FILTRO` (now equal to `CAMPO`) and `BOTON_PRIMARIO_PIE` / `BOTON_SECUNDARIO_PIE` / `BOTON_DESTRUCTIVO_PIE` (now equal to `BOTON_*`). They stay exported so existing imports keep working. `variante="filtro"`/`"campo"` and `size="sm"`/`"lg"` on `Button`, `SelectTrigger`, `StepperNumerico`, `EntradaFecha` and `EntradaMonto` are accepted but no longer change the height.

## [0.1.9] - 2026-10-08

### Fixed
- `StepperNumerico` accepts `paso="any"` for quantities with decimals (kilos, hours, meters). `paso` is also the `step` of the hidden `<input type="number">` that base-ui uses for native form validation: with the default `paso={1}` and a `min`, any non-integer value fell into `stepMismatch` and the browser silently aborted the submit, so the button looked dead. With `"any"` the step validation is off and the arrows still add 1 (base-ui treats `step="any"` as 1). Found and fixed first in the khipu portal's invoice dialog; the gallery now shows a decimal example.

## [0.1.8] - 2026-10-08

### Changed
- `Dialog` no longer closes on an outside click (`disablePointerDismissal` defaults to `true`). A stray click lost what was typed in a form or a one-time value such as an API key. It still closes with the X, Escape or its own buttons, and `disablePointerDismissal={false}` restores the old behavior where it is wanted. `DialogoConfirmacion` and `Paleta` inherit it; side panels (`Sheet`, `PanelLateral`, `Drawer`) are unchanged.

## [0.1.7] - 2026-10-08

### Changed
- `Pasos` centers each step: every step takes the same width, with its circle and text centered in its column, and the connector runs from circle center to circle center (primary up to the current step). Before, steps were left-aligned and the line hung off the right of each circle, so the indicator looked pushed to the left inside a dialog. It stays horizontal on mobile and hides the descriptions there so the titles fit in one row.

## [0.1.6] - 2026-10-08

### Added
- `SEGMENTADO` / `SEGMENTO` recipes for the segmented control of a filter bar. `Tabs estilo="segmentado"` uses them, and so can a row of links to filtered views, because the active segment is marked by either `data-active` (base-ui Tabs) or `aria-current="page"` (a link). Before, the style lived only inside `Tabs`, so the khipu portal had hand-built two versions at three different heights.

### Fixed
- The segmented `Tabs`, `Toolbar` and `BloqueCodigo` language selector declared an `h-8` box but did not fit their own items: with the border and `p-1`/`p-0.5` there were 22–26 px left for 24–28 px items, which overflowed the box. Padding goes to `p-0.5` and the code-block segments to `h-6`, measured at 32 px in the browser. `SEGMENTADO` uses `min-h-8`, so a long list wraps instead of overflowing.

## [0.1.5] - 2026-10-08

### Added
- A recipe for every height in the scale, so no consumer has to override one with `cn(RECIPE, "h-N")`: `BOTON_DESTRUCTIVO` (`h-10`), `BOTON_PRIMARIO_PIE` / `BOTON_SECUNDARIO_PIE` / `BOTON_DESTRUCTIVO_PIE` for the documented `h-9` dialog/panel/step footer, and `CAMPO_FILTRO` (`CAMPO` at `h-8`). An audit of the khipu portal found 80 such overrides, the design system itself had 20 (gallery, demo dialog, `DialogoConfirmacion`, `EntradaFecha`, `EntradaMonto`), and that is how controls in the same row ended up at different heights.
- `SelectTrigger` `size="campo"` (`h-10`): a select can now sit next to a `CAMPO` in a form at the same height. Before, the only sizes were `h-7` and `h-8`.
- `npm run lint` now runs `scripts/verificar-alturas.mjs`, which fails on any height override applied to a control recipe and names the file and line.

### Changed
- `ACCION_PRINCIPAL`, `ACCION_SECUNDARIA` and `CONTROL_FILTRO` moved to `lib/estilos.ts` with the rest of the scale. `nav/top-bar.tsx` and `patrones/pie-tabla.tsx` re-export them, so existing imports keep working.
- `DialogoConfirmacion` uses the footer recipes. Its destructive button now takes `text-destructive-foreground` instead of `text-white`: in dark mode the red is light, and white text on it was hard to read.
- `EntradaFecha` and `EntradaMonto` use `CAMPO_FILTRO` for `variante="filtro"` instead of overriding `CAMPO`'s height.

## [0.1.4] - 2026-09-22

### Changed
- `EntradaFecha` and `EntradaMonto` accept `variante="filtro"` to drop from `h-10` to `h-8`, mirroring the API `StepperNumerico` already had. Both applied `CAMPO` to their inner input, so a consumer could not shrink them from the outside. For dense forms — a dialog holding client, item table and totals in one view — 8 px per control decides how many rows fit without scrolling. Default stays `"campo"` (`h-10`), so existing usage is unchanged.

## [0.1.3] - 2026-09-18

### Added
- CLI (`cli/khipu.mjs`, `khipu-ds add`/`list`) to copy a single component and its transitive dependencies (other components + `lib/`) into a consumer project, shadcn/ui-style, without publishing this design system as an npm package. Runnable via `npx github:bacsystem/khipu-design-system add <component>` or locally.
- Auto-generated component registry (`registry/registry.json`, built by `scripts/build-registry.mjs` from each component's actual imports) that the CLI resolves against — regenerated from source, never hand-maintained.

## [0.1.2] - 2026-09-17

### Added
- Autocomplete (formularios/): free-text search with suggestions over `base-ui/autocomplete`, distinct from Combobox's forced selection
- Toolbar (ui/): grouped action bar with roving-tabindex keyboard navigation over `base-ui/toolbar`
- Drawer (ui/): mobile bottom sheet with native swipe-to-dismiss over `base-ui/drawer`

## [0.1.1] - 2026-09-17

### Added
- Unified height scale (28/32/40px) across all interactive controls, documented in docs/design-system.md §4
- Spinner, ProgresoLineal, ProgresoCircular, BotonAsync (feedback)
- Avatar, AvatarGroup, Popover, Buscador
- StepperNumerico, EntradaRangoFechas
- Multi-row selection + bulk actions in TablaDatos
- Separator, Kbd, GrupoBotones, Contrasena (password with strength meter)
- HoverCard, ScrollArea, Deslizador (slider), Banner

### Fixed
- Responsive overflow bugs (CabeceraSeccion missing min-w-0, TopBar breakpoint collision at 768px)
- disabled+hover pointer-events conflict across 8 button recipes
- React "missing key" warning when a Server Component element crosses into a Client Component as a static sibling (TopBar)
- Off-center search icon in Buscador
- Missing/English accessible labels: GrupoBotones, Deslizador, StepperNumerico, Sheet's default close button, Pagination component

## [0.1.0] - 2026-09-16

### Added
- Initial release: design tokens (light/dark), base components (ui/), navigation (nav/), patterns (patrones/), feedback, forms, navigation and data components
