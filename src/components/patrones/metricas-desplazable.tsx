"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Región desplazable de `FilaMetricas desplazable`: `role="region"` con nombre y, solo mientras hay algo que desplazar,
 * `tabIndex=0` para recorrerla con el teclado. Sin desborde (en desktop la fila es una grilla) no es una parada de Tab vacía.
 * Hasta medir (servidor y primer render) se asume que desborda: es el caso del móvil, donde importa.
 */
export function FilaDesplazable({ etiqueta, className, children }: { etiqueta: string; className: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const [desborda, setDesborda] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const medir = () => setDesborda(el.scrollWidth > el.clientWidth + 1);
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    for (const hijo of Array.from(el.children)) observador.observe(hijo);
    return () => observador.disconnect();
  }, []);
  return (
    <section ref={ref} role="region" aria-label={etiqueta} tabIndex={desborda ? 0 : undefined} className={className}>
      {children}
    </section>
  );
}
