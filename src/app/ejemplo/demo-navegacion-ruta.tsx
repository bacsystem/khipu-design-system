"use client";

import { BellRingingIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { CentroNotificaciones, type Notificacion } from "@/components/nav/centro-notificaciones";
import { TabsRuta } from "@/components/navegacion/tabs-ruta";

/** Instante de hace `minutos` minutos, en ISO: las fechas de la demo siempre son recientes. */
const hace = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();

// Las pestañas son rutas reales de la demo: «Documentos» (exacta: no sigue activa en /ejemplo/series) y «Series».
const ITEMS_TABS = [
  { href: "/ejemplo", etiqueta: "Documentos", contador: 136, exacto: true },
  { href: "/ejemplo/series", etiqueta: "Series", contador: "4 activas", tonoContador: "ok" as const },
];

/** `TabsRuta` en sus dos estilos, sobre las dos rutas de la demo. */
export function DemoTabsRuta() {
  return (
    <div className="grid gap-3">
      <TabsRuta etiqueta="Secciones de facturación (subrayadas)" items={ITEMS_TABS} />
      <TabsRuta etiqueta="Secciones de facturación (segmentadas)" items={ITEMS_TABS} estilo="segmentado" />
    </div>
  );
}

/** `CentroNotificaciones` con el estado de lectura en la app, como se usa de verdad: el kit solo pinta y avisa. */
export function DemoNotificaciones({ vacio = false }: { vacio?: boolean }) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>(() =>
    vacio
      ? []
      : [
          { id: "1", titulo: "Factura F001-136 aceptada", descripcion: "CDR recibido de SUNAT.", fecha: hace(5), tono: "ok", href: "/ejemplo", categoria: "sunat", acciones: [{ etiqueta: "Descargar CDR", onClick: () => {} }, { etiqueta: "Ver comprobante", href: "/ejemplo" }], leida: false },
          { id: "2", titulo: "Boleta B001-2210 con observaciones", descripcion: "Se reintentará a las 16:00.", fecha: hace(42), tono: "aviso", href: "/ejemplo/series", categoria: "sunat", leida: false },
          { id: "3", titulo: "Nota de crédito FC01-104 rechazada", descripcion: "Error 2335: el comprobante de referencia no existe.", fecha: hace(130), tono: "error", categoria: "stock", leida: false },
          { id: "4", titulo: "Certificado digital: 245 días restantes", fecha: hace(60 * 26), leida: true },
          { id: "5", titulo: "Nueva llave de API creada", descripcion: "Por Ana Torres.", fecha: hace(60 * 50), icono: BellRingingIcon, leida: true },
        ],
  );
  const leer = (id: string) => setNotificaciones((l) => l.map((n) => (n.id === id ? { ...n, leida: true } : n)));
  return (
    <CentroNotificaciones
      notificaciones={notificaciones}
      categorias={vacio ? undefined : [{ id: "sunat", etiqueta: "SUNAT" }, { id: "stock", etiqueta: "Stock" }]}
      onLeer={leer}
      onLeerTodas={() => setNotificaciones((l) => l.map((n) => ({ ...n, leida: true })))}
      verTodas={{ href: "/ejemplo/series", etiqueta: "Ver historial completo" }}
    />
  );
}
