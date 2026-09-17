# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
