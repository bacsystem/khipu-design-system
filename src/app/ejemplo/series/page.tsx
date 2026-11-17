import { Pagina } from "@/components/nav/shell";
import { ENTRADA, pasoEntrada } from "@/lib/estilos";
import { hrefNotificacionSeguro, indiceActivoRuta } from "@/lib/navegacion";
import { DemoTabsRuta } from "../demo-navegacion-ruta";

/** Segunda ruta de la demo de `TabsRuta`: al venir de «Documentos», aquí es «Series» la que lleva `aria-current="page"`. */
export default function SeriesPage() {
  // `lib/navegacion` no es un módulo cliente: un Server Component puede llamar a sus helpers (si no, `next build` falla).
  const pestana = indiceActivoRuta([{ href: "/ejemplo", exacto: true }, { href: "/ejemplo/series" }], "/ejemplo/series");
  const volver = hrefNotificacionSeguro("/ejemplo");
  return (
    <Pagina>
      <header className={`${ENTRADA} px-1 pt-1`} style={pasoEntrada(0)} data-pestana-activa={pestana} data-volver={volver}>
        <h1 className="text-titulo-pagina text-foreground">Series</h1>
        <p className="mt-0.5 text-control text-texto-terciario">Series de comprobantes por establecimiento.</p>
      </header>
      <div className={ENTRADA} style={pasoEntrada(1)}>
        <DemoTabsRuta />
      </div>
    </Pagina>
  );
}
