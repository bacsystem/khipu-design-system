# Rediseño visual khipu 0.5: estilo pastel compacto con paletas elegibles

- **Fecha:** 2026-11-01
- **Rama base:** `main` (0.4.0, `5107d20`)
- **Estado:** aprobado (2026-11-01)
- **Boceto de referencia:** `b.html` del scratchpad de la sesión (servido en `http://127.0.0.1:4100/b.html` mientras se diseñó). Las capturas aprobadas son la fuente de verdad visual; los valores exactos están en este documento.
- **Referencia de estilo:** FitMove (Dribbble, aportada por el usuario): pasteles, tarjetas redondeadas sin borde, píldoras, mucho color en superficies y poco en botones.

## 1. Objetivo

La 0.4.0 (Linear/Vercel, índigo) se percibe plana: texto de 12–14 px sin jerarquía, mono en exceso, fondo y tarjetas casi iguales y un oscuro casi negro. El objetivo es un diseño **moderno, dinámico y profesional**, más **compacto**, con **paletas de color** y **tonos de modo oscuro** que cada usuario elige, cambiando solo la capa visual y sumando piezas nuevas sin romper las existentes.

**Criterio de éxito:** `/ejemplo` reproduce el boceto aprobado en claro (5 paletas) y en oscuro con sus 3 tonos (Medianoche, Grafito, Tintado) × 5 paletas; todos los pares de texto/fondo cumplen WCAG AA (≥ 4.5) y los indicadores no textuales que transmiten estado ≥ 3:1; el usuario puede cambiar de paleta y de tono oscuro sin parpadeo y la elección persiste; ningún export existente cambia de nombre ni pierde props; `npm test`, `typecheck`, `lint`, `build` y `verify:paquete` pasan.

## 2. Decisiones tomadas (no se reabren)

| Tema | Decisión |
|---|---|
| Lenguaje | Variante B del boceto, versión compacta |
| Paletas | 5, elegibles por el usuario: **Lima** (por defecto), Índigo, Océano, Coral, Violeta |
| Tipografía | **Inter** (interfaz) + **JetBrains Mono** (datos), «estilo IntelliJ» |
| Iconos | **Phosphor**, peso **duotono**; **relleno** (`fill`) en el estado activo/destacado |
| Iconos: tratamiento | **Nunca con fondo/contenedor**; el color comunica el significado |
| Acción principal | Casi negra en claro (`#16181d`), casi blanca en oscuro (`#f4f5f7`); el color de la paleta vive en superficies |
| Oscuro | 3 tonos elegibles por el usuario: **Medianoche** (por defecto), Grafito, Tintado; en todos, acentos como superficie teñida + texto pastel, nunca relleno pastel grande |
| Preferencias | Paleta y tono oscuro se manejan juntos en un solo `AparienciaProvider` (más el claro/oscuro/sistema de next-themes, que no cambia) |
| «papel» | Sigue como diseño alternativo; no usa paletas; hereda tipografía, iconos y escala |
| Versión | **0.5.0** |

## 3. Alcance

**Entra**

1. Tokens nuevos en `src/styles/tokens.css` (claro, oscuro Medianoche y un bloque por paleta) y su mapeo en `src/styles/theme.css`.
2. Escala tipográfica compacta y fuentes Inter + JetBrains Mono (`src/app/layout.tsx`, `theme.css`).
3. Formas: radios, píldoras, bandas de tabla, tarjetas sin borde (§6).
4. Preferencias de apariencia del usuario (paleta y tono oscuro): `AparienciaProvider`, `useApariencia`, `SelectorApariencia`, `PALETAS`, `TONOS_OSCURO`, `ScriptDiseno` extendido (§8).
5. Migración de `lucide-react` a `@phosphor-icons/react` en todos los componentes (43 archivos, ~52 iconos) y ampliación de los tipos de prop de icono (§5).
6. Tarjetas de métrica con la anatomía nueva (§7) y gráficos con el acento resaltado (§9).
7. Demo `/ejemplo` rehecha con el layout del boceto (saludo, KPIs, gráfico, anillos, actividad, tabla) además de la galería existente.
8. Verificadores: contraste por paleta × modo, tipografía con la escala nueva, test del sistema de paletas.
9. Documentación (`docs/design-system.md`, `docs/guia-visual.html`, `README.md`, `CHANGELOG.md` con «Upgrading from 0.4.x») y `registry/registry.json` regenerado; `package.json` con la dependencia y subrutas nuevas.

**No entra**

- Quitar o renombrar exports o props existentes.
- Paletas para «papel».
- Elegir fuente o set de iconos por usuario (eso fue solo para comparar en el boceto).

## 4. Tipografía

**Fuentes** (vía `next/font/google`, variables `--font-sans` / `--font-mono` en `<html>` como hoy):

- `Inter` — interfaz completa. Rasgos: `font-feature-settings: "cv11", "ss01", "ss03"` en `body`.
- `JetBrains Mono` — pesos 400/500/600; **solo** correlativos (`F001-00000136`), ids, llaves, código. Fechas, montos, RUC y cantidades van en Inter con `tabular-nums`.

**Escala con nombre** (reemplaza los valores de 0.4; se agregan dos tokens):

| Token | Tamaño / interlineado | Peso | Tracking | Uso |
|---|---|---|---|---|
| `text-etiqueta` | 11.5 / 16 | 500 | 0 | ayudas, pies de tarjeta, ejes |
| `text-control` | 13 / 20 | 500 | −0.005em | botones, campos, menú |
| `text-cuerpo` | 13 / 20 | 400 | 0 | texto base (`body`) |
| **`text-titulo`** (nuevo) | 14.5 / 20 | 620 | −0.014em | títulos de tarjeta, diálogo, panel |
| **`text-titulo-pagina`** (nuevo) | 21 / 24 | 650 | −0.028em | `h1` de página |
| `text-metrica` | 26 / 28 | 650 | −0.035em | números de KPI (`tnum`, `lnum`) |

- Encabezados de tabla y de grupo del menú: `text-etiqueta` 11 px, 600, MAYÚSCULAS, `tracking 0.04em`, color terciario.
- Montos: 650, `tnum`. El texto terciario nunca baja de 4.5:1 (§10).
- `cn` (`src/lib/utils.ts`) se amplía con `titulo` y `titulo-pagina` en el grupo `font-size`.

## 5. Iconos

- Dependencia nueva: `@phosphor-icons/react` (dependencia del paquete). `lucide-react` deja de usarse internamente y pasa de peer a **peer opcional** (`peerDependenciesMeta`), para no obligar a quien ya pasa iconos de Lucide.
- **Peso por defecto duotono**; estado activo (ítem del sidebar, KPI destacado, tab activa) en **`fill`**. En Server Components se importa desde `@phosphor-icons/react/dist/ssr` con `weight` explícito; en cliente, `IconContext` en `Providers` fija `weight: "duotone"`.
- Tamaños: 18 px menú, 16 px encabezado de tarjeta y controles, 19 px tipo de documento en tabla, 18 px actividad, 15 px dentro de botones.
- **Sin fondo**: se elimina todo contenedor teñido detrás de un icono (`ico`, `fi`, punto de timeline con fondo). Color por significado: `ok` / `aviso` / `error` con sus tokens de texto; neutro con `muted-foreground`; categorías con `acento-2-texto`.
- **Tipos de prop:** los 12 archivos que tipan `icon: LucideIcon` pasan a `icon: IconoComponente`, exportado desde `src/lib/iconos.ts` como `ComponentType<{ className?: string; weight?: IconWeight }>`. Acepta Phosphor y Lucide (Lucide ignora `weight`), así que el cambio es solo de ampliación.

## 6. Formas, superficies y componentes base

| Elemento | 0.4 | 0.5 |
|---|---|---|
| Lienzo claro | `#fbfbfc` | `#eceef1` |
| Tarjeta | radio 12, borde + sombra | radio **18**, **sin borde**, sin sombra en reposo; hover: `0 10px 24px -10px rgba(16,17,20,.14)` y −2 px (solo KPI) |
| Popover, diálogo, menú, toast | radio 12, sombra | radio **18** (`rounded-xl`, el mismo de la tarjeta), sombra `--sombra-md`/`--sombra-lg` (se conserva) |
| Botón, chip, pill de estado, segmentado, paginador, ítem de menú | radio 8 | **píldora** (`rounded-full`) |
| Campo, select, textarea | radio 8, borde | radio **12**, borde `--input`, fondo `card` |
| Fila de tabla | línea separadora | **banda** redondeada 12 px con fondo `soft`, 3 px entre filas, hover `soft` + `line` 40 % |
| Altura de control | 36 | **34** (`h-[34px]` vía token `--alto-control`; `verificar-alturas` usa el token) |
| Espaciado | gap 16 | gap **12**; padding de tarjeta 13–15 px |
| Sidebar | ancho 248 | **216**, tarjeta blanca radio 18 con margen 12; ítem activo píldora con acento |

`SEGMENTADO`, `BOTON_*`, `ACCION_*`, `CAMPO`, `SELECT_NATIVO`, `TARJETA`, `CABECERA_TABLA`, `CONTENEDOR_TABLA` conservan sus nombres; cambian sus clases.

## 7. Tarjetas de métrica

Anatomía (claro y oscuro), aplicada a `Kpi` y a una variante de `Metrica`:

1. **Encabezado:** icono (16 px, color por tono) + etiqueta `text-control` 550 + botón «⋯» opcional (22 px, aparece con fondo `soft` al hover).
2. **Valor:** `text-metrica`; sufijo («/ 136») en `text-control` terciario.
3. **Visual:** uno de `barra` (progreso 6 px), `serie` (sparkline con área, ya existe), `puntos` (10 segmentos, n coloreados por tono).
4. **Pie:** chip de variación (`↑ 12%` verde, `↓ 2` rojo, neutro) + texto terciario.
5. **Destacada** (`destacada`): fondo `acento` en claro; en oscuro superficie teñida (§9).

Props nuevas, todas opcionales: `icono?: IconoComponente`, `tono?: "ok" | "aviso" | "error" | "neutro" | "acento"`, `visual?: { tipo: "barra"; valor: number } | { tipo: "puntos"; total: number; marcados: number }`, `destacada?: boolean`, `acciones?: ReactNode` (slot a la derecha del encabezado, típicamente un `MenuAcciones`; el «⋯» lo pone ese menú). `serie`, `variacion`, `periodo`, `invertir` siguen igual. `FilaMetricas` pasa de «una tarjeta dividida» a grilla de tarjetas separadas con gap 12 (mismo export, mismas props).

## 8. Paletas y tono oscuro como preferencia del usuario

**Tokens por paleta.** Cada paleta define solo tres acentos (cada uno con relleno, texto encima y versión tenue):

| Paleta | `--acento` / `--acento-texto` | `--acento-2` / `--acento-2-texto` | `--acento-3` | Contraste texto/relleno |
|---|---|---|---|---|
| Lima (defecto) | `#d4f06b` / `#2f3a07` | `#cfe2fb` / `#1d4f91` | `#f8ec84` | 9.53 · 6.17 |
| Índigo | `#c9c8ff` / `#23215e` | `#cdeee9` / `#0f5a52` | `#ffdcc2` | 9.09 · 6.53 |
| Océano | `#9fe3dc` / `#0b3d3a` | `#d3e4fd` / `#1d4f91` | `#ffe7a0` | 8.32 · 6.31 |
| Coral | `#ffc6b3` / `#5a1d0c` | `#e3dafb` / `#4a2b8c` | `#fbe39b` | 8.65 · 7.78 |
| Violeta | `#dacbff` / `#34146b` | `#c6efdf` / `#0f5b40` | `#ffd3e6` | 9.58 · 6.49 |

`--acento-suave`, `--acento-2-suave`, `--acento-3-suave`: en claro `color-mix(in srgb, var(--acento*) 30%, #ffffff)` (texto de acento encima: 10.8–12.8); en oscuro `color-mix(in srgb, var(--acento*) 14%, var(--card))`. Texto terciario claro: `#666a76` (5.40 tarjeta, 4.95 `soft`, 4.65 lienzo).

**Mapeo a tokens existentes** (para que todo componente actual tome la paleta sin tocarlo): `--sidebar-primary` = `--acento`, `--sidebar-primary-foreground` = `--acento-texto`, `--accent` = `--acento-suave`, `--accent-foreground` = `--acento-texto`, `--chart-1` = `--acento-2`, `--chart-destacado` (nuevo) = `--acento`, `--chart-2..5` siguen siendo los semánticos validados. `--primary` = `#16181d` (claro) / `#f4f5f7` (oscuro), `--primary-foreground` inverso. `--ring` = `--acento-texto` (≥ 8:1 sobre card; el pastel no sirve como anillo).

**Estados fijos** (no cambian con la paleta): `ok` `#2f6b12`/`#e5f5c4` (5.63), `aviso` `#8a5a00`/`#fdf0c2` (5.20), `error` `#a3263c`/`#fde3e7` (5.97), `info` `#1d4f91`/`#dcebfd` (6.72). Oscuro: texto `#b9e45a` / `#f3cf5a` / `#f7899b` / `#8fc0f7` sobre su color al 13 %.

**Mecanismo** (mismo patrón que `DisenoProvider`, un solo proveedor para las dos preferencias):

- `src/components/apariencia-opciones.ts`: `type Paleta = { valor: string; etiqueta: string; muestra: [string, string, string] }`, `PALETAS`, `PALETA_POR_DEFECTO = "lima"`; `type TonoOscuro = { valor: string; etiqueta: string; muestra: string }`, `TONOS_OSCURO` (`medianoche`, `grafito`, `tintado`), `TONO_OSCURO_POR_DEFECTO = "medianoche"`; `CLAVE_PALETA = "khipu-paleta"`, `CLAVE_TONO_OSCURO = "khipu-oscuro"`.
- `src/components/apariencia.tsx`: `AparienciaProvider({ children, paletas?, tonosOscuro?, inicial?, onCambio? })` y `useApariencia(): { paleta, setPaleta, paletas, tonoOscuro, setTonoOscuro, tonosOscuro }`. Escribe `data-paleta` y `data-oscuro` en `<html>` y en `localStorage`. `inicial?: { paleta?: string; tonoOscuro?: string }` (p. ej. leído del perfil del usuario en el servidor) gana sobre `localStorage`; `onCambio(preferencias: { paleta: string; tonoOscuro: string })` se llama en cada cambio para que la app lo guarde en su backend. Sin proveedor no falla (listas vacías, igual que `useDiseno`). El tono oscuro se aplica siempre al atributo, pero solo tiene efecto cuando `.dark` está activo, así que se puede elegir estando en claro.
- `ScriptDiseno` acepta `paletas?`, `tonosOscuro?` e `inicial?` y aplica `data-paleta` y `data-oscuro` antes del primer pintado (sin parpadeo).
- `SelectorApariencia` (`src/components/nav/selector-apariencia.tsx`): dos grupos, «Paleta» (círculos con la muestra de 3 colores) y «Oscuro» (tres muestras del lienzo con su nombre). Cada grupo es un `role="radiogroup"` navegable con flechas, con nombre en `aria-label` y tooltip. `MenuUsuario` lo muestra bajo el selector de tema (`mostrarApariencia`, por defecto `true`); también se exportan `SelectorPaleta` y `SelectorTonoOscuro` por separado para pantallas de configuración.
- Con `data-diseno="papel"` los bloques de paleta y de tono no aplican (selectores `html:not([data-diseno="papel"])[data-paleta=…]`) y `SelectorApariencia` no se muestra.
- `Providers` incluye `AparienciaProvider`. Nuevas subrutas del paquete: `./apariencia`, `./apariencia-opciones`.

## 9. Modo oscuro: tres tonos elegibles

**Común a los tres tonos**

- Tarjeta: degradado de +2.5 % blanco en los primeros 120 px, borde `color-mix(fg 7%)`, `inset 0 1px 0 rgba(255,255,255,.04)`; hover borde 9 % y sombra profunda.
- Fondo: dos resplandores radiales fijos, acento al 9 % arriba al centro y acento-2 al 6 % arriba a la derecha.
- **Acentos como luz:** KPI destacado, ítem activo, chips y promo usan `color-mix(acento 13–15 %, card)` + borde de acento al 22–28 % + texto/icono en el pastel. El pastel puro solo en marcas pequeñas: barra destacada (con `0 0 24px` de brillo), progreso, puntos, anillos.
- Gráficos: barras base `acento-2` translúcido (42 % → 16 %), destacada en `acento` pleno; tooltip blanco con texto `#0a0b0e`.
- Acción principal `#f4f5f7` con texto `#0a0b0e`.

**Superficies y texto por tono** (contraste calculado sobre tarjeta / `soft`):

| Tono | Lienzo | Tarjeta | `soft` | Línea | Principal | Secundario | Terciario |
|---|---|---|---|---|---|---|---|
| **Medianoche** (defecto) | `#0a0f1c` | `#111a2c` | `#19233a` | `#222d45` | `#e9eef8` (14.97) | `#a3afc7` (7.88) | `#8794ad` (5.69 / 5.12) |
| Grafito | `#111214` | `#1a1b1f` | `#232529` | `#2c2e33` | `#eceef2` (14.81) | `#a9abb3` (7.51) | `#8e9099` (5.41 / 4.82) |
| Tintado | `color-mix(acento 5%, #0b0c10)` | `color-mix(acento 6%, #15171b)` | `color-mix(acento 8%, #1d2025)` | `color-mix(acento 10%, #262930)` | `#eceef2` | `#a2a6b2` | `#979ba7` |

Tintado depende de la paleta: el verificador de contraste lo calcula para las 5. El terciario es `#979ba7` (no `#8a8e9b`, que daba 4.06 sobre `soft` con Lima): 4.78–4.94 sobre `soft` y 5.67–5.72 sobre tarjeta. Sidebar: degradado del tono de tarjeta un 4 % más claro → tono base.

## 10. Accesibilidad

- Texto ≥ 4.5:1 en las 5 paletas × (claro + 3 tonos oscuros) = 20 combinaciones: `npm run check:contraste` se amplía para leer cada bloque de paleta y de tono, resolver `color-mix` y combinarlos (pares: `acento-texto/acento`, `acento-2-texto/acento-2`, `fg/bg`, `fg/card`, `muted/card`, `muted/bg`, `terciario/card`, `terciario/soft`, estados, `primary-foreground/primary`).
- No textual ≥ 3:1: anillo de foco (`acento-texto`), indicador del segmento activo y puntos de estado. Los rellenos pastel de superficie (1.3–1.6 sobre blanco) son decorativos: todo estado que transmiten también va en texto o icono con color AA.
- Gráficos: las barras pastel no alcanzan 3:1 en claro; se compensa con valor en tooltip, `aria-label` por barra con el valor y la barra destacada en `acento` + etiqueta. Se documenta en `design-system.md`.
- Selector de paletas operable por teclado; `prefers-reduced-motion` desactiva hover-lift y transiciones de tarjeta.

## 11. Verificación

- `npm test`: tests nuevos de `apariencia-opciones.ts` (valores únicos, los por defecto existen, muestras bien formadas) y del script de `ScriptDiseno` (aplica `data-paleta` y `data-oscuro`, `inicial` gana sobre `localStorage`, ignora valores inválidos).
- `npm run lint` (ESLint + alturas + tipografía con la escala nueva + contraste por paleta).
- `typecheck`, `build`, `verify:paquete` (subrutas `./apariencia`, `./apariencia-opciones`).
- Navegador: `/ejemplo` en claro y en los 3 tonos oscuros con las 5 paletas, sin errores de consola, cambio de paleta y de tono sin recarga ni parpadeo al recargar, comparado contra las capturas del boceto.

## 12. Riesgos

- **Migración de iconos** (43 archivos): es mecánica pero amplia; nombres que no tienen equivalente directo en Phosphor se resuelven con una tabla de equivalencias en el plan.
- **Altura 34 px**: cambia la alineación con controles de apps que ya copiaron 0.4; se documenta en «Upgrading».
- **Inter/JetBrains Mono** reemplazan Geist: los consumidores del paquete deben cambiar sus `next/font`; se documenta.
