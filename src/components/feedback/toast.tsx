"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import { CheckCircle2Icon, CircleAlertIcon, InfoIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tono = "ok" | "aviso" | "error" | "info";

const ICONOS: Record<Tono, typeof InfoIcon> = { ok: CheckCircle2Icon, aviso: TriangleAlertIcon, error: CircleAlertIcon, info: InfoIcon };
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
      <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 outline-none">
        {toasts.map((t) => {
          const tono = (t.type as Tono | undefined) ?? "info";
          const Icono = ICONOS[tono];
          return (
            <ToastPrimitive.Root
              key={t.id}
              toast={t}
              className={cn(
                "relative flex w-full items-start gap-2.5 rounded-xl border border-border bg-popover px-3.5 py-3 text-popover-foreground shadow-md ring-1 ring-foreground/5",
                "transition-[opacity,transform] duration-200 data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0",
              )}
            >
              <Icono className={cn("mt-0.5 size-4 shrink-0", COLORES[tono])} />
              <ToastPrimitive.Content className="min-w-0 flex-1">
                <ToastPrimitive.Title className="text-[13px] leading-tight font-semibold" />
                <ToastPrimitive.Description className="mt-0.5 text-[12px] leading-snug text-muted-foreground" />
                {t.actionProps ? (
                  <ToastPrimitive.Action className="mt-2 inline-flex h-7 items-center rounded-md border border-border bg-card px-2.5 text-[12px] font-medium text-foreground shadow-2xs hover:bg-muted" />
                ) : null}
              </ToastPrimitive.Content>
              <ToastPrimitive.Close aria-label="Cerrar" className="rounded p-0.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground">
                <XIcon className="size-3.5" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  );
}

/** Envuelve la app (dentro de `Providers`) para habilitar `useToast()`. */
export function ToastProvider({ children, timeout = 5000 }: { children: ReactNode; timeout?: number }) {
  return (
    <ToastPrimitive.Provider timeout={timeout} limit={3}>
      {children}
      <Lista />
    </ToastPrimitive.Provider>
  );
}

/**
 * `const toast = useToast(); toast.ok("Guardado"); toast.error("No se pudo", "Detalle…"); toast.promise(p, {…})`.
 * Los tonos son los del sistema: verde, ámbar, rojo, info (primary).
 */
export function useToast() {
  const manager = ToastPrimitive.useToastManager();
  const emitir = (type: Tono) => (title: string, description?: string, accion?: { etiqueta: string; onClick: () => void }) =>
    manager.add({
      type,
      title,
      description,
      actionProps: accion ? { children: accion.etiqueta, onClick: accion.onClick } : undefined,
    });
  return {
    ok: emitir("ok"),
    aviso: emitir("aviso"),
    error: emitir("error"),
    info: emitir("info"),
    cerrar: manager.close,
    /** Muestra "cargando" y luego éxito/error según resuelva la promesa. */
    promise: <T,>(p: Promise<T>, textos: { cargando: string; ok: string | ((v: T) => string); error: string | ((e: unknown) => string) }) =>
      manager.promise(p, {
        loading: { title: textos.cargando, type: "info" },
        success: (v) => ({ title: typeof textos.ok === "function" ? textos.ok(v) : textos.ok, type: "ok" }),
        error: (e) => ({ title: typeof textos.error === "function" ? textos.error(e) : textos.error, type: "error" }),
      }),
  };
}
