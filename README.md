# khipu design system

Design system para aplicaciones de gestión: tokens (claro/oscuro), componentes base sobre [base-ui](https://base-ui.com), componentes de navegación (sidebar, top bar, selector de contexto, menú de usuario), patrones (métricas, pills, tablas, diálogos, código) y componentes de feedback, formularios, navegación y datos. Stack: **Next.js 15 y 16 · React 19 · Tailwind v4 · Motion · Phosphor**.

Nació en el portal de facturación electrónica [khipu](https://github.com/bacsystem) y está desacoplado de él: rutas, textos, iconos y handlers entran por props.

- **Guía visual** (un solo HTML, claro/oscuro): [`docs/guia-visual.html`](docs/guia-visual.html)
- **Catálogo y convenciones**: [`docs/design-system.md`](docs/design-system.md)
- **Demo en vivo**: `npm run dev` → <http://localhost:3000/ejemplo>

## Empezar

```bash
npm install
npm run dev        # http://localhost:3000 → /ejemplo con todos los componentes
npm run typecheck
npm run lint
npm run build
```

## Usarlo en tu proyecto

**Proyecto nuevo:** clona este repo y borra `src/app/ejemplo/` cuando tengas tu propio shell.

**Proyecto existente (Next.js + Tailwind v4) — un componente a la vez, con su CLI:**

No hace falta copiar todo `src/components/` a mano ni instalarlo como paquete npm. La CLI (`cli/khipu.mjs`) copia un componente puntual **y sus dependencias** (otros componentes + `lib/`) directo a tu proyecto, y te dice qué paquetes de npm instalar — el mismo modelo que la CLI de shadcn/ui, pero apuntando a este repo en vez de a un registry publicado.

```bash
# Desde la raíz de TU proyecto (no de este repo):
npx github:bacsystem/khipu-design-system list             # ver todos los componentes disponibles
npx github:bacsystem/khipu-design-system add panel-lateral # copia panel-lateral + sheet + button + cabecera-seccion + lib/utils
```

`npx github:...` clona este repo en un caché temporal, instala sus dependencias y compila el paquete (`prepare`) antes de correr la CLI (tarda más que un paquete publicado en npm, es la contrapartida de no publicar nada). Si ya tienes el repo clonado localmente, es más rápido correr `node cli/khipu.mjs add <componente>` directamente desde ahí, apuntando tu proyecto como `cwd`.

Por defecto no sobrescribe archivos que ya existan en tu proyecto (usa `--force` si quieres reemplazarlos). Después de copiar los componentes que necesites, una sola vez por proyecto:

1. Pega en tu `globals.css` los `@import` de [`src/app/globals.css`](src/app/globals.css) y, debajo, el contenido de [`src/styles/tokens.css`](src/styles/tokens.css) (`:root`, `.dark`, las paletas `html[data-paleta]`, los tonos oscuros `.dark[data-oscuro]` y los diseños `html[data-diseno]`) y de [`src/styles/theme.css`](src/styles/theme.css) (`@custom-variant dark`, `@theme inline`, `@layer base` y la regla de «reducir movimiento»). Los tokens se llaman como en shadcn (`--background`, `--primary`, `--muted`…) más los semánticos (`--success*`, `--warning*`, `--destructive-border`, `--destructive-suave`/`-texto`, `--accent-border`, `--info*`, `--codigo*`, `--sidebar*`, `--chart-1..5`, `--sombra-*`, `--duracion-*`) y los de 0.5: los acentos de la paleta (`--acento`, `--acento-texto`, `--acento-2`, `--acento-2-texto`, `--acento-3` y sus `-suave`), `--texto-terciario`, `--chart-base`, `--chart-destacado`, `--borde-tarjeta`, `--brillo-tarjeta` y `--sombra-elevada`; en `@theme`, `--spacing-control` (`h-control`, 34 px) y `--text-titulo` / `--text-titulo-pagina`. Si copias componentes animados (sidebar, tabla, KPI, gráficos, progreso, copiar), instala también `motion` y envuelve la app con `ProveedorMovimiento` (ya incluido en `Providers`).
2. Envuelve la app con [`Providers`](src/components/providers.tsx) (tema + diseño + `AparienciaProvider` para la paleta y el tono oscuro + iconos duotono + toasts + tooltips), pon `ScriptDiseno` en el `<head>` y carga las fuentes (Inter + JetBrains Mono) como en [`src/app/layout.tsx`](src/app/layout.tsx).
3. Asegura el alias `"@/*": ["./src/*"]` en `tsconfig.json`.

**Alternativa manual (todo de una vez):** copia `src/components/` y `src/lib/` completos a tu `src/`, e instala tú mismo `@base-ui/react @phosphor-icons/react class-variance-authority cn next-themes motion` (+ `tw-animate-css` como dev dependency).

El registro que usa la CLI (`registry/registry.json`) se genera con `npm run registry:build` a partir de los imports reales de cada componente — se regenera solo, nunca se edita a mano.

## Instalarlo como paquete (desde 0.3.0)

La alternativa a copiar archivos: depender del design system y recibir sus cambios subiendo de versión. No está publicado en npm (`"private": true`, a propósito: publicar lo decide el dueño del repo), así que se instala **desde GitHub, fijado a un tag**:

```bash
npm install github:bacsystem/khipu-design-system#v0.5.0
```

npm clona el tag, instala sus devDependencies y corre `prepare`, que compila el paquete (`scripts/build-paquete.mjs` → `dist/`). Requisitos del proyecto consumidor: **Next.js 15.5+ o 16, React 19, Tailwind v4** y los peers `@base-ui/react` y `next-themes` (peerDependencies, no dependencias: una segunda copia de base-ui o de next-themes rompería sus contextos); `lucide-react` ya no es peer desde 0.6.0 (el paquete no lo importa; las props de icono aceptan cualquier componente, también los de Lucide si ya los usas). `motion` y `@phosphor-icons/react` sí vienen como dependencias del paquete. No hace falta `transpilePackages`: el paquete trae ESM ya compilado y `.d.ts`.

**CSS** — una sola línea en tu `globals.css`, después de Tailwind:

```css
@import "tailwindcss";
@import "khipu-design-system/styles.css";

/* opcional: tu marca encima, redefiniendo los tokens en :root Y en .dark */
:root { --primary: #0f5c5e; }
.dark { --primary: #5cc8c2; }
```

`styles.css` trae `tw-animate-css`, las variantes `data-open`/`data-closed`/… de shadcn (copiadas en el build: no hace falta instalar `shadcn`), los tokens (`tokens.css`), el tema (`theme.css`) y los `@source` que hacen que **tu** Tailwind genere las clases de los componentes compilados (Tailwind no escanea `node_modules` por su cuenta). `tokens.css` y `theme.css` también se exportan sueltos. Las fuentes no van en el paquete: define `--font-sans` y `--font-mono` (Inter y JetBrains Mono con `next/font` en `<html>`, como en [`src/app/layout.tsx`](src/app/layout.tsx)). Para que el diseño, la paleta y el tono oscuro guardados se apliquen sin parpadeo al cargar, pon `ScriptDiseno` en el `<head>`.

**Imports** — un subpath por componente, igual que la carpeta en `src/components/`:

```tsx
import { Button, buttonVariants } from "khipu-design-system/ui/button";
import { Dialog, DialogContent } from "khipu-design-system/ui/dialog";
import { Alerta } from "khipu-design-system/feedback/alerta";
import { Campo } from "khipu-design-system/formularios/campo";
import { Tabs } from "khipu-design-system/navegacion/tabs"; // con children/paneles monta paneles; sin ellos es una tira sola
import { PieTabla } from "khipu-design-system/patrones/pie-tabla";
import { TablaDatos } from "khipu-design-system/datos/tabla-datos";
import { TablaListado } from "khipu-design-system/datos/tabla-listado"; // tarjetaMovil, anchoMinimo, pie, filaActiva, claveAlmacenamiento
import { ACCION_PRINCIPAL, CAMPO } from "khipu-design-system/lib/estilos";
import { cn } from "khipu-design-system/utils";
import { Providers } from "khipu-design-system/providers";
import { AparienciaProvider, useApariencia } from "khipu-design-system/apariencia";
import { PALETAS, TONOS_OSCURO } from "khipu-design-system/apariencia-opciones";
```

- Cada módulo conserva su `"use client"`: los que usan hooks o callbacks son componentes cliente; `ui/button` (y `buttonVariants`), `ui/input`, `ui/card`, `feedback/alerta`, etc. no lo llevan y se pueden usar —y llamar— desde un Server Component.
- **`nav/*` es un export aparte** (shell, sidebar, top bar, selector de contexto, menú de usuario, mobile nav, theme toggle): dependen del router de Next (`next/link`, `usePathname`) y de `next-themes`, y una app suele tener su propio shell. Están disponibles, pero no son parte del núcleo estable: si tu app ya tiene su navegación, no los importes. `navegacion/paleta` también usa `useRouter`. **Con Next 16 y `cacheComponents`**, `SidebarNav`, `TopBar`, `MobileNav` y `BarraInferior` usan `usePathname` y deben ir (ellos o su padre) dentro de `<Suspense>`; sin él, `next build` falla en las rutas dinámicas con «usePathname() in a Client Component outside of <Suspense>». Sin `cacheComponents` (el caso por defecto) no hace falta.
- No hay un `index` que lo exporte todo, a propósito: un barrel mezclaría módulos cliente y servidor y obligaría al bundler a cargar todos los componentes.

**Mantenerlo** — `npm run verify:next15` corre en CI (job `next15`) en cada PR y antes de cada release; en local es una comprobación opcional: instala `next@15.5.28` sin guardarlo (`npm i --no-save`), compila y verifica el paquete y corre los tests, porque el repo solo desarrolla con Next 16 y el peer promete también 15.5 (el portal sigue ahí); después restaura con `npm ci` (en local; en CI el runner se descarta). `npm run build:paquete` compila a `dist/`; `npm run verify:paquete` compila y falla si un componente de `src/` no tiene subpath en `exports`, si un subpath no resuelve a su `.js` y su `.d.ts`, si un módulo no carga o si el CSS apunta a algo que no existe. Una carpeta nueva en `src/components/` necesita su entrada `"./<carpeta>/*"` en `package.json`. La receta para migrar el portal de khipu está en [`docs/adopcion-en-el-portal.md`](docs/adopcion-en-el-portal.md).

## Publicar una versión

Las versiones se publican solas al llegar a `main`; no se crean tags a mano.

1. En el PR, sube `version` en `package.json` (X.Y.Z) y añade en `CHANGELOG.md` la sección `## [X.Y.Z] - YYYY-MM-DD` (con fecha y con contenido).
2. Al hacer merge a `main`, `.github/workflows/release.yml` mira si existe el tag `vX.Y.Z`. Si no existe, vuelve a pasar la CI completa (`ci.yml`, incluido `verify:next15`) y, solo si pasa, crea el tag anotado `vX.Y.Z` sobre el commit del push (mensaje `vX.Y.Z: <título del PR> (#N)`) y la release de GitHub con las notas = esa sección del CHANGELOG. Es «Latest» solo si es la versión más alta; si el tag y la release ya existen, no hace nada. Si falta la sección o no tiene fecha, el workflow falla antes de la CI y no se crea nada.
3. Recuperación: si el run falla o no llegó a correr, se re-ejecuta (Actions → Release → «Re-run all jobs», o un nuevo push a `main`). Si el tag existe pero no la release, el run solo crea la release. Limitación: GitHub guarda un único run pendiente por grupo de concurrencia; si dos pushes que suben versión llegan mientras otro run está activo, se descarta el pendiente más antiguo y su versión no se publica sola: re-ejecuta el run de ese commit.

## Estructura

```
src/
├── app/globals.css          importa Tailwind + styles/
├── styles/tokens.css        tokens claro/oscuro (:root, .dark) y diseños (html[data-diseno]), CSS plano
├── styles/theme.css         @custom-variant dark + @theme inline + @layer base + «reducir movimiento» (Tailwind v4)
├── app/layout.tsx           Inter + JetBrains Mono, ScriptDiseno, Providers
├── app/ejemplo/             demo: shell completo + galería de componentes
├── components/providers.tsx ThemeProvider + DisenoProvider + AparienciaProvider + IconContext + ProveedorMovimiento + ToastProvider + TooltipProvider
├── components/diseno.tsx    DisenoProvider · useDiseno (+ disenos.ts, script-diseno.tsx) — ver docs/design-system.md «Diseños»
├── components/apariencia.tsx AparienciaProvider · useApariencia (paleta y tono oscuro) — ver docs/design-system.md «Apariencia»
├── components/apariencia-opciones.ts PALETAS · TONOS_OSCURO · claves de localStorage · código del script sin parpadeo
├── components/ui/           avatar · badge · button · card · dialog · drawer · grupo-botones · hover-card · input · kbd · label · menu · pagination · popover · scroll-area · select · selector-por-pagina · separator · sheet · table · toolbar
├── components/nav/          shell · sidebar · sidebar-nav · rail (BotonRail) · barra-inferior · logo · selector-contexto · menu-usuario · theme-toggle · selector-diseno · selector-apariencia · top-bar · mobile-nav
├── components/patrones/     metricas · pill-estado · cabecera-seccion · cabecera-dialogo · aviso-responsivo · franja-cuenta-regresiva · pie-tabla · confirmacion-en-linea · bloque-codigo · boton-copiar · boton-async · tarjeta-destacada
├── components/feedback/     toast (useToast) · tooltip · alerta · banner · skeleton · estado-vacio · spinner · progreso (lineal/circular)
├── components/formularios/  campo · casilla (Casilla, Interruptor) · opciones · combobox · autocomplete · contrasena · deslizador · entrada-fecha · entrada-rango-fechas · entrada-monto · entrada-decimal · zona-archivos · buscador · stepper-numerico
├── components/navegacion/   tabs · pasos · panel-lateral · acordeon · menu-acciones · dialogo-confirmacion · paleta (⌘K)
├── components/datos/        tabla-datos (selección múltiple + acciones masivas) · tabla-listado (buscador, columnas, CSV, impresión) · timeline · lista-datos · kpi (Kpi, Sparkline) · grafico (barras, líneas)
└── lib/                     utils (cn) · estilos (recetas) · formato (fechas es/en y montos, zona America/Lima) · paginacion · navegacion (esClickSimple, itemActivo) · rail (preferencia del rail) · movimiento · iconos (IconoComponente, pesos) · calendario · ordenar (ordenarFilas) · exportar (CSV, impresión) · escala-grafico (marcas del eje Y) · decimal (texto ↔ número de los campos decimales)

cli/khipu.mjs                CLI (list · add) para copiar componentes a otro proyecto — ver §Usarlo en tu proyecto
registry/registry.json       generado por scripts/build-registry.mjs, no se edita a mano
```

## Cómo armar el shell

```tsx
// src/app/(privado)/layout.tsx — Server Component
import { Shell } from "@/components/nav/shell";
import { TopBar, ACCION_PRINCIPAL } from "@/components/nav/top-bar";
import { MobileNav } from "@/components/nav/mobile-nav";
import { SidebarApp } from "./sidebar-app"; // tu componente CLIENTE con rutas, iconos y handlers

export default function Layout({ children }) {
  return (
    <Shell
      sidebar={<SidebarApp />}
      topBar={
        <TopBar
          migas={[{ prefijo: "/documentos", seccion: "Operación", pagina: "Documentos" }]}
          pills={[{ texto: "Entorno de pruebas", tono: "aviso" }]}
          menuMovil={<MobileNav><SidebarApp /></MobileNav>}
          buscador={{ placeholder: "Buscar…", atajo: "⌘K" }}
          acciones={<button className={ACCION_PRINCIPAL}>Nuevo documento</button>}
        />
      }
    >
      {children}
    </Shell>
  );
}
```

**Tablet y móvil.** Con `rail="auto"` el sidebar se pliega a 64 px (solo iconos, con tooltips) entre 768 y 1279 px; el botón de su cabecera lo expande y la elección se recuerda en `localStorage`. En el móvil (≤ 767 px) no hay sidebar: la `BarraInferior` recibe las entradas como datos, una entrada «Más» con el menú completo y, si quieres, una acción flotante. Con la barra no hace falta la hamburguesa: omite `menuMovil` (y, si la página pinta su propio título, `migaComoTitulo={false}`).

```tsx
<Shell
  rail="auto"
  sidebar={<SidebarApp />}
  barraInferior={<BarraInferiorApp />} // cliente: <BarraInferior items={…} mas={{ etiqueta: "Más", contenido: <SidebarApp /> }} accion={{ href: "/ventas/nueva", etiqueta: "Nueva venta", icono: PlusIcon }} />
  topBar={<TopBar migas={MIGAS} migaComoTitulo={false} />}
>
```

Para que no parpadee, `ScriptDiseno` va en el `<head>` (copia la preferencia a `<html data-rail>` antes del primer pintado) y, para que la barra respete la zona segura de iOS, el `viewport` lleva `viewportFit: "cover"`. Si usas la CLI (`khipu add`), la variante `rail:` vive en `styles/theme.css`: copia también ese bloque. Ver [`src/app/ejemplo/layout.tsx`](src/app/ejemplo/layout.tsx) y [`barra-inferior-app.tsx`](src/app/ejemplo/barra-inferior-app.tsx).

`SidebarApp` (ver [`src/app/ejemplo/sidebar-app.tsx`](src/app/ejemplo/sidebar-app.tsx)) compone `SidebarContent` con `LogoMarca`, `SelectorContexto`, los grupos de `SidebarNav` y `MenuUsuario`.

> **Regla del App Router:** los iconos y los callbacks son funciones y no pueden pasarse desde un Server Component a uno cliente. Defínelos en un componente `"use client"`. Migas y pills son datos planos y pueden vivir en el layout de servidor.

## Convenciones

- **Tema**: `next-themes` con `attribute="class"`; el selector Claro / Oscuro / Sistema vive en `MenuUsuario`.
- **Color por token**, nunca hex ni paleta de Tailwind en componentes. Verde = OK/activo, ámbar = provisional, rojo = error/destructivo, neutro = en proceso/inactivo.
- **Mono para datos** (ids, códigos, montos, fechas) con `tabular-nums`.
- **Top bar**: la miga es el `h1`; máximo dos acciones secundarias + una principal. La acción principal es casi negra (clara en oscuro); el color de la paleta vive en superficies.
- **Iconos** Phosphor duotono sin fondo; relleno en el activo. El color dice el significado.
- **Próximamente**: lo que aún no existe se muestra deshabilitado con `title="…: próximamente"`, nunca se oculta ni se simula.
- **Feedback**: `useToast()` para confirmaciones globales; `Alerta` para avisos de página; `Aviso` dentro de diálogos; `ConfirmacionEnLinea` en filas; `DialogoConfirmacion` solo cuando afecta a varios registros.
- **Gráficos**: máximo 5 series en orden fijo (`--chart-1..5`), un solo eje, leyenda solo con ≥ 2 series, texto en tokens de texto. Con una serie, las barras van en `--chart-base` y la destacada (`destacado`) en `--chart-destacado`, el acento de la paleta. En oscuro los pasos están validados para daltonismo y contraste.
- **Un solo `display` por contenedor**; popups al ancho de su disparador; `min-w-0` en contenedores flex/grid.

## Licencia

MIT.
