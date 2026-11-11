import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const leer = (ruta) => readFileSync(join(RAIZ, ruta), "utf8").replaceAll("\r\n", "\n");

// iOS Safari amplía la página al enfocar un campo de texto de menos de 16 px y la deja ampliada: en pantallas táctiles la letra de un campo es `text-campo` (16 px).
test("el tamaño de un campo en pantallas táctiles son 16 px", () => {
  assert.match(leer("src/styles/theme.css"), /--text-campo:\s*1rem;/);
});

test("los campos de texto usan text-campo hasta md y text-control desde md", () => {
  const estilos = leer("src/lib/estilos.ts");
  for (const receta of ["CAMPO", "SELECT_NATIVO"]) {
    const linea = estilos.split("\n").find((_, i, todas) => todas[i - 1]?.startsWith(`export const ${receta} =`)) ?? "";
    assert.match(linea, /text-campo md:text-control/, `${receta} debe llevar text-campo md:text-control`);
  }
  assert.match(leer("src/components/ui/input.tsx"), /text-campo md:text-control/);
  // Los campos que no pasan por CAMPO tienen su propia letra: la del buscador, la del stepper y la de la paleta de comandos.
  for (const ruta of ["src/components/formularios/buscador.tsx", "src/components/formularios/stepper-numerico.tsx", "src/components/navegacion/paleta.tsx"]) {
    assert.match(leer(ruta), /text-campo md:text-control/, `${ruta} debe llevar text-campo md:text-control`);
  }
  // El monto hereda la de CAMPO: un `text-control` propio la pisaba en el teléfono.
  assert.doesNotMatch(leer("src/components/formularios/entrada-monto.tsx"), /cn\(CAMPO, "[^"]*text-control/);
});

// El kit fijaba en castellano los nombres de sus landmarks: ahora son propiedades con ese mismo valor por defecto.
test("los nombres accesibles del menú, la miga y el cajón son propiedades", () => {
  assert.match(leer("src/components/nav/sidebar-nav.tsx"), /aria-label=\{etiqueta\}/);
  assert.match(leer("src/components/nav/sidebar.tsx"), /etiquetaMenu/);
  assert.match(leer("src/components/nav/top-bar.tsx"), /etiquetaUbicacion = "Ubicación"/);
  assert.match(leer("src/components/nav/top-bar.tsx"), /aria-label=\{etiquetaUbicacion\}/);
  assert.match(leer("src/components/nav/mobile-nav.tsx"), /etiqueta = "Abrir menú"/);
});

test("un ítem del menú puede comparar su ruta de forma exacta", () => {
  const nav = leer("src/components/nav/sidebar-nav.tsx");
  assert.match(nav, /exacto\?: boolean/);
  assert.match(nav, /item\.exacto \? pathname === item\.href : pathname\.startsWith\(item\.href\)/);
});

test("el cajón del teléfono se desplaza", () => {
  assert.match(leer("src/components/nav/mobile-nav.tsx"), /overflow-y-auto/);
});

test("el panel lateral tiene nombre accesible: su título es el del diálogo", () => {
  const panel = leer("src/components/navegacion/panel-lateral.tsx");
  assert.match(panel, /<SheetTitle/);
  assert.doesNotMatch(panel, /<h2 className="text-titulo text-foreground">/);
});

test("FilaMetricas admite cinco columnas", () => {
  const metricas = leer("src/components/patrones/metricas.tsx");
  assert.match(metricas, /columnas\?: 2 \| 3 \| 4 \| 5/);
  assert.match(metricas, /lg:grid-cols-5/);
});

// «(opcional)» y la X de los diálogos y las hojas estaban fijos en castellano: ahora son propiedades con ese mismo valor por defecto.
test("el texto de opcional del campo y el nombre de la X del diálogo y de la hoja son propiedades", () => {
  const campo = leer("src/components/formularios/campo.tsx");
  assert.match(campo, /textoOpcional = "\(opcional\)"/);
  assert.match(campo, /\{textoOpcional\}<\/span>/);
  assert.doesNotMatch(campo, />\(opcional\)</);
  const dialogo = leer("src/components/ui/dialog.tsx");
  assert.match(dialogo, /etiquetaCerrar = "Cerrar"/);
  assert.match(dialogo, /<span className="sr-only">\{etiquetaCerrar\}<\/span>/);
  const hoja = leer("src/components/ui/sheet.tsx");
  assert.match(hoja, /etiquetaCerrar = "Cerrar"/);
  assert.match(hoja, /<span className="sr-only">\{etiquetaCerrar\}<\/span>/);
  const confirmacion = leer("src/components/navegacion/dialogo-confirmacion.tsx");
  assert.match(confirmacion, /etiquetaCerrar = "Cerrar"/);
  assert.match(confirmacion, /<DialogContent[^>]*etiquetaCerrar=\{etiquetaCerrar\}/);
});

// Los textos de la tabla estaban fijos en castellano: ahora son `textos` con ese valor por defecto, y cada nivel los pasa al de abajo.
test("los textos del pie, la selección y el selector de filas se traducen y llegan desde TablaListado", () => {
  const pie = leer("src/components/patrones/pie-tabla.tsx");
  for (const [clave, valor] of [["mostrando", "Mostrando"], ["de", "de"], ["anterior", "Anterior"], ["siguiente", "Siguiente"], ["filas", "Filas"], ["filasPorPagina", "Filas por página"]]) {
    assert.match(pie, new RegExp(`${clave}: "${valor}"`));
    assert.match(pie, new RegExp(`\\{textos\\.${clave}\\}`), `PieTabla debe usar textos.${clave}`);
  }
  assert.match(pie, /<SelectorPorPagina[^>]*etiqueta=\{textos\.filasPorPagina\} textoFilas=\{textos\.filas\}/);
  assert.doesNotMatch(pie, /> Anterior|Siguiente <|^\s*Mostrando\{/m);

  const selector = leer("src/components/ui/selector-por-pagina.tsx");
  assert.match(selector, /etiqueta = "Filas por página"/);
  assert.match(selector, /aria-label=\{etiqueta\}/);
  assert.match(selector, /<span>\{textoFilas\}<\/span>/);

  const tabla = leer("src/components/datos/tabla-datos.tsx");
  assert.match(tabla, /seleccionados: \(n\) => \(n === 1 \? "seleccionado" : "seleccionados"\)/);
  assert.match(tabla, /seleccionarFila: \(id\) => `Seleccionar fila \$\{id\}`/);
  for (const uso of [/aria-label=\{textos\.accionesSeleccion\}/, /aria-label=\{textos\.quitarSeleccion\}/, /title=\{textos\.quitarSeleccion\}/, /etiqueta=\{textos\.seleccionarTodo\}/, /etiqueta=\{textos\.seleccionarFila\(id\)\}/, /\{textos\.seleccionados\(seleccionados\.length\)\}/]) {
    assert.match(tabla, uso);
  }
  assert.match(tabla, /<PieTabla[\s\S]*?textos=\{textosParciales\}[\s\S]*?\/>/);

  const listado = leer("src/components/datos/tabla-listado.tsx");
  assert.match(listado, /textos\?: Partial<TextosTablaListado & TextosTablaDatos>/);
  assert.match(listado, /<TablaDatos[\s\S]*?textos=\{textosParciales\}[\s\S]*?\/>/);
});

test("los botones del stepper se nombran por propiedad y la paginación acepta su aria-label", () => {
  const stepper = leer("src/components/formularios/stepper-numerico.tsx");
  assert.match(stepper, /etiquetaDisminuir = "Disminuir"/);
  assert.match(stepper, /etiquetaAumentar = "Aumentar"/);
  assert.match(stepper, /aria-label=\{etiquetaDisminuir\}/);
  assert.match(stepper, /aria-label=\{etiquetaAumentar\}/);
  // El aria-label fijo va antes de {...props}: el que pasa quien llama lo pisa.
  const paginacion = leer("src/components/ui/pagination.tsx");
  for (const componente of ["Pagination", "PaginationPrevious", "PaginationNext"]) {
    const cuerpo = paginacion.slice(paginacion.indexOf(`function ${componente}(`));
    const etiqueta = cuerpo.indexOf("aria-label=");
    assert.ok(etiqueta > 0 && etiqueta < cuerpo.indexOf("{...props}"), `${componente}: aria-label debe ir antes de {...props}`);
  }
});

// Con el dedo, los botones de icono sueltos aceptan el toque en 44×44 px (WCAG 2.5.5) sin cambiar lo que se ve (§4).
test("el objetivo táctil mide 44 px y lo llevan los botones de icono sueltos", () => {
  assert.match(leer("src/styles/theme.css"), /--spacing-objetivo-tactil:\s*2\.75rem;/);
  const estilos = leer("src/lib/estilos.ts");
  const receta = estilos.match(/export const OBJETIVO_TACTIL =\s*"([^"]*)"/)?.[1] ?? "";
  for (const clase of ["relative", "pointer-coarse:after:absolute", "pointer-coarse:after:min-h-objetivo-tactil", "pointer-coarse:after:min-w-objetivo-tactil", "pointer-coarse:after:size-full"]) {
    assert.ok(receta.split(" ").includes(clase), `OBJETIVO_TACTIL debe llevar ${clase}`);
  }
  // Fuera de pointer-coarse no hay halo: con mouse el área es la del botón.
  assert.ok(receta.split(" ").every((c) => c === "relative" || c.startsWith("pointer-coarse:")));
  for (const ruta of [
    "src/components/ui/dialog.tsx",
    "src/components/ui/sheet.tsx",
    "src/components/ui/popover.tsx",
    "src/components/feedback/toast.tsx",
    "src/components/feedback/banner.tsx",
    "src/components/navegacion/panel-lateral.tsx",
    "src/components/navegacion/menu-acciones.tsx",
    "src/components/nav/mobile-nav.tsx",
    "src/components/formularios/calendario.tsx",
  ]) {
    assert.match(leer(ruta), /cn\(\s*OBJETIVO_TACTIL,|className=\{OBJETIVO_TACTIL\}/, `${ruta} debe usar OBJETIVO_TACTIL`);
  }
});

// Review de #46 (H1): en el Banner con `accion` y `onCerrar`, el halo de la X (18 px → 44 px, 13 px por lado) tapaba la última columna de la
// acción con un `gap-3` de 12 px, y ese toque cerraba el aviso. La separación entre ambos debe ser al menos lo que sobresale el halo.
test("el halo táctil de la X del Banner no tapa la acción de al lado", () => {
  const banner = leer("src/components/feedback/banner.tsx");
  const px = (paso) => Number(paso) * 4;
  const gap = px(banner.match(/role=\{tono === "error"[^>]*className=\{cn\("flex items-center gap-([\d.]+)/)?.[1]);
  const boton = banner.match(/aria-label="Cerrar aviso" className=\{cn\(OBJETIVO_TACTIL, "([^"]*)"/)?.[1] ?? "";
  const margen = px(boton.match(/(?:^| )ml-([\d.]+)/)?.[1] ?? 0);
  const relleno = px(boton.match(/(?:^| )p-([\d.]+)/)?.[1]);
  const icono = px(banner.match(/<XIcon weight="bold" className="size-([\d.]+)"/)?.[1]);
  const objetivo = Number(leer("src/styles/theme.css").match(/--spacing-objetivo-tactil:\s*([\d.]+)rem/)?.[1]) * 16;
  const sobresale = (objetivo - (icono + 2 * relleno)) / 2;
  assert.ok(gap + margen >= sobresale, `separación ${gap + margen} px < halo ${sobresale} px`);
});
