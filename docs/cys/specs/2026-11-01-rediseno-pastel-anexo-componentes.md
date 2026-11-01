# Anexo al rediseño 0.5: componentes y tipografía elegible

- **Fecha:** 2026-11-01
- **Spec base:** `2026-11-01-rediseno-pastel-paletas-design.md`
- **Rama:** `feat/rediseno-pastel` (PR #28)
- **Estado:** aprobado (2026-11-01)
- **Boceto aprobado:** `componentes.html` del scratchpad de la sesión (servido en `http://127.0.0.1:4100/componentes.html`).

Revisión de `/ejemplo` con los popups abiertos: los selects, checks, diálogos, popups, iconos, bordes y gráficos no seguían el lenguaje del boceto del dashboard. Este anexo fija cómo quedan. Todo es capa visual o props opcionales nuevas; no se quita ni renombra nada.

## 1. Iconos: una regla por tipo

- **Semánticos** (menú, encabezados, tarjetas, estados vacíos, avisos): duotono; relleno en el activo. Sin cambio.
- **Funcionales** (caret, check, cerrar, más/menos, flechas, ⋯, lupa, spinner, copiar, refrescar, hamburguesa): **bold** siempre. Hoy salen en duotono y el caret del select parece un triángulo relleno.
- `src/lib/iconos.ts` exporta `PESO_ICONO_FUNCIONAL = "bold"`.

## 2. Menú de usuario

- **Tema solo con iconos** (sol, luna, monitor), con el nombre en `title` y `aria-label`: el texto no entraba («Osc…», «Sist…»).
- **Tono oscuro** como mini muestra de lienzo + tarjeta + acento, con el nombre debajo (hoy tres puntos negros iguales). `TonoOscuro` gana el campo opcional `lienzo`.
- **Tipografía** (nueva preferencia, §3) como fila de «Aa», cada uno en su fuente, con el nombre debajo.

## 3. Tipografía elegible por el usuario

- Fuentes de interfaz: **Inter** (por defecto), **Plus Jakarta Sans**, **Manrope**, **DM Sans**, **Figtree**. JetBrains Mono queda fija para datos.
- Mismo mecanismo que paleta y tono oscuro: `data-fuente` en `<html>`, `localStorage` (`khipu-fuente`), `ScriptDiseno` sin parpadeo, `AparienciaProvider` con `fuente` / `setFuente` / `fuentes`, `inicial.fuente` y `onCambio` con las tres preferencias.
- Carga: `next/font` con `preload: false` para las no elegidas por defecto; cada fuente expone `--fuente-<valor>` y el bloque `html[data-fuente="<valor>"]` cambia `--font-sans`.
- «papel» no usa la preferencia de tipografía.

## 4. Componentes

| Componente | Cómo queda |
|---|---|
| Select | Lista flotante radio 16, sombra suave + anillo de 1 px, opciones de 34 px con hover `secondary`, la elegida en negrita con check en círculo de acento. Caret bold que gira al abrir. |
| Campos | Foco: borde `acento-texto` (oscuro: `acento`) + anillo del acento. Error: borde y anillo rojo tenue. Stepper en píldora. Slider: pista `secondary`, rango `primary`, pomo blanco con anillo. |
| Checks | Caja 18 px, radio 6, check bold; marcado en `primary` (el pastel no llega a 3:1 como indicador). Switch más fino. Opción elegida (radio card) teñida `acento-suave` con borde fino `acento-texto`. |
| Diálogo | Radio 22, sin líneas entre cabecera, cuerpo y pie; icono de 22 px en círculo del tono (la única excepción a «icono sin fondo»: es la cara del diálogo); velo `overlay` más suave con desenfoque de 2 px; cerrar en botón redondo. |
| Panel lateral | Flota con 12 px de margen y radio 20. |
| Menú y popover | Ítems con icono duotono, radio 10, separadores finos; destructivo en rojo. Tooltip radio 10. |
| Avisos | Sin borde, solo el tinte, radio 14. Toast: tarjeta flotante con icono relleno del tono. |
| Tabs | Subrayado de 2 px en `foreground`, contador en píldora (`acento` en la activa). Acordeón sobre superficie `secondary`, radio 14. |
| Gráficos | Barras con extremo de radio 9 y más hueco; leyenda en píldoras; ejes en texto terciario sin rejilla punteada. Nuevo `GraficoAnillos` (anillos concéntricos con la paleta) para el dashboard. |

## 5. Verificación

Tests (nuevos para `FUENTES` y el script con `data-fuente`), typecheck, lint (contraste sin cambios: no se tocan tokens de color salvo el overlay), build, paquete y comparación en navegador contra `componentes.html` en claro y oscuro.
