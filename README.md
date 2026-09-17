# khipu design system

Design system para aplicaciones de gestión: tokens (claro/oscuro), componentes base sobre [base-ui](https://base-ui.com), componentes de navegación (sidebar, top bar, selector de contexto, menú de usuario), patrones (métricas, pills, tablas, diálogos, código) y componentes de feedback, formularios, navegación y datos. Stack: **Next.js 15 · React 19 · Tailwind v4 · lucide-react**.

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

**Proyecto existente (Next.js + Tailwind v4):**

```bash
npm i @base-ui/react lucide-react class-variance-authority cn next-themes
npm i -D tw-animate-css shadcn
```

1. Copia `src/components/` y `src/lib/` a tu `src/`.
2. Pega en tu `globals.css` los bloques `@import`, `@custom-variant dark`, `@theme inline`, `:root`, `.dark` y `@layer base` de [`src/app/globals.css`](src/app/globals.css). Los tokens se llaman como en shadcn (`--background`, `--primary`, `--muted`…) más los semánticos (`--success*`, `--warning*`, `--destructive-border`, `--accent-border`, `--sidebar*`, `--chart-1..5`).
3. Envuelve la app con [`Providers`](src/components/providers.tsx) (tema + toasts + tooltips) y carga las fuentes como en [`src/app/layout.tsx`](src/app/layout.tsx).
4. Asegura el alias `"@/*": ["./src/*"]` en `tsconfig.json`.

## Estructura

```
src/
├── app/globals.css          tokens + @theme
├── app/layout.tsx           Inter + JetBrains Mono, Providers
├── app/ejemplo/             demo: shell completo + galería de componentes
├── components/providers.tsx ThemeProvider + ToastProvider + TooltipProvider
├── components/ui/           badge · button · card · dialog · input · label · menu · pagination · select · selector-por-pagina · sheet · table
├── components/nav/          shell · sidebar · sidebar-nav · logo · selector-contexto · menu-usuario · theme-toggle · top-bar · mobile-nav
├── components/patrones/     metricas · pill-estado · cabecera-seccion · cabecera-dialogo · pie-tabla · confirmacion-en-linea · bloque-codigo · boton-copiar
├── components/feedback/     toast (useToast) · tooltip · alerta · skeleton · estado-vacio
├── components/formularios/  campo · casilla (Casilla, Interruptor) · opciones · combobox · entrada-fecha · entrada-monto · zona-archivos
├── components/navegacion/   tabs · pasos · panel-lateral · acordeon · menu-acciones · dialogo-confirmacion · paleta (⌘K)
├── components/datos/        tabla-datos · timeline · lista-datos · kpi (Kpi, Sparkline) · grafico (barras, líneas)
└── lib/                     utils (cn) · estilos (recetas) · formato (fechas/montos, zona America/Lima) · paginacion
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

`SidebarApp` (ver [`src/app/ejemplo/sidebar-app.tsx`](src/app/ejemplo/sidebar-app.tsx)) compone `SidebarContent` con `LogoMarca`, `SelectorContexto`, los grupos de `SidebarNav` y `MenuUsuario`.

> **Regla del App Router:** los iconos de lucide y los callbacks son funciones y no pueden pasarse desde un Server Component a uno cliente. Defínelos en un componente `"use client"`. Migas y pills son datos planos y pueden vivir en el layout de servidor.

## Convenciones

- **Tema**: `next-themes` con `attribute="class"`; el selector Claro / Oscuro / Sistema vive en `MenuUsuario`.
- **Color por token**, nunca hex ni paleta de Tailwind en componentes. Verde = OK/activo, ámbar = provisional, rojo = error/destructivo, neutro = en proceso/inactivo.
- **Mono para datos** (ids, códigos, montos, fechas) con `tabular-nums`.
- **Top bar**: la miga es el `h1`; máximo dos acciones secundarias + una principal (negra); el índigo se reserva para confirmar en formularios.
- **Próximamente**: lo que aún no existe se muestra deshabilitado con `title="…: próximamente"`, nunca se oculta ni se simula.
- **Feedback**: `useToast()` para confirmaciones globales; `Alerta` para avisos de página; `Aviso` dentro de diálogos; `ConfirmacionEnLinea` en filas; `DialogoConfirmacion` solo cuando afecta a varios registros.
- **Gráficos**: máximo 5 series en orden fijo (`--chart-1..5`), un solo eje, leyenda solo con ≥ 2 series, texto en tokens de texto. En oscuro los pasos están validados para daltonismo y contraste.
- **Un solo `display` por contenedor**; popups al ancho de su disparador; `min-w-0` en contenedores flex/grid.

## Licencia

MIT.
