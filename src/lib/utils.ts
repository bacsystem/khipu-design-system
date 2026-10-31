import { createCn } from "cn/config";

/**
 * Une clases y resuelve conflictos de Tailwind. Se configura con la escala tipográfica con nombre de globals.css
 * (`text-etiqueta`, `text-control`, `text-cuerpo`, `text-metrica`): sin esto `cn` las toma por colores de texto y borra
 * el tamaño o el color al combinarlas (`cn("text-etiqueta text-muted-foreground")` perdía `text-etiqueta`).
 * Todo componente importa `cn` desde aquí, nunca desde el paquete "cn" directo.
 */
export const cn = createCn({
  extend: { classGroups: { "font-size": [{ text: ["etiqueta", "control", "cuerpo", "metrica"] }] } },
});
