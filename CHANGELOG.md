# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
