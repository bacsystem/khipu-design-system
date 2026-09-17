"use client";

import { BellIcon, DownloadIcon, EyeIcon, FileTextIcon, InboxIcon, ListOrderedIcon, PackageIcon, PencilIcon, SendIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { TablaDatos, type Columna } from "@/components/datos/tabla-datos";
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
import { Buscador } from "@/components/formularios/buscador";
import { Casilla, Interruptor } from "@/components/formularios/casilla";
import { Combobox } from "@/components/formularios/combobox";
import { Contrasena } from "@/components/formularios/contrasena";
import { Deslizador } from "@/components/formularios/deslizador";
import { EntradaFecha } from "@/components/formularios/entrada-fecha";
import { EntradaMonto } from "@/components/formularios/entrada-monto";
import { EntradaRangoFechas, type RangoFechas } from "@/components/formularios/entrada-rango-fechas";
import { GrupoOpciones } from "@/components/formularios/opciones";
import { StepperNumerico } from "@/components/formularios/stepper-numerico";
import { ZonaArchivos } from "@/components/formularios/zona-archivos";
import { Acordeon } from "@/components/navegacion/acordeon";
import { DialogoConfirmacion } from "@/components/navegacion/dialogo-confirmacion";
import { MenuAcciones } from "@/components/navegacion/menu-acciones";
import { Paleta } from "@/components/navegacion/paleta";
import { PanelLateral } from "@/components/navegacion/panel-lateral";
import { Pasos, TarjetaPaso } from "@/components/navegacion/pasos";
import { Tabs } from "@/components/navegacion/tabs";
import { BotonAsync } from "@/components/patrones/boton-async";
import { CabeceraSeccion } from "@/components/patrones/cabecera-seccion";
import { PillEstado } from "@/components/patrones/pill-estado";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { GrupoBotones } from "@/components/ui/grupo-botones";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Kbd } from "@/components/ui/kbd";
import { Popover, PopoverContent, PopoverHeader, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BOTON_PRIMARIO, BOTON_SECUNDARIO, TARJETA } from "@/lib/estilos";
import { formatearMonto } from "@/lib/formato";
import { cn } from "@/lib/utils";

type Doc = { id: string; numero: string; cliente: string; total: number; estado: "ok" | "aviso" | "error" };
const DOCS: Doc[] = [
  { id: "1", numero: "F001-00000136", cliente: "Inversiones Andinas S.A.C.", total: 2000.01, estado: "ok" },
  { id: "2", numero: "F001-00000135", cliente: "María Quispe Huamán", total: 850, estado: "aviso" },
  { id: "3", numero: "F001-00000134", cliente: "Comercial Wari E.I.R.L.", total: 120, estado: "error" },
];
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
          { label: "Descargar XML", icon: DownloadIcon, onClick: () => {} },
          { label: "Editar", icon: PencilIcon, disabled: true, title: "Edición: próximamente" },
          { label: "Eliminar", icon: Trash2Icon, destructiva: true, separador: true, onClick: () => {} },
        ]}
      />
    ),
  },
];

const SECCION = cn(TARJETA, "grid gap-4 px-5 py-4");

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
  const [rango, setRango] = useState<RangoFechas>({ desde: "2026-09-01", hasta: "2026-09-15" });
  const [docsSeleccionados, setDocsSeleccionados] = useState<string[]>([]);
  const [clave, setClave] = useState("");
  const [vista, setVista] = useState<"lista" | "tarjetas">("lista");
  const [bannerVisible, setBannerVisible] = useState(true);
  const [descuento, setDescuento] = useState(15);
  const [rangoMonto, setRangoMonto] = useState<[number, number]>([200, 1500]);

  function simularEnvio() {
    setEnviando(true);
    setTimeout(() => setEnviando(false), 1800);
  }

  return (
    <>
      {/* ── Feedback ─────────────────────────────────────────────── */}
      <section className={SECCION}>
        <CabeceraSeccion icon={BellIcon} titulo="Feedback" subtitulo="toast · tooltip · alerta · skeleton · estado vacío · progreso · spinner · banner" conBorde={false} className="px-0 py-0" />
        {bannerVisible ? (
          <div className="-mx-5 -mt-4 overflow-hidden rounded-t-xl">
            <Banner tono="aviso" onCerrar={() => setBannerVisible(false)}>
              El certificado digital vence en 21 días — renuévalo antes de que se venza el plan actual.
            </Banner>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")} onClick={() => toast.ok("Serie guardada", "F002 ya acepta emisiones.")}>
            Toast ok
          </button>
          <button type="button" className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")} onClick={() => toast.error("No se pudo enviar", "SUNAT no respondió a tiempo.", { etiqueta: "Reintentar", onClick: () => {} })}>
            Toast error con acción
          </button>
          <button
            type="button"
            className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")}
            onClick={() => toast.promise(new Promise((r) => setTimeout(r, 1500)), { cargando: "Enviando a SUNAT…", ok: "Aceptado con CDR", error: "Rechazado" })}
          >
            Toast promise
          </button>
          <Tooltip texto="Exportar reporte: próximamente">
            <button type="button" className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")}>
              Con tooltip
            </button>
          </Tooltip>
          <BotonAsync pendiente={enviando} icon={<SendIcon className="size-4" />} textoPendiente="Enviando…" className={cn(BOTON_PRIMARIO, "h-8 text-[12px]")} onClick={simularEnvio}>
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
          <Alerta tono="aviso" accion={<button type="button" className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")}>Renovar</button>}>El certificado vence en 21 días.</Alerta>
          <Alerta tono="error" titulo="Envío rechazado">Código 2324: el RUC del receptor no existe.</Alerta>
          <Alerta tono="ok">Credenciales SOL verificadas correctamente.</Alerta>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <SkeletonMetricas columnas={2} />
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="grid flex-1 gap-1.5">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2.5 w-3/4" />
            </div>
          </div>
        </div>
        <EstadoVacio icon={InboxIcon} titulo="Sin documentos todavía" accion={<button type="button" className={BOTON_PRIMARIO}>Nuevo documento</button>}>
          Cuando emitas el primero aparecerá aquí con su estado en SUNAT.
        </EstadoVacio>
      </section>

      {/* ── Formularios ─────────────────────────────────────────── */}
      <section className={SECCION}>
        <CabeceraSeccion icon={PencilIcon} titulo="Formularios" subtitulo="campo · combobox · fecha · monto · casilla · interruptor · opciones · archivos · buscador · stepper · rango de fechas · contraseña · deslizador" conBorde={false} className="px-0 py-0" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Buscador etiqueta="Buscar documentos" valor={busqueda} onCambio={setBusqueda} placeholder="Buscar por serie o cliente…" />
          <Campo id="g-buscador-campo" etiqueta="Buscar cliente (variante campo, h-10)">
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
      <section className={SECCION}>
        <CabeceraSeccion icon={FileTextIcon} titulo="Navegación y estructura" subtitulo="tabs · pasos · panel lateral · acordeón · menú ⋯ · confirmación · ⌘K · avatar · popover · grupo de botones · hover card · scroll area" conBorde={false} className="px-0 py-0" />
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
                    <p className="text-[13px] font-medium text-foreground">Ana Torres</p>
                    <p className="font-mono text-[11px] text-muted-foreground">ana@acme.pe</p>
                  </div>
                </div>
                <p className="mt-2 text-[12px] text-muted-foreground">Administradora · 12 documentos emitidos este mes.</p>
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
              { valor: "lista", etiqueta: "Lista", icon: <ListOrderedIcon className="size-3.5" /> },
              { valor: "tarjetas", etiqueta: "Tarjetas", icon: <PackageIcon className="size-3.5" /> },
            ]}
          />
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            Paleta <Kbd>⌘K</Kbd>
          </span>
          <Popover>
            <PopoverTrigger className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")}>Filtros avanzados</PopoverTrigger>
            <PopoverContent>
              <PopoverHeader titulo="Filtros avanzados" descripcion="Se aplican solo a esta vista" />
              <div className="grid gap-2 text-[12px] text-muted-foreground">
                <p>Rango de fechas, moneda y estado SUNAT — cualquier contenido rico que no cabe en un tooltip.</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <ScrollArea alto="140px" className="rounded-lg border border-border/60 bg-muted/40">
          <div className="grid gap-0.5 p-2">
            {["F001-00000136 · Aceptado", "F001-00000135 · Con observaciones", "F001-00000134 · Rechazado", "F001-00000133 · Aceptado", "F001-00000132 · Aceptado", "F001-00000131 · Enviado", "F001-00000130 · Aceptado"].map((linea) => (
              <div key={linea} className="rounded-md px-2 py-1.5 font-mono text-[12px] text-muted-foreground hover:bg-secondary">
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
              <p className="text-[13px] text-muted-foreground">Contenido de «{id}».</p>
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
          <button type="button" className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")} onClick={() => setPanel(true)}>
            Abrir panel lateral
          </button>
          <button type="button" className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")} onClick={() => setConfirmar(true)}>
            Diálogo de confirmación
          </button>
          <button type="button" className={cn(BOTON_SECUNDARIO, "h-8 text-[12px]")} onClick={() => setPaleta(true)}>
            Paleta ⌘K
          </button>
          <TarjetaPaso numero={2} total={3} titulo="Certificado digital" className="basis-full" pie={<><button type="button" className={cn(BOTON_SECUNDARIO, "h-9 text-[13px]")}>Atrás</button><button type="button" className={cn(BOTON_PRIMARIO, "h-9 text-[13px]")}>Continuar</button></>}>
            <p className="text-[13px] text-muted-foreground">Contenido del paso (formulario del certificado).</p>
          </TarjetaPaso>
        </div>
        <PanelLateral open={panel} onOpenChange={setPanel} icon={ShieldCheckIcon} titulo="F001-00000136" descripcion="Factura electrónica · Aceptada" pie={<button type="button" className={cn(BOTON_PRIMARIO, "h-9 text-[13px]")} onClick={() => setPanel(false)}>Cerrar</button>}>
          <ListaDatos datos={[{ etiqueta: "Cliente", valor: "Inversiones Andinas S.A.C." }, { etiqueta: "Total", valor: "S/ 2,000.01", mono: true }]} />
        </PanelLateral>
        <DialogoConfirmacion open={confirmar} onOpenChange={setConfirmar} titulo="Anular 3 documentos" descripcion="Se enviará una comunicación de baja a SUNAT" textoConfirmar="Sí, anular" onConfirmar={async () => { toast.ok("Comunicación de baja enviada"); }}>
          Los documentos anulados no se pueden recuperar.
        </DialogoConfirmacion>
        <Paleta
          open={paleta}
          onOpenChange={setPaleta}
          comandos={[
            { id: "docs", label: "Documentos", detalle: "/ejemplo", grupo: "Ir a", icon: FileTextIcon, href: "/ejemplo" },
            { id: "keys", label: "API keys", detalle: "/ejemplo/api-keys", grupo: "Ir a", href: "/ejemplo/api-keys" },
            { id: "nuevo", label: "Nuevo documento", grupo: "Acciones", icon: PencilIcon, onSelect: () => toast.info("Nuevo documento") },
          ]}
        />
      </section>

      {/* ── Datos y dashboard ───────────────────────────────────── */}
      <section className={SECCION}>
        <CabeceraSeccion icon={ShieldCheckIcon} titulo="Datos y dashboard" subtitulo="kpi · gráficos · tabla de datos · selección múltiple" conBorde={false} className="px-0 py-0" />
        <div className="grid gap-3 md:grid-cols-3">
          <Kpi etiqueta="Facturado (mes)" valor="S/ 128,430" variacion={12.4} serie={[42, 48, 45, 60, 58, 71, 80]} />
          <Kpi etiqueta="Documentos emitidos" valor="1,236" variacion={-3.1} serie={[120, 110, 130, 125, 118, 121, 116]} />
          <Kpi etiqueta="Rechazados" valor="4" variacion={-40} invertir serie={[9, 7, 8, 6, 5, 6, 4]} />
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <GraficoBarras titulo="Documentos por mes" categorias={["Abr", "May", "Jun", "Jul", "Ago", "Set"]} series={[{ nombre: "Facturas", valores: [120, 140, 135, 160, 172, 190] }, { nombre: "Boletas", valores: [80, 95, 90, 110, 120, 118] }]} />
          <GraficoLineas titulo="Facturado (S/ miles)" categorias={["Abr", "May", "Jun", "Jul", "Ago", "Set"]} series={[{ nombre: "PEN", valores: [82, 95, 91, 110, 121, 128] }]} formato={(v) => `${v}k`} />
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
                <button type="button" className="text-[12px] font-medium text-accent-foreground hover:underline" onClick={() => toast.ok("Reenviados", `${docsSeleccionados.length} documento(s) en cola.`)}>
                  Reenviar
                </button>
                <button type="button" className="text-[12px] font-medium text-destructive hover:underline" onClick={() => toast.error("No se pudo anular", "Requiere confirmación adicional.")}>
                  Anular
                </button>
              </>
            ),
          }}
        />
      </section>
    </>
  );
}
