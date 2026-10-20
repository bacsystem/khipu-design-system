# Adopción del paquete en el portal de khipu (fase 2 de bacsystem/khipu#16)

Receta para que `portal/` (repo `bacsystem/khipu`) deje de copiar archivos del design system y dependa del paquete. La fase 1 (este repo, 0.3.0) dejó el paquete listo y probado en una app Next mínima con el mismo stack que el portal (Next 15.5.25, React 19.1.0, Tailwind v4, base-ui 1.8): `tsc` limpio, build con Turbopack y con webpack, Button / Input / Dialog / Alerta / TopBar / ThemeToggle / toast renderizados con sus estilos desde un Server Component, en claro y en oscuro.

Estado del portal al escribir esto: `develop` de khipu, último cambio a `portal/src/components/ui` en `628a6cc1` («todos los controles miden 36 px (H25)»). Si el portal cambió después, rehacer la tabla de §1 con `diff --strip-trailing-cr` antes de empezar.

---

## 0. Antes de tocar el portal

1. **Publicar el tag** en este repo: merge de la rama a `main`, tag `v0.3.0` y push del tag. Sin el tag no hay qué instalar.
2. ~~Subir al DS lo que el portal tiene de más~~ **Hecho en 0.3.1**: `etiqueta` de `BotonCopiar`, `hrefPagina` de `PieTabla` (con `lib/navegacion` / `esClickSimple`), `SELECT_NATIVO` y `CABECERA_TABLA` en `lib/estilos`, copiados del portal (`feat/24-dashboard`, `4cfc1fe9`) con sus textos y clases. Falta taggear `v0.3.1` (igual que el punto 1). La regla del proyecto es corregir primero en el DS y después traerlo; con el paquete, «traerlo» pasa a ser subir la versión.
3. Hacerlo **sobre la pila final de ramas del portal**, cuando no haya otras ramas tocando `portal/src/components/ui`: el cambio de imports toca 88 archivos (medido en `develop`, incluidas las copias que se borran) y choca con cualquiera.

## 1. Divergencias portal ↔ DS (riesgo de regresión visual)

Comparación de los archivos homónimos (`diff --strip-trailing-cr`):

| Archivo del portal | Estado frente al DS | Qué hacer |
|---|---|---|
| `ui/badge, button, card, dialog, grupo-botones, input, label, menu, select, selector-por-pagina, table` | idénticos | reemplazar por `khipu-design-system/ui/*` |
| `feedback/alerta, estado-vacio, spinner` | idénticos | `khipu-design-system/feedback/*` |
| `formularios/campo, entrada-fecha, entrada-monto, stepper-numerico` | idénticos | `khipu-design-system/formularios/*` |
| `navegacion/pasos, tabs` | idénticos | `khipu-design-system/navegacion/*` |
| `patrones/cabecera-dialogo, cabecera-seccion` | idénticos | `khipu-design-system/patrones/*` |
| `patrones/boton-async` | solo cambia un comentario | `khipu-design-system/patrones/boton-async` |
| `lib/utils` (`cn`), `lib/paginacion` | idénticos | `khipu-design-system/utils`, `khipu-design-system/lib/paginacion` (o dejar el `lib/utils` local, es una línea) |
| `ui/sheet` | `sr-only` del cerrar en inglés («Close»); el DS dice «Cerrar» | adoptar el del DS. Ningún e2e ni test busca «Close» (verificado con grep) |
| `ui/pagination` | textos en inglés; **nadie lo importa** | borrarlo |
| `ui/boton-copiar` | el DS ya tiene la prop `etiqueta` desde 0.3.1 (mismo componente que el del portal; sin `etiqueta` las clases son las mismas, en otro orden) | reemplazar por `khipu-design-system/patrones/boton-copiar` (8 imports) |
| `ui/pie-tabla` | el DS ya tiene `hrefPagina` desde 0.3.1 (mismo `Salto` con `<Link>`, `aria-disabled` y ⌘-clic; `esClickSimple` está en `khipu-design-system/lib/navegacion`). Además exporta `TablaVacia`, `CONTENEDOR_TABLA` y re-exporta `CABECERA_TABLA`, que el portal no usa desde aquí. Único cambio a propósito: `nota` acepta `ReactNode` (el portal: `string`, que sigue valiendo) | reemplazar por `khipu-design-system/patrones/pie-tabla` (8 imports). `@/lib/navegacion` del portal puede quedarse o reexportar el del DS (lo usa también `comprobantes-table`) |
| `lib/estilos` | mismas cadenas en todas las recetas comunes. Desde 0.3.1 el DS también tiene `SELECT_NATIVO` y `CABECERA_TABLA` (mismas cadenas que el portal); el portal no trae los alias obsoletos `CAMPO_FILTRO`, `BOTON_*_PIE` ni `POPUP_LISTA` | nada que subir. Fachada de §3.4 |
| `lib/formato` | divergió a propósito (EUR, `hoyLima`, `diasEntre`, ciclos de plan, `sumarDias` en UTC…) | **se queda en el portal**. Los componentes del DS usan su propio `lib/formato` interno, igual que hoy |
| `ui/metrica` | componente propio (`Metrica`), distinto de `patrones/metricas` del DS | se queda en el portal (o se sube como variante; decisión de diseño aparte) |
| `ui/referencia-tecnica`, `forms/form-field` | propios del portal (form-field depende de react-hook-form) | se quedan; moverlos fuera de `components/ui` (p. ej. `components/developers/`, `components/forms/`) para que `ui/` quede vacía |
| `providers.tsx` | el portal monta `QueryClientProvider` + `ThemeProvider`, **sin** `ToastProvider` ni `TooltipProvider` | se queda el del portal. Si algún día usa `feedback/toast` o `feedback/tooltip`, añadir esos providers (o anidar `khipu-design-system/providers`) |
| `nav/*` | muy divergido: `top-bar` (≈160 líneas), `sidebar-nav`, `logo`, `mobile-nav`; y propios: `empresa-selector`, `perfil-usuario`, `plan-y-consumo`, `sidebar-content`. Solo `theme-toggle` es idéntico | **se queda en el portal** (el issue lo deja para el final). `nav/theme-toggle` puede venir de `khipu-design-system/nav/theme-toggle` |
| `app/globals.css` | **otra marca**: teal/papel/ámbar en vez de índigo, en claro y en oscuro (todos los colores salvo success/warning). Tokens propios: `--acento*`, `--code*`, `--font-heading: var(--font-titulo), …`, keyframes `khipu-anillo` del hero | se queda como capa encima del paquete (§3.2) |

Lo que **no** diverge: la escala de alturas (todo control `h-9`, segmentos `h-7`), radios, `buttonVariants`, las variantes `data-*` y las animaciones. Las clases que generan los componentes son las mismas cadenas: Tailwind ordena las utilidades por su cuenta, así que escanear el paquete en vez de las copias no reordena la cascada.

## 2. Dependencias (`portal/package.json`)

```jsonc
"dependencies": {
  "khipu-design-system": "github:bacsystem/khipu-design-system#v0.3.1",
  // se quedan: @base-ui/react, lucide-react, next, next-themes, react, react-dom (peers del paquete), cn (lo usa el código propio)
  // se pueden quitar cuando ya nadie los importe: class-variance-authority (solo lo usaban ui/badge y ui/button),
  // shadcn (solo se usaba por `shadcn/tailwind.css`, que ahora trae el paquete), tw-animate-css (lo trae el paquete)
}
```

`npm install github:…#v0.3.0` clona el tag (o baja el tarball de codeload), instala las devDependencies del DS y corre su `prepare` (compila a `dist/`). Probado con `npm pack git+file://…#feat/paquete-npm`: `prepare` corre y el tarball sale idéntico (243 archivos) al de `npm pack` local.

**Riesgo a verificar en la fase 2: el Dockerfile.** `portal/Dockerfile` hace `npm ci` en `node:22-alpine`, que no trae `git`. Para un repo público de GitHub npm suele bajar el tarball por HTTPS sin `git`, pero **no está probado**. Si falla, dos salidas:
- `RUN apk add --no-cache git` en la etapa `deps`, o
- (más robusto) adjuntar `khipu-design-system-0.3.0.tgz` (de `npm pack`) como asset del release `v0.3.0` y depender de su URL: `"khipu-design-system": "https://github.com/bacsystem/khipu-design-system/releases/download/v0.3.0/khipu-design-system-0.3.0.tgz"`. No necesita git ni `prepare` y es inmutable.

`next.config.ts`: **sin cambios**. No hace falta `transpilePackages` (el paquete trae ESM compilado con `"use client"` preservado; probado con Turbopack y con webpack). `output: "standalone"` traza `node_modules/khipu-design-system/dist` como cualquier dependencia.

## 3. Cambios en el código

### 3.1 Orden recomendado (una PR por paso o una pila corta)

1. Subidas al DS (§0.2) y tag `v0.3.x`.
2. Dependencia + `globals.css` (§3.2). Sin cambiar imports todavía: las copias y el paquete conviven, y el CSS ya sale del paquete. Capturas «después» de este paso = regresión del CSS sola.
3. Codemod de imports (§3.3), borrar las copias idénticas, mover `referencia-tecnica`/`form-field`/`metrica` fuera de `ui/`.
4. `lib/estilos` (§3.4) y tests del portal que leen archivos (§3.5).

### 3.2 `portal/src/app/globals.css`

Las tres primeras líneas pasan a dos, y todo lo que es del portal queda debajo:

```css
@import "tailwindcss";
@import "khipu-design-system/styles.css";   /* trae tw-animate-css, las variantes de shadcn, tokens, tema y @source */

/* Lo propio del portal, encima del tema del DS */
@theme inline {
  --font-heading: var(--font-titulo), var(--font-sans);
  --color-acento: var(--acento);
  --color-acento-suave: var(--acento-suave);
  --color-acento-borde: var(--acento-borde);
  --color-code: var(--code);
  --color-code-foreground: var(--code-foreground);
}

:root { /* bloque :root actual del portal, completo (marca teal + acento + code) */ }
.dark { /* bloque .dark actual del portal, completo */ }

/* @media … khipu-anillo: igual que hoy */
```

- Se borran del `globals.css` del portal: `@import "tw-animate-css"`, `@import "shadcn/tailwind.css"`, `@custom-variant dark`, el `@theme inline` con los `--color-*`/`--radius-*` comunes y el `@layer base`; todo eso ya viene en `styles.css`.
- **Hay que redefinir `:root` y `.dark` completos.** Un `:root { --primary: … }` suelto después del import también pisa al `.dark` del DS (misma especificidad, gana el último), así que el modo oscuro tomaría el color claro. Copiando los dos bloques actuales del portal no pasa.
- Probado en la app mínima: un `@theme inline` posterior pisa `--font-heading` (`h1,h2,h3{font-family:var(--font-titulo),var(--font-sans)}`) y añade utilidades nuevas (`.bg-acento`); importar dos veces las variantes de shadcn (si quedara `shadcn/tailwind.css`) no da error ni duplica selectores.
- `@source` escanea todo `dist/` del paquete: el CSS del portal incluirá las clases de componentes que no usa (unos KB más, sin efecto visual).

### 3.3 Codemod de imports

Desde la raíz de khipu (Git Bash), sobre `portal/src` y `portal/e2e`:

```bash
grep -rlE '@/components/(ui|feedback|formularios|navegacion|patrones)/' portal/src portal/e2e --include=*.ts --include=*.tsx \
  | xargs sed -i -E \
    -e 's#"@/components/ui/(badge|button|card|dialog|grupo-botones|input|label|menu|select|selector-por-pagina|sheet|table)"#"khipu-design-system/ui/\1"#' \
    -e 's#"@/components/feedback/(alerta|estado-vacio|spinner)"#"khipu-design-system/feedback/\1"#' \
    -e 's#"@/components/formularios/(campo|entrada-fecha|entrada-monto|stepper-numerico)"#"khipu-design-system/formularios/\1"#' \
    -e 's#"@/components/navegacion/(pasos|tabs)"#"khipu-design-system/navegacion/\1"#' \
    -e 's#"@/components/patrones/(boton-async|cabecera-dialogo|cabecera-seccion)"#"khipu-design-system/patrones/\1"#' \
    -e 's#"@/components/ui/boton-copiar"#"khipu-design-system/patrones/boton-copiar"#' \
    -e 's#"@/components/ui/pie-tabla"#"khipu-design-system/patrones/pie-tabla"#' \
    -e 's#"@/components/nav/theme-toggle"#"khipu-design-system/nav/theme-toggle"#' \
    -e 's#"@/lib/paginacion"#"khipu-design-system/lib/paginacion"#'
```

Las dos líneas de `boton-copiar` y `pie-tabla` ya aplican: el DS tiene `etiqueta` y `hrefPagina` desde 0.3.1 (§1). Imports a cambiar medidos en `develop` (`grep -rhoE 'from "@/…"' | sort | uniq -c`): `ui/button` 24, `ui/dialog` 18, `ui/table` 17, `lib/paginacion` 12, `ui/pie-tabla` 8, `ui/boton-copiar` 8, `feedback/alerta` 8, y 1–4 cada uno del resto. `@/lib/utils` (90) y `@/lib/estilos` (73) no hace falta tocarlos (§3.4).

Después: borrar los archivos que ya nadie importa (`git rm` de las copias idénticas y de `ui/pagination.tsx`), mover `ui/metrica`, `ui/referencia-tecnica` y `forms/form-field` a carpetas del portal, y comprobar con `grep -rn '@/components/ui/' portal/src` que no queda nada. `components/ui` debe quedar vacía.

### 3.4 `lib/estilos` y `lib/utils`

Para no tocar 163 imports, los dos archivos quedan como fachada:

```ts
// portal/src/lib/estilos.ts
export * from "khipu-design-system/lib/estilos";
// SELECT_NATIVO y CABECERA_TABLA ya vienen del DS (0.3.1): no hace falta definir nada más aquí.
```

```ts
// portal/src/lib/utils.ts — ya es `export { cn } from "cn"`; puede quedarse así o reexportar khipu-design-system/utils.
```

La fachada también expone los alias obsoletos del DS (`CAMPO_FILTRO`, `BOTON_*_PIE`); el `alturas.test.ts` del portal ya prohíbe usarlos en la práctica, y siguen midiendo `h-9`.

### 3.5 Tests del portal que leen archivos

- `src/lib/alturas.test.ts` lee el **texto** de `lib/estilos.ts` con una regex (`export const (CAMPO|BOTON_…) = "…"`). Con la fachada, el texto ya no tiene las recetas y la regex no encuentra ninguna: el test pasaría sin vigilar nada. Cambiarlo a importar el módulo (`import * as estilos from "@/lib/estilos"`) y comprobar `h-9` sobre los valores. Su lista de excepciones (`components/ui/selector-por-pagina.tsx`) queda obsoleta: borrar la entrada.
- `src/lib/tokens-de-color.test.ts` recorre los componentes del portal: deja de ver los del DS (que ya vigila `npm run lint` del DS). Correcto, pero conviene saberlo.
- `src/lib/paginacion.test.ts` y `src/lib/utils.test.ts`: si se borran los archivos locales, apuntar los tests al paquete o moverlos al DS (el DS no tiene suite de tests propia; sería el momento de crearla).
- Vitest corre los módulos del paquete en Node: `npm run verify:paquete` del DS ya importa los 77 módulos en Node sin error. Si Vitest se quejara de `"use client"` o de ESM, `test.server.deps.inline: ["khipu-design-system"]` en `vitest.config.mts`.

## 4. Verificar «sin regresión visual»

No hay capturas en los e2e del portal hoy (`grep toHaveScreenshot` vacío), así que se toman a propósito, **antes** (en `develop`, sin la migración) y **después**, con el mismo mock, viewport y tema:

```ts
// portal/e2e/capturas-ds.spec.ts — temporal, no se commitea
import { test, expect } from "@playwright/test";
import { entrarComoAdmin } from "./admin-sesion";
import { registrarYVerificar } from "./registro-sesion";

const PUBLICAS = ["/login", "/registro", "/recuperar", "/developers", "/developers/guia", "/developers/errores", "/developers/catalogos"];
const CLIENTE = ["/comprobantes", "/series", "/establecimientos", "/empresa", "/api-keys", "/cuenta/plan"];
const ADMIN = ["/admin", "/admin/cuentas", "/admin/empresas", "/admin/planes", "/admin/monitor", "/admin/configuracion"];

for (const tema of ["light", "dark"] as const) {
  test.describe(`capturas ${tema}`, () => {
    test.use({ colorScheme: tema, viewport: { width: 1280, height: 900 } });
    test("públicas", async ({ page }) => {
      for (const ruta of PUBLICAS) {
        await page.goto(ruta);
        await expect(page).toHaveScreenshot(`${tema}${ruta.replaceAll("/", "_")}.png`, { fullPage: true, animations: "disabled" });
      }
    });
    // cliente (tras registrarYVerificar) y admin (tras entrarComoAdmin): mismo bucle sobre CLIENTE y ADMIN,
    // más un diálogo abierto (emitir comprobante, nueva API key) y una tabla con paginación.
  });
}
```

1. En `develop`: `npx playwright test e2e/capturas-ds.spec.ts --update-snapshots` (puerto propio con `E2E_PORT`).
2. En la rama migrada: `npx playwright test e2e/capturas-ds.spec.ts` — falla si algún píxel cambia (ajustar `maxDiffPixelRatio` solo por antialiasing, nunca para tapar una diferencia real).
3. Además, en la consola del navegador: medir con `getBoundingClientRect` que botones, inputs y selects siguen en 36 px (la memoria del proyecto: medir, no suponer).
4. `npm run typecheck`, `npm run lint`, `npm run test` y `npm run e2e` completos en verde, y `docker build` del portal (§2, riesgo del Dockerfile).

Diferencias **esperadas** y aceptables tras la migración: el texto `sr-only` del cerrar del `Sheet` («Cerrar» en vez de «Close»; invisible). `etiqueta`/`hrefPagina` se subieron sin ajustes: con `hrefPagina` el `PieTabla` del DS genera el mismo HTML que el del portal; sin él, los botones numéricos no llevan las variantes `disabled:` (nunca se deshabilitan) y el `BotonCopiar` sin `etiqueta` ordena distinto las mismas clases. Ninguna de las dos cambia un píxel.
