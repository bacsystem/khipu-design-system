"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { CURVA_SALIDA, DURACION } from "@/lib/movimiento";
import { cn } from "@/lib/utils";

/** Copia `texto` al portapapeles; el icono gira a un check durante 1.5 s. `className` ajusta tamaño y radio (p. ej. `size-9 rounded-lg`). */
export function BotonCopiar({ texto, titulo = "Copiar", className }: { texto: string; titulo?: string; className?: string }) {
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
          // el navegador puede denegar el acceso al portapapeles; no hay nada más que hacer
        }
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md p-0.5 text-muted-foreground transition-colors duration-(--duracion-rapida) ease-salida hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={copiado ? "copiado" : "copiar"}
          initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: 45 }}
          transition={{ duration: DURACION.rapida, ease: CURVA_SALIDA }}
          className="inline-flex"
        >
          {copiado ? <CheckIcon className="size-3.5 text-success-foreground" /> : <CopyIcon className="size-3.5" />}
        </m.span>
      </AnimatePresence>
    </button>
  );
}
