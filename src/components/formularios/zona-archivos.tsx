"use client";

import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { cn } from "@/lib/utils";

function tamano(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Zona de arrastre para un archivo (certificado .p12/.pfx, CSV, XML…). Borde punteado; se vuelve primary al arrastrar.
 * Muestra nombre y tamaño del archivo elegido y permite quitarlo.
 */
export function ZonaArchivos({
  id,
  archivo,
  onCambio,
  accept,
  titulo = "Arrastra un archivo o haz clic para elegirlo",
  ayuda,
  disabled,
  className,
}: {
  id: string;
  archivo: File | null;
  onCambio: (f: File | null) => void;
  accept?: string;
  titulo?: string;
  ayuda?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [sobre, setSobre] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  function soltar(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setSobre(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) onCambio(f);
  }

  if (archivo) {
    return (
      <div className={cn("flex items-center gap-3 rounded-lg border border-border bg-muted px-3 py-2.5", className)}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
          <FileIcon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-mono text-[13px] font-medium text-foreground">{archivo.name}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{tamano(archivo.size)}</p>
        </div>
        <button
          type="button"
          aria-label="Quitar archivo"
          disabled={disabled}
          onClick={() => onCambio(null)}
          className="rounded p-1 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
        >
          <XIcon className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setSobre(true);
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={soltar}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed px-4 py-8 text-center transition-colors",
        sobre ? "border-primary bg-accent/40" : "border-border bg-muted hover:bg-accent/30",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
    >
      <UploadCloudIcon className={cn("size-6", sobre ? "text-primary" : "text-muted-foreground/70")} />
      <span className="text-[13px] font-medium text-foreground">{titulo}</span>
      {ayuda ? <span className="font-mono text-[11px] text-muted-foreground">{ayuda}</span> : null}
      <input ref={input} id={id} type="file" accept={accept} disabled={disabled} className="sr-only" onChange={(e) => onCambio(e.target.files?.[0] ?? null)} />
    </label>
  );
}
