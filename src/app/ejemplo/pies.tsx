"use client";

import { useState } from "react";
import { CabeceraSeccion } from "@/components/patrones/cabecera-seccion";
import { PieTabla } from "@/components/patrones/pie-tabla";
import { CalendarIcon } from "@phosphor-icons/react";
import { TARJETA } from "@/lib/estilos";

const TOTAL = 240;

/** Un pie con estado local: el que usa la app (`pagina`, `porPagina`) sobre un total fijo. */
function PieDemo({ inicial, conSelector, opciones, extremos }: { inicial: number; conSelector: boolean; opciones?: readonly number[]; extremos?: boolean }) {
  const [porPagina, setPorPagina] = useState(inicial);
  const [pagina, setPagina] = useState(3);
  const ultimaPagina = Math.max(1, Math.ceil(TOTAL / porPagina));
  const actual = Math.min(pagina, ultimaPagina);
  return (
    <PieTabla
      desde={(actual - 1) * porPagina + 1}
      hasta={Math.min(actual * porPagina, TOTAL)}
      total={TOTAL}
      unidad="filas"
      porPagina={porPagina}
      onPorPagina={conSelector ? (n) => { setPorPagina(n); setPagina(1); } : undefined}
      opciones={opciones}
      extremos={extremos}
      pagina={actual}
      ultimaPagina={ultimaPagina}
      onPagina={setPagina}
    />
  );
}

/** Variantes del pie de tabla: tamaños propios con el valor actual siempre marcado, sin selector y con extremos. */
export function PiesEjemplo() {
  return (
    <section className={TARJETA}>
      <CabeceraSeccion icon={CalendarIcon} titulo="Pie de tabla" subtitulo="opciones · sin selector · extremos" />
      <div className="grid gap-1 pb-2">
        <p className="px-4 pt-3 text-etiqueta text-texto-terciario">opciones [5, 10, 25, 50] con el valor 25 · extremos</p>
        <PieDemo inicial={25} conSelector opciones={[5, 10, 25, 50]} extremos />
        <p className="px-4 pt-3 text-etiqueta text-texto-terciario">valor 20 que no está en [5, 10, 50]: se inserta ordenado</p>
        <PieDemo inicial={20} conSelector opciones={[5, 10, 50]} />
        <p className="px-4 pt-3 text-etiqueta text-texto-terciario">sin onPorPagina: no hay selector de filas</p>
        <PieDemo inicial={10} conSelector={false} />
      </div>
    </section>
  );
}
