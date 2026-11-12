"use client";

import { BellIcon, DownloadSimpleIcon, EyeIcon, FileTextIcon, ListNumbersIcon, PackageIcon, PaletteIcon, PaperPlaneTiltIcon, PencilSimpleIcon, ProhibitIcon, RocketLaunchIcon, ShieldCheckIcon, SparkleIcon, TextBIcon, TextItalicIcon, TextUnderlineIcon, TrashIcon, TrayIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { TablaDatos, type Columna } from "@/components/datos/tabla-datos";
import { TablaListado, type ColumnaListado } from "@/components/datos/tabla-listado";
import { GraficoBarras, GraficoLineas } from "@/components/datos/grafico";
import { Kpi } from "@/components/datos/kpi";
import { ListaDatos } from "@/components/datos/lista-datos";
import { Timeline } from "@/components/datos/timeline";
import { Alerta } from "@/components/feedback/alerta";
import { Banner } from "@/components/feedback/banner";
import { EstadoVacio } from "@/components/feedback/estado-vacio";
import { ProgresoCircular, ProgresoLineal } from "@/components/feedback/progreso";
import { Skeleton, SkeletonMetricas } from "@/components/feedback/skeleton";
import { Spinner } from "@/components/feedback/spinner";
import { useToast } from "@/components/feedback/toast";
import { Tooltip } from "@/components/feedback/tooltip";
import { AreaTexto, Campo, Entrada } from "@/components/formularios/campo";
import { Autocomplete } from "@/components/formularios/autocomplete";
import { Buscador } from "@/components/formularios/buscador";
import { Casilla, Interruptor } from "@/components/formularios/casilla";
import { Combobox } from "@/components/formularios/combobox";
import { Contrasena } from "@/components/formularios/contrasena";
import { Deslizador } from "@/components/formularios/deslizador";
import { EntradaFecha } from "@/components/formularios/entrada-fecha";
import { EntradaMonto } from "@/components/formularios/entrada-monto";
import { EntradaRangoFechas, type RangoFechas } from "@/components/formularios/entrada-rango-fechas";
import { GrupoOpciones } from "@/components/formularios/opciones";
import { SelectCampo } from "@/components/formularios/select-campo";
import { StepperNumerico } from "@/components/formularios/stepper-numerico";
import { ZonaArchivos } from "@/components/formularios/zona-archivos";
import { SelectorApariencia } from "@/components/nav/selector-apariencia";
import { SelectorDiseno } from "@/components/nav/selector-diseno";
import { Acordeon } from "@/components/navegacion/acordeon";
import { DialogoConfirmacion } from "@/components/navegacion/dialogo-confirmacion";
import { MenuAcciones } from "@/components/navegacion/menu-acciones";
import { Paleta } from "@/components/navegacion/paleta";
import { PanelLateral } from "@/components/navegacion/panel-lateral";
import { Pasos, TarjetaPaso } from "@/components/navegacion/pasos";
import { Tabs } from "@/components/navegacion/tabs";
import { DemoAvisos } from "./demo-avisos";
import { BotonAsync } from "@/components/patrones/boton-async";
import { CabeceraPagina, EnlaceVolver } from "@/components/patrones/cabecera-pagina";
import { CabeceraSeccion } from "@/components/patrones/cabecera-seccion";
import { PanelQuitable } from "@/components/patrones/panel-quitable";
import { PillEstado } from "@/components/patrones/pill-estado";
import { NumeroAnimado } from "@/components/patrones/numero-animado";
import { TarjetaDestacada } from "@/components/patrones/tarjeta-destacada";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { GrupoBotones } from "@/components/ui/grupo-botones";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import { ACCION_MASIVA, ACCION_MASIVA_PELIGRO, ACCION_PRINCIPAL, ACCION_SECUNDARIA, BOTON_PRIMARIO, BOTON_SECUNDARIO, ENTRADA, pasoEntrada, TARJETA } from "@/lib/estilos";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

type Doc = { id: string; numero: string; cliente: string; total: number; estado: "ok" | "aviso" | "error" };
const DOCS: Doc[] = [
  { id: "1", numero: "F001-00000136", cliente: "Inversiones Andinas S.A.C.", total: 2000.01, estado: "ok" },
  { id: "2", numero: "F001-00000135", cliente: "María Quispe Huamán", total: 850, estado: "aviso" },
  { id: "3", numero: "F001-00000134", cliente: "Comercial Wari E.I.R.L.", total: 120, estado: "error" },
];
/** Un mes de emisión para el gráfico por día: días en 0, un pico el 18 y hoy (el 31) al final. */
const DIAS_DEL_MES = [0, 2, 3, 0, 1, 4, 2, 0, 3, 5, 2, 1, 0, 3, 4, 2, 6, 9, 3, 0, 2, 4, 1, 0, 3, 5, 2, 0, 1, 4, 3].map((emitidos, i) => ({ dia: i + 1, emitidos }));

const COLUMNAS: Columna<Doc>[] = [
  { id: "numero", titulo: "Documento", ordenable: true, className: "font-mono font-semibold" },
  { id: "cliente", titulo: "Cliente", ordenable: true },
  { id: "total", titulo: "Total", ordenable: true, alinear: "derecha", className: "font-mono", render: (d) => formatearMonto("PEN", d.total) },
  { id: "estado", titulo: "Estado", render: (d) => <PillEstado tono={d.estado}>{{ ok: "Aceptado", aviso: "Con obs.", error: "Rechazado" }[d.estado]}</PillEstado> },
  {
    id: "acciones",
    titulo: "",
    alinear: "derecha",
    render: () => (
      <MenuAcciones
        acciones={[
          { label: "Ver detalle", icon: EyeIcon, onClick: () => {} },
          { label: "Descargar XML", icon: DownloadSimpleIcon, onClick: () => {} },
          { label: "Editar", icon: PencilSimpleIcon, disabled: true, ayuda: "Edición: próximamente" },
          { label: "Eliminar", icon: TrashIcon, destructiva: true, separador: true, onClick: () => {} },
        ]}
      />
    ),
  },
];

const ESTADO_DOC = { ok: "Aceptado", aviso: "Con obs.", error: "Rechazado" } as const;
/** Las mismas columnas para `TablaListado`: `texto` hace que se busque y exporte lo que se ve («Aceptado», «S/ 2,000.01»), no el dato crudo. */
const COLUMNAS_LISTADO: ColumnaListado<Doc>[] = COLUMNAS.map((c) =>
  c.id === "total" ? { ...c, texto: (d: Doc) => formatearMonto("PEN", d.total) } : c.id === "estado" ? { ...c, texto: (d: Doc) => ESTADO_DOC[d.estado] } : c,
);

const SECCION = cn(TARJETA, ENTRADA, "grid gap-4 px-5 py-4");
export function Galeria() {
  const toast = useToast();
  const [confirmar, setConfirmar] = useState(false);
  const [panel, setPanel] = useState(false);
  const [paleta, setPaleta] = useState(false);
  const [monto, setMonto] = useState<number | null>(2360);
  const [moneda, setMoneda] = useState("PEN");
  const [fecha, setFecha] = useState("2026-09-15");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [cliente, setCliente] = useState<string | null>("20554198211");
  const [tipo, setTipo] = useState<"01" | "03">("01");
  const [enviando, setEnviando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaCampo, setBusquedaCampo] = useState("");
  const [cantidad, setCantidad] = useState<number | null>(3);
  const [peso, setPeso] = useState<number | null>(2.5);
  const [rango, setRango] = useState<RangoFechas>({ desde: "2026-09-01", hasta: "2026-09-15" });
  const [docsSeleccionados, setDocsSeleccionados] = useState<string[]>([]);
  const [clave, setClave] = useState("");
  const [vista, setVista] = useState<"lista" | "tarjetas">("lista");
  const [bannerVisible, setBannerVisible] = useState(true);
  const [descuento, setDescuento] = useState(15);
  const [rangoMonto, setRangoMonto] = useState<[number, number]>([200, 1500]);
  const [producto, setProducto] = useState("");
  const [operacion, setOperacion] = useState("0101");
  const [incoterm, setIncoterm] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [negrita, setNegrita] = useState(false);
  const [cursiva, setCursiva] = useState(false);
  const [subrayado, setSubrayado] = useState(false);

  function simularEnvio() {
    setEnviando(true);
    setTimeout(() => setEnviando(false), 1800);
  }

  return (
    <>
      {/* ── Diseño, botones y tarjetas destacadas ─────────────────── */}
      <section className={SECCION} style={pasoEntrada(5)}>
        <CabeceraSeccion icon={PaletteIcon} titulo="Diseño, botones y tarjetas destacadas" subtitulo="selector de diseño · paleta y tono oscuro · button · tarjeta destacada" conBorde={false} className="px-0 py-0" />
        <div className="grid max-w-xs gap-1.5">
          <span className="text-etiqueta font-medium text-muted-foreground">Diseño</span>
          <SelectorDiseno />
          <SelectorApariencia />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="suave">Suave</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button variant="suave" disabled title="Exportar: próximamente">
            Deshabilitado
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <TarjetaDestacada tono="neutro" icono={<FileTextIcon />} titulo="Tu primer documento" descripcion="Emítelo en modo de pruebas; no tiene validez tributaria." accion={<Button variant="suave">Emitir</Button>} />
          <TarjetaDestacada tono="info" icono={<SparkleIcon />} titulo="Novedad: reenvío masivo" descripcion="Reenvía a SUNAT todos los comprobantes observados con un clic." accion={<Button variant="suave">Ver más</Button>} />
          <TarjetaDestacada tono="ok" icono={<ShieldCheckIcon />} titulo="Certificado vigente" descripcion="Vence en 11 meses; te avisamos con 30 días de anticipación." />
          <TarjetaDestacada tono="aviso" icono={<BellIcon />} titulo="Plan por vencer" descripcion="Renueva antes del 30 de octubre para no interrumpir las emisiones." accion={<button type="button" className={BOTON_SECUNDARIO}>Renovar</button>} />
          <TarjetaDestacada
            tono="invertido"
            className="md:col-span-2"
            icono={<RocketLaunchIcon />}
            titulo="Pasa a producción"
            descripcion="Cuando tus series estén listas, activa el entorno de producción desde Empresa."
            accion={<button type="button" className={BOTON_SECUNDARIO}>Activar producción</button>}
          />
        </div>
      </section>

      {/* ── Feedback ─────────────────────────────────────────────── */}
      <section className={SECCION} style={pasoEntrada(6)}>
        <CabeceraSeccion icon={BellIcon} titulo="Feedback" subtitulo="toast · tooltip · alerta · skeleton · estado vacío · progreso · spinner · banner" conBorde={false} className="px-0 py-0" />
        {bannerVisible ? (
          <div className="-mx-5 -mt-4 overflow-hidden rounded-t-xl">
            <Banner tono="aviso" onCerrar={() => setBannerVisible(false)}>
              El certificado digital vence en 21 días — renuévalo antes de que se venza el plan actual.
            </Banner>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={ACCION_SECUNDARIA} onClick={() => toast.ok("Serie guardada", "F002 ya acepta emisiones.")}>
            Toast ok
          </button>
          <button type="button" className={ACCION_SECUNDARIA} onClick={() => toast.error("No se pudo enviar", "SUNAT no respondió a tiempo.", { etiqueta: "Reintentar", onClick: () => {} })}>
            Toast error con acción
          </button>
          <button
            type="button"
            className={ACCION_SECUNDARIA}
            onClick={() => toast.promise(new Promise((r) => setTimeout(r, 1500)), { cargando: "Enviando a SUNAT…", ok: "Aceptado con CDR", error: "Rechazado" })}
          >
            Toast promise
          </button>
          <Tooltip texto="Exportar reporte: próximamente">
            <button type="button" className={ACCION_SECUNDARIA}>
              Con tooltip
            </button>
          </Tooltip>
          <BotonAsync pendiente={enviando} icon={<PaperPlaneTiltIcon className="size-4" />} textoPendiente="Enviando…" className={ACCION_PRINCIPAL} onClick={simularEnvio}>
            Enviar a SUNAT
          </BotonAsync>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ProgresoLineal etiqueta="Subiendo certificado.p12…" valor={64} />
          <ProgresoLineal etiqueta="Enviando lote a SUNAT…" tono="warning" />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Spinner tamano="xs" />
            <Spinner tamano="sm" />
            <Spinner tamano="default" />
            <Spinner tamano="lg" className="text-primary" />
          </div>
          <div className="flex items-center gap-4">
            <ProgresoCircular valor={72} tamano="sm" />
            <ProgresoCircular valor={40} tono="destructive" />
            <ProgresoCircular tamano="lg" contenido={null} />
          </div>
        </div>
        <div className="grid gap-2">
          <Alerta tono="info" titulo="Entorno de pruebas">Los documentos emitidos aquí no tienen validez tributaria.</Alerta>
          <Alerta tono="aviso" accion={<button type="button" className={ACCION_SECUNDARIA}>Renovar</button>}>El certificado vence en 21 días.</Alerta>
          <Alerta tono="error" titulo="Envío rechazado">Código 2324: el RUC del receptor no existe.</Alerta>
          <Alerta tono="ok">Credenciales SOL verificadas correctamente.</Alerta>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <SkeletonMetricas columnas={2} />
          <div className="flex items-center gap-3">
            <Skeleton className="size-control rounded-full" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2.5 w-3/4" />
            </div>
          </div>
        </div>
        <EstadoVacio icon={TrayIcon} titulo="Sin documentos todavía" accion={<button type="button" className={BOTON_PRIMARIO}>Nuevo documento</button>}>
          Cuando emitas el primero aparecerá aquí con su estado en SUNAT.
        </EstadoVacio>
        <CabeceraPagina
          volver={<EnlaceVolver href="/ejemplo">Cuentas</EnlaceVolver>}
          titulo="Comercial Andina S.A.C."
          descripcion="Cabecera de una página sin título en la barra superior (backoffice, detalle): volver, título, descripción y acciones."
          acciones={<button type="button" className={ACCION_SECUNDARIA}>Suspender</button>}
        />
        <PanelQuitable titulo="Al crédito (cuotas)" etiquetaQuitar="Quitar crédito" onQuitar={() => undefined}>
          <p className="text-control text-muted-foreground">Lo que el usuario agregó con «+ Crédito»; la ✕ lo quita y limpia sus datos.</p>
        </PanelQuitable>
      </section>

      {/* ── Formularios ─────────────────────────────────────────── */}
      <section className={SECCION} style={pasoEntrada(7)}>
        <CabeceraSeccion icon={PencilSimpleIcon} titulo="Formularios" subtitulo="campo · combobox · autocomplete · fecha · monto · casilla · interruptor · opciones · archivos · buscador · stepper · rango de fechas · contraseña · deslizador" conBorde={false} className="px-0 py-0" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Buscador etiqueta="Buscar documentos" valor={busqueda} onCambio={setBusqueda} placeholder="Buscar por serie o cliente…" />
          <Campo id="g-buscador-campo" etiqueta="Buscar cliente (variante campo)">
            <Buscador id="g-buscador-campo" variante="campo" valor={busquedaCampo} onCambio={setBusquedaCampo} placeholder="RUC o razón social…" />
          </Campo>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Campo id="g-serie" etiqueta="Serie" ayuda="4 caracteres alfanuméricos">
            <Entrada id="g-serie" mono placeholder="F001" maxLength={4} />
          </Campo>
          <Campo id="g-ruc" etiqueta="RUC" error="Debe tener 11 dígitos.">
            <Entrada id="g-ruc" mono defaultValue="2061479809" invalido />
          </Campo>
          <Campo id="g-cliente" etiqueta="Cliente" ayuda="Escribe para buscar por razón social o RUC">
            <Combobox
              id="g-cliente"
              valor={cliente}
              onCambio={setCliente}
              items={[
                { value: "20554198211", label: "Corporación Gráfica Andina S.A.C.", detalle: "RUC 20554198211" },
                { value: "20123456789", label: "Inversiones Andinas S.A.C.", detalle: "RUC 20123456789" },
                { value: "44781209", label: "Miguel Ángel Valencia Ramos", detalle: "DNI 44781209" },
              ]}
            />
          </Campo>
          <Campo id="g-producto" etiqueta="Producto" ayuda="Sugiere del catálogo, pero acepta texto libre">
            <Autocomplete
              id="g-producto"
              valor={producto}
              onCambio={setProducto}
              placeholder="Escribe o elige uno…"
              items={["Servicio de consultoría", "Licencia de software anual", "Papel bond A4 (millar)", "Tóner para impresora", "Servicio de mantenimiento"]}
            />
          </Campo>
          <Campo id="g-operacion" etiqueta="Tipo de operación" ayuda="SelectCampo: el combo de formulario, con grupos">
            <SelectCampo
              id="g-operacion"
              valor={operacion}
              onCambio={setOperacion}
              opciones={[
                { value: "0101", label: "0101 · Venta interna", grupo: "Venta interna" },
                { value: "0112", label: "0112 · Venta interna, sustenta gastos deducibles", grupo: "Venta interna" },
                { value: "0200", label: "0200 · Exportación de bienes", grupo: "Exportación" },
                { value: "0401", label: "0401 · Ventas no domiciliados", grupo: "Exportación" },
              ]}
            />
          </Campo>
          <Campo id="g-incoterm" etiqueta="Incoterm" opcional ayuda="Sin elegir muestra el placeholder">
            <SelectCampo id="g-incoterm" valor={incoterm} onCambio={setIncoterm} placeholder="Sin incoterm" mono opciones={["EXW", "FOB", "CIF", "DAP"].map((i) => ({ value: i, label: i }))} />
          </Campo>
          <Campo id="g-fecha" etiqueta="Fecha de emisión">
            <EntradaFecha id="g-fecha" valor={fecha} onCambio={setFecha} />
          </Campo>
          <Campo id="g-monto" etiqueta="Importe total" ayuda="Se formatea al salir del campo">
            <EntradaMonto id="g-monto" valor={monto} onCambio={setMonto} moneda={moneda} onMoneda={setMoneda} />
          </Campo>
          <Campo id="g-obs" etiqueta="Observaciones" opcional>
            <AreaTexto id="g-obs" placeholder="Notas internas…" />
          </Campo>
          <Campo id="g-cantidad" etiqueta="Cantidad" ayuda="Ítems de la línea">
            <StepperNumerico id="g-cantidad" valor={cantidad} onCambio={setCantidad} min={1} max={99} />
          </Campo>
          <Campo id="g-peso" etiqueta="Peso (kg)" ayuda='Con decimales: paso="any"'>
            <StepperNumerico id="g-peso" valor={peso} onCambio={setPeso} min={0} paso="any" />
          </Campo>
          <Campo id="g-clave" etiqueta="Contraseña" ayuda="Para el registro, no para el login">
            <Contrasena id="g-clave" valor={clave} onCambio={setClave} conFuerza autoComplete="new-password" />
          </Campo>
          <Campo id="g-rango" etiqueta="Rango de emisión">
            <EntradaRangoFechas valor={rango} onCambio={setRango} />
          </Campo>
          <Campo id="g-descuento" etiqueta="Descuento" ayuda="Aplica sobre el subtotal">
            <Deslizador etiqueta="Descuento" valor={descuento} onCambio={(v) => setDescuento(v as number)} min={0} max={50} formato={(v) => `${v}%`} />
          </Campo>
          <Campo id="g-montos" etiqueta="Rango de montos" ayuda="Filtra la tabla por total">
            <Deslizador etiqueta="Monto" valor={rangoMonto} onCambio={(v) => setRangoMonto(v as [number, number])} min={0} max={3000} paso={50} formato={(v) => formatearMonto("PEN", v)} />
          </Campo>
          <div className="grid gap-3">
            <Casilla id="g-auto" etiqueta="Enviar automáticamente a SUNAT" descripcion="Si no, queda firmado hasta que lo envíes" defaultChecked />
            <Interruptor id="g-notif" etiqueta="Notificar por correo" descripcion="Cuando llegue el CDR" defaultChecked />
          </div>
          <GrupoOpciones
            nombre="tipo"
            estilo="tarjetas"
            valor={tipo}
            onCambio={setTipo}
            opciones={[
              { valor: "01", etiqueta: "Factura", descripcion: "Para RUC · F###" },
              { valor: "03", etiqueta: "Boleta", descripcion: "Para DNI · B###" },
            ]}
          />
          <div className="md:col-span-2">
            <Campo id="g-cert" etiqueta="Certificado digital" ayuda=".p12 o .pfx · el RUC debe figurar en el OU">
              <ZonaArchivos id="g-cert" archivo={archivo} onCambio={setArchivo} accept=".p12,.pfx" ayuda="PKCS#12 · máx. 1 MB" />
            </Campo>
          </div>
        </div>
      </section>

      {/* ── Navegación y estructura ─────────────────────────────── */}
      <section className={SECCION} style={pasoEntrada(8)}>
        <CabeceraSeccion icon={FileTextIcon} titulo="Navegación y estructura" subtitulo="tabs · pasos · panel lateral · drawer · aviso responsivo · acordeón · menú ⋯ · confirmación · ⌘K · avatar · popover · toolbar · grupo de botones · hover card · scroll area" conBorde={false} className="px-0 py-0" />
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <HoverCard>
              <HoverCardTrigger>
                <span className="cursor-default">
                  <Avatar nombre="Ana Torres" tamano="sm" />
                </span>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="flex items-center gap-2.5">
                  <Avatar nombre="Ana Torres" tono="primary" />
                  <div className="min-w-0">
                    <p className="text-control font-medium text-foreground">Ana Torres</p>
                    <p className="font-mono text-etiqueta text-muted-foreground">ana@acme.pe</p>
                  </div>
                </div>
                <p className="mt-2 text-control text-muted-foreground">Administradora · 12 documentos emitidos este mes.</p>
              </HoverCardContent>
            </HoverCard>
            <Avatar nombre="Miguel Valencia" tamano="default" tono="primary" />
            <Avatar nombre="cliente@correo-muy-largo.pe" tamano="default" tono="accent" />
          </div>
          <AvatarGroup nombres={["Ana Torres", "Miguel Valencia", "Rosa Quispe", "Luis Pérez", "Wari Comercial"]} max={3} />
          <Separator orientacion="vertical" className="h-6" />
          <GrupoBotones
            etiqueta="Vista de la lista de documentos"
            valor={vista}
            onCambio={setVista}
            opciones={[
              { valor: "lista", etiqueta: "Lista", icon: <ListNumbersIcon className="size-3.5" /> },
              { valor: "tarjetas", etiqueta: "Tarjetas", icon: <PackageIcon className="size-3.5" /> },
            ]}
          />
          <span className="inline-flex items-center gap-1 text-etiqueta text-muted-foreground">
            Paleta <Kbd>⌘K</Kbd>
          </span>
          <Popover>
            <PopoverTrigger className={ACCION_SECUNDARIA}>Filtros avanzados</PopoverTrigger>
            <PopoverContent>
              <PopoverHeader titulo="Filtros avanzados" descripcion="Se aplican solo a esta vista" />
              <div className="grid gap-2 text-control text-muted-foreground">
                <p>Rango de fechas, moneda y estado SUNAT — cualquier contenido rico que no cabe en un tooltip.</p>
              </div>
            </PopoverContent>
          </Popover>
          <Toolbar aria-label="Formato de texto">
            <ToolbarGroup aria-label="Estilo de fuente">
              <ToolbarButton aria-label="Negrita" aria-pressed={negrita} onClick={() => setNegrita((v) => !v)}>
                <TextBIcon />
              </ToolbarButton>
              <ToolbarButton aria-label="Cursiva" aria-pressed={cursiva} onClick={() => setCursiva((v) => !v)}>
                <TextItalicIcon />
              </ToolbarButton>
              <ToolbarButton aria-label="Subrayado" aria-pressed={subrayado} onClick={() => setSubrayado((v) => !v)}>
                <TextUnderlineIcon />
              </ToolbarButton>
            </ToolbarGroup>
            <ToolbarSeparator />
            <ToolbarButton className="w-auto px-2" onClick={() => toast.info("Insertar enlace")}>
              Enlace
            </ToolbarButton>
          </Toolbar>
        </div>
        <ScrollArea alto="140px" className="rounded-lg border border-border/60 bg-muted/40">
          <div className="grid gap-0.5 p-2">
            {["F001-00000136 · Aceptado", "F001-00000135 · Con observaciones", "F001-00000134 · Rechazado", "F001-00000133 · Aceptado", "F001-00000132 · Aceptado", "F001-00000131 · Enviado", "F001-00000130 · Aceptado"].map((linea) => (
              <div key={linea} className="rounded-md px-2 py-1.5 font-mono text-control text-muted-foreground hover:bg-secondary">
                {linea}
              </div>
            ))}
          </div>
        </ScrollArea>
        <Pasos actual={1} pasos={[{ titulo: "Empresa", descripcion: "RUC y razón social" }, { titulo: "Certificado", descripcion: "Archivo .p12" }, { titulo: "Credenciales SOL" }]} />
        <Tabs
          items={[
            { id: "resumen", etiqueta: "Resumen" },
            { id: "items", etiqueta: "Ítems", contador: 3 },
            { id: "historial", etiqueta: "Historial", contador: 2 },
            { id: "pdf", etiqueta: "PDF", disabled: true },
          ]}
          defaultValor="historial"
        >
          {(id) =>
            id === "historial" ? (
              <Timeline
                eventos={[
                  { id: "a", titulo: "Aceptado por SUNAT", detalle: "CDR 0 · La Factura numero F001-136, ha sido aceptada", fecha: "15 Set 2026, 10:32", tono: "ok", actual: true },
                  { id: "b", titulo: "Reintento de envío", detalle: "Timeout del servicio (intento 2 de 3)", fecha: "15 Set 2026, 10:20", tono: "aviso" },
                  { id: "c", titulo: "Firmado", detalle: "XML-DSig con certificado vigente", fecha: "15 Set 2026, 10:18", tono: "neutro" },
                ]}
              />
            ) : id === "resumen" ? (
              <ListaDatos
                columnas={2}
                datos={[
                  { etiqueta: "Documento", valor: "F001-00000136", mono: true },
                  { etiqueta: "Cliente", valor: "Inversiones Andinas S.A.C." },
                  { etiqueta: "Total", valor: "S/ 2,000.01", mono: true },
                  { etiqueta: "Hash", valor: "y4M8+jW8Xp278K1aM02q19KjvO3k=", mono: true },
                ]}
              />
            ) : (
              <p className="text-control text-muted-foreground">Contenido de «{id}».</p>
            )
          }
        </Tabs>
        <Acordeon
          defaultAbiertos={["a"]}
          items={[
            { id: "a", titulo: "¿Qué pasa si SUNAT no responde?", detalle: "reintentos automáticos", contenido: "El documento queda en ENVIADO y se reintenta con backoff exponencial hasta 3 veces." },
            { id: "b", titulo: "¿Puedo anular un documento aceptado?", contenido: "Sí, con una comunicación de baja dentro de los 7 días." },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={ACCION_SECUNDARIA} onClick={() => setPanel(true)}>
            Abrir panel lateral
          </button>
          <button type="button" className={ACCION_SECUNDARIA} onClick={() => setDrawer(true)}>
            Abrir drawer (móvil)
          </button>
          <button type="button" className={ACCION_SECUNDARIA} onClick={() => setConfirmar(true)}>
            Diálogo de confirmación
          </button>
          <button type="button" className={ACCION_SECUNDARIA} onClick={() => setPaleta(true)}>
            Paleta ⌘K
          </button>
          <DemoAvisos />
          <TarjetaPaso numero={2} total={3} titulo="Certificado digital" className="basis-full" pie={<><button type="button" className={BOTON_SECUNDARIO}>Atrás</button><button type="button" className={BOTON_PRIMARIO}>Continuar</button></>}>
            <p className="text-control text-muted-foreground">Contenido del paso (formulario del certificado).</p>
          </TarjetaPaso>
        </div>
        <PanelLateral open={panel} onOpenChange={setPanel} icon={ShieldCheckIcon} titulo="F001-00000136" descripcion="Factura electrónica · Aceptada" pie={<button type="button" className={BOTON_PRIMARIO} onClick={() => setPanel(false)}>Cerrar</button>}>
          <ListaDatos datos={[{ etiqueta: "Cliente", valor: "Inversiones Andinas S.A.C." }, { etiqueta: "Total", valor: "S/ 2,000.01", mono: true }]} />
        </PanelLateral>
        <Drawer open={drawer} onOpenChange={setDrawer}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>F001-00000136</DrawerTitle>
              <DrawerDescription>Factura electrónica · Aceptada</DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <ListaDatos datos={[{ etiqueta: "Cliente", valor: "Inversiones Andinas S.A.C." }, { etiqueta: "Total", valor: "S/ 2,000.01", mono: true }]} />
            </div>
            <DrawerFooter>
              <DrawerClose render={<button type="button" className={BOTON_PRIMARIO} />}>Cerrar</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <DialogoConfirmacion open={confirmar} onOpenChange={setConfirmar} titulo="Anular 3 documentos" descripcion="Se enviará una comunicación de baja a SUNAT" textoConfirmar="Sí, anular" onConfirmar={async () => { toast.ok("Comunicación de baja enviada"); }}>
          Los documentos anulados no se pueden recuperar.
        </DialogoConfirmacion>
        <Paleta
          open={paleta}
          onOpenChange={setPaleta}
          comandos={[
            { id: "docs", label: "Documentos", detalle: "/ejemplo", grupo: "Ir a", icon: FileTextIcon, href: "/ejemplo" },
            { id: "keys", label: "API keys", detalle: "/ejemplo/api-keys", grupo: "Ir a", href: "/ejemplo/api-keys" },
            { id: "nuevo", label: "Nuevo documento", grupo: "Acciones", icon: PencilSimpleIcon, onSelect: () => toast.info("Nuevo documento") },
          ]}
        />
      </section>

      {/* ── Datos y dashboard ───────────────────────────────────── */}
      <section className={SECCION} style={pasoEntrada(9)}>
        <CabeceraSeccion icon={ShieldCheckIcon} titulo="Datos y dashboard" subtitulo="kpi · gráficos · tabla de datos · selección múltiple" conBorde={false} className="px-0 py-0" />
        <div className="grid gap-3 md:grid-cols-3">
          <Kpi etiqueta="Facturado (mes)" valor={<NumeroAnimado valor={128430} prefijo="S/ " />} variacion={12.4} serie={[42, 48, 45, 60, 58, 71, 80]} />
          <Kpi etiqueta="Documentos emitidos" valor={<NumeroAnimado valor={1236} />} variacion={-3.1} serie={[120, 110, 130, 125, 118, 121, 116]} />
          <Kpi etiqueta="Rechazados" valor={<NumeroAnimado valor={4} />} variacion={-40} invertir serie={[9, 7, 8, 6, 5, 6, 4]} />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <GraficoBarras titulo="Documentos por mes" categorias={["Abr", "May", "Jun", "Jul", "Ago", "Set"]} series={[{ nombre: "Facturas", valores: [120, 140, 135, 160, 172, 190] }, { nombre: "Boletas", valores: [80, 95, 90, 110, 120, 118] }]} />
          <GraficoLineas titulo="Facturado (S/ miles)" categorias={["Abr", "May", "Jun", "Jul", "Ago", "Set"]} series={[{ nombre: "PEN", valores: [82, 95, 91, 110, 121, 128] }]} formato={(v) => `${v}k`} />
        </div>
        {/* Los días de un mes dentro de otra tarjeta: `plano`, rótulo cada cinco días, sin marca los días en 0 y hoy (el último) destacado. */}
        <div className={cn(TARJETA, "grid gap-2 p-4")}>
          <h3 id="galeria-dias-titulo" className="text-titulo text-foreground">
            Emitidos por día
          </h3>
          <GraficoBarras
            plano
            etiquetadoPor="galeria-dias-titulo"
            descripcion="75 comprobantes en 31 días; el pico, el día 18 con 9."
            categorias={DIAS_DEL_MES.map((d) => String(d.dia))}
            series={[{ nombre: "Emitidos", valores: DIAS_DEL_MES.map((d) => d.emitidos) }]}
            destacado={DIAS_DEL_MES.length - 1}
            rotuloVisible={(i) => i === 0 || i === DIAS_DEL_MES.length - 1 || DIAS_DEL_MES[i].dia % 5 === 0}
            tituloDeCategoria={(i) => `${DIAS_DEL_MES[i].dia} oct: ${DIAS_DEL_MES[i].emitidos} comprobantes`}
            alto={160}
          />
        </div>
        <TablaDatos
          columnas={COLUMNAS}
          filas={DOCS}
          clave={(d) => d.id}
          unidad="documentos"
          ordenInicial={{ id: "numero", dir: "desc" }}
          seleccion={{
            seleccionados: docsSeleccionados,
            onCambio: setDocsSeleccionados,
            acciones: (
              <>
                <button type="button" className={ACCION_MASIVA} onClick={() => toast.ok("Reenviados", `${docsSeleccionados.length} documento(s) en cola.`)}>
                  <PaperPlaneTiltIcon className="size-4" />
                  Reenviar
                </button>
                <button type="button" className={ACCION_MASIVA} onClick={() => toast.ok("Descarga lista", `${docsSeleccionados.length} XML comprimidos.`)}>
                  <DownloadSimpleIcon className="size-4" />
                  Descargar XML
                </button>
                <button type="button" className={ACCION_MASIVA_PELIGRO} onClick={() => toast.error("No se pudo anular", "Requiere confirmación adicional.")}>
                  <ProhibitIcon className="size-4" />
                  Anular
                </button>
              </>
            ),
          }}
        />
        {/* El mismo listado completo en cliente con buscador, columnas visibles, CSV e impresión (en el orden de la tabla). */}
        <TablaListado
          titulo="Documentos"
          columnas={COLUMNAS_LISTADO}
          filas={DOCS}
          clave={(d) => d.id}
          unidad="documentos"
          placeholderBusqueda="Buscar por número o cliente…"
        />
      </section>
    </>
  );
}
