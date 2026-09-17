"use client";

import { SearchIcon, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ComandoPaleta = {
  id: string;
  label: string;
  /** Texto secundario (ruta, atajo, categoría). */
  detalle?: string;
  grupo?: string;
  icon?: LucideIcon;
  /** Navega a `href` o ejecuta `onSelect`. */
  href?: string;
  onSelect?: () => void;
  /** Palabras extra para la búsqueda. */
  claves?: string[];
};

function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Paleta de comandos (⌘K / Ctrl+K): búsqueda difusa simple por etiqueta, detalle y claves, navegación con flechas y Enter.
 * Monta `<Paleta comandos={…} />` una vez en el layout; se abre con el atajo o con `open`/`onOpenChange` desde el buscador de la top bar.
 */
export function Paleta({
  comandos,
  open,
  onOpenChange,
  placeholder = "Buscar o ejecutar…",
}: {
  comandos: ComandoPaleta[];
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  placeholder?: string;
}) {
  const router = useRouter();
  const [interno, setInterno] = useState(false);
  const abierto = open ?? interno;
  const setAbierto = onOpenChange ?? setInterno;
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const lista = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function atajo(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAbierto(!abierto);
      }
    }
    window.addEventListener("keydown", atajo);
    return () => window.removeEventListener("keydown", atajo);
  }, [abierto, setAbierto]);

  const filtrados = useMemo(() => {
    const n = normalizar(q.trim());
    if (!n) return comandos;
    return comandos.filter((c) => normalizar([c.label, c.detalle ?? "", c.grupo ?? "", ...(c.claves ?? [])].join(" ")).includes(n));
  }, [comandos, q]);

  useEffect(() => setIdx(0), [q, abierto]);

  function ejecutar(c: ComandoPaleta) {
    setAbierto(false);
    setQ("");
    if (c.href) router.push(c.href);
    c.onSelect?.();
  }

  function teclas(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((i) => Math.min(i + 1, filtrados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtrados[idx]) {
      e.preventDefault();
      ejecutar(filtrados[idx]);
    }
  }

  let grupoActual: string | undefined;

  return (
    <Dialog open={abierto} onOpenChange={setAbierto}>
      <DialogContent className="mt-[12vh] gap-0 self-start overflow-hidden p-0 sm:max-w-lg" showCloseButton={false}>
        <DialogTitle className="sr-only">Paleta de comandos</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border/60 px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground/70" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={teclas}
            placeholder={placeholder}
            aria-label={placeholder}
            className="h-11 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/70"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70">Esc</kbd>
        </div>
        <div ref={lista} role="listbox" className="max-h-80 overflow-y-auto p-1">
          {filtrados.length === 0 ? <p className="px-3 py-6 text-center text-[12px] text-muted-foreground">Sin resultados para «{q}»</p> : null}
          {filtrados.map((c, i) => {
            const Icono = c.icon;
            const cabecera = c.grupo && c.grupo !== grupoActual ? c.grupo : null;
            grupoActual = c.grupo;
            return (
              <div key={c.id} className="contents">
                {cabecera ? <div className="px-2 pt-2 pb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">{cabecera}</div> : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={i === idx}
                  onMouseEnter={() => setIdx(i)}
                  onClick={() => ejecutar(c)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-[12px] font-medium outline-none",
                    i === idx ? "bg-accent/70 text-accent-foreground" : "text-foreground",
                  )}
                >
                  {Icono ? <Icono className={cn("size-3.5 shrink-0", i === idx ? "text-accent-foreground" : "text-muted-foreground")} /> : null}
                  <span className="min-w-0 flex-1 truncate">{c.label}</span>
                  {c.detalle ? <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{c.detalle}</span> : null}
                </button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
