# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **`CentroNotificaciones`** (`nav/centro-notificaciones`): la campana de la top bar con un panel (`Popover`) de notificaciones. Todo son datos de la app: `notificaciones: Notificacion[]` (`id`, `titulo`, `descripcion?`, `fecha` ISO en hora de Lima, `tono?`, `icono?`, `href?`, `leida`), `onLeer(id)`, `onLeerTodas()`, `verTodas?`, `textos?` (`Partial<TextosNotificaciones>`; `TEXTOS_NOTIFICACIONES_ES`) y `locale?`. Disparador `size-control` con `aria-label` «Notificaciones, 3 sin leer» y un punto si hay sin leer; panel de 360 px (ancho completo bajo `md`) nombrado por su título, con `ScrollArea` desde 5 notificaciones y `EstadoVacio` si no hay ninguna. Cada fila es un enlace (con `href`), un botón que la marca en el sitio (sin `href` y sin leer) o texto; las sin leer llevan punto y «Sin leer» para el lector de pantalla. El `href` solo se acepta si es una ruta de la app o `http(s)` (`hrefNotificacionSeguro`). `Notificacion.acciones` (botones o enlaces bajo la fila, fuera de su enlace) y `categorias` + `Notificacion.categoria` (filtro con contadores). Teclado: Enter/Espacio abre, Tab recorre, Esc cierra y devuelve el foco a la campana; al marcar como leída el foco queda en su fila y tras «Marcar todas» en el título. No usa `usePathname`. `PanelNotificaciones` y `ContenidoNotificaciones` (el contenido) también son públicos, pero solo dentro de un `Popover`.
- **`TabsRuta`** (`navegacion/tabs-ruta`): pestañas que son rutas. Una `<nav aria-label>` con una lista de `next/link` y `aria-current="page"` en la ruta actual (con `usePathname`; coincidencia por segmento, `exacto` por item y, si coinciden varias, gana la de href más largo: `indiceActivoRuta`), no `role="tablist"`. `items: { href, etiqueta, contador?: number | string, tonoContador?, exacto? }[]`, `etiqueta` y `estilo: "linea" | "segmentado"`, con el mismo aspecto que `Tabs` (contador incluido, con tono `ok`/`aviso`/`info`/`neutro`). En móvil se desplaza en horizontal y centra la pestaña activa. **Con `cacheComponents` (Next 16)** va dentro de `<Suspense>`, igual que `SidebarNav`, `TopBar` y `BarraInferior`.
- `lib/navegacion`: `indiceActivoRuta`, `desplazamientoCentrado`, `hrefNotificacionSeguro`, `etiquetaBotonNotificaciones` y `TEXTOS_NOTIFICACIONES_ES`, sin `"use client"` (un Server Component puede llamarlos). `lib/estilos`: `PESTANA_LINEA_BASE` y `CONTADOR_PESTANA`, las recetas de pestaña subrayada y contador que comparten `Tabs` y `TabsRuta`.
- App de ejemplo: la galería muestra las dos piezas y `/ejemplo/series` es la segunda ruta de la demo de `TabsRuta`.

### Changed
- `Tabs estilo="linea"`: el anillo de foco de la pestaña ahora va hacia dentro (`ring-inset`): la fila recorta (`overflow-x-auto`) y el anillo con separación se cortaba. La receta se movió a `lib/estilos` (`PESTANA_LINEA_BASE`, con la regla de iconos de 16 px de 0.9.0, y `CONTADOR_PESTANA`).

## [0.9.0] - 2026-11-17

### Added
- **`Tabs` como tira sola**: sin `children` ni `paneles` el componente no monta ningún `Panel`. Antes montaba uno por pestaña, vacío, con `pt-4` (16 px de hueco bajo la tira) y con `aria-controls` hacia un panel sin contenido. Ahora la tira es solo `role="tablist"` + `role="tab"` con `aria-selected` (sin `aria-controls`), y el contenido lo pinta la app fuera, con `valor`/`onCambio` (controlado) o `defaultValor`. Prop opcional `controla` (id de la región de contenido de la app, con `role="tabpanel"`): va como `aria-controls` en cada pestaña de la tira sola. La galería lo muestra.
- Las recetas de pestaña (`PESTANA_LINEA` de `Tabs estilo="linea"` y `SEGMENTO_BASE` de `lib/estilos` para `"segmentado"`) fijan el tamaño del icono: `[&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`, la misma regla que `ui/button`. Un icono con su propio `size-*` lo conserva.

### Changed
- **Los iconos de las pestañas ahora miden 16 px** (`size-4`) en `linea` y `segmentado`, y también en la receta exportada `SEGMENTO` (que incluye `SEGMENTO_BASE`). Para otro tamaño usa `size-*` en el icono (no `h-*`/`w-*`, que no desactivan la regla).
- Compatible hacia atrás: con `children` o `paneles` el marcado es el mismo de 0.8.0 salvo la regla de iconos en la clase de cada pestaña. **Si usas la CLI (`khipu add`) vuelve a copiar `lib/estilos.ts` y `navegacion/tabs.tsx`.** Quien pasaba `className="size-4"` a los iconos de una pestaña puede quitarlo.

## [0.8.0] - 2026-11-17

### Added
- **Rail del sidebar** (`Shell rail="auto" | "nunca"`, por defecto `"nunca"`: sin cambios). Con `"auto"` el sidebar se pliega a **64 px** entre 768 y 1279 px: ítems de solo icono con `Tooltip` a la derecha (el nombre sigue en el DOM como texto para el lector de pantalla), sin títulos de grupo, grupos colapsables aplanados (abiertos y sin `inert`), la marca reducida a su icono, el chip y el pie ocultos y `SelectorContexto` y `MenuUsuario` reducidos a su avatar (sus menús se abren a la derecha con ancho propio). Lo decide CSS con la variante nueva `rail:` (`styles/theme.css`, solo dentro de `[data-khipu-rail="auto"]`), así que no hay parpadeo de hidratación; un `ProveedorRail` (`nav/rail`) solo informa del estado a lo que cambia de comportamiento (tooltips, `inert`, ancho de los menús). `BotonRail` (en la cabecera de `SidebarContent`; `aria-expanded`, `aria-controls`, «Contraer menú»/«Expandir menú» traducibles con `SidebarContent textosRail`) alterna entre rail y expandido en cualquier ancho desde md; la elección se guarda en `localStorage["khipu-sidebar-rail"]` (`"rail" | "expandido"`, `lib/rail`: `CLAVE_RAIL`, `leerPreferenciaRail`, `guardarPreferenciaRail`, `railEfectivo`; todo en `try/catch`) y `ScriptDiseno` la copia a `<html data-rail>` antes del primer pintado. Sin `ScriptDiseno` en el `<head>` se aplica tras montar.
- **`BarraInferior`** (`nav/barra-inferior`): navegación inferior del móvil (≤ 767 px; `md:hidden`) que reemplaza a la hamburguesa. `items: ItemNav[]` los pone la app (hasta 4; el kit no trae lista fija), `mas?: { etiqueta, contenido }` abre `contenido` (normalmente el `SidebarContent` completo) en el cajón de `MobileNav`, `accion?: { href, etiqueta, icono }` es un botón redondo flotante (p. ej. «Nueva venta») y `etiqueta` es el nombre de la `<nav>` («Navegación principal»). Entradas de ≥ 44 px, activa por prefijo (o `exacto`) con `aria-current="page"`, entradas sin `href` como «próximamente» deshabilitadas, zona segura `env(safe-area-inset-bottom)` (la página necesita `viewport-fit=cover`). La barra va en `Shell barraInferior` y queda `sticky` al final de la columna **en el flujo**, con el hueco de la acción reservado: ni la barra ni la acción tapan el final del contenido. Mientras hay una barra, `--khipu-reserva-inferior` sube los toasts por encima de ella.
- `TopBar migaComoTitulo` (por defecto `true`): con `false` la miga es solo texto de ubicación (`<nav aria-label>` con la página `aria-current="page"`), no un `h1`, para páginas que pintan su propio título. Sin `menuMovil` no hay hamburguesa.
- `MobileNav disparador` y `etiquetaCajon`: otro elemento como disparador del cajón (el foco vuelve a él al cerrar) y nombre accesible del cajón (`aria-label` del diálogo, por defecto «Menú de navegación»). La hamburguesa por defecto no cambia.
- `itemActivo(item, pathname)` (`lib/navegacion`): la regla de ítem activo del sidebar y de la barra inferior (prefijo, o exacta con `exacto`).
- App de ejemplo: el layout de `/ejemplo` usa `rail="auto"` y `BarraInferior` (sin hamburguesa); la galería lo explica.

### Changed
- **Si usas la CLI (`khipu add`) vuelve a copiar `src/styles/theme.css`**: trae la variante `rail:` (`@custom-variant rail`) y las reglas de `--khipu-reserva-inferior`. Sin ellas `Shell rail="auto"` no se pliega y los toasts no suben sobre `BarraInferior`. (Con el paquete npm llegan solos en `styles.css`.) La receta `ACCION_FLOTANTE` (`lib/estilos`) es la del botón redondo de la barra; `check:alturas` ahora también rechaza `size-N` sobre una receta de control.
- `SidebarContent`: el chip y el pie van en un contenedor propio (para ocultarlos en el rail); sin `rail="auto"` se ven igual que antes. `Toast`: el visor sube `--khipu-reserva-inferior` (0 sin barra inferior). **Con `cacheComponents` (Next 16)** `BarraInferior` usa `usePathname`: va dentro de `<Suspense>`, igual que `SidebarNav`, `TopBar` y `MobileNav`.

## [0.7.0] - 2026-11-17

### Added
- `TablaDatos` y `TablaListado` ganan, todo opcional y sin cambiar el comportamiento de quien no los usa: `tarjetaMovil` (bajo `md` cada fila es una tarjeta en una `<ul role="list" aria-label>`; la tabla se ve desde `md`; con `onFila` la tarjeta es un `<button>`, o un `<div>` con `tarjetaMovilInteractiva` si lleva controles propios; la `seleccion` pone su casilla en la tarjeta), `anchoMinimo` (`min-width` de la tabla con scroll horizontal dentro de la tarjeta), `pie` (fila de totales `<tfoot>` sobre las columnas visibles y, en móvil, un resumen `role="group"` fuera de la lista, para que el lector de pantalla cuente solo las filas), `pieEtiqueta` (el rótulo «Total»: primera celda del pie y título del resumen móvil), `filaActiva` (`aria-current="true"` en la fila o la tarjeta, más la banda de acento) y `titulo` (nombre de la lista de tarjetas; `TablaListado` lo pasa solo).
- `TablaListado claveAlmacenamiento`: recuerda las columnas en `localStorage` (nuevo `lib/columnas-visibles`: `calcularOcultas`, `leerColumnasOcultas`, `guardarColumnasOcultas`, `interpretarColumnasOcultas`, `restablecerColumnasOcultas`; nunca lanza). Se guardan las columnas **ocultas**, no las visibles: una columna que se añada después con `ocultaInicial: true` la verá quien ya tenía algo guardado; cambia la clave si todos deben partir de cero. Lo recordado se lee con `useSyncExternalStore`, sin desajuste de hidratación (la primera pintura usa `ocultaInicial`).
- Acción «Restablecer» (`textos.restablecer`) en el selector de columnas: vuelve a `ocultaInicial` y borra lo recordado.
- **Aviso de tipo:** `TextosTablaListado` gana `fijo` y `restablecer`, obligatorios en el tipo: quien tipa un objeto completo de textos debe añadirlos (quien pasa `Partial`, no).

### Changed
- El selector de columnas de `TablaListado` lista ahora todas las columnas con título de texto y marca las `ocultable: false` como bloqueadas con «Fijo» (`textos.fijo`). Sigue apareciendo solo si hay al menos una columna ocultable: un listado sin ninguna no gana botón ni barra.
- `filaActiva` usa `aria-current="true"` (no `aria-selected`): en una `table` sin rol `grid` es la semántica correcta, y «seleccionada» queda para la casilla de `seleccion`.
- Sin selector de densidad de filas (decisión de producto).

## [0.6.0] - 2026-11-17

### Added
- Soporte de **Next.js 16**: el peer `next` pasa de `^15.5.0` a `^15.5.0 || ^16.0.0`. Los componentes del paquete no cambian y el `dist/` compilado es byte a byte el mismo que con Next 15 (solo usan `next/link` y `next/navigation`, sin APIs de petición asíncronas, `middleware`/`proxy`, `next/image` ni `next/font` en el código publicado), así que un consumidor en Next 15.5 no nota nada. Probado contra Next 15.5.25 (línea base) y 16.3.5 con React 19. **Con `cacheComponents` (Next 16),** `SidebarNav`, `TopBar` y `MobileNav` (`nav/*`) usan `usePathname` y hay que envolverlos (o a su padre) en `<Suspense>`; si no, `next build` falla en las rutas dinámicas. Sin `cacheComponents` no cambia nada.
- Guarda del contrato de peers: `scripts/tests/peers-next.test.mjs` valida con `semver.satisfies` que `peerDependencies.next` acepta 15.5.0 y 16.0.0 (y rechaza 14 y 17), y `npm run verify:next15` instala `next@15.5.28` sin guardarlo y corre `verify:paquete` y `npm test`; es un paso previo a cada tag (README §Mantenerlo).

### Removed
- `lucide-react` deja de ser peerDependency (y su `peerDependenciesMeta` opcional): ningún archivo de `src/components` ni `src/lib` lo importa. `IconoComponente` sigue aceptando cualquier componente de icono (Phosphor, Lucide u otro), así que quien ya pasa iconos de Lucide no cambia nada; solo deja de recibir un aviso de peer si no lo tiene instalado. Sigue como devDependency (lo usa la prueba de tipos de `IconoComponente`).

### Changed
- Cadena de herramientas de la app de ejemplo (no afecta al paquete publicado): `next` y `eslint-config-next` 16.3.5 (devDependencies); `next dev` y `next build` sin `--turbopack` (Turbopack es el valor por defecto en Next 16); `eslint.config.mjs` usa la flat config nativa de `eslint-config-next` 16 (`defineConfig`) en vez de `FlatCompat`, y se elimina `@eslint/eslintrc`; `tsconfig.json` adopta `jsx: react-jsx` e incluye `.next/dev/types`, como pide Next 16.
- Las reglas nuevas de `react-hooks` que trae `eslint-config-next` 16 (`refs`, `set-state-in-effect`, `immutability`, las del React Compiler) siguen en `error` en todo el repo salvo en 7 archivos, donde son `warn` (10 avisos): `apariencia`, `diseno`, `calendario`, `mobile-nav`, `theme-toggle`, `paleta` y `demo-avisos`. El comportamiento de esos efectos **no tiene pruebas** (`Calendario` se prueba con `renderToStaticMarkup`, que no ejecuta efectos; `mobile-nav`, `theme-toggle` y `paleta` con regex sobre el código fuente; `diseno` sin test), así que reescribirlos aquí cambiaría el componente sin red de seguridad. La migración empieza por escribir esas pruebas: #58.
- Requisito de Node para desarrollar el repo: 20.9+ (Next 16).

## [0.5.23] - 2026-11-15

### Added
- `GrupoNav colapsable` / `abiertoPorDefecto` / `id` (`nav/sidebar-nav`): un grupo del sidebar puede plegarse desde su título, que pasa a ser un botón con `aria-expanded` y `aria-controls` (teclado: Tab, Enter y Espacio). El grupo que contiene la ruta activa se abre solo, también al navegar; el resto arranca cerrado salvo `abiertoPorDefecto`. El estado se recuerda en `localStorage` (`CLAVE_GRUPOS_NAV`, o `claveAlmacenamiento`) dentro de un `try/catch`: sin almacenamiento, con acceso bloqueado o con JSON roto funciona igual, solo que no recuerda (`leerGruposAbiertos`, `guardarGruposAbiertos` en `lib/navegacion`). El despliegue anima la altura con `grid-template-rows` solo con `motion-safe:` (con «reducir movimiento» abre y cierra de golpe) y un grupo cerrado es `inert`: sus ítems salen del teclado y del lector de pantalla. `id` identifica al grupo en el estado recordado (por defecto, el título): ponlo si el título se traduce.
- `SidebarNav textos` y `SidebarContent textosNav` (`TextosSidebarNav`: `expandirGrupo`, `contraerGrupo`, con `{grupo}` por el título; por defecto «Expandir {grupo}» / «Contraer {grupo}»), el `title` del botón. Un grupo sin `colapsable` se ve y se comporta exactamente como antes.

### Changed
- **Pie fijo.** `SidebarContent` ya no se desplaza entero: solo la navegación hace scroll (`min-h-0 flex-1 overflow-y-auto`), y la marca, el selector, el pie y el usuario (`MenuUsuario`: perfil, tema, cerrar sesión) quedan `shrink-0` y siempre a la vista, aunque el menú tenga decenas de ítems. El pie lleva `border-t border-border/60`, como decía la guía. `Shell` ya no hace scroll del contenedor del sidebar (`overflow-hidden`) y `MobileNav` ya no envuelve el contenido en un contenedor que desplaza todo: el cajón es una columna con el mismo comportamiento (su hijo debe ser el `SidebarContent` directo).
- `scripts/tests/cargar-tsx.mjs` resuelve los imports `next/link` y `next/navigation` (el ESM de Node pide la extensión) para poder renderizar `SidebarNav`.

## [0.5.22] - 2026-11-15

### Added
- `formatearFecha(iso, locale)` y `formatearFechaHora(iso, locale)` (`lib/formato`) aceptan `"es"` (por defecto) o `"en"`: los meses salen en el idioma pedido («15 Set 2026» / «Sep 15, 2026»), así que una app en inglés ya no dice «Set». Sin pasar `locale` el resultado es el de antes (salvo el arreglo de «Fixed» más abajo). Exporta `LocaleFecha`, `LOCALES_FECHA` y `esLocaleFecha()`. Un idioma desconocido (`fr`, `null`) cae en castellano en ejecución. `EntradaFecha locale` y `Calendario locale` hacen lo mismo (en `EntradaFecha`, también el `placeholder` y el `etiquetaLimpiar` por defecto: «Pick a date», «Clear date»; si se pasan, mandan) con la fecha del disparador, los nombres de mes y de día, «Hoy» y «Mes anterior/siguiente» (`nombreMes(anio, mes, locale)`, `DIAS_SEMANA_EN`).

### Fixed
- `patrones/pill-estado` y `nav/sidebar` importaban a su vecino con una ruta relativa (`./metricas`, `./sidebar-nav`), que el registro de la CLI ignoraba: `khipu add` dejaba un import roto. Ahora usan `@/…` y `build-registry` rechaza cualquier import relativo.
- `formatearFecha` con un mes fuera de 1–12 («2026-13-10») devolvía «10 undefined 2026»; ahora devuelve el texto tal cual, como con cualquier otra cosa que no sea una fecha.

## [0.5.21] - 2026-11-15

### Added
- `GraficoBarras enteros` y `GraficoLineas enteros`: las marcas del eje Y son enteros (paso ≥ 1) para gráficos de conteos, que con un máximo de 1 mostraban 0,25 y 0,5. Por defecto sigue la escala de siempre. La escala sale a `lib/escala-grafico` (`escalaEje`).

## [0.5.20] - 2026-11-15

### Added
- `Buscador etiquetaLimpiar`: el nombre accesible del botón de limpiar, que estaba fijo en «Limpiar búsqueda» (por defecto, el mismo). `TablaListado` se lo pasa desde `textos.limpiar` (`TextosTablaListado`), así que traducir la barra del listado también traduce ese botón. **Aviso de tipo:** `TextosTablaListado` gana `limpiar`, obligatorio en el tipo: quien tipa un objeto completo de textos debe añadirlo (quien pasa `Partial`, no).

## [0.5.19] - 2026-11-12

### Added
- `AvisoResponsivo` (`patrones/aviso-responsivo`): un aviso que es una hoja inferior bajo `sm` (640 px) —a todo el ancho, con las esquinas superiores redondeadas y `env(safe-area-inset-bottom)`— y un diálogo centrado desde `sm`. Es una sola primitiva `Dialog` con clases responsivas (sin hook de `matchMedia`, sin `Drawer` ni `Sheet`): el HTML del servidor y el del cliente son iguales, así que no hay desajuste de hidratación ni doble montaje. Props: `open`, `onOpenChange`, `descartable` (por defecto `true`), `initialFocus` y el resto del popup (`finalFocus`, `data-testid`…). Con `descartable={false}` no se cierra con Escape, clic afuera ni arrastre, y como no lleva botón de cerrar, solo cierra el consumidor cambiando `open`; con `descartable`, Escape lo informa por `onOpenChange(false)`. El clic afuera nunca cierra. Con «reducir movimiento» la hoja no se desliza: solo aparece y desaparece con opacidad (`motion-safe:`).
- `CabeceraAviso` (`icon`, `titulo`, `descripcion`, `tono`): cabecera centrada con el icono en un círculo de `size-12` del tono (los de `CabeceraDialogo`), `DialogTitle` y `DialogDescription`, que son el nombre y la descripción accesibles del aviso. `PieAviso`: los hijos van en orden «secundario, primario»; bajo `sm` se apilan al revés a todo el ancho (el primario arriba) y desde `sm` van en fila a la derecha.
- `FranjaCuentaRegresiva` (`patrones/franja-cuenta-regresiva`; `segundos`, `etiqueta`, `tono` `peligro` | `aviso`): la etiqueta a la izquierda y, a la derecha, un reloj decorativo y el tiempo en `mm:ss` con `font-mono tabular-nums`. No es una región viva (sin `role`, `aria-live` ni `aria-atomic`): el lector de pantalla no repite el tiempo en cada tic.
- `formatearMmSs(segundos)` (`lib/formato`): `65 → "01:05"`, los minutos no se limitan a 2 dígitos (`6000 → "100:00"`), un valor negativo o no finito da `"00:00"` y los decimales se truncan.
- Ningún texto va fijo: el título, la descripción, la etiqueta de la franja y los botones del pie entran por props o `children`. La galería (`/ejemplo`, «Navegación y estructura») trae un aviso con la franja contando y otro no descartable.
- `DialogPortal` y `DialogOverlay` (`ui/dialog`) se exportan, y `CIRCULO` (`patrones/cabecera-dialogo`), para armar contenedores propios sobre el mismo velo y los mismos tonos.

## [0.5.18] - 2026-11-12

### Added
- `PanelLateral etiquetaCerrar`: el nombre accesible del botón de cerrar, que estaba fijo en «Cerrar» (por defecto, el mismo). `PanelApariencia` se lo pasa desde `textos.cerrar` (`TextosPanelApariencia`), así que `MenuUsuario textos` también lo traduce.

## [0.5.17] - 2026-11-12

### Added
- Textos traducibles del menú de usuario: `MenuUsuario textos` (`TextosMenuUsuario`: `menu`, el `aria-label` del disparador, `cuenta`, `tema` y `apariencia`), `PanelApariencia textos` (`TextosPanelApariencia`: título, descripción, rótulos y ayudas de cada sección, la frase de muestra de la tipografía y el `aria-label` del selector de diseño) y `ThemeToggle textos` (`TextosThemeToggle`: `temaInterfaz`, `claro`, `oscuro` y `sistema`). Cada nivel pasa los suyos al de abajo, así que `MenuUsuario textos` los admite todos en un solo objeto, como `TablaListado`. `SelectorDiseno`, `SelectorPaleta`, `SelectorTonoOscuro` y `SelectorTipografia` reciben `etiqueta` (su `aria-label`, con el valor de siempre por defecto) y `PanelApariencia` se la pasa desde `textos` (`paletaColor`, `tonoModoOscuro`, `tipografiaFuente`, `disenoInterfaz`). Sin pasar nada, todo queda en castellano exactamente como antes. Exporta `TEXTOS_MENU_USUARIO_ES`, `TEXTOS_PANEL_APARIENCIA_ES` y `TEXTOS_THEME_TOGGLE_ES`.

## [0.5.16] - 2026-11-11

### Added
- `AccionFila.ayuda` (`MenuAcciones`): el porqué de una acción deshabilitada, como texto visible bajo el ítem y enlazado con `aria-describedby`. El `title` no basta: el ítem deshabilitado no recibe puntero (`pointer-events-none`) y en el móvil no hay hover; con teclado sí recibe foco (`focusableWhenDisabled` de base-ui), donde `aria-describedby` anuncia la ayuda. El `<p>` va `aria-hidden` para no romper `role="menu"` (axe `aria-required-children`) y la descripción se anuncia igual. Exporta `AyudaAccion`. La galería usa `ayuda` en «Editar».

## [0.5.15] - 2026-11-11

### Added
- `PillEstado` `icon`: a Phosphor icon instead of the dot (`size-3.5`, `PESO_ICONO`, the tone's text color). It is decorative (`aria-hidden`); the text still says the state. Without `icon` the pill renders exactly as before. Gallery shows three pills with icons.

## [0.5.14] - 2026-11-11

### Added
- `OBJETIVO_TACTIL` (`lib/estilos`) and the token `--spacing-objetivo-tactil` (44 px): with a coarse pointer (a finger), an invisible centered `::after` makes the tappable area at least 44×44 px (WCAG 2.5.5) without changing the visible size. It does nothing with a mouse. Use it first in `cn` on a standalone icon button (it brings `relative`, which a later `absolute` overrides).

### Changed
- Standalone icon buttons get `OBJETIVO_TACTIL` by default: the close button of `DialogContent`, `SheetContent` and `PanelLateral`, `MenuAcciones`, the `MobileNav` menu button, the close button of `Toast`, `Banner` and `PopoverHeader` (18 px, under the 24 px of WCAG 2.5.8 until now), and the month buttons of `Calendario`. The `Banner` close button gets 2 px more of margin so its larger area does not cover the `accion` next to it. Grouped or clipped controls (page numbers, segmented controls, `Toolbar`, `StepperNumerico`, buttons inside a field, the `Button` base) do not, because the larger area would cover their neighbour.

## [0.5.13] - 2026-11-11

### Added
- `PieTabla` `textos` (`TextosPieTabla`): «Mostrando», «de», «Anterior», «Siguiente» and the rows selector's «Filas» / «Filas por página» can be translated. The sentence keeps its order («{mostrando} x–y {de} N {unidad}»).
- `SelectorPorPagina` `etiqueta` (the group's accessible name, «Filas por página») and `textoFilas` (the visible «Filas»).
- `TablaDatos` `textos` (`TextosTablaDatos`): the footer texts plus the selection ones: the bar's name, «Quitar selección», «Seleccionar todo en esta página», `seleccionarFila(id)` and `seleccionados(n)` (the label next to the counter, singular or plural). They are passed on to `PieTabla`.
- `TablaListado` `textos` also takes the `TextosTablaDatos` keys and passes them to `TablaDatos`, so a list is translated with a single object. `TextosTablaListado` itself does not change.
- `StepperNumerico` `etiquetaDisminuir` / `etiquetaAumentar`: the accessible names of − and + («Disminuir», «Aumentar» by default).

## [0.5.12] - 2026-11-11

### Added
- `Campo` `textoOpcional`: the «(opcional)» shown next to the label with `opcional` can be translated (default «(opcional)»).
- `DialogContent` `etiquetaCerrar`: the screen-reader name of the close button («Cerrar» by default) can be translated. `DialogoConfirmacion` takes `etiquetaCerrar` too and passes it on, so the whole dialog can be translated like `textoConfirmar`/`textoCancelar`.
- `SheetContent` `etiquetaCerrar`: the same for the side sheet's close button.

## [0.5.11] - 2026-11-09

### Added
- `TablaListado<T>` (`datos/tabla-listado`): a full client-side list on top of `TablaDatos` with a search box over the visible columns (ignores case and accents: «jose» finds «José»), a visible-columns menu and an export menu (CSV and print) that use the columns and the order shown on screen. Searching goes back to page 1, and so does a change of the caller's own `reinicioPagina` (its filters). Columns add `texto` (the plain value used to search and export; without it the raw `valor`/`fila[id]` is used, not what `render` draws), `tituloTexto` (the name to export and list a column whose `titulo` is not text), `exportable`, `ocultable` and `ocultaInicial`; `filtros` goes under the search box and `acciones` on its right. Its labels come in Spanish and are translated with `textos`; `onImpresionBloqueada` runs when the browser blocks the print window.
- `MenuCheckboxItem` (`ui/menu`): an option that is checked and unchecked without closing the menu (`role="menuitemcheckbox"` with `aria-checked`), used by the visible-columns menu.
- `lib/exportar`: `descargarCsv(nombre, columnas, filas)` (UTF-8 with BOM so Excel reads accents; a cell that starts with `= + - @` gets a `'` so a spreadsheet does not run it as a formula, while negative numbers such as `-3`, `-1,234.56` or `-1 234` are left alone) and `imprimirTabla(titulo, columnas, filas)`, which returns `false` when the browser blocks its window.

## [0.5.10] - 2026-11-09

### Added
- `TablaDatos` `onOrdenCambio(orden)`: tells the caller each column order the user picks (it is not called with `ordenInicial`), so an export or a print can list the rows in the order shown. The sort itself is `lib/ordenar` (`ordenarFilas(filas, columnas, orden)` and `OrdenTabla`, also re-exported from `tabla-datos`), so the caller sorts exactly like the table.
- `TablaDatos` `reinicioPagina`: when this value changes (the search text, a filter), the table goes back to page 1 instead of staying on a page of the new result. It is compared with `Object.is`, so pass a primitive or a memoized value.
- `Contrasena` `onBlur`: runs when the field loses focus (e.g. to mark it touched in a form library), without wrapping the component in a `div` with `onBlur`.
- `DialogoConfirmacion` `textoCancelar` and `textoPendiente`: the cancel button and the pending label («Cancelar», «Procesando…» by default) can be translated, like `textoConfirmar`.

### Fixed
- `Contrasena`: clicking or tapping the eye took focus away from the field, so a form that validates on blur showed its error («too short») while the user was still typing. A click or tap on the eye now keeps the focus in the field; tabbing to the button still leaves the field, as it should.

## [0.5.9] - 2026-11-02

### Added
- `GraficoBarras` can go inside another card and name itself from it: `plano` (no card or padding of its own), `etiquetadoPor` (the id of the heading that names it), `etiqueta` (an accessible name when there is no title, translated by the caller) and `descripcion` (a summary for screen readers, in `<desc>`).
- `GraficoBarras` `rotuloVisible(i)` (which categories get an axis label; with the 31 days of a month they do not fit on a phone), `tituloDeCategoria(i)` (the text of each category in its `<title>` and in the tooltip) and `propiedadesDeCategoria(i)` (extra `data-*` attributes on each category's group).

### Fixed
- `GraficoBarras` drew a small bump above the baseline for a value of 0 (the rounded cap of an empty bar), and a bar lower than its corner radius stuck out above its value. A 0 now draws no mark, and the radius never exceeds the bar's height.

## [0.5.8] - 2026-11-02

### Added
- `CabeceraPagina` and `EnlaceVolver` (`patrones/cabecera-pagina`): the header of a page that has no title in the top bar (backoffice, record detail): an optional «back» link (the secondary action with the caret, the same everywhere), an `h1`, a description and actions on the right.
- `CONTENEDOR_PAGINA`: the page container (`max-w-[1520px]`, `gap-3` between blocks, §4), so no detail page is narrower or looser than another.
- `PanelQuitable` (`patrones/panel-quitable`): an optional block of a form that the user added with a «+» button and removes with the ✕ (credit, withholding, references…). Its content has no border of its own.
- `Aviso` `tono="peligro"` (what a destructive action will do, with the error tint of `Alerta`) and `tono="neutro"` (an effect that does not alarm, on `secondary`).

## [0.5.7] - 2026-11-02

### Added
- `SelectCampo` (`formularios/select-campo`): the form combo. It is the `Select` (rounded list with the check) with the look of `CAMPO` at the field's full width, and it speaks in strings like a `<select>` (`""` shows the `placeholder` unless an option has `value: ""`). Options with the same `grupo` go under that heading, like an `<optgroup>`. `id` goes on the trigger, so a `<label htmlFor>` names it; `nombre`/`required` feed base-ui's hidden input; `invalido`/`describidoPor`, `mono` and `etiqueta` (an accessible name with no label). It replaces the native `<select>` + `SELECT_NATIVO`, which the operating system draws its own way.
- `Combobox` `invalido`, `describidoPor` and `etiquetaAbrir` (the open button's name, until now fixed in Spanish).

### Deprecated
- `SELECT_NATIVO`: use `SelectCampo`. Kept so imports do not break.

## [0.5.6] - 2026-11-01

### Added
- Form controls take their texts and error state as props, like the native ones they replace: `Contrasena` `etiquetaMostrar`/`etiquetaOcultar`, `etiquetasFuerza`, `describidoPor`; `ZonaArchivos` `etiquetaQuitar`; `Casilla` `invalido`, `describidoPor`, `name`, `required`; `EntradaFecha` `invalido` (`aria-invalid`, the field's red border) and `describidoPor`. Defaults stay in Spanish.

## [0.5.5] - 2026-11-01

### Added
- `EntradaFecha` `limpiable` (a ✕ that calls `onCambio("")`, what an optional filter needs), `nombre` (a hidden input with the ISO value for a native form) and `enBarra` (the filter-bar pill, `CONTROL_FILTRO`, next to the bar's `Select`s). Closes #31's first part.

### Fixed
- `Select` popups are at least as wide as their longest option (and the trigger, and 9rem) and at most the screen minus 1.5rem: they were fixed to the trigger's width, so long options were cut («Liquidación de c…») and the check covered the text.
- `TopBar` on a phone shows only the page in the breadcrumb: section and page did not fit next to the main action and the page ended as «C…».

## [0.5.4] - 2026-11-01

### Fixed
- Underlined `Tabs` (`estilo="linea"`) scroll horizontally when they do not fit, with no visible scrollbar: on a phone five tabs were wider than the screen and pushed the whole page sideways. The base line is an inset shadow and the indicator sits at `bottom-0`, so the scroll container does not clip it.
- `PanelLateral` on a phone takes the screen width minus its margins (it was 75 %, ~280 px, and the «Apariencia» panel did not fit); from `sm` it keeps its `ancho`. The dark-tone and typography swatches are a grid of equal shrinking columns: in flex, Safari did not shrink them and the rows went past the panel's edge.

### Removed
- The «papel» design: its token blocks, its entry in `DISENOS` and every `diseno !== "papel"` exclusion. With a single design the «Diseño» section of the panel is not shown. Palette, dark-tone and font blocks use `html:root` (the same specificity the `:not([data-diseno="papel"])` gave them).

## [0.5.3] - 2026-11-01

### Changed
- Denser UI (the portal looked oversized): the single control height `h-control` is 32 px (was 34), metric values are 22 px (`text-metrica`, was 26), field labels (`ETIQUETA_CAMPO`, `ui/Label`) are `text-etiqueta` (was `text-control`), and the floating sidebar is 248 px (was 216: it cut the company name and the e-mail). The phone drawer is 248 px too, at most 85 % of the screen.

### Added
- `text-metrica-texto` (18 px) and `Metrica texto`: a metric whose value is a word (a state, an environment, a code) instead of a number; at metric size a long word dominated the card. `cn` knows the new size.
- `FilaVacia` (`patrones/pie-tabla`): the empty/loading row of a table, spanning every column without the cells' grey band, which made a 14-line message look like a loose grey block inside the card. `TablaVacia`'s `icon` is optional.

## [0.5.2] - 2026-11-01

### Fixed
- Text fields no longer zoom the page on iPhone: iOS Safari enlarges the page when a field under 16 px takes focus and leaves it enlarged. `CAMPO`, `SELECT_NATIVO` and `ui/input` use the new `text-campo` (16 px) below `md` and `text-control` (13 px) from `md`; the 34 px control height is unchanged. The `Buscador` and `StepperNumerico` fields and the command palette input do the same, and `cn` knows `text-campo`.
- The phone drawer (`MobileNav`) scrolls: `SidebarContent` is `h-full overflow-hidden`, so on a short screen the user block at the bottom (theme, appearance, sign out) was out of reach.
- `PanelLateral` has an accessible name: its title is the dialog's `SheetTitle` (and its description the `SheetDescription`) instead of a loose heading.

### Added
- Accessible names as props, with the same Spanish defaults: `SidebarNav` `etiqueta` (and `SidebarContent` `etiquetaMenu`) names its `nav`, `TopBar` `etiquetaUbicacion` the breadcrumb, `MobileNav` `etiqueta` the button. An app in another language no longer has these landmarks in Spanish.
- `ItemNav.exacto`: the item is active only when the route is exactly its `href` (a «Home» at `/admin` was active on every page below it, because items match by prefix).
- `FilaMetricas` `columnas={5}`.

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
