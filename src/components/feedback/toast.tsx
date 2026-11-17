"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircleIcon, InfoIcon, WarningCircleIcon, WarningIcon, XIcon } from "@phosphor-icons/react";
import { type ReactNode, useEffect } from "react";
import { crearCola } from "@/lib/cola-toast";
import { OBJETIVO_TACTIL } from "@/lib/estilos";
import { cn } from "@/lib/utils";

type Tono = "ok" | "aviso" | "error" | "info";
type Accion = { etiqueta: string; onClick: () => void };

// Almacén del módulo: `toast` lo usa sin hooks y `ToastProvider` lo suscribe (ver `lib/cola-toast`).
const manager = ToastPrimitive.createToastManager();
const cola = crearCola();
let secuencia = 0;

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
          const tono = (t.type as Tono | undefined) ?? "info";
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
              <Icono className={cn("mt-0.5 size-4 shrink-0", COLORES[tono])} />
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
  useEffect(() => cola.conectar(), []);
  return (
    <ToastPrimitive.Provider timeout={timeout} limit={3} toastManager={manager}>
      {children}
      <Lista />
    </ToastPrimitive.Provider>
  );
}

function emitir(type: Tono) {
  return (title: string, description?: string, accion?: Accion) => {
    const id = `khipu-toast-${++secuencia}`;
    cola.despachar(() =>
      manager.add({
        id,
        type,
        title,
        description,
        // `error` es `assertive` (región `role="alert"`); el resto `polite`.
        priority: type === "error" ? "high" : "low",
        actionProps: accion ? { children: accion.etiqueta, onClick: accion.onClick } : undefined,
      }),
    );
    return id;
  };
}

/**
 * `toast.ok("Guardado")`, `toast.error("No se pudo", "Detalle…")`, `toast.promise(p, {…})`: se puede llamar desde cualquier
 * parte (manejadores, renderizadores de columna, funciones sueltas), no solo dentro de componentes. Los tonos son los del
 * sistema: verde, ámbar, rojo, info (primary).
 *
 * - Antes de que `ToastProvider` se monte en el navegador, las llamadas esperan en una cola (máximo 5, se descartan las más antiguas).
 * - En el servidor no hacen nada: ni lanzan ni muestran. Llámalo desde un manejador o un efecto, no durante el render.
 * - `ok`/`aviso`/`error`/`info` devuelven el id para `cerrar(id)`; `cerrar()` sin id cierra todos.
 */
export const toast = {
  ok: emitir("ok"),
  aviso: emitir("aviso"),
  error: emitir("error"),
  info: emitir("info"),
  cerrar: (id?: string) => cola.despachar(() => manager.close(id)),
  /** Muestra "cargando" y luego éxito/error según resuelva la promesa. Devuelve la misma promesa. */
  promise: <T,>(p: Promise<T>, textos: { cargando: string; ok: string | ((v: T) => string); error: string | ((e: unknown) => string) }): Promise<T> => {
    cola.despachar(() => {
      manager.promise(p, {
        loading: { title: textos.cargando, type: "info" },
        success: (v) => ({ title: typeof textos.ok === "function" ? textos.ok(v) : textos.ok, type: "ok" }),
        error: (e) => ({ title: typeof textos.error === "function" ? textos.error(e) : textos.error, type: "error", priority: "high" }),
      });
    });
    return p;
  },
};

/** `const toast = useToast()`: el mismo objeto `toast`, por compatibilidad. No usa hooks. */
export function useToast() {
  return toast;
}
