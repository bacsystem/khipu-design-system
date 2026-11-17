### Added
- **`Tabs` contador con tono y texto, y `etiqueta`.** `TabItem.contador` pasa de `number` a `number | string` (el número se pinta tal cual, el texto verbatim) y `TabItem.tonoContador` (`TonoContadorTab`, ahora en `lib/estilos`) usa el vocabulario de estado de `PillEstado`/`Chip`: `ok` | `aviso` | `error` (rojo) | `info` (azul informativo) | `acento` | `neutro`, con la misma receta que `TabsRuta` (`CONTADOR_PESTANA` + `colorContadorPestana`, que reemplaza el mapa privado de `TabsRuta`). `Tabs etiqueta` es el `aria-label` del `tablist`. Nuevos `DESPLAZABLE_X` (`lib/estilos`), `centrarEnContenedor`, `centrarActiva` y `SELECTOR_PESTANA_ACTIVA` (`lib/navegacion`).

### Changed
- **`TabsRuta tonoContador`**: `info` pasa a ser el azul informativo (`bg-info`) como en `PillEstado`/`Chip`; el color anterior de `info` (`bg-accent`, el acento de la paleta) se llama ahora `acento`, y se añade `error`. `TabsRuta` aún no tenía versión publicada.
- **`Tabs estilo="segmentado"` ya no se parte en 2–3 filas** en un teléfono: `SEGMENTADO` es `flex-nowrap` y la caja (34 px) se desplaza en horizontal sin barra a la vista (`DESPLAZABLE_X`, la misma receta que la fila `linea` y `TabsRuta`, que ahora también contiene el desplazamiento en el eje horizontal con `overscroll-x-contain` y deja un margen de foco `scroll-px-1`).
- `Tabs` lleva `min-w-0` en el Root (si no, dentro de un grid o flex se ensancha hasta el ancho de todas las pestañas y no desborda).
- Los segmentos (`SEGMENTO_BASE`, también en `TabsRuta segmentado`) dibujan el anillo de foco hacia dentro (`focus-visible:ring-inset`) para que la caja desplazable no lo recorte.
- `Tabs` centra la pestaña activa dentro de su lista al montar y cada vez que cambia (con `valor` o sin él), como ya hacía `TabsRuta`.
