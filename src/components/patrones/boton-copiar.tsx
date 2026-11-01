"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { MovimientoLocal } from "@/components/movimiento";
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/**
 * Copia `texto` al portapapeles; el icono gira a un check durante 1.5 s. `className` ajusta tamaño y radio (p. ej. `size-control rounded-lg`).
 * Sin `etiqueta` es solo el icono (celdas de tabla); con ella muestra "Copiar" / "Copiado" (barras de acciones).
 */
export function BotonCopiar({
  texto,
  titulo = "Copiar",
  etiqueta = false,
  className,
}: {
  texto: string;
  titulo?: string;
  etiqueta?: boolean;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  return (
    <button
      type="button"
      title={titulo}
      aria-label={copiado ? "Copiado" : titulo}
      onClick={async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(texto);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1500);
        } catch {
          // el navegador puede denegar el acceso al portapapeles; el contenido sigue seleccionable
        }
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida hover:bg-secondary hover:text-foreground",
        etiqueta ? "gap-1.5" : "p-0.5",
        className,
      )}
    >
      <MovimientoLocal><AnimatePresence mode="wait" initial={false}>
        <m.span
          key={copiado ? "copiado" : "copiar"}
          initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
          transition={{ duration: DURACION.rapida, ease: CURVA_SALIDA }}
          className="inline-flex"
        >
          {copiado ? <CheckIcon weight="bold" className="size-3.5 text-success-foreground" /> : <CopyIcon weight="bold" className="size-3.5" />}
        </m.span>
      </AnimatePresence></MovimientoLocal>
      {etiqueta ? (copiado ? "Copiado" : "Copiar") : null}
    </button>
  );
}
