import type { Metadata } from "next";
import { DM_Sans, Figtree, Inter, JetBrains_Mono, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import { ScriptDiseno } from "@/components/script-diseno";
import "./globals.css";

// Inter para la interfaz y JetBrains Mono para datos (correlativos, ids, código): la pareja de IntelliJ. Vienen en next/font.
// Las variables van en <html> (no en <body>) para que las lea todo el árbol, portales incluidos.
// La tipografía es preferencia del usuario (components/apariencia-opciones.ts, FUENTES): Inter es --font-sans; las demás
// exponen --fuente-<valor> y html[data-fuente] las pone en --font-sans (src/styles/tokens.css). Solo Inter se precarga.
// Inter se carga una sola vez: Turbopack no acepta dos llamadas a la misma fuente de next/font/google.
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--fuente-jakarta", subsets: ["latin"], preload: false });
const manrope = Manrope({ variable: "--fuente-manrope", subsets: ["latin"], preload: false });
const dmSans = DM_Sans({ variable: "--fuente-dmsans", subsets: ["latin"], preload: false });
const figtree = Figtree({ variable: "--fuente-figtree", subsets: ["latin"], preload: false });
const mono = JetBrains_Mono({ variable: "--font-mono", weight: ["400", "500", "600"], subsets: ["latin"] });
const fuentes = [sans, jakarta, manrope, dmSans, figtree, mono].map((f) => f.variable).join(" ");

export const metadata: Metadata = { title: "Mi aplicación" };

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
