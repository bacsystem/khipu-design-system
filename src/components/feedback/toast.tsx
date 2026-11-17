"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect } from "react";
import { crearCola, crearToast, type Tono, tonoDe } from "@/lib/cola-toast";
import { Spinner } from "@/components/feedback/spinner";
import { OBJETIVO_TACTIL } from "@/lib/estilos";
import { cn } from "@/lib/utils";

// Almacén del módulo: `toast` lo usa sin hooks y `ToastProvider` lo suscribe (ver `lib/cola-toast`).
const manager = ToastPrimitive.createToastManager();
const cola = crearCola();

const ICONOS: Record<Tono, typeof InfoIcon> = { ok: CheckCircleIcon, aviso: WarningIcon, error: WarningCircleIcon, info: InfoIcon };
const COLORES: Record<Tono, string> = {
  ok: "text-success-foreground",
  aviso: "text-warning-foreground",
  error: "text-destructive",
  info: "text-primary",
};

/** Lista de toasts (abajo a la derecha). Va dentro de `ToastProvider`, una sola vez por app. */
function Lista() {
  const { toasts } = ToastPrimitive.useToastManager();
  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport className="fixed inset-x-0 mx-auto md:inset-x-auto md:right-4 md:mx-0 bottom-[calc(1rem+var(--khipu-reserva-inferior,0px))] z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 outline-none">
        {toasts.map((t) => {
          const tono = tonoDe(t.type);
          const Icono = ICONOS[tono];
          return (
            <ToastPrimitive.Root
              key={t.id}
              toast={t}
              className={cn(
                "relative flex w-full items-start gap-2.5 rounded-xl border border-border bg-popover px-3.5 py-3 text-popover-foreground shadow-md ring-1 ring-border",
                "transition-[opacity,transform] duration-(--duracion-media) data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0",
              )}
            >
              {t.type === "loading" ? <Spinner className={cn("mt-0.5 shrink-0", COLORES[tono])} /> : <Icono className={cn("mt-0.5 size-4 shrink-0", COLORES[tono])} />}
              <ToastPrimitive.Content className="min-w-0 flex-1">
                <ToastPrimitive.Title className="text-control leading-tight font-semibold" />
                <ToastPrimitive.Description className="mt-0.5 text-control leading-snug text-muted-foreground" />
                {t.actionProps ? (
                  <ToastPrimitive.Action className="mt-2 inline-flex h-control items-center rounded-full border border-border bg-card px-2.5 text-control font-medium text-foreground shadow-xs hover:bg-muted" />
                ) : null}
              </ToastPrimitive.Content>
              <ToastPrimitive.Close aria-label="Cerrar" className={cn(OBJETIVO_TACTIL, "rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground")}>
                <XIcon weight="bold" className="size-3.5" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

/** Envuelve la app (dentro de `Providers`) para habilitar `toast` y `useToast()`. Una sola vez por app. */
export function ToastProvider({ children, timeout = 5000 }: { children: ReactNode; timeout?: number }) {
  // Se conecta después de que el proveedor de base-ui se suscribe al `manager` (los efectos de los hijos corren antes).
  useEffect(() => {
    const desconectar = cola.conectar();
    if (process.env.NODE_ENV !== "production" && cola.conectados() > 1) {
      console.warn("khipu: hay más de un ToastProvider montado; cada aviso saldrá repetido. Deja uno solo por app.");
    }
    return desconectar;
  }, []);
  return (
    <ToastPrimitive.Provider timeout={timeout} limit={3} toastManager={manager}>
      {children}
      <Lista />
    </ToastPrimitive.Provider>
  );
}

/**
 * `toast.ok("Guardado")`, `toast.error("No se pudo", "Detalle…")`, `toast.promise(p, {…})`: se puede llamar desde cualquier
 * parte **de código de cliente** (manejadores, efectos, renderizadores de columna, funciones sueltas), no solo dentro de
 * componentes. Los tonos son los del sistema: verde, ámbar, rojo, info (primary).
 *
 * - Antes de que `ToastProvider` se monte en el navegador, las llamadas esperan en una cola (máximo 5, se descartan las más antiguas).
 * - Durante el SSR de un componente cliente no hacen nada (el módulo se comparte entre peticiones). Llámalo desde un manejador
 *   o un efecto, no durante el render. Desde un Server Component o una server action no se puede llamar: es código de cliente.
 * - `ok`/`aviso`/`error`/`info` devuelven el id para `cerrar(id)`; `cerrar()` sin id cierra todos.
 * - Un solo `ToastProvider` por app: con dos, cada aviso saldría dos veces (en desarrollo se avisa en consola).
 */
export const toast = crearToast(cola, manager);

/** `const toast = useToast()`: el mismo objeto `toast`, por compatibilidad. No usa hooks. */
export function useToast() {
  return toast;
}
