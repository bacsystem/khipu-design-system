"use client";

import { BookOpenIcon, PlusIcon } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CabeceraDialogo, PieDialogo } from "@/components/patrones/cabecera-dialogo";
import { BOTON_PRIMARIO, BOTON_SECUNDARIO, CAMPO, ETIQUETA_CAMPO, AYUDA_CAMPO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

/** Acciones contextuales de la top bar: máximo dos secundarias + una principal. */
export function AccionesEjemplo({ principal, secundaria }: { principal: string; secundaria: string }) {
  const [abierto, setAbierto] = useState(false);
  return (
    <>
      <button type="button" className={cn(secundaria, "hidden sm:inline-flex")}>
        <BookOpenIcon className="size-4" />
        Referencia técnica
      </button>
      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogTrigger className={principal}>
          <PlusIcon className="size-4" />
          Nuevo documento
        </DialogTrigger>
        <DialogContent className="gap-0 p-0">
          <CabeceraDialogo icon={PlusIcon} titulo="Nuevo documento" descripcion="Formulario de ejemplo con las recetas del kit" />
          <div className="grid gap-4 px-5 py-4">
            <div className="grid gap-1.5">
              <label htmlFor="ej-serie" className={ETIQUETA_CAMPO}>
                Serie
              </label>
              <input id="ej-serie" className={cn(CAMPO, "font-mono")} placeholder="F001" maxLength={4} />
              <span className={AYUDA_CAMPO}>4 caracteres alfanuméricos</span>
            </div>
          </div>
          <PieDialogo>
            <button type="button" onClick={() => setAbierto(false)} className={cn(BOTON_SECUNDARIO, "h-9 px-3.5 text-[13px]")}>
              Cancelar
            </button>
            <button type="button" onClick={() => setAbierto(false)} className={cn(BOTON_PRIMARIO, "h-9 px-3.5 text-[13px]")}>
              Guardar
            </button>
          </PieDialogo>
        </DialogContent>
      </Dialog>
    </>
  );
}
