import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { ScriptDiseno } from "@/components/script-diseno";
import "./globals.css";

// Inter para la interfaz y JetBrains Mono para datos (correlativos, ids, código): la pareja de IntelliJ. Vienen en next/font.
// Las variables --font-sans / --font-mono van en <html> (no en <body>) para que las lea todo el árbol, portales incluidos.
const sans = Inter({ variable: "--font-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", weight: ["400", "500", "600"], subsets: ["latin"] });

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
