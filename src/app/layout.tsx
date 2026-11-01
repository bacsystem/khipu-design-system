import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ScriptDiseno } from "@/components/script-diseno";
import "./globals.css";

// Geist y Geist Mono (Vercel): diseñadas para interfaces densas, con cifras tabulares. Vienen en next/font, sin dependencia extra.
// Las variables --font-sans / --font-mono van en <html> (no en <body>) para que las lea todo el árbol, portales incluidos.
const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", weight: ["400", "500"], subsets: ["latin"] });

export const metadata: Metadata = { title: "Mi aplicación" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <ScriptDiseno />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
