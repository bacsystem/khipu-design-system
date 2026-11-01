"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CLAVE_PALETA,
  CLAVE_TONO_OSCURO,
  PALETAS,
  PALETA_POR_DEFECTO,
  TONOS_OSCURO,
  TONO_OSCURO_POR_DEFECTO,
  valorValido,
  type Paleta,
  type PreferenciasApariencia,
  type TonoOscuro,
} from "@/components/apariencia-opciones";

type ContextoApariencia = {
  paleta: string;
  setPaleta: (valor: string) => void;
  paletas: Paleta[];
  tonoOscuro: string;
  setTonoOscuro: (valor: string) => void;
  tonosOscuro: TonoOscuro[];
};

// Sin proveedor no hay nada que elegir: las listas vacías hacen que SelectorApariencia y el menú de usuario no muestren nada.
const SIN_PROVEEDOR: ContextoApariencia = {
  paleta: PALETA_POR_DEFECTO,
  setPaleta: () => {},
  paletas: [],
  tonoOscuro: TONO_OSCURO_POR_DEFECTO,
  setTonoOscuro: () => {},
  tonosOscuro: [],
};
const Contexto = createContext<ContextoApariencia>(SIN_PROVEEDOR);

/** Paleta y tono oscuro activos, y cómo cambiarlos. Fuera de `AparienciaProvider` devuelve listas vacías y no falla. */
export function useApariencia(): ContextoApariencia {
  return useContext(Contexto);
}

function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // Sin localStorage (modo privado, almacenamiento bloqueado) la preferencia vale solo para esta visita.
  }
}

/**
 * Guarda la paleta y el tono oscuro elegidos en localStorage y los aplica como `data-paleta` / `data-oscuro` en `<html>`.
 * `inicial` (p. ej. el perfil del usuario leído en el servidor) gana sobre lo guardado; `onCambio` recibe las dos
 * preferencias en cada cambio para que la app las guarde en su backend. Para que no haya parpadeo, pon `ScriptDiseno`
 * (con el mismo `inicial`) en el `<head>`.
 */
export function AparienciaProvider({
  children,
  paletas = PALETAS,
  tonosOscuro = TONOS_OSCURO,
  inicial,
  onCambio,
}: {
  children: ReactNode;
  paletas?: Paleta[];
  tonosOscuro?: TonoOscuro[];
  inicial?: Partial<PreferenciasApariencia>;
  onCambio?: (preferencias: PreferenciasApariencia) => void;
}) {
  const [paleta, setPaletaEstado] = useState(() => valorValido(inicial?.paleta, paletas, PALETA_POR_DEFECTO));
  const [tonoOscuro, setTonoEstado] = useState(() => valorValido(inicial?.tonoOscuro, tonosOscuro, TONO_OSCURO_POR_DEFECTO));
  const actual = useRef<PreferenciasApariencia>({ paleta, tonoOscuro });
  actual.current = { paleta, tonoOscuro };
  const avisar = useRef(onCambio);
  avisar.current = onCambio;

  // El valor real solo se conoce en el cliente; ScriptDiseno ya lo puso en <html> antes de pintar, aquí solo se lee.
  useEffect(() => {
    const d = document.documentElement.dataset;
    setPaletaEstado(valorValido(d.paleta, paletas, PALETA_POR_DEFECTO));
    setTonoEstado(valorValido(d.oscuro, tonosOscuro, TONO_OSCURO_POR_DEFECTO));
  }, [paletas, tonosOscuro]);

  const setPaleta = useCallback(
    (valor: string) => {
      if (!paletas.some((p) => p.valor === valor)) return;
      setPaletaEstado(valor);
      document.documentElement.dataset.paleta = valor;
      guardar(CLAVE_PALETA, valor);
      avisar.current?.({ ...actual.current, paleta: valor });
    },
    [paletas],
  );

  const setTonoOscuro = useCallback(
    (valor: string) => {
      if (!tonosOscuro.some((t) => t.valor === valor)) return;
      setTonoEstado(valor);
      document.documentElement.dataset.oscuro = valor;
      guardar(CLAVE_TONO_OSCURO, valor);
      avisar.current?.({ ...actual.current, tonoOscuro: valor });
    },
    [tonosOscuro],
  );

  const valor = useMemo(
    () => ({ paleta, setPaleta, paletas, tonoOscuro, setTonoOscuro, tonosOscuro }),
    [paleta, setPaleta, paletas, tonoOscuro, setTonoOscuro, tonosOscuro],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}
