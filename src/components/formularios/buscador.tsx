"use client";

import { SearchIcon, XIcon } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { CONTROL_FILTRO } from "@/components/patrones/pie-tabla";
import { CAMPO } from "@/lib/estilos";
import { cn } from "@/lib/utils";

/**
 * Input de búsqueda con icono y botón de limpiar, para filtrar listas/tablas dentro de la página (barra de
 * filtros, `PanelLateral`…). El buscador de la `TopBar` es otra cosa: un disparador deshabilitado que abre
 * `Paleta` (⌘K), no un campo que filtra en el sitio.
 * `variante="filtro"` (por defecto, `h-8` como el resto de la barra) o `"campo"` (`h-10`, dentro de un `Formulario`).
 */
export function Buscador({
  valor,
  onCambio,
  placeholder = "Buscar…",
  variante = "filtro",
  className,
  ...props
}: {
  valor: string;
  onCambio: (v: string) => void;
  placeholder?: string;
  variante?: "filtro" | "campo";
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "placeholder" | "className" | "type">) {
  return (
    <div className="relative flex items-center">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground/70" />
      <input
        type="search"
        value={valor}
        onChange={(e) => onCambio(e.target.value)}
        placeholder={placeholder}
        className={cn(
          variante === "campo" ? CAMPO : CONTROL_FILTRO,
          "w-full pr-8 pl-8 placeholder:text-muted-foreground/70 [&::-webkit-search-cancel-button]:hidden",
          className,
        )}
        {...props}
      />
      {valor ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onCambio("")}
          className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded p-1 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
