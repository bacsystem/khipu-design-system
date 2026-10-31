"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import type { ReactNode } from "react";

/**
 * Habilita Motion en la app. `domMax` y no `domAnimation`: trae las animaciones de layout que necesita `layoutId`
 * (el fondo del ítem activo del sidebar). `strict` hace fallar en desarrollo cualquier `motion.*`: los componentes usan `m.*`,
 * que no carga el bundle completo. `reducedMotion="user"` respeta «reducir movimiento» del sistema.
 * Sin este proveedor los `m.*` renderizan bien pero no animan.
 */
export function ProveedorMovimiento({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
