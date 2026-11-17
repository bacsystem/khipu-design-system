// Reglas compartidas entre la CLI para consumidores (`cli/verificar.mjs`) y los chequeos del propio kit
// (`scripts/verificar-tipografia.mjs`, `scripts/verificar-alturas.mjs`). Una sola fuente: si cambia una regla, cambia en los dos.
// Los patrones se exportan SIN la bandera `g` (se pueden usar con `.test` sin estado); quien necesite todas las
// coincidencias crea `new RegExp(patron.source, "g")`. Sin dependencias: este archivo viaja en el paquete.

/** Escala tipográfica con nombre (docs/design-system.md §3). `salvoRecetas`: solo se permite en `src/lib/estilos.ts` del kit. */
export const TIPOGRAFIA = [
  { id: "tamano-suelto", patron: /(?<![\w-])text-\[\d+(?:\.\d+)?(?:px|rem|em)\]/, mensaje: "tamaño suelto: usa la escala con nombre (text-etiqueta … text-metrica)" },
  { id: "tamano-tailwind", patron: /(?<![\w-])text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl)(?![\w-])/, mensaje: "tamaño de Tailwind: usa la escala con nombre" },
  { id: "mayusculas", patron: /(?<![\w-])uppercase(?![\w-])/, mensaje: "mayúsculas: solo con las recetas del kit (ROTULO, CABECERA_TABLA)", salvoRecetas: true },
  { id: "tracking-ancho", patron: /(?<![\w-])tracking-(?:wide|wider|widest|\[0\.\d+em\])(?![\w-])/, mensaje: "tracking ancho: solo con las recetas del kit", salvoRecetas: true },
];

/** `cn(RECETA_DE_CONTROL, "…")`: grupo 1 = receta, grupo 2 = argumentos restantes. */
export const RECETAS = /\bcn\(\s*(CAMPO\w*|BOTON_\w+|ACCION_\w+|CONTROL_FILTRO)\s*,([^()]*(?:\([^()]*\)[^()]*)*)\)/g;

/**
 * Clase que fija altura o `size` (todo control mide `h-control`; `h-auto` sí se permite). Grupo 1 = la clase completa.
 * No cuenta `[&_svg]:size-4` (la clase apunta al icono, no al control), `h-(--alto)` ni `h-[…]`: cualquier cosa distinta de auto/control.
 */
export const ALTURA = /(?<![\w-]|\]:)((?:[a-z-]+:)*(?:h|size)-(?!auto\b|control\b)[^\s"'`,)}]+)/;
