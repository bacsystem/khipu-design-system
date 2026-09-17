"use client";

import { SearchIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Miga por prefijo de ruta: la primera que coincida con `pathname.startsWith(prefijo)` gana. */
export type Miga = { prefijo: string; seccion: string; pagina: string };

/** Pill de estado del entorno/servicio para la zona izquierda. */
export type PillEntorno = { texto: string; tono: "ok" | "aviso" | "neutro" | "oscuro"; title?: string; deshabilitado?: boolean };

// Recetas de acción de la top bar (h-8, 12px). La principal es negra (foreground) para no competir con los colores de estado.
export const ACCION_PRINCIPAL =
  "inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3 text-[12px] font-medium whitespace-nowrap text-background shadow-xs transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60";
export const ACCION_SECUNDARIA =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[12px] font-medium whitespace-nowrap text-foreground/80 shadow-2xs transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60";

function Pill({ pill }: { pill: PillEntorno }) {
  const tonos = {
    ok: "border border-success-border bg-success text-success-foreground",
    aviso: "border border-warning-border bg-warning text-warning-foreground",
    neutro: "border border-border/80 bg-muted text-muted-foreground",
    oscuro: "bg-foreground text-background",
  } as const;
  const puntos = { ok: "bg-success-solid", aviso: "bg-warning-solid", neutro: "bg-muted-foreground/40", oscuro: "bg-success-solid" } as const;
  return (
    <span
      title={pill.title}
      className={cn(
        "hidden items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium whitespace-nowrap sm:inline-flex",
        tonos[pill.tono],
        pill.deshabilitado && "opacity-60",
      )}
    >
      <span className={cn("size-1.5 rounded-full", puntos[pill.tono])} />
      {pill.texto}
    </span>
  );
}

/**
 * Barra superior pegajosa (h-14). Izquierda: `menuMovil` (hamburguesa), miga (es el h1 de la página) y pills.
 * Derecha: buscador opcional, y `acciones` (máximo dos secundarias + una principal; el resto va en diálogos).
 */
export function TopBar({
  migas,
  pills = [],
  menuMovil,
  buscador,
  acciones,
}: {
  migas: Miga[];
  pills?: PillEntorno[];
  menuMovil?: ReactNode;
  /** `{ placeholder, onClick }` o `false` para ocultarlo; sin `onClick` se muestra deshabilitado ("próximamente"). */
  buscador?: { placeholder: string; atajo?: string; onClick?: () => void; title?: string } | false;
  acciones?: ReactNode;
}) {
  const pathname = usePathname();
  const miga = migas.find((m) => pathname.startsWith(m.prefijo));

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-card/80 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {menuMovil ? <div className="md:hidden">{menuMovil}</div> : null}

        {miga ? (
          <nav aria-label="Ubicación" className="flex min-w-0 shrink items-center gap-1.5 overflow-hidden text-[13px] whitespace-nowrap">
            <span className="text-muted-foreground/80">{miga.seccion}</span>
            <span className="text-muted-foreground/40">/</span>
            <h1 className="truncate font-heading font-semibold text-foreground">{miga.pagina}</h1>
          </nav>
        ) : null}

        {pills.length > 0 ? <div className="hidden h-4 w-px bg-border sm:block" /> : null}
        {pills.map((p) => (
          <Pill key={p.texto} pill={p} />
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2.5">
        {buscador ? (
          <div className="relative hidden w-64 lg:block" title={buscador.title}>
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground/70" />
            <input
              readOnly
              disabled={!buscador.onClick}
              onClick={buscador.onClick}
              placeholder={buscador.placeholder}
              className="h-8 w-full rounded-lg border border-border bg-muted pr-12 pl-8 text-[12px] text-foreground placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
            />
            {buscador.atajo ? (
              <kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70 shadow-2xs">
                {buscador.atajo}
              </kbd>
            ) : null}
          </div>
        ) : null}
        {buscador && acciones ? <div className="hidden h-4 w-px bg-border lg:block" /> : null}
        {acciones}
      </div>
    </header>
  );
}
