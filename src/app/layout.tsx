import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/providers";
import { ScriptDiseno } from "@/components/script-diseno";
import "./globals.css";

// Inter para la interfaz y JetBrains Mono para datos (correlativos, ids, código): la pareja de IntelliJ. Los archivos están en
// src/app/fonts (woff2, solo latin, con su licencia OFL) y se sirven con next/font/local: el build no descarga nada.
// Las variables van en <html> (no en <body>) para que las lea todo el árbol, portales incluidos.
// La tipografía es preferencia del usuario (components/apariencia-opciones.ts, FUENTES): Inter es --font-sans; las demás
// exponen --fuente-<valor> y html[data-fuente] las pone en --font-sans (src/styles/tokens.css). Solo Inter se precarga.
const sans = localFont({ src: "./fonts/inter-latin-wght-normal.woff2", weight: "100 900", variable: "--font-sans" });
const jakarta = localFont({ src: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2", weight: "200 800", variable: "--fuente-jakarta", preload: false });
const manrope = localFont({ src: "./fonts/manrope-latin-wght-normal.woff2", weight: "200 800", variable: "--fuente-manrope", preload: false });
const dmSans = localFont({ src: "./fonts/dm-sans-latin-wght-normal.woff2", weight: "100 1000", variable: "--fuente-dmsans", preload: false });
const figtree = localFont({ src: "./fonts/figtree-latin-wght-normal.woff2", weight: "300 900", variable: "--fuente-figtree", preload: false });
const mono = localFont({ src: "./fonts/jetbrains-mono-latin-wght-normal.woff2", weight: "100 600", variable: "--font-mono" });
const fuentes = [sans, jakarta, manrope, dmSans, figtree, mono].map((f) => f.variable).join(" ");

export const metadata: Metadata = { title: "Mi aplicación" };
// `viewport-fit=cover` hace que `env(safe-area-inset-bottom)` valga algo en iPhone: la BarraInferior lo usa para no quedar bajo la barra de gestos.
export const viewport: Viewport = { viewportFit: "cover" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fuentes} suppressHydrationWarning>
      <head>
        <ScriptDiseno />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
