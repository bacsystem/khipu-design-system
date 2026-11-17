"use client";

import { m, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { MovimientoLocal } from "@/components/movimiento";
import { TrazoAnimado } from "@/components/datos/trazo-animado";
import { escalaEje } from "@/lib/escala-grafico";
import { TARJETA } from "@/lib/estilos";
import { RESORTE_SUAVE } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/** `discontinua`: la línea va a guiones (metas, proyecciones); solo `GraficoLineas`. */
export type Serie = { nombre: string; valores: number[]; discontinua?: boolean };
// Barras: relleno pastel de la paleta (como en el boceto) con un borde de 1 px que sí llega a 3:1 sobre la tarjeta
// (WCAG 1.4.11; el pastel solo queda en 1.3–1.6). Líneas: el color de borde de cada serie, que cumple el mismo 3:1
// (el verde y el ámbar semánticos de chart-2/chart-3 quedaban en 2–2.5 sobre blanco). Lo mide `npm run check:contraste`.
const COLORES_BARRAS = ["var(--chart-base)", "var(--chart-destacado)", "var(--acento-3)", "var(--chart-4)", "var(--chart-5)"];
const TRAZOS = ["var(--chart-trazo-base)", "var(--chart-trazo-destacado)", "var(--chart-trazo-3)", "var(--chart-trazo-4)", "var(--chart-trazo-5)"];
const COLORES = ["var(--chart-1)", ...TRAZOS.slice(1)];

/** Leyenda en píldoras, a la derecha del título. Solo con ≥ 2 series. */
function Leyenda({ series, colores = COLORES, trazos }: { series: Array<{ nombre: string; discontinua?: boolean }>; colores?: string[]; trazos?: string[] }) {
  if (series.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {series.map((s, i) => (
        <span key={s.nombre} className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-0.5 pr-2.5 pl-2 text-etiqueta font-medium text-foreground">
          {s.discontinua ? (
            <span className="w-3.5 border-t-2 border-dashed" style={{ borderColor: colores[i % colores.length] }} />
          ) : (
            <span
              className="size-2.5 rounded-full"
              style={{ background: colores[i % colores.length], boxShadow: trazos ? `inset 0 0 0 1px ${trazos[i % trazos.length]}` : undefined }}
            />
          )}
          {s.nombre}
        </span>
      ))}
    </div>
  );
}

/** Título del gráfico con la leyenda a la derecha. */
function Cabecera({ titulo, leyenda }: { titulo?: string; leyenda: ReactNode }) {
  if (!titulo && !leyenda) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
      {titulo ? <div className="text-titulo text-foreground">{titulo}</div> : <span />}
      {leyenda}
    </div>
  );
}

/**
 * Ancho real en px del contenedor del SVG. El viewBox usa ese ancho para que el texto de los ejes mida lo que dice
 * (10 px) a cualquier tamaño: con un viewBox fijo el gráfico se estiraba y las etiquetas crecían con él.
 * Arranca en 640 (servidor y primer render) y se ajusta al medir.
 */
function useAnchoReal(): [RefObject<HTMLDivElement | null>, number] {
  const caja = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(640);
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const medir = () => setAncho(Math.max(240, Math.round(el.clientWidth)));
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  return [caja, ancho];
}

/** Tooltip anclado en horizontal al índice (porcentaje del ancho) y en vertical dentro de la tarjeta, bajo el título. */
function Tooltip({ x, titulo, filas }: { x: number; titulo: string; filas: Array<{ nombre: string; valor: string; color?: string; total?: boolean }> }) {
  return (
    <div
      className="pointer-events-none absolute top-10 z-10 min-w-28 -translate-x-1/2 rounded-lg bg-foreground px-2.5 py-1.5 text-etiqueta text-background shadow-md"
      style={{ left: `clamp(4rem, ${x}%, calc(100% - 4rem))` }}
    >
      <div className="mb-0.5 font-medium">{titulo}</div>
      {filas.map((f) => (
        <div key={f.nombre} className={cn("flex items-center justify-between gap-3", f.total && "mt-0.5 border-t border-background/20 pt-0.5")}>
          <span className={cn("inline-flex items-center gap-1.5", f.total ? "font-medium text-background" : "text-background/70")}>
            {f.color ? <span className="size-2 rounded-sm" style={{ background: f.color }} /> : null}
            {f.nombre}
          </span>
          <span className="font-semibold tabular-nums">{f.valor}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Barras verticales (una o varias series agrupadas): marcas finas con extremo redondeado sobre la línea base, hueco de 2px,
 * rejilla recesiva, etiquetas de eje con la escala real y tooltip por marca. Leyenda solo con ≥ 2 series. Máximo 5 series.
 * Un valor 0 no dibuja marca (solo la franja que responde al cursor). `plano` lo deja sin tarjeta propia, para ir dentro de
 * una sección que ya la tiene; entonces el nombre accesible lo da el título de esa sección (`etiquetadoPor`).
 */
export function GraficoBarras({
  categorias,
  series,
  formato = (v) => v.toLocaleString("en-US"),
  alto = 200,
  titulo,
  destacado,
  plano = false,
  etiquetadoPor,
  etiqueta,
  descripcion,
  rotuloVisible,
  tituloDeCategoria,
  propiedadesDeCategoria,
  enteros = false,
  apiladas = false,
  textoTotal = "Total",
  className,
}: {
  categorias: string[];
  series: Serie[];
  formato?: (v: number) => string;
  alto?: number;
  titulo?: string;
  /** Índice de la categoría a resaltar con el acento de la paleta (solo con una serie). */
  destacado?: number;
  /** Sin tarjeta ni relleno propios: para un gráfico dentro de otra tarjeta. */
  plano?: boolean;
  /** `id` del elemento que nombra al gráfico (el título de la sección que lo contiene). */
  etiquetadoPor?: string;
  /** Nombre accesible cuando no hay `titulo` ni `etiquetadoPor` (traducido por quien lo usa). */
  etiqueta?: string;
  /** Resumen para lectores de pantalla («120 comprobantes en 30 días; el pico, el 12»): va en `<desc>`. */
  descripcion?: string;
  /** Qué categorías llevan rótulo en el eje; por defecto, todas. Con muchas (los días de un mes) no caben en un teléfono. */
  rotuloVisible?: (indice: number) => boolean;
  /** El texto de cada categoría en su `<title>` y en el tooltip («5 oct: 3 comprobantes · S/ 1,180.00»); por defecto, la categoría. */
  tituloDeCategoria?: (indice: number) => string;
  /** Atributos extra del grupo de cada categoría (`data-*`, para pruebas o analítica). */
  propiedadesDeCategoria?: (indice: number) => Record<`data-${string}`, string | number>;
  /** Conteos (prácticas, comprobantes): las marcas del eje Y son enteros, sin 0,25 ni 0,5. Por defecto, la escala admite decimales. */
  enteros?: boolean;
  /** Una barra por categoría con las series una sobre otra (la escala cubre la suma y el tooltip muestra el total). */
  apiladas?: boolean;
  /** Rótulo del total en el tooltip y el resumen accesible de cada barra apilada (traducido por quien lo usa). */
  textoTotal?: string;
  className?: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [caja, ancho] = useAnchoReal();
  const mg = { top: 8, right: 8, bottom: 24, left: 44 };
  const w = ancho - mg.left - mg.right;
  const h = alto - mg.top - mg.bottom;
  const totalDe = (i: number) => series.reduce((suma, s) => suma + Math.max(0, s.valores[i] ?? 0), 0);
  const tope = apiladas ? Math.max(...categorias.map((_, i) => totalDe(i)), 0) : Math.max(...series.flatMap((s) => s.valores), 0);
  const ticks = escalaEje(tope, 4, enteros);
  const max = ticks[ticks.length - 1];
  const grupo = w / categorias.length;
  const barra = apiladas ? Math.max(4, grupo * 0.62) : Math.max(4, (grupo * 0.62 - 4 * (series.length - 1)) / series.length);
  const y = (v: number) => mg.top + h - (v / max) * h;
  const nombreDe = (i: number) => tituloDeCategoria?.(i) ?? categorias[i];
  const nombrado = etiquetadoPor ?? `${id}-t`;

  return (
    <div className={cn(!plano && cn(TARJETA, "px-4 py-3.5"), "relative", className)}>
      <Cabecera titulo={titulo} leyenda={<Leyenda series={series} colores={COLORES_BARRAS} trazos={TRAZOS} />} />
      <div ref={caja} className="w-full"><MovimientoLocal><svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-labelledby={nombrado} aria-describedby={descripcion ? `${id}-d` : undefined} className="block max-w-full overflow-visible" style={{ fontSize: 10 }}>
        {etiquetadoPor ? null : <title id={`${id}-t`}>{titulo ?? etiqueta ?? "Gráfico de barras"}</title>}
        {descripcion ? <desc id={`${id}-d`}>{descripcion}</desc> : null}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={mg.left} x2={ancho - mg.right} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={mg.left - 6} y={y(t) + 3} textAnchor="end" fill="var(--texto-terciario)" className="tabular-nums">
              {formato(t)}
            </text>
          </g>
        ))}
        {categorias.map((c, i) => {
          const x0 = mg.left + i * grupo + (grupo - (barra * (apiladas ? 1 : series.length) + (apiladas ? 0 : 4 * (series.length - 1)))) / 2;
          // Apiladas: de abajo arriba, cada segmento sobre la suma de los anteriores; solo el de arriba lleva las esquinas redondeadas.
          let acumulado = 0;
          const ultimo = series.reduce((u, s, j) => ((s.valores[i] ?? 0) > 0 ? j : u), -1);
          return (
            <g key={c} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} {...propiedadesDeCategoria?.(i)}>
              {apiladas ? (
                <title>{`${nombreDe(i)}: ${series.map((s) => `${s.nombre} ${formato(s.valores[i] ?? 0)}`).join(", ")}; ${textoTotal} ${formato(totalDe(i))}`}</title>
              ) : tituloDeCategoria ? (
                <title>{nombreDe(i)}</title>
              ) : null}
              <rect x={mg.left + i * grupo} y={mg.top} width={grupo} height={h} fill={hover === i ? "var(--muted)" : "transparent"} />
              {series.map((s, j) => {
                const v = s.valores[i] ?? 0;
                // Sin valor no hay marca: el extremo redondeado dejaba una joroba sobre la línea base.
                if (v <= 0) return null;
                if (apiladas) {
                  const base = y(acumulado);
                  acumulado += v;
                  const sh = Math.max(0, base - y(acumulado));
                  const sr = j === ultimo ? Math.min(9, barra / 2, sh) : 0;
                  return (
                    <m.path
                      key={s.nombre}
                      d={`M${x0},${base} v${-Math.max(0, sh - sr)} a${sr},${sr} 0 0 1 ${sr},${-sr} h${barra - 2 * sr} a${sr},${sr} 0 0 1 ${sr},${sr} v${Math.max(0, sh - sr)} z`}
                      fill={COLORES_BARRAS[j % COLORES_BARRAS.length]}
                      stroke={TRAZOS[j % TRAZOS.length]}
                      strokeWidth={1}
                      style={{ originY: 1 }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ ...RESORTE_SUAVE, delay: i * 0.03 }}
                    />
                  );
                }
                const bx = x0 + j * (barra + 4);
                const by = y(v);
                const bh = Math.max(0, mg.top + h - by);
                // El radio no pasa del alto de la barra: una barra baja no asoma por encima de su valor.
                const r = Math.min(9, barra / 2, bh);
                // Crece desde la línea base; cada categoría entra 30 ms después de la anterior. scaleY es una transformación:
                // con «reducir movimiento» MotionConfig la deja en su estado final.
                return (
                  <m.path
                    key={s.nombre}
                    d={`M${bx},${mg.top + h} v${-Math.max(0, bh - r)} a${r},${r} 0 0 1 ${r},${-r} h${barra - 2 * r} a${r},${r} 0 0 1 ${r},${r} v${Math.max(0, bh - r)} z`}
                    fill={series.length === 1 ? (i === destacado ? "var(--chart-destacado)" : "var(--chart-base)") : COLORES_BARRAS[j % COLORES_BARRAS.length]}
                    stroke={series.length === 1 ? (i === destacado ? "var(--chart-trazo-destacado)" : "var(--chart-trazo-base)") : TRAZOS[j % TRAZOS.length]}
                    strokeWidth={1}
                    style={{ originY: 1 }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ ...RESORTE_SUAVE, delay: i * 0.03 }}
                  >
                    {tituloDeCategoria ? null : <title>{`${c}: ${formato(v)}`}</title>}
                  </m.path>
                );
              })}
              {rotuloVisible && !rotuloVisible(i) ? null : (
                <text x={mg.left + i * grupo + grupo / 2} y={alto - 8} textAnchor="middle" fill="var(--texto-terciario)">
                  {c}
                </text>
              )}
            </g>
          );
        })}
      </svg></MovimientoLocal></div>
      {hover != null ? (
        <Tooltip
          x={((mg.left + hover * grupo + grupo / 2) / ancho) * 100}
          titulo={nombreDe(hover)}
          filas={[
            ...series.map((s, j) => ({
              nombre: s.nombre,
              valor: formato(s.valores[hover] ?? 0),
              color: series.length === 1 ? (hover === destacado ? "var(--chart-destacado)" : "var(--chart-base)") : COLORES_BARRAS[j % COLORES_BARRAS.length],
            })),
            ...(apiladas ? [{ nombre: textoTotal, valor: formato(totalDe(hover)), total: true }] : []),
          ]}
        />
      ) : null}
    </div>
  );
}

/** Relleno tenue bajo una línea (`area`): aparece con un fundido; con «reducir movimiento» ya está completo. */
function AreaAnimada({ d, color, retraso }: { d: string; color: string; retraso: number }) {
  const reducir = useReducedMotion();
  return (
    <m.path
      data-area=""
      d={d}
      fill={color}
      stroke="none"
      initial={reducir ? false : { opacity: 0 }}
      animate={{ opacity: 0.14 }}
      transition={{ duration: 0.4, delay: retraso }}
    />
  );
}

/**
 * Líneas (una o varias series): trazo de 2px, marcador ≥ 8px al pasar el cursor, crosshair y tooltip con todas las series.
 * `area` rellena bajo cada línea con su color; una serie `discontinua` va a guiones (metas, proyecciones, el período anterior).
 * Accesible como las barras: `etiqueta`/`titulo` o `etiquetadoPor` la nombran, `descripcion` la resume y cada categoría
 * lleva en su `<title>` los valores de todas las series. `plano` la deja sin tarjeta, para ir dentro de otra sección.
 */
export function GraficoLineas({
  categorias,
  series,
  formato = (v) => v.toLocaleString("en-US"),
  alto = 200,
  titulo,
  enteros = false,
  area = false,
  plano = false,
  etiquetadoPor,
  etiqueta,
  descripcion,
  className,
}: {
  categorias: string[];
  series: Serie[];
  formato?: (v: number) => string;
  alto?: number;
  titulo?: string;
  /** Conteos (prácticas, comprobantes): las marcas del eje Y son enteros, sin 0,25 ni 0,5. Por defecto, la escala admite decimales. */
  enteros?: boolean;
  /** Rellena bajo cada línea con su color (tenue). Las series `discontinua` no se rellenan. */
  area?: boolean;
  /** Sin tarjeta ni relleno propios: para un gráfico dentro de otra tarjeta. */
  plano?: boolean;
  /** `id` del elemento que nombra al gráfico (el título de la sección que lo contiene). */
  etiquetadoPor?: string;
  /** Nombre accesible cuando no hay `titulo` ni `etiquetadoPor` (traducido por quien lo usa). */
  etiqueta?: string;
  /** Resumen para lectores de pantalla («sube de 82 a 128 en seis meses»): va en `<desc>`. */
  descripcion?: string;
  className?: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [caja, ancho] = useAnchoReal();
  const mg = { top: 8, right: 12, bottom: 24, left: 44 };
  const w = ancho - mg.left - mg.right;
  const h = alto - mg.top - mg.bottom;
  const ticks = escalaEje(Math.max(...series.flatMap((s) => s.valores), 0), 4, enteros);
  const max = ticks[ticks.length - 1];
  const x = (i: number) => mg.left + (categorias.length === 1 ? w / 2 : (i / (categorias.length - 1)) * w);
  const y = (v: number) => mg.top + h - (v / max) * h;
  const base = mg.top + h;
  const nombrado = etiquetadoPor ?? `${id}-t`;
  const trazo = (s: Serie) => s.valores.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  return (
    <div className={cn(!plano && cn(TARJETA, "px-4 py-3.5"), "relative", className)}>
      <Cabecera titulo={titulo} leyenda={<Leyenda series={series} />} />
      <div ref={caja} className="w-full"><MovimientoLocal><svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-labelledby={nombrado} aria-describedby={descripcion ? `${id}-d` : undefined} className="block max-w-full overflow-visible" style={{ fontSize: 10 }} onMouseLeave={() => setHover(null)}>
        {etiquetadoPor ? null : <title id={`${id}-t`}>{titulo ?? etiqueta ?? "Gráfico de líneas"}</title>}
        {descripcion ? <desc id={`${id}-d`}>{descripcion}</desc> : null}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={mg.left} x2={ancho - mg.right} y1={y(t)} y2={y(t)} stroke="var(--border)" />
            <text x={mg.left - 6} y={y(t) + 3} textAnchor="end" fill="var(--texto-terciario)" className="tabular-nums">
              {formato(t)}
            </text>
          </g>
        ))}
        {hover != null ? <line x1={x(hover)} x2={x(hover)} y1={mg.top} y2={mg.top + h} stroke="var(--muted-foreground)" strokeOpacity="0.4" /> : null}
        {area
          ? series.map((s, j) =>
              s.discontinua || s.valores.length < 2 ? null : (
                <AreaAnimada key={s.nombre} d={`${trazo(s)} L${x(s.valores.length - 1).toFixed(1)},${base} L${x(0).toFixed(1)},${base} Z`} color={COLORES[j % COLORES.length]} retraso={j * 0.08} />
              ),
            )
          : null}
        {series.map((s, j) =>
          s.discontinua ? (
            // Un trazo a guiones no se anima con `pathLength` (usa el mismo dasharray): aparece con un fundido.
            <path key={s.nombre} d={trazo(s)} fill="none" stroke={COLORES[j % COLORES.length]} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />
          ) : (
            <TrazoAnimado key={s.nombre} d={trazo(s)} stroke={COLORES[j % COLORES.length]} retraso={j * 0.08} />
          ),
        )}
        {hover != null
          ? series.map((s, j) => <circle key={s.nombre} cx={x(hover)} cy={y(s.valores[hover] ?? 0)} r="4" fill={COLORES[j % COLORES.length]} stroke="var(--card)" strokeWidth="2" />)
          : null}
        {categorias.map((c, i) => (
          <g key={c}>
            <title>{`${c}: ${series.map((s) => `${s.nombre} ${formato(s.valores[i] ?? 0)}`).join(", ")}`}</title>
            <rect x={x(i) - w / categorias.length / 2} y={mg.top} width={w / categorias.length} height={h} fill="transparent" onMouseEnter={() => setHover(i)} />
            <text x={x(i)} y={alto - 8} textAnchor="middle" fill="var(--texto-terciario)">
              {c}
            </text>
          </g>
        ))}
      </svg></MovimientoLocal></div>
      {hover != null ? (
        <Tooltip x={(x(hover) / ancho) * 100} titulo={categorias[hover]} filas={series.map((s, j) => ({ nombre: s.nombre, valor: formato(s.valores[hover] ?? 0), color: COLORES[j % COLORES.length] }))} />
      ) : null}
    </div>
  );
}

export type ParteDona = { nombre: string; valor: number; detalle?: ReactNode };

/** Punto de la circunferencia de radio `r` a `a` grados desde las 12 en punto, en sentido horario. */
function polar(c: number, r: number, a: number): [number, number] {
  const rad = ((a - 90) * Math.PI) / 180;
  return [c + r * Math.cos(rad), c + r * Math.sin(rad)];
}

/** Sector de anillo entre `ri` y `ro` desde el ángulo `a0` hasta `a1` (grados, menos de 360). */
function sector(c: number, ro: number, ri: number, a0: number, a1: number): string {
  const [x0, y0] = polar(c, ro, a0);
  const [x1, y1] = polar(c, ro, a1);
  const [x2, y2] = polar(c, ri, a1);
  const [x3, y3] = polar(c, ri, a0);
  const grande = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${ro},${ro} 0 ${grande} 1 ${x1.toFixed(2)},${y1.toFixed(2)} L${x2.toFixed(2)},${y2.toFixed(2)} A${ri},${ri} 0 ${grande} 0 ${x3.toFixed(2)},${y3.toFixed(2)} Z`;
}

/**
 * Dona de composición (hasta 5 partes; quien la usa agrupa el resto en «Otros»): cada parte es un sector con el pastel de la
 * paleta y su borde `--chart-trazo-*` (el mismo par que las barras), y la leyenda al lado lleva nombre, valor y porcentaje.
 * El valor y el porcentaje van también en el `<title>` de cada sector y en el `<desc>` (o en `descripcion`), así que el color
 * no carga solo la información. `centro` va en el hueco (p. ej. el total). Se nombra con `titulo`, `etiqueta` o `etiquetadoPor`.
 * Con «reducir movimiento» los sectores aparecen ya completos.
 */
export function GraficoDona({
  partes,
  centro,
  titulo,
  formato = (v) => v.toLocaleString("en-US"),
  etiquetadoPor,
  etiqueta,
  descripcion,
  tamano = 160,
  plano = false,
  className,
}: {
  partes: ParteDona[];
  centro?: ReactNode;
  titulo?: string;
  formato?: (v: number) => string;
  /** `id` del elemento que nombra al gráfico (el título de la sección que lo contiene). */
  etiquetadoPor?: string;
  /** Nombre accesible cuando no hay `titulo` ni `etiquetadoPor` (traducido por quien lo usa). */
  etiqueta?: string;
  /** Resumen para lectores de pantalla; por defecto, la lista «nombre: valor (porcentaje)». */
  descripcion?: string;
  tamano?: number;
  /** Sin tarjeta ni relleno propios: para un gráfico dentro de otra tarjeta. */
  plano?: boolean;
  className?: string;
}) {
  const id = useId();
  const reducir = useReducedMotion();
  const dato = partes.slice(0, 5).map((p) => ({ ...p, valor: Math.max(0, p.valor) }));
  const total = dato.reduce((suma, p) => suma + p.valor, 0);
  const pct = (v: number) => `${total > 0 ? ((v / total) * 100).toFixed(1) : "0.0"}%`;
  const texto = (p: { nombre: string; valor: number }) => `${p.nombre}: ${formato(p.valor)} (${pct(p.valor)})`;
  const c = tamano / 2;
  const ro = c - 1;
  const ri = Math.round(ro * 0.62);
  let acumulado = 0;
  const sectores = dato.map((p, i) => {
    const a0 = (acumulado / total) * 360;
    acumulado += p.valor;
    return { ...p, i, a0, a1: (acumulado / total) * 360 };
  });
  const nombrado = etiquetadoPor ?? `${id}-t`;
  return (
    <div className={cn(!plano && cn(TARJETA, "px-4 py-3.5"), "grid gap-3", className)}>
      {titulo ? <div className="px-1 text-titulo text-foreground">{titulo}</div> : null}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative shrink-0" style={{ width: tamano, height: tamano }}>
          <MovimientoLocal>
            <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" aria-labelledby={nombrado} aria-describedby={`${id}-d`}>
              {etiquetadoPor ? null : <title id={`${id}-t`}>{titulo ?? etiqueta ?? "Gráfico de dona"}</title>}
              <desc id={`${id}-d`}>{descripcion ?? dato.map(texto).join("; ")}</desc>
              {/* Pista de fondo: la dona vacía (total 0) sigue viéndose como un anillo. */}
              <circle cx={c} cy={c} r={(ro + ri) / 2} fill="none" stroke="var(--secondary)" strokeWidth={ro - ri} />
              {total > 0
                ? sectores.map((p) => {
                    if (p.valor <= 0) return null;
                    const llena = p.a1 - p.a0 >= 359.99;
                    const relleno = COLORES_BARRAS[p.i % COLORES_BARRAS.length];
                    const borde = TRAZOS[p.i % TRAZOS.length];
                    return (
                      <m.g key={p.nombre} data-parte={p.nombre} initial={reducir ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: p.i * 0.06 }}>
                        <title>{texto(p)}</title>
                        {llena ? (
                          <>
                            <circle cx={c} cy={c} r={(ro + ri) / 2} fill="none" stroke={relleno} strokeWidth={ro - ri} />
                            <circle cx={c} cy={c} r={ro} fill="none" stroke={borde} strokeWidth={1} />
                            <circle cx={c} cy={c} r={ri} fill="none" stroke={borde} strokeWidth={1} />
                          </>
                        ) : (
                          <path d={sector(c, ro, ri, p.a0, p.a1)} fill={relleno} stroke={borde} strokeWidth={1} strokeLinejoin="round" />
                        )}
                      </m.g>
                    );
                  })
                : null}
            </svg>
          </MovimientoLocal>
          {centro ? <div className="pointer-events-none absolute inset-0 grid place-items-center text-titulo font-semibold text-foreground tabular-nums">{centro}</div> : null}
        </div>
        <ul className="grid min-w-40 flex-1 gap-2">
          {dato.map((p, i) => (
            <li key={p.nombre} className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-x-2 text-control">
              <span className="size-2.5 rounded-full" style={{ background: COLORES_BARRAS[i % COLORES_BARRAS.length], boxShadow: `inset 0 0 0 1px ${TRAZOS[i % TRAZOS.length]}` }} />
              <span className="min-w-0 text-foreground">{p.nombre}</span>
              <span className="font-semibold text-foreground tabular-nums">{formato(p.valor)}</span>
              <span className="w-12 text-right text-texto-terciario tabular-nums">{pct(p.valor)}</span>
              {p.detalle ? <span className="col-start-2 col-end-5 truncate text-etiqueta text-texto-terciario">{p.detalle}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export type SerieAnillo = { nombre: string; valor: number; detalle?: ReactNode };
const COLORES_ANILLOS = ["var(--acento-2)", "var(--acento)", "var(--acento-3)", "var(--chart-4)", "var(--chart-5)"];

/**
 * Anillos concéntricos (hasta 5): cada serie es un porcentaje 0–100 en un anillo, de afuera hacia adentro, con los
 * pasteles de la paleta y su leyenda al lado. `centro` va en el medio (p. ej. el total). Los valores van también en texto
 * (leyenda y `<title>`), así que el pastel no carga solo la información.
 */
export function GraficoAnillos({
  series,
  centro,
  titulo,
  tamano = 132,
  className,
}: {
  series: SerieAnillo[];
  centro?: ReactNode;
  titulo?: string;
  tamano?: number;
  className?: string;
}) {
  const id = useId();
  const grosor = Math.max(8, Math.round(tamano / 11));
  const hueco = 3;
  const anillos = series.slice(0, 5);
  return (
    <div className={cn(TARJETA, "grid gap-3 px-4 py-3.5", className)}>
      {titulo ? <div className="px-1 text-titulo text-foreground">{titulo}</div> : null}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0" style={{ width: tamano, height: tamano }}>
          <MovimientoLocal>
            <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" aria-labelledby={`${id}-t`} className="-rotate-90">
              <title id={`${id}-t`}>{anillos.map((a) => `${a.nombre}: ${a.valor}%`).join(", ")}</title>
              {anillos.map((a, i) => {
                const radio = tamano / 2 - grosor / 2 - i * (grosor + hueco);
                const v = Math.max(0, Math.min(100, a.valor)) / 100;
                return (
                  <g key={a.nombre}>
                    <circle cx={tamano / 2} cy={tamano / 2} r={radio} fill="none" stroke="var(--secondary)" strokeWidth={grosor} />
                    <m.circle
                      cx={tamano / 2}
                      cy={tamano / 2}
                      r={radio}
                      fill="none"
                      stroke={COLORES_ANILLOS[i % COLORES_ANILLOS.length]}
                      strokeWidth={grosor}
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: v }}
                      transition={{ ...RESORTE_SUAVE, delay: i * 0.08 }}
                    />
                  </g>
                );
              })}
            </svg>
          </MovimientoLocal>
          {centro ? <div className="absolute inset-0 grid place-items-center text-titulo font-semibold text-foreground tabular-nums">{centro}</div> : null}
        </div>
        <ul className="grid min-w-0 flex-1 gap-2">
          {anillos.map((a, i) => (
            <li key={a.nombre} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 text-control">
              <span className="size-2 rounded-full" style={{ background: COLORES_ANILLOS[i % COLORES_ANILLOS.length] }} />
              <span className="min-w-0 text-foreground">{a.nombre}</span>
              <span className="font-semibold text-foreground tabular-nums">{a.valor}%</span>
              {a.detalle ? <span className="col-start-2 col-end-4 truncate text-etiqueta text-texto-terciario">{a.detalle}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
