/**
 * Cola de llamadas imperativas de `toast`. Mientras ningún `ToastProvider` está montado en el navegador, las llamadas
 * esperan aquí (máximo `max`, se descartan las más antiguas) y salen en orden cuando el primero se conecta.
 * En el servidor no hacen nada: el módulo es compartido entre peticiones y guardar avisos allí los filtraría a otro usuario.
 */
export function crearCola({ max = 5, servidor = () => typeof window === "undefined" }: { max?: number; servidor?: () => boolean } = {}) {
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
  };
}
