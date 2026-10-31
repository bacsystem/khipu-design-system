# Rediseño visual moderno de khipu (estilo Linear/Vercel + Motion)

- **Fecha:** 2026-10-31
- **Rama base:** `feat/estilo-notion` (incluye el sistema de diseños y «papel», aún sin commitear)
- **Estado:** pendiente de aprobación

## 1. Objetivo

La interfaz de khipu se ve antigua: paleta slate + índigo por defecto de Tailwind, texto base de 12 px, etiquetas en MAYÚSCULAS de 11 px con `tracking-wider`, fuente mono en subtítulos y ayudas, pills con borde, tarjetas planas y bloque de código negro sólido. El objetivo es modernizar **solo la capa visual** al estilo Linear/Vercel y sumar dinamismo con [Motion](https://motion.dev), sin cambiar la estructura ni las props de ningún componente.

**Criterio de éxito:** `/ejemplo` se ve como un producto de 2026 en claro y en oscuro, todos los pares de texto/fondo cumplen WCAG AA (≥ 4.5), ningún componente exportado cambia su API, y `typecheck`, `lint` y `build` pasan.

## 2. Alcance

**Entra**

1. Tokens nuevos del diseño base «khipu» en `src/app/globals.css` (claro y oscuro): paleta, sombras y escala tipográfica con nombre.
2. Tipografía Geist + Geist Mono en lugar de Inter + JetBrains Mono (`src/app/layout.tsx`).
3. Recetas de `src/lib/estilos.ts` modernizadas, con los mismos nombres de export.
4. Barrido de clases escritas a mano en `src/components/**` y `src/app/ejemplo/**` para usar la escala nueva.
5. Motion en los puntos listados en §6, con `src/lib/movimiento.ts` como fuente única de curvas y resortes.
6. Verificación automática de tipografía en `npm run lint`.
7. Documentación: `docs/design-system.md` (§1–4, §11, §13, §16, «Movimiento»), `docs/guia-visual.html`, `README.md` y `CHANGELOG.md`; `registry/registry.json` regenerado.

**No entra**

- Cambios de API, props, estructura de componentes o nombres de recetas.
- Reescribir con Motion los primitivos de base-ui con portal (diálogo, sheet, drawer, popover, menú, select, combobox, hover-card, tooltip). Siguen con transiciones CSS, afinadas con las mismas curvas (§6.1).
- Tokens nuevos del diseño «papel». Solo hereda recetas, tipografía y sombras.
- Cambiar los colores de gráfico `--chart-2..5` y todo `--chart-*` oscuro, que ya están validados para daltonismo.
- `AnimateNumber` u otras piezas de Motion+ (de pago).

## 3. Decisiones tomadas

| Tema | Decisión |
|---|---|
| Dirección visual | Linear/Vercel: casi monocromo, un acento, jerarquía por peso y no por mayúsculas |
| Relación con diseños | Reemplaza el look base «khipu». «Papel» se mantiene como alternativa |
| Acento | Índigo refinado `#5b5bd6` (claro) / `#8585f2` (oscuro) |
| Enfoque | Sistema completo: tokens + escala + recetas + barrido + Motion |
| Tipografía | Geist + Geist Mono (vienen en `next/font/google`, sin dependencia nueva) |
| Movimiento | `motion` ^14 con `LazyMotion` + `domAnimation`; base-ui sigue en CSS |
| Se mantiene | Altura única `h-9`; acción principal casi negra; índigo para confirmar formularios; regla de tonos de estado |

## 4. Tokens

### 4.1 Paleta (contraste WCAG calculado)

| Token | Claro | Oscuro | Contraste clave |
|---|---|---|---|
| `background` | `#fbfbfc` | `#0b0b0f` | fg/bg 17.13 · 16.81 |
| `foreground` | `#18181b` | `#ededf0` | |
| `card` | `#ffffff` | `#131318` | |
| `popover` | `#ffffff` | `#18181e` | |
| `primary` | `#5b5bd6` | `#8585f2` | enlace/bg 5.19 · enlace/card 5.85 |
| `primary-foreground` | `#ffffff` | `#0b0b0f` | 5.37 · 6.21 |
| `primary-light` | `#7373e0` | `#a3a3f7` | solo decorativo (logo) |
| `secondary` / `-foreground` | `#f4f4f5` / `#18181b` | `#1c1c22` / `#ededf0` | |
| `muted` | `#f7f7f8` | `#16161b` | |
| `muted-foreground` | `#6b6b76` | `#9b9ba6` | /bg 5.09 · 7.14; /card 5.26 · 6.73; /secondary 4.79 · 6.16; /muted 4.92 · 6.55; /popover — · 6.42 |
| `accent` / `-foreground` | `#f0f0fd` / `#4747c2` | `#1e1e33` / `#b4b4fa` | 6.30 · 8.42 |
| `accent-border` | `rgba(91,91,214,.22)` | `rgba(133,133,242,.28)` | |
| `destructive` / `-foreground` | `#dc2547` / `#ffffff` | `#fb6f8a` / `#0b0b0f` | 4.77 · 7.24; texto sobre card 4.77 · 6.83 |
| `destructive-border` | `rgba(220,37,71,.2)` | `rgba(251,111,138,.3)` | |
| `success` / `-foreground` / `-border` / `-solid` | `#edfaf3` / `#0f7b4f` / `rgba(15,123,79,.18)` / `#16a34a` | `#0f2a1f` / `#4fd19a` / `rgba(79,209,154,.25)` / `#34d399` | 4.93 · 7.96 |
| `warning` / `-foreground` / `-border` / `-solid` | `#fef8ec` / `#a15c07` / `rgba(161,92,7,.18)` / `#f59e0b` | `#2e2410` / `#f2c25c` / `rgba(242,194,92,.25)` / `#fbbf24` | 4.90 · 9.19 |
| `border` | `#e8e8ec` | `rgba(255,255,255,.08)` | |
| `input` | `#dedee3` | `rgba(255,255,255,.12)` | |
| `ring` | `#5b5bd6` | `#8585f2` | |
| `overlay` | `rgba(10,10,15,.32)` | `rgba(0,0,0,.6)` | |
| `brand` / `-foreground` | `#5b5bd6` / `#ffffff` | `#8585f2` / `#0b0b0f` | |
| `codigo` / `-foreground` (nuevo) | `#0f0f14` / `#e4e4e9` | `#0f0f14` / `#e4e4e9` | 15.08 · fondo de `BloqueCodigo` en ambos modos |
| `chart-1` | `#5b5bd6` | `#7b72f0` (sin cambio) | /card 5.37 |
| `chart-2..5` | sin cambio | sin cambio | |
| `sidebar` | `#fbfbfc` (igual al fondo) | `#0b0b0f` | |
| `sidebar-foreground` | `#3f3f46` | `#c4c4cc` | 10.10 · 11.33 |
| `sidebar-primary` / `-foreground` | `#ededf5` / `#3c3cb0` | `#1e1e33` / `#b4b4fa` | 7.31 · 8.42 |
| `sidebar-accent` / `-foreground` | `#f2f2f4` / `#18181b` | `#16161b` / `#ededf0` | 15.85 · — |
| `sidebar-border` / `-ring` | `#e8e8ec` / `#5b5bd6` | `rgba(255,255,255,.08)` / `#8585f2` | |

El sidebar comparte el color del fondo, como en Linear: lo separa el borde y no un bloque blanco.

### 4.2 Sombras

Variables de tema (`--sombra-*` en `:root` y `.dark`) expuestas en `@theme inline` como `--shadow-xs/sm/md/lg`, para que `shadow-sm` etc. cambien con el modo:

| Nivel | Claro | Oscuro | Uso |
|---|---|---|---|
| `xs` | `0 1px 2px rgba(16,16,24,.05)` | `inset 0 1px 0 rgba(255,255,255,.04), 0 1px 2px rgba(0,0,0,.4)` | Controles, botones |
| `sm` | `0 1px 2px rgba(16,16,24,.06), 0 1px 3px rgba(16,16,24,.04)` | `inset 0 1px 0 rgba(255,255,255,.04), 0 1px 3px rgba(0,0,0,.45)` | Tarjetas, tablas |
| `md` | `0 4px 12px -2px rgba(16,16,24,.08), 0 2px 4px -2px rgba(16,16,24,.05)` | `inset 0 1px 0 rgba(255,255,255,.05), 0 8px 24px -4px rgba(0,0,0,.6)` | Popups, menús |
| `lg` | `0 16px 40px -8px rgba(16,16,24,.16), 0 4px 12px -4px rgba(16,16,24,.08)` | `inset 0 1px 0 rgba(255,255,255,.06), 0 24px 48px -12px rgba(0,0,0,.7)` | Diálogos, sheets, toasts |

`shadow-2xs` deja de usarse en componentes: pasa a `shadow-xs`. `shadow-xl` de diálogo pasa a `shadow-lg`.

### 4.3 Radios

`--radius` sigue en `0.5rem`. Cambia solo `--radius-xl` a `calc(var(--radius) * 1.5)` = 12 px. Resultado: controles `rounded-lg` 8 px, ítems `rounded-md` 6.4 px, tarjetas, tablas, diálogos y popups `rounded-xl` 12 px.

### 4.4 Escala tipográfica

Tamaños con nombre en `@theme` (utilidades de Tailwind v4 con su interlineado):

| Utilidad | Tamaño / interlineado | Rol |
|---|---|---|
| `text-etiqueta` | 12 / 16 px | Ayudas, etiquetas de dato y sección, cabeceras de tabla, pills, subtítulos |
| `text-control` | 13 / 20 px | Botones, inputs, menús, segmentos, celdas, miga del top bar |
| `text-cuerpo` | 14 / 20 px | Texto corrido, títulos de tarjeta y sección (`font-semibold`), cuerpo de diálogo |
| `text-base` | 16 px (de Tailwind) | Título de diálogo |
| `text-metrica` | 24 / 28 px, `tracking-tight` | Valor de métrica y KPI |

Reglas:

- **Sin mayúsculas en etiquetas.** `TITULO_SECCION` y `ETIQUETA_DATO` pasan a `text-etiqueta font-medium text-muted-foreground` en tipo oración. Se quita `uppercase` y `tracking-wider` de todo el kit. Única excepción: el verbo HTTP de `BloqueCodigo` (`POST`), que es un literal.
- **Mono solo para datos:** ids, series, RUC, montos, fechas en celdas, hashes y código. Los subtítulos de sección y las ayudas de campo dejan de ser mono salvo que muestren un dato técnico.
- **Números:** `tabular-nums` en todo dato numérico, como hoy.
- **Geist** se usa sin conjuntos estilísticos alternativos: su diseño por defecto ya es el de Vercel.

### 4.5 Tabla de barrido

| Antes | Después |
|---|---|
| `text-[10px]`, `text-[11px]` | `text-etiqueta` |
| `text-[12px]` | `text-control` (en controles y celdas) o `text-etiqueta` (en ayudas) |
| `text-[13px]` | `text-control` (controles, celdas, miga) o `text-cuerpo` (títulos de tarjeta) |
| `uppercase tracking-wider` | se elimina |
| `shadow-2xs` | `shadow-xs` |
| `shadow-xl` (diálogo) | `shadow-lg` |
| `shadow-md ring-1 ring-foreground/10` (popups) | `shadow-md ring-1 ring-border` |
| Pills: `border border-*-border` | sin borde: relleno `bg-*` + punto `bg-*-solid` |
| Bloque de código con fondo negro | `bg-codigo text-codigo-foreground` (token nuevo de §4.1) con `border-border` |
| Foco `focus-visible:ring-3 ring-ring/30` | `focus-visible:ring-2 ring-ring/50 ring-offset-2 ring-offset-background` |

## 5. Arquitectura de la capa visual

```
globals.css    tokens claro/oscuro, --sombra-*, escala --text-*, curvas --ease-*
layout.tsx     Geist / Geist_Mono → --font-sans / --font-mono
lib/estilos.ts recetas (mismos nombres) sobre la escala nueva
lib/movimiento.ts  resortes y curvas para Motion
components/movimiento.tsx  ProveedorMovimiento (LazyMotion + MotionConfig), "use client"
components/**  barrido de clases + Motion donde aplica
```

- `ProveedorMovimiento` se monta dentro de `Providers`, junto a tema, diseño, toasts y tooltips. Usa `LazyMotion features={domAnimation} strict`, por lo que los componentes usan `m.*` y no `motion.*`. `strict` hace fallar en desarrollo cualquier `motion.*` que se cuele y cargue el bundle completo.
- `MotionConfig reducedMotion="user"` respeta «reducir movimiento» del sistema, igual que el `motion-safe:` actual de las recetas CSS.
- `lib/movimiento.ts` exporta `RESORTE` (`{ type: "spring", stiffness: 500, damping: 40, mass: 0.8 }`), `RESORTE_SUAVE` (`stiffness: 300, damping: 30`), `CURVA_SALIDA` (`[0.16, 1, 0.3, 1]`) y `DURACION` (`{ rapida: 0.12, media: 0.2, lenta: 0.32 }`). `globals.css` declara las mismas curvas como `--ease-salida` y las duraciones como `--duracion-*`, y los primitivos de base-ui las usan en sus transiciones. Un comentario en ambos archivos marca que deben ir sincronizados.
- Fuera de `ProveedorMovimiento` (consumidores que copian un componente con la CLI y no montan el proveedor) los `m.*` no animan pero renderizan bien: se documenta que el proveedor es necesario para el movimiento.

## 6. Movimiento

### 6.1 CSS (sin Motion)

Diálogo, sheet, drawer, popover, menú, select, combobox, autocomplete, hover-card, tooltip y acordeón conservan sus transiciones `data-starting-style`/`data-ending-style` y `ANIMACION_POPUP`, con `ease-(--ease-salida)` y `duration-(--duracion-*)`. La entrada de bloques (`ENTRADA`) y la presión al pulsar (`PRESION`) siguen en CSS porque deben funcionar en Server Components.

### 6.2 Motion

| Componente | Efecto | Detalle |
|---|---|---|
| `Tabs` (línea y segmentado) | Indicador que se desliza al cambiar de pestaña | `m.span` con `layoutId` único por instancia (`useId`); reemplaza `data-active:border-primary` y `data-active:bg-card` |
| `SidebarNav` | El fondo del ítem activo se desliza | `layoutId` por instancia de sidebar |
| `Toast` | Apilado y salida con resorte | `AnimatePresence` + `layout` en la lista del viewport, solo si el viewport de base-ui lo permite sin romper el temporizador; si no, se queda en CSS (ver §7) |
| `TablaDatos` | La barra de acciones masivas entra y sale | `AnimatePresence` con `y` + `opacity` |
| `Kpi`, `Metricas` | El valor cuenta desde 0 al montarse | Pieza cliente nueva `NumeroAnimado` (`patrones/numero-animado.tsx`) que recibe `valor` y `formato`; `Kpi` y `Metricas` siguen siendo Server Components y solo la renderizan |
| `Sparkline` | La línea se dibuja | `m.path` con `pathLength` 0→1 |
| `Grafico` | Barras crecen desde la base, la línea se dibuja | `scaleY` con `originY: 1`; `pathLength` |
| `ProgresoLineal`, `ProgresoCircular` | Avance con resorte | `RESORTE_SUAVE` sobre `scaleX` / `strokeDashoffset` |
| `ConfirmacionEnLinea` | Cambio animado de acción a confirmación | `AnimatePresence mode="popLayout"` |
| `BotonCopiar` | El icono cambia con giro y escala | `AnimatePresence mode="wait"` |

Todo efecto usa `RESORTE` o `CURVA_SALIDA` de `lib/movimiento.ts`, nunca valores sueltos.

## 7. Riesgos y manejo

- **SSR y parpadeo.** `NumeroAnimado` renderiza en el servidor el valor final formateado y anima solo en el cliente después de hidratar, así el HTML inicial ya muestra el número correcto y no hay desajuste de hidratación.
- **Lectores de pantalla.** `NumeroAnimado` pone el valor final en `aria-label` y marca el texto animado con `aria-hidden`.
- **Reducir movimiento.** Con la preferencia activa, Motion salta al estado final y las transiciones CSS siguen bajo `motion-safe:`.
- **Toasts.** Si `AnimatePresence` choca con el ciclo de vida del `Toast` de base-ui (cierre por tiempo, gesto de deslizar), se conserva la transición CSS actual con las curvas nuevas y se deja constancia en `docs/design-system.md` «Pendientes». No se fuerza.
- **«Papel».** Hereda recetas, tipografía y sombras. Sus colores no cambian, pero se revisa en `/ejemplo` en claro y oscuro que no quede ningún par por debajo de su contraste actual.
- **Consumidores existentes.** Los nombres de tokens, recetas y props no cambian, pero los valores sí: es un cambio visual, versión minor `0.3.0` en `CHANGELOG.md`, con nota de que se necesita `motion` como dependencia para los componentes animados (la CLI lo informa sola desde `registry.json`).

## 8. Verificación

1. `npm run typecheck`, `npm run lint` y `npm run build` sin errores.
2. Nuevo `scripts/verificar-tipografia.mjs`, en `npm run lint` junto a `check:alturas`, falla con archivo y línea si un archivo de `src/components/` usa `text-[Npx]`, `uppercase` (salvo una excepción marcada con comentario) o `tracking-wider`.
3. Script de contraste (el de este spec) sobre los pares de §4.1: todos ≥ 4.5 salvo los marcados como decorativos.
4. Revisión visual de `/ejemplo` en navegador: diseños «khipu» y «papel» × claro y oscuro, con capturas.
5. Con «reducir movimiento» emulado en DevTools, ningún elemento anima y todo queda en su estado final.
6. `npm run registry:build` y `registry.json` lista `motion` en los componentes animados.
7. Con `next dev`, ninguna advertencia de hidratación en la consola de `/ejemplo`.
