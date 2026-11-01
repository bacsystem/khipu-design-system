import { CheckCircleIcon, ClockIcon, KeyIcon, TrayIcon, WalletIcon, XCircleIcon } from "@phosphor-icons/react/dist/ssr";
import { GraficoBarras } from "@/components/datos/grafico";
import { Timeline } from "@/components/datos/timeline";
import { ProgresoCircular } from "@/components/feedback/progreso";
import { Pagina } from "@/components/nav/shell";
import { BloqueCodigo } from "@/components/patrones/bloque-codigo";
import { CabeceraSeccion } from "@/components/patrones/cabecera-seccion";
import { AyudaMetrica, FilaMetricas, Metrica } from "@/components/patrones/metricas";
import { Chip, ChipCodigo, PillEstado } from "@/components/patrones/pill-estado";
import { NumeroAnimado } from "@/components/patrones/numero-animado";
import { TablaVacia } from "@/components/patrones/pie-tabla";
import { ENTRADA, TARJETA, pasoEntrada } from "@/lib/estilos";
import { PESO_ICONO } from "@/lib/iconos";
import { Galeria } from "./galeria";
import { TablaEjemplo } from "./tabla";

export default function EjemploPage() {
  return (
    <Pagina>
      <header className={`${ENTRADA} flex flex-wrap items-end justify-between gap-3 px-1 pt-1`} style={pasoEntrada(0)}>
        <div>
          <h1 className="text-titulo-pagina text-foreground">Documentos</h1>
          <p className="mt-0.5 text-control text-texto-terciario">Comprobantes electrónicos emitidos y su estado ante SUNAT.</p>
        </div>
      </header>

      <div className={ENTRADA} style={pasoEntrada(1)}>
        <FilaMetricas>
          <Metrica etiqueta="Aceptados" icono={CheckCircleIcon} tono="ok" destacada sufijo="/ 136" visual={{ tipo: "barra", valor: 98 }} ayuda="98% con CDR · +12% vs. agosto">
            <NumeroAnimado valor={133} />
          </Metrica>
          <Metrica etiqueta="Facturado" icono={WalletIcon} tono="acento" ayuda="Septiembre · 136 comprobantes">
            <span>S/ 48.2k</span>
          </Metrica>
          <Metrica etiqueta="Pendientes" icono={ClockIcon} tono="aviso" visual={{ tipo: "puntos", total: 10, marcados: 2 }} ayuda={<AyudaMetrica tono="aviso">Reintento automático 16:00</AyudaMetrica>}>
            <NumeroAnimado valor={2} />
          </Metrica>
          <Metrica etiqueta="Rechazados" icono={XCircleIcon} tono="error" visual={{ tipo: "puntos", total: 10, marcados: 1 }} ayuda={<AyudaMetrica tono="error">Revisar observaciones</AyudaMetrica>}>
            <NumeroAnimado valor={1} />
          </Metrica>
        </FilaMetricas>
      </div>

      <div className={`${ENTRADA} grid grid-cols-1 items-start gap-3 xl:grid-cols-[1fr_300px]`} style={pasoEntrada(2)}>
        <GraficoBarras
          titulo="Comprobantes emitidos"
          categorias={["1 set", "2 set", "3 set", "4 set", "5 set", "6 set", "7 set", "8 set", "9 set", "10 set", "11 set", "12 set"]}
          series={[{ nombre: "Comprobantes", valores: [18, 25, 14, 28, 22, 35, 20, 27, 17, 29, 24, 32] }]}
          destacado={5}
          alto={190}
        />
        <section className={`${TARJETA} grid gap-3 px-4 py-3.5`}>
          <h2 className="text-titulo text-foreground">Estado ante SUNAT</h2>
          <div className="flex items-center justify-around py-1">
            <ProgresoCircular valor={95} tono="success" tamano="lg" />
            <ProgresoCircular valor={85} tono="warning" tamano="lg" />
            <ProgresoCircular valor={64} tono="destructive" tamano="lg" />
          </div>
          <Timeline
            eventos={[
              { id: "1", titulo: "F001-136 aceptada", detalle: "CDR recibido", fecha: "15:00", tono: "ok", actual: true },
              { id: "2", titulo: "B001-2210 observada", detalle: "Reintento 16:00", fecha: "14:59", tono: "aviso" },
              { id: "3", titulo: "Nueva llave de API", detalle: "por Ana", fecha: "14:52", tono: "neutro" },
            ]}
          />
        </section>
      </div>

      <div className={ENTRADA} style={pasoEntrada(3)}>
        <TablaEjemplo />
      </div>

      <section className={`${ENTRADA} ${TARJETA}`} style={pasoEntrada(4)}>
        <CabeceraSeccion icon={KeyIcon} titulo="Pills y chips" subtitulo="tonos ok · aviso · error · neutro" derecha={<Chip>4 tonos</Chip>} />
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          <PillEstado tono="ok">Aceptado</PillEstado>
          <PillEstado tono="aviso">Con observaciones</PillEstado>
          <PillEstado tono="error">Rechazado</PillEstado>
          <PillEstado tono="neutro">Enviado</PillEstado>
          <ChipCodigo>F001</ChipCodigo>
          <ChipCodigo inactivo>B001</ChipCodigo>
          <Chip>id: 193f4b35</Chip>
        </div>
      </section>

      <div className={`${ENTRADA} grid grid-cols-1 items-start gap-4 lg:grid-cols-2`} style={pasoEntrada(5)}>
        <BloqueCodigo
          metodo="POST"
          url="https://api.miapp.pe/v1/documentos"
          codigo={`curl -X POST https://api.miapp.pe/v1/documentos \\\n  -H "X-Api-Key: TU_API_KEY" \\\n  -d '{ "serie": "F001", "moneda": "PEN" }'`}
          pie="Reemplaza TU_API_KEY por una llave activa."
        />
        <BloqueCodigo tono="claro" codigo={`{\n  "estado": "exito",\n  "datos": { "serie": "F001", "numero": 137 }\n}`} />
      </div>

      <section className={`${ENTRADA} ${TARJETA}`} style={pasoEntrada(6)}>
        <TablaVacia icon={<TrayIcon weight={PESO_ICONO} className="size-6" />}>Todavía no hay documentos. Crea el primero con «Nuevo documento».</TablaVacia>
      </section>

      <Galeria />
    </Pagina>
  );
}
