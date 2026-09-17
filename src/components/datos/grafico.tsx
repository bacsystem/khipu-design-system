"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type Serie = { nombre: string; valores: number[] };
const COLORES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function escala(max: number, pasos = 4): number[] {
  if (max <= 0) return [0, 1];
  const bruto = max / pasos;
  const mag = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((p) => p >= bruto) ?? bruto;
  const tope = Math.ceil(max / paso) * paso;
  return Array.from({ length: Math.round(tope / paso) + 1 }, (_, i) => i * paso);
}

function Leyenda({ series }: { series: Serie[] }) {
  if (series.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 pt-2 text-[11px] text-muted-foreground">
      {series.map((s, i) => (
        <span key={s.nombre} className="inline-flex items-center gap-1.5">
          <span className="size-2 rounded-sm" style={{ background: COLORES[i % COLORES.length] }} />
          {s.nombre}
        </span>
      ))}
    </div>
  );
}

/** Tooltip anclado en horizontal al índice (porcentaje del ancho) y en vertical dentro de la tarjeta, bajo el título. */
function Tooltip({ x, titulo, filas }: { x: number; titulo: string; filas: Array<{ nombre: string; valor: string; color: string }> }) {
  return (
    <div
      className="pointer-events-none absolute top-10 z-10 min-w-28 -translate-x-1/2 rounded-md border border-border bg-popover px-2.5 py-1.5 text-[11px] text-popover-foreground shadow-md"
      style={{ left: `clamp(4rem, ${x}%, calc(100% - 4rem))` }}
    >
      <div className="mb-0.5 font-medium">{titulo}</div>
      {filas.map((f) => (
        <div key={f.nombre} className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-sm" style={{ background: f.color }} />
            {f.nombre}
          </span>
          <span className="font-mono tabular-nums">{f.valor}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Barras verticales (una o varias series agrupadas): marcas finas con extremo redondeado sobre la línea base, hueco de 2px,
 * rejilla recesiva, etiquetas de eje con la escala real y tooltip por marca. Leyenda solo con ≥ 2 series. Máximo 5 series.
 */
export function GraficoBarras({
  categorias,
  series,
  formato = (v) => v.toLocaleString("en-US"),
  alto = 200,
  titulo,
  className,
}: {
  categorias: string[];
  series: Serie[];
  formato?: (v: number) => string;
  alto?: number;
  titulo?: string;
  className?: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const ancho = 640;
  const m = { top: 8, right: 8, bottom: 24, left: 44 };
  const w = ancho - m.left - m.right;
  const h = alto - m.top - m.bottom;
  const ticks = escala(Math.max(...series.flatMap((s) => s.valores), 0));
  const max = ticks[ticks.length - 1];
  const grupo = w / categorias.length;
  const barra = Math.max(4, (grupo * 0.7 - 2 * (series.length - 1)) / series.length);
  const y = (v: number) => m.top + h - (v / max) * h;

  return (
    <div className={cn("relative rounded-xl border border-border bg-card px-3 py-3 shadow-2xs", className)}>
      {titulo ? <div className="px-1 pb-2 text-[13px] font-semibold text-foreground">{titulo}</div> : null}
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-labelledby={`${id}-t`} className="h-auto w-full overflow-visible text-[10px]">
        <title id={`${id}-t`}>{titulo ?? "Gráfico de barras"}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.left} x2={ancho - m.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={t === 0 ? undefined : "2 3"} />
            <text x={m.left - 6} y={y(t) + 3} textAnchor="end" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {formato(t)}
            </text>
          </g>
        ))}
        {categorias.map((c, i) => {
          const x0 = m.left + i * grupo + (grupo - (barra * series.length + 2 * (series.length - 1))) / 2;
          return (
            <g key={c} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={m.left + i * grupo} y={m.top} width={grupo} height={h} fill={hover === i ? "var(--muted)" : "transparent"} />
              {series.map((s, j) => {
                const v = s.valores[i] ?? 0;
                const bx = x0 + j * (barra + 2);
                const by = y(v);
                const bh = Math.max(0, m.top + h - by);
                return <path key={s.nombre} d={`M${bx},${m.top + h} v${-Math.max(0, bh - 4)} a4,4 0 0 1 4,-4 h${barra - 8} a4,4 0 0 1 4,4 v${Math.max(0, bh - 4)} z`} fill={COLORES[j % COLORES.length]} />;
              })}
              <text x={m.left + i * grupo + grupo / 2} y={alto - 8} textAnchor="middle" fill="var(--muted-foreground)">
                {c}
              </text>
            </g>
          );
        })}
      </svg>
      {hover != null ? (
        <Tooltip
          x={((m.left + hover * grupo + grupo / 2) / ancho) * 100}
          titulo={categorias[hover]}
          filas={series.map((s, j) => ({ nombre: s.nombre, valor: formato(s.valores[hover] ?? 0), color: COLORES[j % COLORES.length] }))}
        />
      ) : null}
      <Leyenda series={series} />
    </div>
  );
}

/** Líneas (una o varias series): trazo de 2px, marcador ≥ 8px al pasar el cursor, crosshair y tooltip con todas las series. */
export function GraficoLineas({
  categorias,
  series,
  formato = (v) => v.toLocaleString("en-US"),
  alto = 200,
  titulo,
  className,
}: {
  categorias: string[];
  series: Serie[];
  formato?: (v: number) => string;
  alto?: number;
  titulo?: string;
  className?: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const ancho = 640;
  const m = { top: 8, right: 12, bottom: 24, left: 44 };
  const w = ancho - m.left - m.right;
  const h = alto - m.top - m.bottom;
  const ticks = escala(Math.max(...series.flatMap((s) => s.valores), 0));
  const max = ticks[ticks.length - 1];
  const x = (i: number) => m.left + (categorias.length === 1 ? w / 2 : (i / (categorias.length - 1)) * w);
  const y = (v: number) => m.top + h - (v / max) * h;

  return (
    <div className={cn("relative rounded-xl border border-border bg-card px-3 py-3 shadow-2xs", className)}>
      {titulo ? <div className="px-1 pb-2 text-[13px] font-semibold text-foreground">{titulo}</div> : null}
      <svg viewBox={`0 0 ${ancho} ${alto}`} role="img" aria-labelledby={`${id}-t`} className="h-auto w-full overflow-visible text-[10px]" onMouseLeave={() => setHover(null)}>
        <title id={`${id}-t`}>{titulo ?? "Gráfico de líneas"}</title>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={m.left} x2={ancho - m.right} y1={y(t)} y2={y(t)} stroke="var(--border)" strokeDasharray={t === 0 ? undefined : "2 3"} />
            <text x={m.left - 6} y={y(t) + 3} textAnchor="end" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {formato(t)}
            </text>
          </g>
        ))}
        {hover != null ? <line x1={x(hover)} x2={x(hover)} y1={m.top} y2={m.top + h} stroke="var(--muted-foreground)" strokeOpacity="0.4" /> : null}
        {series.map((s, j) => (
          <path
            key={s.nombre}
            d={s.valores.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
            fill="none"
            stroke={COLORES[j % COLORES.length]}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        {hover != null
          ? series.map((s, j) => <circle key={s.nombre} cx={x(hover)} cy={y(s.valores[hover] ?? 0)} r="4" fill={COLORES[j % COLORES.length]} stroke="var(--card)" strokeWidth="2" />)
          : null}
        {categorias.map((c, i) => (
          <g key={c}>
            <rect x={x(i) - w / categorias.length / 2} y={m.top} width={w / categorias.length} height={h} fill="transparent" onMouseEnter={() => setHover(i)} />
            <text x={x(i)} y={alto - 8} textAnchor="middle" fill="var(--muted-foreground)">
              {c}
            </text>
          </g>
        ))}
      </svg>
      {hover != null ? (
        <Tooltip x={(x(hover) / ancho) * 100} titulo={categorias[hover]} filas={series.map((s, j) => ({ nombre: s.nombre, valor: formato(s.valores[hover] ?? 0), color: COLORES[j % COLORES.length] }))} />
      ) : null}
      <Leyenda series={series} />
    </div>
  );
}
