import { Pagina } from "@/components/nav/shell";
import { ENTRADA, pasoEntrada } from "@/lib/estilos";
import { DemoTabsRuta } from "../demo-navegacion-ruta";

/** Segunda ruta de la demo de `TabsRuta`: al venir de «Documentos», aquí es «Series» la que lleva `aria-current="page"`. */
export default function SeriesPage() {
  return (
    <Pagina>
      <header className={`${ENTRADA} px-1 pt-1`} style={pasoEntrada(0)}>
        <h1 className="text-titulo-pagina text-foreground">Series</h1>
        <p className="mt-0.5 text-control text-texto-terciario">Series de comprobantes por establecimiento.</p>
      </header>
      <div className={ENTRADA} style={pasoEntrada(1)}>
        <DemoTabsRuta />
      </div>
    </Pagina>
  );
}
