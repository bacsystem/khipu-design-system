import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";
import type { ReactNode } from "react";
import { TrazoAnimado } from "@/components/datos/trazo-animado";
import { cn } from "@/lib/utils";

/** Sparkline de una serie (sin ejes): línea de 2px en el color del gráfico 1 que se dibuja al aparecer, área tenue y punto final. */
export function Sparkline({ datos, ancho = 96, alto = 28, className }: { datos: number[]; ancho?: number; alto?: number; className?: string }) {
  if (datos.length < 2) return null;
  const min = Math.min(...datos);
  const max = Math.max(...datos);
  const rango = max - min || 1;
  const px = 2;
  const puntos = datos.map((v, i) => [px + (i / (datos.length - 1)) * (ancho - px * 2), alto - px - ((v - min) / rango) * (alto - px * 2)] as const);
  const linea = puntos.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [ux, uy] = puntos[puntos.length - 1];
  return (
    <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} aria-hidden="true" className={cn("shrink-0 overflow-visible", className)}>
      <path d={`${linea} L${ux.toFixed(1)},${alto} L${px},${alto} Z`} fill="var(--chart-1)" opacity="0.1" />
      <TrazoAnimado d={linea} stroke="var(--chart-1)" />
      <circle cx={ux} cy={uy} r="3" fill="var(--chart-1)" stroke="var(--card)" strokeWidth="2" />
    </svg>
  );
}

/**
 * KPI con tendencia: valor grande, variación vs. período anterior (verde/rojo/neutro con flecha e importe) y sparkline opcional.
 * `invertir` cuando bajar es bueno (rechazos, errores). Para que el valor cuente al aparecer, pásale `<NumeroAnimado valor={…} />`.
 */
export function Kpi({
  etiqueta,
  valor,
  variacion,
  periodo = "vs. período anterior",
  invertir,
  serie,
  className,
}: {
  etiqueta: ReactNode;
  valor: ReactNode;
  /** Porcentaje, p. ej. 12.5 o -3; omite para no mostrar tendencia. */
  variacion?: number;
  periodo?: ReactNode;
  invertir?: boolean;
  serie?: number[];
  className?: string;
}) {
  const positiva = variacion != null && variacion > 0;
  const negativa = variacion != null && variacion < 0;
  const buena = invertir ? negativa : positiva;
  const mala = invertir ? positiva : negativa;
  const Flecha = positiva ? ArrowUpRightIcon : negativa ? ArrowDownRightIcon : MinusIcon;
  return (
    <div className={cn("flex items-start justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm", className)}>
      <div className="min-w-0">
        <span className="block truncate text-etiqueta font-medium text-muted-foreground">{etiqueta}</span>
        <div className="mt-1.5 text-metrica text-foreground tabular-nums">{valor}</div>
        {variacion != null ? (
          <div className="mt-1.5 flex items-center gap-1.5 text-etiqueta text-muted-foreground">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium tabular-nums",
                buena && "bg-success text-success-foreground",
                mala && "bg-destructive-suave text-destructive-texto",
                !buena && !mala && "bg-secondary",
              )}
            >
              <Flecha className="size-3" />
              {Math.abs(variacion).toFixed(1)}%
            </span>
            <span className="truncate">{periodo}</span>
          </div>
        ) : null}
      </div>
      {serie ? <Sparkline datos={serie} className="mt-1" /> : null}
    </div>
  );
}
