"use client";

import { KeyRoundIcon, RefreshCwIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { CabeceraSeccion } from "@/components/patrones/cabecera-seccion";
import { ConfirmacionEnLinea } from "@/components/patrones/confirmacion-en-linea";
import { CABECERA_TABLA, CONTENEDOR_TABLA, CONTROL_FILTRO, PieTabla } from "@/components/patrones/pie-tabla";
import { ChipCodigo, PillEstado } from "@/components/patrones/pill-estado";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearFechaHora } from "@/lib/formato";
import { POR_PAGINA_DEFECTO } from "@/lib/paginacion";
import { cn } from "@/lib/utils";

type Llave = { id: string; prefijo: string; activa: boolean; creada_en: string };

const DATOS: Llave[] = [
  { id: "193f4b35-1", prefijo: "fk_4R84-fP", activa: true, creada_en: "2026-09-15T20:00:00Z" },
  { id: "9475f31a-2", prefijo: "fk_Gv986MR", activa: true, creada_en: "2026-09-15T19:59:00Z" },
  { id: "k-revoca-3", prefijo: "fk_demo000", activa: false, creada_en: "2026-08-01T15:00:00Z" },
];

const ITEMS_ESTADO: Record<string, string> = { todas: "Estado: Todas", activa: "Activas", revocada: "Revocadas" };

/** Tabla estándar del kit: barra de filtros, contenedor, cabecera, filas, pie con paginación en cliente. */
export function TablaEjemplo() {
  const [llaves, setLlaves] = useState(DATOS);
  const [estado, setEstado] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState<number>(POR_PAGINA_DEFECTO);

  const filtradas = useMemo(() => llaves.filter((k) => (estado === "activa" ? k.activa : estado === "revocada" ? !k.activa : true)), [llaves, estado]);
  const ultimaPagina = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaActual = Math.min(pagina, ultimaPagina);
  const data = filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CabeceraSeccion icon={KeyRoundIcon} titulo="Llaves de acceso" subtitulo="solo se guarda el hash" conBorde={false} className="min-w-0 flex-nowrap px-0 py-0" />
        <div className="flex flex-wrap items-center gap-2.5">
          <Select items={ITEMS_ESTADO} value={estado} onValueChange={(v) => { setEstado(v ?? "todas"); setPagina(1); }}>
            <SelectTrigger className={cn(CONTROL_FILTRO, "w-auto min-w-36 pl-3")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ITEMS_ESTADO).map(([valor, etiqueta]) => (
                <SelectItem key={valor} value={valor}>
                  {etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button type="button" title="Refrescar" className={cn(CONTROL_FILTRO, "inline-flex size-8 items-center justify-center text-muted-foreground hover:text-foreground")}>
            <RefreshCwIcon className="size-4" />
          </button>
        </div>
      </div>

      <div className={CONTENEDOR_TABLA}>
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/80 bg-muted hover:bg-muted">
              <TableHead className={cn(CABECERA_TABLA, "pl-4")}>Llave</TableHead>
              <TableHead className={CABECERA_TABLA}>Creada</TableHead>
              <TableHead className={cn(CABECERA_TABLA, "px-4")}>Estado</TableHead>
              <TableHead className={cn(CABECERA_TABLA, "pr-4 pl-2 text-right")}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-[13px]">
            {data.map((k) => (
              <TableRow key={k.id} className={cn("group border-b border-border/60 hover:bg-muted/80", !k.activa && "opacity-80")}>
                <TableCell className="py-2 pr-3 pl-4">
                  <ChipCodigo inactivo={!k.activa}>{k.prefijo}</ChipCodigo>
                  <div className="mt-0.5 font-mono text-[11px] text-muted-foreground/80">id: {k.id.slice(0, 8)}</div>
                </TableCell>
                <TableCell className="px-3 py-2 font-mono text-[12px] whitespace-nowrap tabular-nums">{formatearFechaHora(k.creada_en)}</TableCell>
                <TableCell className="px-4 py-2 whitespace-nowrap">
                  {k.activa ? <PillEstado tono="ok">Activa</PillEstado> : <PillEstado tono="neutro">Revocada</PillEstado>}
                </TableCell>
                <TableCell className="py-2 pr-4 pl-2 text-right">
                  {k.activa ? (
                    <ConfirmacionEnLinea
                      etiqueta="Revocar"
                      pregunta="¿Revocar de forma permanente?"
                      confirmar="Sí, revocar"
                      onConfirmar={async () => {
                        setLlaves((prev) => prev.map((x) => (x.id === k.id ? { ...x, activa: false } : x)));
                      }}
                    />
                  ) : (
                    <span className="text-[11px] text-muted-foreground/60">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PieTabla
          desde={data.length === 0 ? 0 : (paginaActual - 1) * porPagina + 1}
          hasta={(paginaActual - 1) * porPagina + data.length}
          total={filtradas.length}
          unidad="llaves"
          porPagina={porPagina}
          onPorPagina={(n) => { setPorPagina(n); setPagina(1); }}
          pagina={paginaActual}
          ultimaPagina={ultimaPagina}
          onPagina={setPagina}
          nota="Revocar es irreversible"
        />
      </div>
    </div>
  );
}
