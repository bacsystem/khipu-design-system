"use client";

import { HourglassMediumIcon, LockKeyIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { AvisoResponsivo, CabeceraAviso, PieAviso } from "@/components/patrones/aviso-responsivo";
import { FranjaCuentaRegresiva } from "@/components/patrones/franja-cuenta-regresiva";
import { ACCION_SECUNDARIA, BOTON_PRIMARIO, BOTON_SECUNDARIO } from "@/lib/estilos";

const SEGUNDOS_DE_AVISO = 65;

/**
 * Demo de `AvisoResponsivo`: un aviso descartable con la franja contando (Escape = «seguir conectado») y otro no descartable,
 * que solo se cierra con su botón. Hoja inferior bajo 640 px (emula un teléfono en las herramientas del navegador), diálogo desde ahí.
 */
export function DemoAvisos() {
  const [aviso, setAviso] = useState(false);
  const [terminada, setTerminada] = useState(false);
  const [segundos, setSegundos] = useState(SEGUNDOS_DE_AVISO);
  const principal = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!aviso) return;
    const reloj = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(reloj);
  }, [aviso]);

  useEffect(() => {
    if (aviso && segundos === 0) {
      setAviso(false);
      setTerminada(true);
    }
  }, [aviso, segundos]);

  function abrirAviso() {
    setSegundos(SEGUNDOS_DE_AVISO);
    setAviso(true);
  }

  return (
    <>
      <button type="button" className={ACCION_SECUNDARIA} onClick={abrirAviso}>
        Aviso con cuenta regresiva
      </button>
      <button type="button" className={ACCION_SECUNDARIA} onClick={() => setTerminada(true)}>
        Aviso no descartable
      </button>

      <AvisoResponsivo open={aviso} onOpenChange={setAviso} initialFocus={principal}>
        <CabeceraAviso icon={HourglassMediumIcon} tono="peligro" titulo="Tu sesión está por finalizar" descripcion="Por seguridad cerramos la sesión cuando no hay actividad. Si sigues aquí, la mantenemos abierta." />
        <div className="px-5 pb-2">
          <FranjaCuentaRegresiva segundos={segundos} etiqueta="Tu sesión se cerrará en:" />
        </div>
        <PieAviso>
          <button type="button" className={BOTON_SECUNDARIO} onClick={() => setAviso(false)}>
            Cerrar sesión
          </button>
          <button ref={principal} type="button" className={BOTON_PRIMARIO} onClick={() => setAviso(false)}>
            Seguir conectado
          </button>
        </PieAviso>
      </AvisoResponsivo>

      <AvisoResponsivo open={terminada} descartable={false}>
        <CabeceraAviso icon={LockKeyIcon} tono="aviso" titulo="Tu sesión terminó" descripcion="Cerramos la sesión por inactividad. Vuelve a iniciar sesión para continuar. Este aviso no se cierra con Escape ni con un clic afuera." />
        <PieAviso>
          <button type="button" className={BOTON_PRIMARIO} onClick={() => setTerminada(false)}>
            Iniciar sesión
          </button>
        </PieAviso>
      </AvisoResponsivo>
    </>
  );
}
