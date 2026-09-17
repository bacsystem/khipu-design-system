import { InboxIcon, KeyRoundIcon } from "lucide-react";
import { Pagina } from "@/components/nav/shell";
import { BloqueCodigo } from "@/components/patrones/bloque-codigo";
import { CabeceraSeccion } from "@/components/patrones/cabecera-seccion";
import { AyudaMetrica, FilaMetricas, Metrica } from "@/components/patrones/metricas";
import { Chip, ChipCodigo, PillEstado } from "@/components/patrones/pill-estado";
import { TablaVacia } from "@/components/patrones/pie-tabla";
import { Galeria } from "./galeria";
import { TablaEjemplo } from "./tabla";

export default function EjemploPage() {
  return (
    <Pagina>
      <FilaMetricas>
        <Metrica etiqueta="Documentos aceptados" sufijo="/ 136 emitidos" ayuda={<AyudaMetrica tono="ok">98% con CDR</AyudaMetrica>}>
          133
        </Metrica>
        <Metrica etiqueta="Último correlativo" ayuda="Factura electrónica · 14 Set 2026">
          <span className="text-primary">F001</span>#00000136
        </Metrica>
        <Metrica etiqueta="Pendientes de envío" ayuda={<AyudaMetrica tono="aviso">Reintento automático</AyudaMetrica>}>
          2
        </Metrica>
        <Metrica etiqueta="Rechazados" ayuda={<AyudaMetrica tono="error">Revisar observaciones</AyudaMetrica>}>
          <span className="text-destructive">1</span>
        </Metrica>
      </FilaMetricas>

      <TablaEjemplo />

      <section className="rounded-xl border border-border bg-card shadow-2xs">
        <CabeceraSeccion icon={KeyRoundIcon} titulo="Pills y chips" subtitulo="tonos ok · aviso · error · neutro" derecha={<Chip>4 tonos</Chip>} />
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

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <BloqueCodigo
          metodo="POST"
          url="https://api.miapp.pe/v1/documentos"
          codigo={`curl -X POST https://api.miapp.pe/v1/documentos \\\n  -H "X-Api-Key: TU_API_KEY" \\\n  -d '{ "serie": "F001", "moneda": "PEN" }'`}
          pie="Reemplaza TU_API_KEY por una llave activa."
        />
        <BloqueCodigo tono="claro" codigo={`{\n  "estado": "exito",\n  "datos": { "serie": "F001", "numero": 137 }\n}`} />
      </div>

      <section className="rounded-xl border border-border bg-card shadow-2xs">
        <TablaVacia icon={<InboxIcon className="size-6" />}>Todavía no hay documentos. Crea el primero con «Nuevo documento».</TablaVacia>
      </section>

      <Galeria />
    </Pagina>
  );
}
