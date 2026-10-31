import { CLAVE_DISENO, DISENO_POR_DEFECTO, DISENOS, type Diseno } from "@/components/disenos";

/**
 * Script en línea para el `<head>` del layout raíz: aplica el diseño guardado a `<html>` antes del primer pintado,
 * para que no se vea un instante el diseño base. Server Component; la lista debe ser la misma que recibe `DisenoProvider`.
 */
export function ScriptDiseno({ disenos = DISENOS, porDefecto = DISENO_POR_DEFECTO }: { disenos?: Diseno[]; porDefecto?: string }) {
  const validos = JSON.stringify(disenos.map((d) => d.valor));
  const codigo = `try{var v=localStorage.getItem(${JSON.stringify(CLAVE_DISENO)});document.documentElement.dataset.diseno=${validos}.indexOf(v)>-1?v:${JSON.stringify(porDefecto)}}catch(e){document.documentElement.dataset.diseno=${JSON.stringify(porDefecto)}}`;
  return <script dangerouslySetInnerHTML={{ __html: codigo }} />;
}
