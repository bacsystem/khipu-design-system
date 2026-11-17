/**
 * Lógica pura de `toast` (sin React ni DOM, para probarla en Node): la cola de llamadas previas al montaje, la detección
 * del servidor, el mapeo de tonos y la fábrica del objeto `toast`. `feedback/toast` la une a base-ui.
 */

export type Tono = "ok" | "aviso" | "error" | "info";
export type AccionToast = { etiqueta: string; onClick: () => void };
export type TextosPromesa<T> = { cargando: string; ok: string | ((v: T) => string); error: string | ((e: unknown) => string) };

/** True fuera del navegador: el SSR de un componente cliente, donde el módulo se comparte entre peticiones. */
export function esServidor(global: { window?: unknown } = globalThis): boolean {
  return typeof global.window === "undefined";
}

/**
 * Tono de un toast. base-ui cambia `type` a `"loading"`, `"success"` o `"error"` al resolver una promesa, así que no basta
 * con los cuatro tonos del kit: `loading` se pinta como info, `success` como ok y lo desconocido como info.
 */
export function tonoDe(type: string | undefined): Tono {
  switch (type) {
    case "ok":
    case "aviso":
    case "error":
    case "info":
      return type;
    case "success":
      return "ok";
    default:
      return "info"; // incluye "loading"
  }
}

/**
 * Cola de llamadas imperativas. Mientras ningún `ToastProvider` está conectado en el navegador, las llamadas esperan aquí
 * (máximo `max`, se descartan las más antiguas) y salen en orden cuando el primero se conecta. Durante el SSR de un componente cliente no hacen nada:
 * guardar avisos allí los filtraría a otra petición.
 */
export function crearCola({ max = 5, servidor = esServidor }: { max?: number; servidor?: () => boolean } = {}) {
  let conectados = 0;
  const pendientes: Array<() => void> = [];
  return {
    /** Ejecuta `accion` ya, la guarda hasta que haya un proveedor, o la ignora en el servidor. */
    despachar(accion: () => void) {
      if (servidor()) return;
      if (conectados > 0) return accion();
      pendientes.push(accion);
      if (pendientes.length > max) pendientes.shift();
    },
    /** Un proveedor se monta: vacía la cola. Devuelve la función que lo desconecta. */
    conectar() {
      conectados++;
      for (const accion of pendientes.splice(0)) accion();
      let activo = true;
      return () => {
        if (!activo) return;
        activo = false;
        conectados--;
      };
    },
    /** Proveedores conectados ahora (más de uno duplica los avisos). */
    conectados: () => conectados,
  };
}

/** Lo que `toast` necesita del manager de base-ui. */
export type ManagerToast = {
  add(opciones: { id: string; type: Tono; title: string; description?: string; priority: "high" | "low"; actionProps?: { children: string; onClick: () => void } }): unknown;
  close(id?: string): unknown;
  promise<T>(
    p: Promise<T>,
    opciones: {
      loading: { title: string; type: Tono };
      success: (v: T) => { title: string; type: Tono };
      error: (e: unknown) => { title: string; type: Tono; priority: "high" };
    },
  ): Promise<T>;
};

/** Construye el objeto `toast` sobre una cola y un manager. */
export function crearToast(cola: Pick<ReturnType<typeof crearCola>, "despachar">, manager: ManagerToast) {
  let secuencia = 0;
  const emitir = (type: Tono) => (title: string, description?: string, accion?: AccionToast) => {
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
  return {
    ok: emitir("ok"),
    aviso: emitir("aviso"),
    error: emitir("error"),
    info: emitir("info"),
    cerrar: (id?: string) => cola.despachar(() => manager.close(id)),
    /** Muestra "cargando" y luego éxito/error según resuelva la promesa. Devuelve la misma promesa. */
    promise: <T,>(p: Promise<T>, textos: TextosPromesa<T>): Promise<T> => {
      cola.despachar(() => {
        // base-ui devuelve una promesa encadenada que se rechaza de nuevo: sin este `catch` quedaría un rechazo sin capturar
        // aunque quien llama ya maneje el suyo (`p`).
        manager
          .promise(p, {
            loading: { title: textos.cargando, type: "info" },
            success: (v) => ({ title: typeof textos.ok === "function" ? textos.ok(v) : textos.ok, type: "ok" }),
            error: (e) => ({ title: typeof textos.error === "function" ? textos.error(e) : textos.error, type: "error", priority: "high" }),
          })
          .catch(() => {});
      });
      return p;
    },
  };
}
